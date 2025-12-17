<?php
/**
 * Debug - Testa conexão com BSPAY diretamente
 * 
 * Acesse: https://dlgconnect.com/api/debug-bspay.php
 * APAGUE ESTE ARQUIVO DEPOIS DE USAR!
 */

header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 Debug Conexão BSPAY</h1>";
echo "<hr>";

// Coloque suas credenciais aqui para testar
$CLIENT_ID = ''; // Cole seu client_id aqui
$CLIENT_SECRET = ''; // Cole seu client_secret aqui
$BSPAY_API_URL = 'https://api.bfrpagamentos.com.br';

if (empty($CLIENT_ID) || empty($CLIENT_SECRET)) {
    echo "<p style='color: red;'>⚠️ Configure CLIENT_ID e CLIENT_SECRET no arquivo para testar!</p>";
    echo "<p>Edite o arquivo debug-bspay.php e coloque suas credenciais.</p>";
    exit;
}

echo "<h2>📤 Testando conexão com BSPAY...</h2>";

// IP de saída
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.ipify.org');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
$outgoing_ip = curl_exec($ch);
curl_close($ch);
echo "<p><strong>IP de saída:</strong> $outgoing_ip</p>";
echo "<p>⚠️ Certifique-se que este IP está no whitelist do BSPAY!</p>";

echo "<hr>";
echo "<h2>🔐 Tentando obter Access Token...</h2>";

// Tentar obter token
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $BSPAY_API_URL . '/oauth/token');
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

// Para debug
curl_setopt($ch, CURLOPT_VERBOSE, true);
$verbose = fopen('php://temp', 'w+');
curl_setopt($ch, CURLOPT_STDERR, $verbose);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
$curl_info = curl_getinfo($ch);

// Get verbose info
rewind($verbose);
$verbose_log = stream_get_contents($verbose);

curl_close($ch);

echo "<p><strong>URL chamada:</strong> {$BSPAY_API_URL}/oauth/token</p>";
echo "<p><strong>HTTP Status:</strong> $http_code</p>";

if ($curl_error) {
    echo "<p style='color: red;'><strong>Erro cURL:</strong> $curl_error</p>";
}

echo "<h3>📥 Resposta do BSPAY:</h3>";
echo "<pre style='background: #f0f0f0; padding: 10px; overflow: auto;'>";
echo htmlspecialchars($response ?: 'Sem resposta');
echo "</pre>";

// Parse response
$data = json_decode($response, true);

if ($http_code === 200 && isset($data['access_token'])) {
    echo "<p style='color: green;'>✅ <strong>SUCESSO!</strong> Token obtido com sucesso!</p>";
    echo "<p>O problema NÃO é a conexão com BSPAY. Verifique se as credenciais no admin estão corretas.</p>";
} else {
    echo "<p style='color: red;'>❌ <strong>FALHA!</strong> Não foi possível obter o token.</p>";
    
    if ($http_code === 401 || $http_code === 403) {
        echo "<p>Possíveis causas:</p>";
        echo "<ul>";
        echo "<li>Credenciais (client_id/client_secret) incorretas</li>";
        echo "<li>IP <strong>$outgoing_ip</strong> não está no whitelist do BSPAY</li>";
        echo "</ul>";
    } elseif ($http_code === 0) {
        echo "<p>Não foi possível conectar ao servidor BSPAY. Verifique a URL da API.</p>";
    }
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
