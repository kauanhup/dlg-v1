<?php
/**
 * Proxy PixUp para Hostinger
 * 
 * Este arquivo faz proxy das requisições do Supabase Edge Function para a API PixUp
 * Hospede em: public_html/api/proxy-pixup.php
 */

// Configurações
define('PROXY_SECRET', 'swx_proxy_2024_Xk9mP2nQ7rT3wY5z'); // Troque por uma chave segura
define('PIXUP_API_URL', 'https://api.pixupbr.com');

// Headers CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Proxy-Secret');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Validar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Validar secret
$headers = getallheaders();
$proxySecret = $headers['X-Proxy-Secret'] ?? $headers['x-proxy-secret'] ?? '';

if ($proxySecret !== PROXY_SECRET) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid proxy secret']);
    exit;
}

// Ler body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

$action = $data['action'] ?? '';
$client_id = $data['client_id'] ?? '';
$client_secret = $data['client_secret'] ?? '';

// Log para debug
error_log("PixUp Proxy - Action: $action");

// Função para obter access_token via OAuth2
function getAccessToken($client_id, $client_secret) {
    $ch = curl_init();
    
    // Endpoint de token OAuth2
    $url = PIXUP_API_URL . '/v2/oauth/token';
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
    
    // OAuth2 client_credentials flow
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/x-www-form-urlencoded',
        'Accept: application/json'
    ]);
    
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'grant_type' => 'client_credentials',
        'client_id' => $client_id,
        'client_secret' => $client_secret
    ]));
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    
    curl_close($ch);
    
    if ($curlError) {
        return ['error' => $curlError, 'http_code' => 0];
    }
    
    $data = json_decode($response, true);
    
    if ($httpCode === 200 && isset($data['access_token'])) {
        return ['access_token' => $data['access_token'], 'http_code' => $httpCode];
    }
    
    return [
        'error' => $data['message'] ?? $data['error'] ?? 'Falha ao obter token',
        'http_code' => $httpCode,
        'response' => $data
    ];
}

// Função para chamar a API PixUp com access_token
function callPixUpAPI($endpoint, $method, $access_token, $body = null) {
    $ch = curl_init();
    
    $url = PIXUP_API_URL . $endpoint;
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
    
    $headers = [
        "Authorization: Bearer $access_token",
        'Content-Type: application/json',
        'Accept: application/json'
    ];
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($body) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    
    curl_close($ch);
    
    if ($curlError) {
        return ['error' => $curlError, 'http_code' => 0];
    }
    
    return [
        'response' => json_decode($response, true) ?: $response,
        'http_code' => $httpCode
    ];
}

// Processar ações
switch ($action) {
    case 'test_connection':
        // Primeiro obter access_token
        $tokenResult = getAccessToken($client_id, $client_secret);
        
        if (isset($tokenResult['error'])) {
            http_response_code($tokenResult['http_code'] ?: 401);
            echo json_encode([
                'success' => false,
                'error' => 'Falha na autenticação: ' . $tokenResult['error'],
                'http_code' => $tokenResult['http_code'],
                'details' => $tokenResult['response'] ?? null
            ]);
            exit;
        }
        
        // Testar conexão criando um QR code de teste
        $result = callPixUpAPI('/v2/pix/qrcode', 'POST', $tokenResult['access_token'], [
            'amount' => 0.01,
            'external_id' => 'test_' . time(),
            'payer_name' => 'Teste Conexao',
            'payer_document' => '00000000000'
        ]);
        
        if ($result['http_code'] === 200 || $result['http_code'] === 201) {
            echo json_encode([
                'success' => true,
                'message' => 'Conexão estabelecida com sucesso',
                'http_code' => $result['http_code']
            ]);
        } else {
            http_response_code($result['http_code'] ?: 500);
            echo json_encode([
                'success' => false,
                'error' => $result['response']['message'] ?? $result['error'] ?? 'Erro desconhecido',
                'http_code' => $result['http_code'],
                'details' => $result['response'] ?? null
            ]);
        }
        break;
        
    case 'create_pix':
        $amount = $data['amount'] ?? 0;
        $external_id = $data['external_id'] ?? '';
        $description = $data['description'] ?? 'Pagamento';
        $payer_name = $data['payer_name'] ?? '';
        $payer_document = $data['payer_document'] ?? '';
        
        if ($amount <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Valor inválido']);
            exit;
        }
        
        // Primeiro obter access_token
        $tokenResult = getAccessToken($client_id, $client_secret);
        
        if (isset($tokenResult['error'])) {
            http_response_code($tokenResult['http_code'] ?: 401);
            echo json_encode([
                'success' => false,
                'error' => 'Falha na autenticação: ' . $tokenResult['error'],
                'http_code' => $tokenResult['http_code']
            ]);
            exit;
        }
        
        $pixData = [
            'amount' => (float) $amount,
            'external_id' => $external_id
        ];
        
        // Adicionar campos opcionais se fornecidos
        if ($payer_name) {
            $pixData['payer_name'] = $payer_name;
        }
        if ($payer_document) {
            $pixData['payer_document'] = preg_replace('/[^0-9]/', '', $payer_document);
        }
        
        $result = callPixUpAPI('/v2/pix/qrcode', 'POST', $tokenResult['access_token'], $pixData);
        
        if ($result['http_code'] === 200 || $result['http_code'] === 201) {
            echo json_encode([
                'success' => true,
                'data' => $result['response']
            ]);
        } else {
            http_response_code($result['http_code'] ?: 500);
            echo json_encode([
                'success' => false,
                'error' => $result['response']['message'] ?? $result['error'] ?? 'Erro ao criar cobrança',
                'http_code' => $result['http_code'],
                'details' => $result['response'] ?? null
            ]);
        }
        break;
        
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Ação inválida: ' . $action]);
        break;
}
?>
