<?php
/**
 * BOT API - DLG Connect
 * API PHP para autenticação e verificação do bot
 * 
 * Actions disponíveis:
 * - login: Autenticação básica
 * - check_license: Verificar licença ativa
 * - full_login_check: Login completo com todas verificações
 * - register_trial: Registrar período de trial
 * - check_trial: Verificar elegibilidade de trial
 * - logout: Encerrar sessão do dispositivo
 */

// Carregar configurações
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function supabaseRequest($endpoint, $method = 'GET', $body = null, $params = []) {
    $url = SUPABASE_URL . '/rest/v1/' . $endpoint;
    
    if (!empty($params)) {
        $url .= '?' . http_build_query($params);
    }
    
    $headers = [
        'apikey: ' . SUPABASE_SERVICE_KEY,
        'Authorization: Bearer ' . SUPABASE_SERVICE_KEY,
        'Content-Type: application/json',
        'Prefer: return=representation'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($body) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }
    } elseif ($method === 'PATCH') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
        if ($body) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }
    } elseif ($method === 'DELETE') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'data' => json_decode($response, true),
        'status' => $httpCode
    ];
}

function validateApiKey($request) {
    $apiKey = $request['api_key'] ?? $_SERVER['HTTP_X_API_KEY'] ?? null;
    
    if (!$apiKey || $apiKey !== BOT_API_SECRET) {
        jsonResponse(['success' => false, 'error' => 'API key inválida'], 401);
    }
}

function getClientIP() {
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    }
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

function logActivity($userId, $action, $details = [], $deviceId = null) {
    supabaseRequest('bot_activity_logs', 'POST', [
        'user_id' => $userId,
        'action' => $action,
        'details' => $details,
        'device_id' => $deviceId,
        'ip_address' => getClientIP()
    ]);
}

// =====================================================
// ACTIONS
// =====================================================

function actionLogin($request) {
    $email = $request['email'] ?? null;
    $password = $request['password'] ?? null;
    
    if (!$email || !$password) {
        jsonResponse(['success' => false, 'error' => 'Email e senha são obrigatórios'], 400);
    }
    
    // Autenticar via Supabase Auth
    $authUrl = SUPABASE_URL . '/auth/v1/token?grant_type=password';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $authUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'apikey: ' . SUPABASE_SERVICE_KEY,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'email' => $email,
        'password' => $password
    ]));
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $authData = json_decode($response, true);
    
    if ($httpCode !== 200 || !isset($authData['user'])) {
        jsonResponse(['success' => false, 'error' => 'Credenciais inválidas'], 401);
    }
    
    $user = $authData['user'];
    
    // Buscar profile
    $profileResult = supabaseRequest('profiles', 'GET', null, [
        'user_id' => 'eq.' . $user['id'],
        'select' => '*'
    ]);
    
    $profile = $profileResult['data'][0] ?? null;
    
    jsonResponse([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $profile['name'] ?? '',
            'avatar' => $profile['avatar'] ?? '😀'
        ],
        'access_token' => $authData['access_token']
    ]);
}

function actionCheckLicense($request) {
    $userId = $request['user_id'] ?? null;
    
    if (!$userId) {
        jsonResponse(['success' => false, 'error' => 'user_id é obrigatório'], 400);
    }
    
    // Buscar licença ativa
    $licenseResult = supabaseRequest('licenses', 'GET', null, [
        'user_id' => 'eq.' . $userId,
        'status' => 'eq.active',
        'select' => '*',
        'order' => 'end_date.desc',
        'limit' => '1'
    ]);
    
    $license = $licenseResult['data'][0] ?? null;
    
    if (!$license) {
        jsonResponse([
            'success' => true,
            'hasLicense' => false,
            'license' => null
        ]);
    }
    
    // Verificar se expirou
    $endDate = strtotime($license['end_date']);
    $now = time();
    
    if ($endDate < $now) {
        // Expirar a licença
        supabaseRequest('licenses?id=eq.' . $license['id'], 'PATCH', [
            'status' => 'expired',
            'updated_at' => date('c')
        ]);
        
        jsonResponse([
            'success' => true,
            'hasLicense' => false,
            'license' => null,
            'expired' => true
        ]);
    }
    
    // Buscar plano para max_devices
    $planResult = supabaseRequest('subscription_plans', 'GET', null, [
        'name' => 'eq.' . $license['plan_name'],
        'select' => 'max_devices'
    ]);
    
    $maxDevices = $planResult['data'][0]['max_devices'] ?? 1;
    
    jsonResponse([
        'success' => true,
        'hasLicense' => true,
        'license' => [
            'id' => $license['id'],
            'plan_name' => $license['plan_name'],
            'start_date' => $license['start_date'],
            'end_date' => $license['end_date'],
            'status' => $license['status']
        ],
        'maxDevices' => $maxDevices
    ]);
}

function actionFullLoginCheck($request) {
    $email = $request['email'] ?? null;
    $password = $request['password'] ?? null;
    $deviceFingerprint = $request['device_fingerprint'] ?? null;
    $deviceName = $request['device_name'] ?? null;
    $deviceOs = $request['device_os'] ?? null;
    $machineId = $request['machine_id'] ?? null;
    
    if (!$email || !$password) {
        jsonResponse(['success' => false, 'error' => 'Email e senha são obrigatórios'], 400);
    }
    
    if (!$deviceFingerprint) {
        jsonResponse(['success' => false, 'error' => 'device_fingerprint é obrigatório'], 400);
    }
    
    // 1. Verificar manutenção
    $maintenanceResult = supabaseRequest('system_settings', 'GET', null, [
        'key' => 'eq.maintenance_mode',
        'select' => 'value'
    ]);
    
    $maintenanceMode = ($maintenanceResult['data'][0]['value'] ?? 'false') === 'true';
    
    if ($maintenanceMode) {
        jsonResponse([
            'success' => false,
            'error' => 'Sistema em manutenção',
            'code' => 'MAINTENANCE'
        ], 503);
    }
    
    // 2. Autenticar usuário
    $authUrl = SUPABASE_URL . '/auth/v1/token?grant_type=password';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $authUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'apikey: ' . SUPABASE_SERVICE_KEY,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'email' => $email,
        'password' => $password
    ]));
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $authData = json_decode($response, true);
    
    if ($httpCode !== 200 || !isset($authData['user'])) {
        jsonResponse([
            'success' => false,
            'error' => 'Credenciais inválidas',
            'code' => 'INVALID_CREDENTIALS'
        ], 401);
    }
    
    $user = $authData['user'];
    $userId = $user['id'];
    
    // 3. Verificar ban
    $profileResult = supabaseRequest('profiles', 'GET', null, [
        'user_id' => 'eq.' . $userId,
        'select' => '*'
    ]);
    
    $profile = $profileResult['data'][0] ?? null;
    
    if ($profile && $profile['banned']) {
        logActivity($userId, 'login_blocked_banned', ['reason' => $profile['ban_reason']], $deviceFingerprint);
        jsonResponse([
            'success' => false,
            'error' => 'Conta banida',
            'code' => 'BANNED',
            'reason' => $profile['ban_reason']
        ], 403);
    }
    
    // 4. Verificar licença ativa
    $licenseResult = supabaseRequest('licenses', 'GET', null, [
        'user_id' => 'eq.' . $userId,
        'status' => 'eq.active',
        'select' => '*',
        'order' => 'end_date.desc',
        'limit' => '1'
    ]);
    
    $license = $licenseResult['data'][0] ?? null;
    $hasValidLicense = false;
    $maxDevices = 1;
    
    if ($license) {
        $endDate = strtotime($license['end_date']);
        $now = time();
        
        if ($endDate >= $now) {
            $hasValidLicense = true;
            
            // Buscar max_devices do plano
            $planResult = supabaseRequest('subscription_plans', 'GET', null, [
                'name' => 'eq.' . $license['plan_name'],
                'select' => 'max_devices'
            ]);
            $maxDevices = $planResult['data'][0]['max_devices'] ?? 1;
        } else {
            // Expirar licença automaticamente
            supabaseRequest('licenses?id=eq.' . $license['id'], 'PATCH', [
                'status' => 'expired',
                'updated_at' => date('c')
            ]);
            $license = null;
        }
    }
    
    // 5. Se não tem licença, verificar trial
    $trialInfo = null;
    $canUseTrial = false;
    
    if (!$hasValidLicense) {
        // Verificar trial existente para este device
        $trialResult = supabaseRequest('trial_device_history', 'GET', null, [
            'device_fingerprint' => 'eq.' . $deviceFingerprint,
            'select' => '*',
            'order' => 'trial_started_at.desc',
            'limit' => '1'
        ]);
        
        $existingTrial = $trialResult['data'][0] ?? null;
        
        // Buscar duração do trial das configurações
        $trialDurationResult = supabaseRequest('system_settings', 'GET', null, [
            'key' => 'eq.trial_duration_hours',
            'select' => 'value'
        ]);
        $trialDurationHours = intval($trialDurationResult['data'][0]['value'] ?? TRIAL_DURATION_HOURS);
        
        if ($existingTrial) {
            $trialStart = strtotime($existingTrial['trial_started_at']);
            $trialEnd = $trialStart + ($trialDurationHours * 3600);
            $now = time();
            
            if ($now < $trialEnd) {
                // Trial ainda válido
                $trialInfo = [
                    'active' => true,
                    'started_at' => $existingTrial['trial_started_at'],
                    'expires_at' => date('c', $trialEnd),
                    'hours_remaining' => round(($trialEnd - $now) / 3600, 1)
                ];
                $maxDevices = TRIAL_MAX_DEVICES;
            } else {
                // Trial expirado
                $trialInfo = [
                    'active' => false,
                    'expired' => true,
                    'expired_at' => date('c', $trialEnd)
                ];
            }
        } else {
            // Nunca usou trial neste device - elegível
            $canUseTrial = true;
            $trialInfo = [
                'active' => false,
                'eligible' => true,
                'duration_hours' => $trialDurationHours
            ];
        }
    }
    
    // 6. Se não tem licença e trial não está ativo
    if (!$hasValidLicense && (!$trialInfo || !$trialInfo['active']) && !$canUseTrial) {
        logActivity($userId, 'login_no_license', ['trial_info' => $trialInfo], $deviceFingerprint);
        jsonResponse([
            'success' => false,
            'error' => 'Sem licença ativa',
            'code' => 'NO_LICENSE',
            'trial' => $trialInfo,
            'user' => [
                'id' => $userId,
                'email' => $user['email'],
                'name' => $profile['name'] ?? ''
            ]
        ], 403);
    }
    
    // 7. Verificar limite de dispositivos
    $activeDevicesResult = supabaseRequest('bot_device_sessions', 'GET', null, [
        'user_id' => 'eq.' . $userId,
        'is_active' => 'eq.true',
        'select' => '*'
    ]);
    
    $activeDevices = $activeDevicesResult['data'] ?? [];
    $currentDeviceSession = null;
    
    foreach ($activeDevices as $device) {
        if ($device['device_id'] === $deviceFingerprint) {
            $currentDeviceSession = $device;
            break;
        }
    }
    
    if (!$currentDeviceSession && count($activeDevices) >= $maxDevices) {
        logActivity($userId, 'login_device_limit', [
            'active_devices' => count($activeDevices),
            'max_devices' => $maxDevices
        ], $deviceFingerprint);
        
        jsonResponse([
            'success' => false,
            'error' => 'Limite de dispositivos atingido',
            'code' => 'DEVICE_LIMIT',
            'activeDevices' => count($activeDevices),
            'maxDevices' => $maxDevices
        ], 403);
    }
    
    // 8. Registrar/Atualizar sessão do dispositivo
    if ($currentDeviceSession) {
        // Atualizar última atividade
        supabaseRequest('bot_device_sessions?id=eq.' . $currentDeviceSession['id'], 'PATCH', [
            'last_activity_at' => date('c'),
            'device_name' => $deviceName,
            'device_os' => $deviceOs,
            'ip_address' => getClientIP()
        ]);
    } else {
        // Criar nova sessão
        supabaseRequest('bot_device_sessions', 'POST', [
            'user_id' => $userId,
            'device_id' => $deviceFingerprint,
            'device_name' => $deviceName,
            'device_os' => $deviceOs,
            'ip_address' => getClientIP(),
            'is_active' => true
        ]);
    }
    
    // 9. Log de sucesso
    logActivity($userId, 'login_success', [
        'has_license' => $hasValidLicense,
        'trial_active' => $trialInfo['active'] ?? false,
        'device_name' => $deviceName
    ], $deviceFingerprint);
    
    // 10. Resposta de sucesso
    jsonResponse([
        'success' => true,
        'user' => [
            'id' => $userId,
            'email' => $user['email'],
            'name' => $profile['name'] ?? '',
            'avatar' => $profile['avatar'] ?? '😀'
        ],
        'license' => $hasValidLicense ? [
            'id' => $license['id'],
            'plan_name' => $license['plan_name'],
            'end_date' => $license['end_date'],
            'days_remaining' => round((strtotime($license['end_date']) - time()) / 86400)
        ] : null,
        'trial' => $trialInfo,
        'canUseTrial' => $canUseTrial,
        'maxDevices' => $maxDevices,
        'activeDevices' => count($activeDevices) + ($currentDeviceSession ? 0 : 1),
        'access_token' => $authData['access_token']
    ]);
}

function actionRegisterTrial($request) {
    $userId = $request['user_id'] ?? null;
    $deviceFingerprint = $request['device_fingerprint'] ?? null;
    $deviceName = $request['device_name'] ?? null;
    $deviceOs = $request['device_os'] ?? null;
    $machineId = $request['machine_id'] ?? null;
    
    if (!$userId || !$deviceFingerprint) {
        jsonResponse(['success' => false, 'error' => 'user_id e device_fingerprint são obrigatórios'], 400);
    }
    
    // Verificar se já usou trial neste device
    $existingResult = supabaseRequest('trial_device_history', 'GET', null, [
        'device_fingerprint' => 'eq.' . $deviceFingerprint,
        'select' => 'id'
    ]);
    
    if (!empty($existingResult['data'])) {
        jsonResponse([
            'success' => false,
            'error' => 'Este dispositivo já utilizou o período de trial',
            'code' => 'TRIAL_ALREADY_USED'
        ], 400);
    }
    
    // Buscar duração do trial
    $trialDurationResult = supabaseRequest('system_settings', 'GET', null, [
        'key' => 'eq.trial_duration_hours',
        'select' => 'value'
    ]);
    $trialDurationHours = intval($trialDurationResult['data'][0]['value'] ?? TRIAL_DURATION_HOURS);
    
    $now = time();
    $expiresAt = $now + ($trialDurationHours * 3600);
    
    // Registrar trial
    $insertResult = supabaseRequest('trial_device_history', 'POST', [
        'user_id' => $userId,
        'device_fingerprint' => $deviceFingerprint,
        'device_name' => $deviceName,
        'device_os' => $deviceOs,
        'machine_id' => $machineId,
        'ip_address' => getClientIP(),
        'trial_started_at' => date('c', $now),
        'trial_expired_at' => date('c', $expiresAt)
    ]);
    
    if ($insertResult['status'] !== 201) {
        jsonResponse(['success' => false, 'error' => 'Erro ao registrar trial'], 500);
    }
    
    logActivity($userId, 'trial_started', [
        'duration_hours' => $trialDurationHours,
        'expires_at' => date('c', $expiresAt)
    ], $deviceFingerprint);
    
    jsonResponse([
        'success' => true,
        'trial' => [
            'active' => true,
            'started_at' => date('c', $now),
            'expires_at' => date('c', $expiresAt),
            'duration_hours' => $trialDurationHours
        ]
    ]);
}

function actionCheckTrial($request) {
    $deviceFingerprint = $request['device_fingerprint'] ?? null;
    
    if (!$deviceFingerprint) {
        jsonResponse(['success' => false, 'error' => 'device_fingerprint é obrigatório'], 400);
    }
    
    $trialResult = supabaseRequest('trial_device_history', 'GET', null, [
        'device_fingerprint' => 'eq.' . $deviceFingerprint,
        'select' => '*',
        'order' => 'trial_started_at.desc',
        'limit' => '1'
    ]);
    
    $trial = $trialResult['data'][0] ?? null;
    
    if (!$trial) {
        jsonResponse([
            'success' => true,
            'trial' => [
                'exists' => false,
                'eligible' => true
            ]
        ]);
    }
    
    // Buscar duração do trial
    $trialDurationResult = supabaseRequest('system_settings', 'GET', null, [
        'key' => 'eq.trial_duration_hours',
        'select' => 'value'
    ]);
    $trialDurationHours = intval($trialDurationResult['data'][0]['value'] ?? TRIAL_DURATION_HOURS);
    
    $trialStart = strtotime($trial['trial_started_at']);
    $trialEnd = $trialStart + ($trialDurationHours * 3600);
    $now = time();
    
    jsonResponse([
        'success' => true,
        'trial' => [
            'exists' => true,
            'active' => $now < $trialEnd,
            'started_at' => $trial['trial_started_at'],
            'expires_at' => date('c', $trialEnd),
            'expired' => $now >= $trialEnd,
            'eligible' => false
        ]
    ]);
}

function actionLogout($request) {
    $userId = $request['user_id'] ?? null;
    $deviceFingerprint = $request['device_fingerprint'] ?? null;
    
    if (!$userId || !$deviceFingerprint) {
        jsonResponse(['success' => false, 'error' => 'user_id e device_fingerprint são obrigatórios'], 400);
    }
    
    // Desativar sessão do dispositivo
    supabaseRequest('bot_device_sessions?user_id=eq.' . $userId . '&device_id=eq.' . $deviceFingerprint, 'PATCH', [
        'is_active' => false,
        'last_activity_at' => date('c')
    ]);
    
    logActivity($userId, 'logout', [], $deviceFingerprint);
    
    jsonResponse(['success' => true, 'message' => 'Logout realizado']);
}

// =====================================================
// ROUTER
// =====================================================

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Método não permitido'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    jsonResponse(['success' => false, 'error' => 'JSON inválido'], 400);
}

$action = $input['action'] ?? null;

if (!$action) {
    jsonResponse(['success' => false, 'error' => 'Action não especificada'], 400);
}

// Validar API key (exceto para login básico que usa credenciais)
if (!in_array($action, ['login'])) {
    validateApiKey($input);
}

// Router
switch ($action) {
    case 'login':
        actionLogin($input);
        break;
        
    case 'check_license':
        actionCheckLicense($input);
        break;
        
    case 'full_login_check':
        actionFullLoginCheck($input);
        break;
        
    case 'register_trial':
        actionRegisterTrial($input);
        break;
        
    case 'check_trial':
        actionCheckTrial($input);
        break;
        
    case 'logout':
        actionLogout($input);
        break;
        
    default:
        jsonResponse(['success' => false, 'error' => 'Action desconhecida: ' . $action], 400);
}
