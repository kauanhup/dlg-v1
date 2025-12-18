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
    
    // Create admin client for checking settings
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const body: RegisterRequest = await req.json();
    const { email, password, name, whatsapp } = body;

    console.log(`Register attempt for email: ${email}`);

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

    // Validate WhatsApp format
    const whatsappClean = whatsapp.replace(/\s/g, '');
    const whatsappRegex = /^\+?[0-9]{10,15}$/;
    if (!whatsappRegex.test(whatsappClean)) {
      return new Response(
        JSON.stringify({ success: false, error: "WhatsApp inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================
    // SERVER-SIDE CHECK: Is registration allowed?
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

    let allowRegistration = true;
    let maintenanceMode = false;

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
    // CREATE USER via Supabase Auth
    // ==========================================
    
    // Use the anon key client for signup (respects email confirmation settings)
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${req.headers.get('origin') || supabaseUrl}/login`,
        data: {
          name: name.trim(),
          whatsapp: whatsappClean,
        },
      },
    });

    if (signUpError) {
      console.error('SignUp error:', signUpError.message);
      
      // Handle specific errors with generic messages
      if (signUpError.message.includes('User already registered')) {
        // Don't reveal if email exists - use generic message
        return new Response(
          JSON.stringify({ 
            success: true, 
            requiresEmailConfirmation: true,
            message: "Se este email não estiver cadastrado, você receberá um link de confirmação." 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: "Erro ao criar conta. Tente novamente." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if email confirmation is required
    const requiresEmailConfirmation = signUpData.user && !signUpData.session;

    console.log(`User created: ${signUpData.user?.id}, requires confirmation: ${requiresEmailConfirmation}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        requiresEmailConfirmation,
        message: requiresEmailConfirmation 
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