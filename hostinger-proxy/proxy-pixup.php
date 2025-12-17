<?php
/**
 * Proxy PixUp para Hostinger
 * Este script recebe requisições do Supabase Edge Function
 * e encaminha para a API do PixUp com IP fixo.
 * 
 * Upload este arquivo para: public_html/api/proxy-pixup.php
 * URL: https://dlgconnect.com/api/proxy-pixup.php
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
define('PIXUP_API_URL', 'https://api.pixupbr.com'); // URL correta do PixUp

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

// PixUp usa client_id e client_secret como API Key no header Authorization
function getAuthHeaders($clientId, $clientSecret) {
    // PixUp aceita Basic Auth com client_id:client_secret
    $credentials = base64_encode("$clientId:$clientSecret");
    return [
        "Authorization: Basic $credentials",
        "Content-Type: application/json",
        "Accept: application/json"
    ];
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
    
    // Testar conexão fazendo uma requisição simples
    // PixUp não tem endpoint específico de teste, vamos verificar se as credenciais são aceitas
    $headers = getAuthHeaders($clientId, $clientSecret);
    
    // Tentar criar uma cobrança de teste mínima para validar credenciais
    $testBody = json_encode([
        'amount' => 0.01,
        'external_id' => 'test_' . time()
    ]);
    
    $result = makeRequest(
        PIXUP_API_URL . '/v2/pix/qrcode',
        'POST',
        $headers,
        $testBody
    );
    
    // Se retornou 401, credenciais inválidas
    if ($result['status'] === 401) {
        return ['success' => false, 'error' => 'Credenciais inválidas ou IP não autorizado'];
    }
    
    // Se retornou 403, IP não autorizado
    if ($result['status'] === 403) {
        return ['success' => false, 'error' => 'IP não autorizado no PixUp'];
    }
    
    // Se retornou 200, 201 ou até 400/422 (parâmetros inválidos), significa que autenticou
    if ($result['status'] === 200 || $result['status'] === 201 || $result['status'] === 400 || $result['status'] === 422) {
        return ['success' => true, 'message' => 'Conexão bem sucedida!'];
    }
    
    // Outro erro
    return [
        'success' => false, 
        'error' => 'Erro na conexão: HTTP ' . $result['status'],
        'details' => $result['body']
    ];
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
    
    $headers = getAuthHeaders($clientId, $clientSecret);
    
    // Create PIX charge - formato PixUp
    $pixBody = [
        'amount' => floatval($amount),
        'external_id' => $externalId,
        'payerQuestion' => $description
    ];
    
    if ($payerName && $payerDocument) {
        $pixBody['payer'] = [
            'name' => $payerName,
            'document' => preg_replace('/\D/', '', $payerDocument) // Remove non-digits
        ];
    }
    
    $result = makeRequest(
        PIXUP_API_URL . '/v2/pix/qrcode',
        'POST',
        $headers,
        json_encode($pixBody)
    );
    
    if ($result['status'] !== 200 && $result['status'] !== 201) {
        return [
            'success' => false, 
            'error' => 'Falha ao criar cobrança PIX',
            'details' => $result['body'],
            'http_code' => $result['status']
        ];
    }
    
    $pixData = json_decode($result['body'], true);
    
    // Normalize response - formato PixUp
    return [
        'success' => true,
        'data' => [
            'id' => $pixData['transactionId'] ?? null,
            'pixCode' => $pixData['qrcode'] ?? null,
            'qrCodeBase64' => $pixData['qrcode_base64'] ?? null,
            'transactionId' => $pixData['transactionId'] ?? null,
            'expiresAt' => $pixData['calendar']['dueDate'] ?? null,
            'status' => $pixData['status'] ?? 'PENDING'
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
