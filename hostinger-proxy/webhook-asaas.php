<?php
/**
 * Proxy Webhook para Asaas
 * Recebe webhooks da Asaas e repassa para a Edge Function do Supabase
 */

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, asaas-access-token');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Apenas POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// URL da Edge Function
$supabaseUrl = 'https://nydtfckvvslkbyolipsf.supabase.co/functions/v1/asaas-webhook';

// Ler o body da requisição
$rawBody = file_get_contents('php://input');

// Log para debug (opcional - remover em produção)
error_log('[Asaas Webhook] Received: ' . substr($rawBody, 0, 500));

// Preparar headers para repassar
$headers = [
    'Content-Type: application/json',
];

// Repassar header de autenticação da Asaas se existir
if (isset($_SERVER['HTTP_ASAAS_ACCESS_TOKEN'])) {
    $headers[] = 'asaas-access-token: ' . $_SERVER['HTTP_ASAAS_ACCESS_TOKEN'];
}

// Inicializar cURL
$ch = curl_init($supabaseUrl);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $rawBody,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_SSL_VERIFYPEER => true,
]);

// Executar request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Log resultado
error_log('[Asaas Webhook] Response code: ' . $httpCode);

// Retornar resposta
if ($error) {
    error_log('[Asaas Webhook] cURL error: ' . $error);
    http_response_code(500);
    echo json_encode(['error' => 'Proxy error', 'details' => $error]);
} else {
    http_response_code($httpCode);
    echo $response;
}
