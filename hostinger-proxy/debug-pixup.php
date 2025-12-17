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
echo "<h2>🔐 Tentando autenticar no PixUp...</h2>";

// PixUp usa Basic Auth
$credentials = base64_encode("$CLIENT_ID:$CLIENT_SECRET");

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $PIXUP_API_URL . '/v2/pix/qrcode');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Basic $credentials",
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'amount' => 0.01,
    'external_id' => 'test_' . time()
]));

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
$curl_info = curl_getinfo($ch);

curl_close($ch);

echo "<p><strong>URL chamada:</strong> {$PIXUP_API_URL}/v2/pix/qrcode</p>";
echo "<p><strong>HTTP Status:</strong> $http_code</p>";

if ($curl_error) {
    echo "<p style='color: red;'><strong>Erro cURL:</strong> $curl_error</p>";
}

echo "<h3>📥 Resposta do PixUp:</h3>";
echo "<pre style='background: #f0f0f0; padding: 10px; overflow: auto;'>";
echo htmlspecialchars($response ?: 'Sem resposta');
echo "</pre>";

// Interpretar resposta
if ($http_code === 200 || $http_code === 201) {
    echo "<p style='color: green;'>✅ <strong>SUCESSO!</strong> Credenciais válidas e IP autorizado!</p>";
} elseif ($http_code === 401) {
    echo "<p style='color: red;'>❌ <strong>ERRO 401:</strong> Credenciais inválidas (client_id ou client_secret errado)</p>";
} elseif ($http_code === 403) {
    echo "<p style='color: red;'>❌ <strong>ERRO 403:</strong> IP não autorizado no PixUp. Adicione o IP <strong>$outgoing_ip</strong> no painel PixUp.</p>";
} elseif ($http_code === 400 || $http_code === 422) {
    echo "<p style='color: orange;'>⚠️ <strong>HTTP $http_code:</strong> Autenticação OK, mas parâmetros inválidos (esperado para teste). Credenciais funcionando!</p>";
} elseif ($http_code === 0) {
    echo "<p style='color: red;'>❌ Não foi possível conectar ao servidor PixUp.</p>";
} else {
    echo "<p style='color: red;'>❌ <strong>ERRO $http_code:</strong> Verifique a resposta acima.</p>";
}

echo "<hr>";
echo "<h3>📊 Detalhes técnicos:</h3>";
echo "<pre style='background: #f0f0f0; padding: 10px; font-size: 12px; overflow: auto;'>";
echo "HTTP Code: $http_code\n";
echo "Total Time: " . ($curl_info['total_time'] ?? 'N/A') . "s\n";
echo "Connect Time: " . ($curl_info['connect_time'] ?? 'N/A') . "s\n";
echo "Primary IP: " . ($curl_info['primary_ip'] ?? 'N/A') . "\n";
echo "</pre>";

echo "<hr>";
echo "<p style='color: red;'>⚠️ <strong>APAGUE ESTE ARQUIVO APÓS O TESTE!</strong></p>";
?>
