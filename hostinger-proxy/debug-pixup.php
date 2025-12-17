<?php
/**
 * Debug - Testa conexão com PixUp diretamente
 * 
 * Acesse: https://dlgconnect.com/api/debug-pixup.php
 * APAGUE ESTE ARQUIVO DEPOIS DE USAR!
 */

header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 Debug Conexão PixUp</h1>";
echo "<hr>";

// Coloque suas credenciais aqui para testar
$CLIENT_ID = ''; // Cole seu client_id aqui
$CLIENT_SECRET = ''; // Cole seu client_secret aqui
$PIXUP_API_URL = 'https://api.pixupbr.com';

if (empty($CLIENT_ID) || empty($CLIENT_SECRET)) {
    echo "<p style='color: red;'>⚠️ Configure CLIENT_ID e CLIENT_SECRET no arquivo para testar!</p>";
    echo "<p>Edite o arquivo debug-pixup.php e coloque suas credenciais.</p>";
    exit;
}

echo "<h2>📤 Testando conexão com PixUp...</h2>";

// IP de saída
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.ipify.org');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
$outgoing_ip = curl_exec($ch);
curl_close($ch);
echo "<p><strong>IP de saída:</strong> $outgoing_ip</p>";
echo "<p>⚠️ Certifique-se que este IP está no whitelist do PixUp!</p>";

echo "<hr>";
echo "<h2>🔐 Passo 1: Obtendo Access Token via OAuth2...</h2>";

// Primeiro obter o access_token via OAuth2
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $PIXUP_API_URL . '/v2/oauth/token');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'grant_type' => 'client_credentials',
    'client_id' => $CLIENT_ID,
    'client_secret' => $CLIENT_SECRET
]));

$token_response = curl_exec($ch);
$token_http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$token_curl_error = curl_error($ch);
curl_close($ch);

echo "<p><strong>URL chamada:</strong> {$PIXUP_API_URL}/v2/oauth/token</p>";
echo "<p><strong>HTTP Status:</strong> $token_http_code</p>";

if ($token_curl_error) {
    echo "<p style='color: red;'><strong>Erro cURL:</strong> $token_curl_error</p>";
}

echo "<h3>📥 Resposta do Token:</h3>";
echo "<pre style='background: #f0f0f0; padding: 10px; overflow: auto;'>";
echo htmlspecialchars($token_response ?: 'Sem resposta');
echo "</pre>";

$token_data = json_decode($token_response, true);
$access_token = $token_data['access_token'] ?? null;

if ($token_http_code === 200 && $access_token) {
    echo "<p style='color: green;'>✅ <strong>Token obtido com sucesso!</strong></p>";
    echo "<p><strong>Access Token:</strong> " . substr($access_token, 0, 20) . "...</p>";
    
    echo "<hr>";
    echo "<h2>🔐 Passo 2: Testando criação de QR Code PIX...</h2>";
    
    // Agora testar criação de QR code
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $PIXUP_API_URL . '/v2/pix/qrcode');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $access_token",
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'amount' => 0.01,
        'external_id' => 'test_' . time()
    ]));
    
    $qr_response = curl_exec($ch);
    $qr_http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $qr_curl_error = curl_error($ch);
    $qr_curl_info = curl_getinfo($ch);
    curl_close($ch);
    
    echo "<p><strong>URL chamada:</strong> {$PIXUP_API_URL}/v2/pix/qrcode</p>";
    echo "<p><strong>HTTP Status:</strong> $qr_http_code</p>";
    
    if ($qr_curl_error) {
        echo "<p style='color: red;'><strong>Erro cURL:</strong> $qr_curl_error</p>";
    }
    
    echo "<h3>📥 Resposta do QR Code:</h3>";
    echo "<pre style='background: #f0f0f0; padding: 10px; overflow: auto;'>";
    echo htmlspecialchars($qr_response ?: 'Sem resposta');
    echo "</pre>";
    
    if ($qr_http_code === 200 || $qr_http_code === 201) {
        echo "<p style='color: green;'>✅ <strong>SUCESSO TOTAL!</strong> Credenciais válidas e IP autorizado!</p>";
    } elseif ($qr_http_code === 403) {
        echo "<p style='color: red;'>❌ <strong>ERRO 403:</strong> IP não autorizado no PixUp. Adicione o IP <strong>$outgoing_ip</strong> no painel PixUp.</p>";
    } else {
        echo "<p style='color: orange;'>⚠️ <strong>HTTP $qr_http_code:</strong> Verifique a resposta acima.</p>";
    }
    
} elseif ($token_http_code === 401) {
    echo "<p style='color: red;'>❌ <strong>ERRO 401:</strong> Credenciais inválidas (client_id ou client_secret errado)</p>";
} elseif ($token_http_code === 403) {
    echo "<p style='color: red;'>❌ <strong>ERRO 403:</strong> IP não autorizado. Adicione o IP <strong>$outgoing_ip</strong> no painel PixUp.</p>";
} elseif ($token_http_code === 0) {
    echo "<p style='color: red;'>❌ Não foi possível conectar ao servidor PixUp.</p>";
} else {
    echo "<p style='color: red;'>❌ <strong>ERRO $token_http_code:</strong> Verifique a resposta acima.</p>";
}

echo "<hr>";
echo "<p style='color: red;'>⚠️ <strong>APAGUE ESTE ARQUIVO APÓS O TESTE!</strong></p>";
?>
