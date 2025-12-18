import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  whatsapp: string;
  honeypot?: string; // Bot trap field - should be empty
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
    
    // Create admin client for checking settings and admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const body: RegisterRequest = await req.json();
    const { email, password, name, whatsapp, honeypot } = body;

    console.log(`Register attempt for email: ${email}`);

    // ==========================================
    // HONEYPOT CHECK - Silent rejection for bots
    // ==========================================
    if (honeypot && honeypot.length > 0) {
      console.log('Bot detected via honeypot');
      // Return fake success to not reveal the trap
      return new Response(
        JSON.stringify({ 
          success: true, 
          requiresEmailConfirmation: true,
          message: "Verifique seu email para confirmar o cadastro."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================
    // FIELD VALIDATIONS
    // ==========================================
    
    // Validate required fields
    if (!email || !password || !name || !whatsapp) {
      return new Response(
        JSON.stringify({ success: false, error: "Todos os campos são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Email inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return new Response(
        JSON.stringify({ success: false, error: "A senha deve ter pelo menos 8 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate name
    if (name.trim().length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: "Nome inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate WhatsApp format (10-15 digits)
    const whatsappClean = whatsapp.replace(/\D/g, ''); // Remove all non-digits
    if (whatsappClean.length < 10 || whatsappClean.length > 15) {
      return new Response(
        JSON.stringify({ success: false, error: "WhatsApp inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================
    // SERVER-SIDE CHECK: System Settings
    // ==========================================
    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from('system_settings')
      .select('key, value')
      .in('key', ['allow_registrations', 'maintenance_mode']);

    if (settingsError) {
      console.error('Error fetching system settings:', settingsError);
      return new Response(
        JSON.stringify({ success: false, error: "Erro interno do servidor" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get email verification setting from gateway_settings (Admin API section)
    const { data: gatewayData, error: gatewayError } = await supabaseAdmin
      .from('gateway_settings')
      .select('email_verification_enabled')
      .limit(1)
      .single();

    let allowRegistration = true;
    let maintenanceMode = false;
    let requireEmailConfirmation = gatewayData?.email_verification_enabled ?? false;

    settingsData?.forEach((setting) => {
      if (setting.key === 'allow_registrations') {
        allowRegistration = setting.value === 'true';
      }
      if (setting.key === 'maintenance_mode') {
        maintenanceMode = setting.value === 'true';
      }
    });

    // Block if maintenance mode is active
    if (maintenanceMode) {
      console.log('Registration blocked: maintenance mode');
      return new Response(
        JSON.stringify({ success: false, error: "Sistema temporariamente indisponível" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Block if registration is disabled (generic error to not reveal config)
    if (!allowRegistration) {
      console.log('Registration blocked: registrations disabled');
      return new Response(
        JSON.stringify({ success: false, error: "Não foi possível criar a conta no momento" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================
    // CREATE USER via Supabase Auth Admin API
    // ==========================================
    
    const emailClean = email.trim().toLowerCase();
    
    // Use admin API to have full control over user creation
    const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: emailClean,
      password,
      email_confirm: !requireEmailConfirmation, // Auto-confirm if not requiring email confirmation
      user_metadata: {
        name: name.trim(),
        whatsapp: whatsappClean,
      },
    });

    if (signUpError) {
      console.error('SignUp error:', signUpError.message);
      
      // Handle specific errors with generic messages to not reveal user existence
      if (signUpError.message.includes('already been registered') || 
          signUpError.message.includes('User already registered') ||
          signUpError.message.includes('already exists')) {
        console.log('Email already exists, returning generic message');
        // Return same response as success to not reveal if email exists
        return new Response(
          JSON.stringify({ 
            success: true, 
            requiresEmailConfirmation: requireEmailConfirmation,
            message: requireEmailConfirmation 
              ? "Se este email não estiver cadastrado, você receberá um link de confirmação."
              : "Se este email não estiver cadastrado, sua conta foi criada."
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: "Erro ao criar conta. Tente novamente." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If email confirmation is required, send the invite email
    if (requireEmailConfirmation && signUpData.user) {
      const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(emailClean, {
        redirectTo: `${req.headers.get('origin') || supabaseUrl}/login`,
        data: {
          name: name.trim(),
          whatsapp: whatsappClean,
        },
      });

      if (inviteError) {
        console.error('Error sending invite email:', inviteError);
        // User was created but email failed - delete the user to maintain consistency
        await supabaseAdmin.auth.admin.deleteUser(signUpData.user.id);
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao enviar email de confirmação. Tente novamente." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`User created: ${signUpData.user?.id}, requires confirmation: ${requireEmailConfirmation}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        requiresEmailConfirmation: requireEmailConfirmation,
        message: requireEmailConfirmation 
          ? "Verifique seu email para confirmar o cadastro." 
          : "Conta criada com sucesso!"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in register function:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});