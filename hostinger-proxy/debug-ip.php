<?php
/**
 * Debug - Descobre o IP do servidor Hostinger (entrada e saída)
 * 
 * Acesse: https://dlgconnect.com/api/debug-ip.php
 * APAGUE ESTE ARQUIVO DEPOIS DE USAR!
 */

header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 IP do Servidor Hostinger</h1>";
echo "<hr>";

// ========== IPs do SERVIDOR ==========
echo "<h2>📥 IPs do Servidor (quando recebe requisições)</h2>";

// IPv4
$ipv4 = @file_get_contents('https://api.ipify.org');
echo "<p><strong>IPv4:</strong> " . ($ipv4 ?: 'Não detectado') . "</p>";

// IPv6 (se disponível)
$ipv6 = @file_get_contents('https://api6.ipify.org');
echo "<p><strong>IPv6:</strong> " . ($ipv6 ?: 'Não detectado') . "</p>";

// Server info
echo "<p><strong>SERVER_ADDR:</strong> " . ($_SERVER['SERVER_ADDR'] ?? 'N/A') . "</p>";

// ========== IP de SAÍDA (quando FAZ requisições) ==========
echo "<hr>";
echo "<h2>📤 IP de Saída (quando o servidor FAZ requisições para APIs externas)</h2>";
echo "<p>Este é o IP que o BSPAY/PixUp vai ver quando você chamar a API deles.</p>";

// Teste usando cURL para ver o IP de saída
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.ipify.org');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4); // Força IPv4
$outgoing_ip_v4 = curl_exec($ch);
$curl_error = curl_error($ch);
curl_close($ch);

echo "<p><strong>IP de Saída (IPv4 via cURL):</strong> " . ($outgoing_ip_v4 ?: "Erro: $curl_error") . "</p>";

// Teste IPv6 de saída
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api64.ipify.org');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$outgoing_ip_v6 = curl_exec($ch);
curl_close($ch);

echo "<p><strong>IP de Saída (IPv6 via cURL):</strong> " . ($outgoing_ip_v6 ?: 'Não detectado ou não suportado') . "</p>";

// ========== RESUMO ==========
echo "<hr>";
echo "<h2>✅ RESUMO - Adicione estes IPs no BSPAY:</h2>";
echo "<div style='background: #f0f0f0; padding: 15px; border-radius: 8px; font-family: monospace;'>";
if ($outgoing_ip_v4) {
    echo "<p><strong>IPv4 (PRINCIPAL):</strong> <code style='background: #ddd; padding: 5px;'>$outgoing_ip_v4</code></p>";
}
if ($outgoing_ip_v6 && $outgoing_ip_v6 !== $outgoing_ip_v4) {
    echo "<p><strong>IPv6 (se necessário):</strong> <code style='background: #ddd; padding: 5px;'>$outgoing_ip_v6</code></p>";
}
echo "</div>";

echo "<hr>";
echo "<p style='color: red;'>⚠️ <strong>APAGUE ESTE ARQUIVO APÓS COPIAR OS IPs!</strong></p>";
?>
