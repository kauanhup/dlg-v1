<?php
/**
 * Webhook Receiver para EvoPay
 * 
 * Este script recebe webhooks do EvoPay no seu domínio Hostinger
 * e encaminha para a Supabase Edge Function.
 * 
 * URL para configurar no EvoPay: https://dlgconnect.com/api/webhook-evopay.php
 */

// Headers CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Signature');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Apenas POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// ========================================
// CONFIGURAÇÃO - ALTERE AQUI
// ========================================
define('SUPABASE_WEBHOOK_URL', 'https://nydtfckvvslkbyolipsf.supabase.co/functions/v1/evopay-webhook');

// ========================================
// RECEBER E ENCAMINHAR WEBHOOK
// ========================================

// Capturar o body raw
$rawBody = file_get_contents('php://input');

// Capturar headers relevantes do EvoPay
$signature = isset($_SERVER['HTTP_X_SIGNATURE']) ? $_SERVER['HTTP_X_SIGNATURE'] : '';
$authorization = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';

// Log para debug (opcional - remover em produção)
$logFile = __DIR__ . '/webhook-evopay-log.txt';
$logEntry = date('Y-m-d H:i:s') . " - Received webhook\n";
$logEntry .= "Body: " . $rawBody . "\n";
$logEntry .= "Signature: " . $signature . "\n";
$logEntry .= "Authorization: " . $authorization . "\n";
$logEntry .= "---\n";
file_put_contents($logFile, $logEntry, FILE_APPEND);

// Preparar headers para encaminhar
$forwardHeaders = [
    'Content-Type: application/json',
];

// Mapear headers do EvoPay para o formato esperado pelo Supabase webhook
if (!empty($signature)) {
    $forwardHeaders[] = 'X-Evopay-Signature: ' . $signature;
}

// Também tentar capturar outros formatos de assinatura que o EvoPay pode enviar
$evopaySignature = isset($_SERVER['HTTP_X_EVOPAY_SIGNATURE']) ? $_SERVER['HTTP_X_EVOPAY_SIGNATURE'] : '';
if (!empty($evopaySignature)) {
    $forwardHeaders[] = 'X-Evopay-Signature: ' . $evopaySignature;
}

if (!empty($authorization)) {
    $forwardHeaders[] = 'Authorization: ' . $authorization;
}

// Encaminhar para Supabase Edge Function
$ch = curl_init(SUPABASE_WEBHOOK_URL);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $rawBody);
curl_setopt($ch, CURLOPT_HTTPHEADER, $forwardHeaders);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Log da resposta (opcional - remover em produção)
$logEntry = date('Y-m-d H:i:s') . " - Response from Supabase\n";
$logEntry .= "HTTP Code: " . $httpCode . "\n";
$logEntry .= "Response: " . $response . "\n";
if ($error) {
    $logEntry .= "Error: " . $error . "\n";
}
$logEntry .= "===\n";
file_put_contents($logFile, $logEntry, FILE_APPEND);

// Retornar resposta
http_response_code($httpCode ?: 500);

if ($error) {
    echo json_encode(['error' => 'Failed to forward webhook', 'details' => $error]);
} else {
    echo $response;
}
