import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LoginRequest {
  email: string;
  password: string;
  honeypot?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    
    const body: LoginRequest = await req.json();
    const { email, password, honeypot } = body;

    console.log(`Login attempt for email: ${email}`);

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
    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: "Email e senha são obrigatórios" }),
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
    // ATTEMPT AUTHENTICATION
    // ==========================================
    const emailClean = email.trim().toLowerCase();
    
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email: emailClean,
      password,
    });

    if (authError) {
      console.log('Auth error:', authError.message);
      
      // Generic error - never reveal if email exists or password is wrong
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Credenciais inválidas"
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!authData.user || !authData.session) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Credenciais inválidas"
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = authData.user.id;

    // ==========================================
    // CHECK IF PROFILE EXISTS (Email confirmed)
    // ==========================================
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, banned')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error checking profile:', profileError);
    }

    // If profile doesn't exist, account is not activated
    if (!profileData) {
      console.log('Login blocked: profile not found (email not confirmed)');
      
      // Sign out the user since they shouldn't have a session
      await supabaseAdmin.auth.admin.signOut(authData.session.access_token);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Conta não ativada. Verifique seu email.",
          code: "NOT_ACTIVATED"
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================
    // CHECK IF USER IS BANNED
    // ==========================================
    if (profileData.banned === true) {
      console.log('Login blocked: user is banned');
      
      // Sign out the user
      await supabaseAdmin.auth.admin.signOut(authData.session.access_token);
      
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
      .eq('user_id', userId)
      .maybeSingle();

    const userRole = roleData?.role || 'user';

    // ==========================================
    // LOG LOGIN ATTEMPT
    // ==========================================
    try {
      await supabaseAdmin.from('login_history').insert({
        user_id: userId,
        device: 'Web Browser',
        location: 'Brasil',
        status: 'success',
      });
    } catch (logError) {
      console.error('Error logging login:', logError);
    }

    console.log(`Login successful for user: ${userId}, role: ${userRole}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        session: authData.session,
        user: authData.user,
        role: userRole
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in login function:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
