<?php
/**
 * Debug - Descobre o IP do servidor Hostinger
 * 
 * Acesse: https://dlgconnect.com/api/debug-ip.php
 * APAGUE ESTE ARQUIVO DEPOIS DE USAR!
 */

header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 IP do Servidor Hostinger</h1>";
echo "<hr>";

// IPv4
$ipv4 = @file_get_contents('https://api.ipify.org');
echo "<p><strong>IPv4:</strong> " . ($ipv4 ?: 'Não detectado') . "</p>";

// IPv6 (se disponível)
$ipv6 = @file_get_contents('https://api6.ipify.org');
echo "<p><strong>IPv6:</strong> " . ($ipv6 ?: 'Não detectado') . "</p>";

// Alternativa
$ip2 = @file_get_contents('https://ifconfig.me');
echo "<p><strong>IP (ifconfig.me):</strong> " . ($ip2 ?: 'Não detectado') . "</p>";

// Server info
echo "<hr>";
echo "<p><strong>SERVER_ADDR:</strong> " . ($_SERVER['SERVER_ADDR'] ?? 'N/A') . "</p>";

echo "<hr>";
echo "<p style='color: red;'>⚠️ <strong>APAGUE ESTE ARQUIVO APÓS COPIAR O IP!</strong></p>";
echo "<p>O IP que você deve adicionar no BSPAY é o <strong>IPv4</strong> (ou IPv6 se o BSPAY exigir).</p>";
?>
