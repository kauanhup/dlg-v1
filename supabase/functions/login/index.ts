import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-forwarded-for, x-real-ip",
};

interface LoginValidationRequest {
  email: string;
  honeypot?: string;
  recaptchaToken?: string;
}

// Rate limit configuration
const MAX_FAILED_ATTEMPTS_USER = 5;    // Por usuário (via login_history)
const MAX_FAILED_ATTEMPTS_IP = 10;     // Por IP (inclui emails desconhecidos)
const RATE_LIMIT_WINDOW_MINUTES = 15;

/**
 * LOGIN EDGE FUNCTION
 * 
 * RESPONSABILIDADES (APENAS VALIDAÇÃO):
 * - Verificar rate limiting por IP (PRIMEIRO - antes de tudo)
 * - Verificar honeypot
 * - Verificar reCAPTCHA
 * - Verificar maintenance_mode
 * - Verificar se usuário existe (via profiles)
 * - Verificar se usuário está banido
 * - Rate limiting por usuário
 * - Registrar tentativa de login (login_history)
 * 
 * NÃO FAZ:
 * - signInWithPassword (isso é responsabilidade do frontend)
 * - Criar sessão
 * - Retornar tokens
 */
serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const body: LoginValidationRequest = await req.json();
    const { email, honeypot, recaptchaToken } = body;

    // Get client IP from headers
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
                  || req.headers.get('x-real-ip') 
                  || 'unknown';

    console.log(`Login validation for email: ${email}, IP: ${clientIp}`);

    // ==========================================
    // IP-BASED RATE LIMITING (PRIMEIRO CHECK)
    // Protege contra ataques de força bruta com emails aleatórios
    // ==========================================
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
    
    const { count: ipAttemptCount } = await supabaseAdmin
      .from('ip_login_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', clientIp)
      .gte('created_at', windowStart);

    if (ipAttemptCount && ipAttemptCount >= MAX_FAILED_ATTEMPTS_IP) {
      console.log(`IP rate limit exceeded: ${clientIp} (${ipAttemptCount} attempts)`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Muitas tentativas deste endereço. Aguarde ${RATE_LIMIT_WINDOW_MINUTES} minutos.`,
          code: "IP_RATE_LIMITED"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================
    // HONEYPOT CHECK - Silent rejection for bots
    // ==========================================
    if (honeypot && honeypot.length > 0) {
      console.log('Bot detected via honeypot');
      // Log IP attempt (bot detected)
      await logIpAttempt(supabaseAdmin, clientIp, email);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Credenciais inválidas",
          code: "BOT_DETECTED"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================
    // reCAPTCHA VALIDATION
    // ==========================================
    const { data: gatewayData } = await supabaseAdmin
      .from('gateway_settings')
      .select('recaptcha_enabled, recaptcha_secret_key')
      .eq('provider', 'pixup')
      .limit(1)
      .maybeSingle();

    if (gatewayData?.recaptcha_enabled && gatewayData?.recaptcha_secret_key) {
      if (!recaptchaToken) {
        console.log('reCAPTCHA token missing');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Verificação de segurança necessária",
            code: "RECAPTCHA_REQUIRED"
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify reCAPTCHA token with Google
      const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${gatewayData.recaptcha_secret_key}&response=${recaptchaToken}`
      });

      const recaptchaResult = await recaptchaResponse.json();
      console.log('reCAPTCHA verification result:', recaptchaResult.success);

      if (!recaptchaResult.success) {
        console.log('reCAPTCHA verification failed');
        await logIpAttempt(supabaseAdmin, clientIp, email);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Verificação de segurança falhou. Tente novamente.",
            code: "RECAPTCHA_FAILED"
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ==========================================
    // FIELD VALIDATIONS
    // ==========================================
    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email é obrigatório", code: "VALIDATION_ERROR" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Formato de email inválido", code: "VALIDATION_ERROR" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailClean = email.trim().toLowerCase();

    // ==========================================
    // SERVER-SIDE CHECK: System Settings
    // ==========================================
    const { data: settingsData } = await supabaseAdmin
      .from('system_settings')
      .select('key, value')
      .in('key', ['maintenance_mode']);

    let maintenanceMode = false;
    settingsData?.forEach((setting) => {
      if (setting.key === 'maintenance_mode') {
        maintenanceMode = setting.value === 'true';
      }
    });

    // Block if maintenance mode is active
    if (maintenanceMode) {
      console.log('Login blocked: maintenance mode');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Sistema em manutenção. Tente novamente mais tarde.",
          code: "MAINTENANCE"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================
    // CHECK USER VIA PROFILES TABLE
    // ==========================================
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, user_id, banned, email')
      .eq('email', emailClean)
      .maybeSingle();

    if (profileError) {
      console.error('Error checking profile:', profileError);
    }

    // If profile doesn't exist, account is not activated or doesn't exist
    // Log IP attempt and return generic error
    if (!profileData) {
      console.log('Login validation failed: profile not found');
      await logIpAttempt(supabaseAdmin, clientIp, emailClean);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email ou senha incorretos",
          code: "INVALID_CREDENTIALS"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================
    // USER-BASED RATE LIMITING (via login_history)
    // ==========================================
    const { count: userFailedCount } = await supabaseAdmin
      .from('login_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profileData.user_id)
      .eq('status', 'failed')
      .gte('created_at', windowStart);

    if (userFailedCount && userFailedCount >= MAX_FAILED_ATTEMPTS_USER) {
      console.log(`User rate limit exceeded: ${profileData.user_id}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Conta temporariamente bloqueada. Aguarde ${RATE_LIMIT_WINDOW_MINUTES} minutos.`,
          code: "USER_RATE_LIMITED"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================
    // CHECK IF USER IS BANNED
    // ==========================================
    if (profileData.banned === true) {
      console.log('Login blocked: user is banned');
      
      // Log failed login attempt
      await logLoginAttempt(supabaseAdmin, profileData.user_id, 'failed', 'Conta suspensa');
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Sua conta foi suspensa. Entre em contato com o suporte.",
          code: "BANNED"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================
    // GET USER ROLE
    // ==========================================
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', profileData.user_id)
      .maybeSingle();

    const userRole = roleData?.role || 'user';

    console.log(`Login validation successful for: ${emailClean}, role: ${userRole}`);

    // ==========================================
    // RETURN SUCCESS - Frontend will do signInWithPassword
    // ==========================================
    return new Response(
      JSON.stringify({ 
        success: true,
        canLogin: true,
        role: userRole,
        userId: profileData.user_id
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in login validation function:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erro interno. Tente novamente." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to log login attempts (for known users)
async function logLoginAttempt(
  supabaseAdmin: any, 
  userId: string, 
  status: 'success' | 'failed', 
  failureReason?: string
) {
  try {
    await supabaseAdmin.from('login_history').insert({
      user_id: userId,
      device: 'Web Browser',
      location: 'Brasil',
      status,
      failure_reason: failureReason || null,
    });
  } catch (error) {
    console.error('Error logging login attempt:', error);
  }
}

// Helper function to log IP attempts (for unknown emails or failed attempts)
async function logIpAttempt(
  supabaseAdmin: any,
  ipAddress: string,
  email: string
) {
  try {
    await supabaseAdmin.from('ip_login_attempts').insert({
      ip_address: ipAddress,
      email: email,
    });
  } catch (error) {
    console.error('Error logging IP attempt:', error);
  }
}
