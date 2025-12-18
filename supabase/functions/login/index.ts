import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LoginValidationRequest {
  email: string;
  honeypot?: string;
}

// Rate limit configuration
const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MINUTES = 15;

/**
 * LOGIN EDGE FUNCTION
 * 
 * RESPONSABILIDADES (APENAS VALIDAÇÃO):
 * - Verificar maintenance_mode
 * - Verificar se usuário existe (via profiles)
 * - Verificar se usuário está banido
 * - Verificar se profile existe (conta ativada)
 * - Rate limiting no backend
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
    const { email, honeypot } = body;

    console.log(`Login validation for email: ${email}`);

    // ==========================================
    // HONEYPOT CHECK - Silent rejection for bots
    // ==========================================
    if (honeypot && honeypot.length > 0) {
      console.log('Bot detected via honeypot');
      // Return generic error to not reveal the trap
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Credenciais inválidas"
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================
    // FIELD VALIDATIONS
    // ==========================================
    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Email inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailClean = email.trim().toLowerCase();

    // ==========================================
    // BACKEND RATE LIMITING (via login_history)
    // ==========================================
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
    
    // First, get user_id from profiles (if exists)
    const { data: profileForRate } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('email', emailClean)
      .maybeSingle();
    
    if (profileForRate) {
      // Count recent failed attempts for this user
      const { count } = await supabaseAdmin
        .from('login_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileForRate.user_id)
        .eq('status', 'failed')
        .gte('created_at', windowStart);
      
      if (count && count >= MAX_FAILED_ATTEMPTS) {
        console.log(`Rate limit exceeded for user: ${profileForRate.user_id}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Muitas tentativas. Aguarde ${RATE_LIMIT_WINDOW_MINUTES} minutos.`,
            code: "RATE_LIMITED"
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

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
          error: "Sistema em manutenção",
          code: "MAINTENANCE"
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================
    // CHECK USER VIA PROFILES TABLE (NOT listUsers)
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
    // Return generic error to not reveal if email exists
    if (!profileData) {
      console.log('Login validation failed: profile not found');
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Credenciais inválidas"
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
          error: "Conta suspensa",
          code: "BANNED"
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
    // Note: login_history will be logged after successful auth in frontend
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
      JSON.stringify({ success: false, error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to log login attempts
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
