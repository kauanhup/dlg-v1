<?php
/**
 * =====================================================
 * CONFIGURAÇÃO CENTRAL - DLG Connect
 * =====================================================
 * 
 * Este arquivo contém TODAS as credenciais do sistema.
 * 
 * IMPORTANTE: Nunca compartilhe este arquivo!
 */

// =====================================================
// SUPABASE (Lovable Cloud)
// =====================================================
define('SUPABASE_URL', 'https://nydtfckvvslkbyolipsf.supabase.co');
define('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55ZHRmY2t2dnNsa2J5b2xpcHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3OTMyNDMsImV4cCI6MjA4MTM2OTI0M30.1vHOv48yxJNkyjodlWA3l94mDVDMRwVa97a-0R_U4uI');

// ⚠️ VOCÊ PRECISA PREENCHER ESTA:
// Vá em: Lovable → Cloud → Settings → API → service_role (secret)
define('SUPABASE_SERVICE_KEY', 'COLE_AQUI_SUA_SERVICE_ROLE_KEY');

// =====================================================
// BOT API - Autenticação do Bot
// =====================================================
// Chave gerada para autenticar o bot - use esta mesma no Python
define('BOT_API_SECRET', 'dlg_bot_2024_Xk9mP2nQ7rT3wY5zB8cD4fG6hJ');

// =====================================================
// PIXUP / BSPAY - Gateway de Pagamento PIX
// =====================================================
// ⚠️ VOCÊ PRECISA PREENCHER SE USAR PIXUP:
define('PIXUP_PROXY_SECRET', 'COLE_AQUI_SUA_CHAVE_PIXUP');

// =====================================================
// ASAAS - Gateway de Pagamento
// =====================================================
// ⚠️ VOCÊ PRECISA PREENCHER SE USAR ASAAS:
define('ASAAS_API_KEY', 'COLE_AQUI_SUA_API_KEY_ASAAS');

// =====================================================
// CONFIGURAÇÕES DO TRIAL
// =====================================================
define('TRIAL_DURATION_HOURS', 24);
define('TRIAL_MAX_DEVICES', 1);

// =====================================================
// DEBUG (mude para false em produção!)
// =====================================================
define('DEBUG_MODE', false);

if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}
