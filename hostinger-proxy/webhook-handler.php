<?php
/**
 * Handler de Webhook para a raiz do domínio
 * 
 * Coloque este arquivo como index.php na pasta public_html
 * OU use com .htaccess para redirecionar POSTs
 * 
 * URL para configurar no PixUp: https://dlgconnect.com
 */

// Se não for POST, redireciona para o site normal
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    // Redirecionar para o site Lovable
    header('Location: https://swextractor.lovable.app');
    exit();
}

// Headers CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Signature, X-Webhook-Secret, Authorization');

// ========================================
// CONFIGURAÇÃO
// ========================================
define('SUPABASE_PIXUP_WEBHOOK', 'https://nydtfckvvslkbyolipsf.supabase.co/functions/v1/pixup-webhook');
define('SUPABASE_EVOPAY_WEBHOOK', 'https://nydtfckvvslkbyolipsf.supabase.co/functions/v1/evopay-webhook');

// ========================================
// RECEBER WEBHOOK
// ========================================

$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody, true);

// Log para debug
$logFile = __DIR__ . '/webhook-log.txt';
$logEntry = date('Y-m-d H:i:s') . " - Webhook recebido na raiz\n";
$logEntry .= "Body: " . $rawBody . "\n";
$logEntry .= "Headers: " . json_encode(getallheaders()) . "\n";
$logEntry .= "---\n";
file_put_contents($logFile, $logEntry, FILE_APPEND);

// Detectar qual gateway enviou (PixUp ou EvoPay)
$isEvoPay = false;
$isPixUp = false;

// Verificar headers
$headers = getallheaders();
foreach ($headers as $key => $value) {
    $lowerKey = strtolower($key);
    if (strpos($lowerKey, 'evopay') !== false) {
        $isEvoPay = true;
        break;
    }
}

// Verificar payload para identificar gateway
if ($data) {
    // EvoPay geralmente tem campos específicos
    if (isset($data['pix_code']) || isset($data['evopay']) || isset($data['pixCode'])) {
        $isEvoPay = true;
    }
    // PixUp/BSPAY geralmente tem esses campos
    if (isset($data['transactionId']) || isset($data['transaction_id']) || isset($data['status'])) {
        $isPixUp = true;
    }
}

// Default para PixUp se não conseguir identificar
if (!$isEvoPay && !$isPixUp) {
    $isPixUp = true;
}

$webhookUrl = $isEvoPay ? SUPABASE_EVOPAY_WEBHOOK : SUPABASE_PIXUP_WEBHOOK;

// Log qual gateway foi detectado
$logEntry = date('Y-m-d H:i:s') . " - Gateway detectado: " . ($isEvoPay ? 'EvoPay' : 'PixUp') . "\n";
$logEntry .= "Encaminhando para: " . $webhookUrl . "\n";
file_put_contents($logFile, $logEntry, FILE_APPEND);

// Preparar headers para encaminhar
$forwardHeaders = [
    'Content-Type: application/json',
];

// Capturar e encaminhar headers de assinatura
$signature = isset($headers['X-Signature']) ? $headers['X-Signature'] : '';
$pixupSignature = isset($headers['X-Pixup-Signature']) ? $headers['X-Pixup-Signature'] : '';
$authorization = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if (!empty($signature)) {
    $forwardHeaders[] = 'X-Webhook-Signature: ' . $signature;
}
if (!empty($pixupSignature)) {
    $forwardHeaders[] = 'X-Webhook-Signature: ' . $pixupSignature;
}
if (!empty($authorization)) {
    $forwardHeaders[] = 'Authorization: ' . $authorization;
}

// Encaminhar para Supabase
$ch = curl_init($webhookUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $rawBody);
curl_setopt($ch, CURLOPT_HTTPHEADER, $forwardHeaders);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Log da resposta
$logEntry = date('Y-m-d H:i:s') . " - Resposta do Supabase\n";
$logEntry .= "HTTP Code: " . $httpCode . "\n";
$logEntry .= "Response: " . $response . "\n";
if ($error) {
    $logEntry .= "Curl Error: " . $error . "\n";
}
$logEntry .= "===\n";
file_put_contents($logFile, $logEntry, FILE_APPEND);

// Retornar resposta
http_response_code($httpCode ?: 500);

if ($error) {
    echo json_encode(['error' => 'Falha ao encaminhar webhook', 'details' => $error]);
} else {
    echo $response;
}
