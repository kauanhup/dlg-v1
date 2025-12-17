<?php
/**
 * Proxy PixUp/BSPAY para Hostinger
 * Este script recebe requisições do Supabase Edge Function
 * e encaminha para a API do BSPAY com IP fixo.
 * 
 * Upload este arquivo para: public_html/api/proxy-pixup.php
 * URL: https://seusite.com/api/proxy-pixup.php
 */

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Proxy-Secret');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ========================================
// CONFIGURAÇÃO - ALTERE AQUI
// ========================================
define('PROXY_SECRET', 'swx_proxy_2024_Xk9mP2nQ7rT3wY5z'); // Chave para validar requisições do seu servidor
define('BSPAY_API_URL', 'https://api.bspay.co');

// ========================================
// VALIDAÇÃO DE SEGURANÇA
// ========================================
function validateRequest() {
    $proxySecret = $_SERVER['HTTP_X_PROXY_SECRET'] ?? '';
    
    if ($proxySecret !== PROXY_SECRET) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================
function makeRequest($url, $method, $headers, $body = null) {
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4); // Força IPv4 para whitelist
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($body !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        }
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    
    curl_close($ch);
    
    return [
        'body' => $response,
        'status' => $httpCode,
        'error' => $error
    ];
}

function getAccessToken($clientId, $clientSecret) {
    $credentials = base64_encode("$clientId:$clientSecret");
    
    $headers = [
        "Authorization: Basic $credentials",
        "Content-Type: application/x-www-form-urlencoded"
    ];
    
    $result = makeRequest(
        BSPAY_API_URL . '/v2/oauth/token',
        'POST',
        $headers,
        'grant_type=client_credentials'
    );
    
    if ($result['status'] !== 200) {
        return ['error' => 'Failed to get access token', 'details' => $result['body']];
    }
    
    $data = json_decode($result['body'], true);
    return ['access_token' => $data['access_token']];
}

// ========================================
// HANDLERS DE AÇÕES
// ========================================
function handleTestConnection($params) {
    $clientId = $params['client_id'] ?? '';
    $clientSecret = $params['client_secret'] ?? '';
    
    if (empty($clientId) || empty($clientSecret)) {
        return ['success' => false, 'error' => 'Credentials required'];
    }
    
    $tokenResult = getAccessToken($clientId, $clientSecret);
    
    if (isset($tokenResult['error'])) {
        return ['success' => false, 'error' => $tokenResult['error']];
    }
    
    return ['success' => true, 'message' => 'Connection successful'];
}

function handleCreatePix($params) {
    $clientId = $params['client_id'] ?? '';
    $clientSecret = $params['client_secret'] ?? '';
    $amount = $params['amount'] ?? 0;
    $description = $params['description'] ?? 'Payment';
    $externalId = $params['external_id'] ?? 'pix_' . time();
    $payerName = $params['payer_name'] ?? null;
    $payerDocument = $params['payer_document'] ?? null;
    
    if (empty($clientId) || empty($clientSecret)) {
        return ['success' => false, 'error' => 'Credentials required'];
    }
    
    if ($amount <= 0) {
        return ['success' => false, 'error' => 'Invalid amount'];
    }
    
    // Get access token
    $tokenResult = getAccessToken($clientId, $clientSecret);
    
    if (isset($tokenResult['error'])) {
        return ['success' => false, 'error' => $tokenResult['error']];
    }
    
    $token = $tokenResult['access_token'];
    
    // Create PIX charge
    $pixBody = [
        'amount' => $amount,
        'description' => $description,
        'external_id' => $externalId
    ];
    
    if ($payerName && $payerDocument) {
        $pixBody['payer'] = [
            'name' => $payerName,
            'document' => $payerDocument
        ];
    }
    
    $headers = [
        "Authorization: Bearer $token",
        "Content-Type: application/json"
    ];
    
    $result = makeRequest(
        BSPAY_API_URL . '/v2/pix/qrcode',
        'POST',
        $headers,
        json_encode($pixBody)
    );
    
    if ($result['status'] !== 200 && $result['status'] !== 201) {
        return [
            'success' => false, 
            'error' => 'Failed to create PIX charge',
            'details' => $result['body']
        ];
    }
    
    $pixData = json_decode($result['body'], true);
    
    // Normalize response
    return [
        'success' => true,
        'data' => [
            'id' => $pixData['id'] ?? $pixData['transactionId'] ?? null,
            'pixCode' => $pixData['qrcode'] ?? $pixData['pixCode'] ?? $pixData['pix_code'] ?? null,
            'qrCodeBase64' => $pixData['qrcode_base64'] ?? $pixData['qrCodeBase64'] ?? null,
            'transactionId' => $pixData['transactionId'] ?? $pixData['id'] ?? null,
            'expiresAt' => $pixData['expires_at'] ?? $pixData['expiresAt'] ?? null,
            'status' => $pixData['status'] ?? 'pending'
        ]
    ];
}

// ========================================
// MAIN
// ========================================

// Validate request origin
validateRequest();

// Get request body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['action'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request']);
    exit();
}

$action = $data['action'];
unset($data['action']);

// Route to handler
switch ($action) {
    case 'test_connection':
        $response = handleTestConnection($data);
        break;
    
    case 'create_pix':
        $response = handleCreatePix($data);
        break;
    
    default:
        http_response_code(400);
        $response = ['error' => 'Invalid action'];
}

echo json_encode($response);
