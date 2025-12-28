<?php
/**
 * =====================================================
 * CONFIGURAÇÃO CENTRAL - DLG Connect
 * =====================================================
 * 
 * Este arquivo contém TODAS as credenciais do sistema.
 * EDITE AQUI e todos os outros arquivos PHP vão usar.
 * 
 * IMPORTANTE: Nunca compartilhe este arquivo!
 */

// =====================================================
// SUPABASE (Lovable Cloud)
// =====================================================
// Pegue no painel do Lovable Cloud ou Supabase Dashboard
define('SUPABASE_URL', 'https://nydtfckvvslkbyolipsf.supabase.co');
define('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55ZHRmY2t2dnNsa2J5b2xpcHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3OTMyNDMsImV4cCI6MjA4MTM2OTI0M30.1vHOv48yxJNkyjodlWA3l94mDVDMRwVa97a-0R_U4uI');

// IMPORTANTE: Pegue a Service Role Key no Supabase Dashboard
// Settings → API → service_role (NÃO é a anon key!)
define('SUPABASE_SERVICE_KEY', 'COLE_SUA_SERVICE_ROLE_KEY_AQUI');

// =====================================================
// BOT API - Autenticação do Bot
// =====================================================
// Crie uma chave secreta forte (ex: gere em https://randomkeygen.com/)
// Esta chave será usada pelo bot Python para autenticar
define('BOT_API_SECRET', 'dlg_bot_2024_TROQUE_ESTA_CHAVE_POR_UMA_SEGURA');

// =====================================================
// PIXUP / BSPAY - Gateway de Pagamento PIX
// =====================================================
// Pegue no painel da PixUp/BSPAY
define('PIXUP_PROXY_SECRET', 'COLE_SUA_CHAVE_PIXUP_AQUI');

// =====================================================
// ASAAS - Gateway de Pagamento (se usar)
// =====================================================
// Pegue no painel da Asaas
define('ASAAS_API_KEY', 'COLE_SUA_API_KEY_ASAAS_AQUI');

// =====================================================
// CONFIGURAÇÕES DO TRIAL
// =====================================================
define('TRIAL_DURATION_HOURS', 24);  // Duração do trial em horas
define('TRIAL_MAX_DEVICES', 1);      // Máximo de dispositivos no trial

// =====================================================
// DEBUG (desative em produção!)
// =====================================================
define('DEBUG_MODE', false);  // true = mostra erros, false = esconde

if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}
