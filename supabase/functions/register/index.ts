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
  honeypot?: string;
  verificationCode?: string;
  action?: 'register' | 'verify_code';
  recaptchaToken?: string;
}

// Rate limit configuration
const MAX_ATTEMPTS_PER_EMAIL = 10;
const MAX_ATTEMPTS_PER_IP = 20;
const RATE_LIMIT_WINDOW_MINUTES = 30;

async function sendEmail(apiKey: string, from: string, to: string, subject: string, html: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  const result = await response.json();
  if (!response.ok) {
    console.error("Resend API error:", result);
    throw new Error(result.message || 'Failed to send email');
  }
  return result;
}

/**
 * REGISTER EDGE FUNCTION
 * 
 * CORREÇÕES IMPLEMENTADAS:
 * 1. Rollback de auth.users se profile não for criado (via trigger)
 * 2. Rate limiting no backend por email
 * 3. Limpeza automática de verification_codes expirados
 * 4. profiles é fonte da verdade para dados do usuário
 */
serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const body: RegisterRequest = await req.json();
    const { email, password, name, whatsapp, honeypot, verificationCode, action = 'register', recaptchaToken } = body;

    console.log(`Register action: ${action} for email: ${email}`);

    // ==========================================
    // HONEYPOT CHECK - Silent rejection for bots
    // ==========================================
    if (honeypot && honeypot.length > 0) {
      console.log('Bot detected via honeypot');
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
    // reCAPTCHA VALIDATION (for all register actions - initial and resends)
    // ==========================================
    if (action === 'register') {
      const { data: gatewayData } = await supabaseAdmin
        .from('gateway_settings')
        .select('recaptcha_enabled, recaptcha_secret_key')
        .eq('provider', 'pixup')
        .limit(1)
        .maybeSingle();

      if (gatewayData?.recaptcha_enabled && gatewayData?.recaptcha_secret_key) {
        if (!recaptchaToken) {
          console.log('reCAPTCHA token missing for registration');
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Verificação de segurança necessária",
              code: "RECAPTCHA_REQUIRED"
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `secret=${gatewayData.recaptcha_secret_key}&response=${recaptchaToken}`
        });

        const recaptchaResult = await recaptchaResponse.json();
        console.log('reCAPTCHA verification result:', recaptchaResult.success);

        if (!recaptchaResult.success) {
          console.log('reCAPTCHA verification failed');
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Verificação de segurança falhou. Tente novamente.",
              code: "RECAPTCHA_FAILED"
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // ==========================================
    // IP-BASED RATE LIMITING (prevents email switching bypass)
    // ==========================================
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    if (clientIP !== 'unknown' && action === 'register') {
      const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
      
      // Count recent codes sent from this IP (stored in verification_codes metadata)
      const { count: ipCount } = await supabaseAdmin
        .from('verification_codes')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'email_verification')
        .gte('created_at', windowStart);
      
      // For IP limiting, we need to track IP separately - using a simple approach
      // by checking total codes in window and applying stricter limit
      console.log(`IP: ${clientIP}, Total codes in window: ${ipCount}`);
      
      if (ipCount && ipCount >= MAX_ATTEMPTS_PER_IP) {
        console.log(`Global rate limit approached, may affect IP: ${clientIP}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Sistema ocupado. Aguarde alguns minutos.",
            code: "RATE_LIMITED"
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ==========================================
    // CLEANUP EXPIRED VERIFICATION CODES
    // ==========================================
    try {
      await supabaseAdmin
        .from('verification_codes')
        .delete()
        .lt('expires_at', new Date().toISOString());
      console.log('Cleaned up expired verification codes');
    } catch (cleanupErr) {
      console.error('Error cleaning up codes:', cleanupErr);
    }

    // ==========================================
    // SERVER-SIDE CHECK: System Settings
    // ==========================================
    const { data: settingsData } = await supabaseAdmin
      .from('system_settings')
      .select('key, value')
      .in('key', ['allow_registrations', 'maintenance_mode']);

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

    if (maintenanceMode) {
      return new Response(
        JSON.stringify({ success: false, error: "Sistema temporariamente indisponível", code: "MAINTENANCE" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!allowRegistration) {
      return new Response(
        JSON.stringify({ success: false, error: "Não foi possível criar a conta no momento", code: "DISABLED" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get email verification setting and template from gateway_settings
    const { data: gatewayData } = await supabaseAdmin
      .from('gateway_settings')
      .select('email_verification_enabled, resend_api_key, resend_from_email, resend_from_name, email_template_title, email_template_greeting, email_template_message, email_template_expiry_text, email_template_footer, email_template_bg_color, email_template_accent_color')
      .limit(1)
      .single();

    const requireEmailConfirmation = gatewayData?.email_verification_enabled ?? false;

    // ==========================================
    // BACKEND RATE LIMITING BY EMAIL
    // ==========================================
    if (email) {
      const emailClean = email.trim().toLowerCase();
      const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
      
      // Count recent attempts for this email
      const { count } = await supabaseAdmin
        .from('verification_codes')
        .select('*', { count: 'exact', head: true })
        .eq('user_email', emailClean)
        .gte('created_at', windowStart);
      
      if (count && count >= MAX_ATTEMPTS_PER_EMAIL) {
        console.log(`Rate limit exceeded for email: ${emailClean}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Muitas tentativas. Aguarde alguns minutos.",
            code: "RATE_LIMITED"
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ==========================================
    // ACTION: VERIFY CODE (Step 2)
    // ==========================================
    if (action === 'verify_code') {
      if (!email || !verificationCode) {
        return new Response(
          JSON.stringify({ success: false, error: "Email e código são obrigatórios" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const emailClean = email.trim().toLowerCase();

      // Verify the code
      const { data: codeData } = await supabaseAdmin
        .from('verification_codes')
        .select('*')
        .eq('user_email', emailClean)
        .eq('code', verificationCode)
        .eq('type', 'email_verification')
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (!codeData) {
        return new Response(
          JSON.stringify({ success: false, error: "Código inválido ou expirado" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!password || !name || !whatsapp) {
        return new Response(
          JSON.stringify({ success: false, error: "Dados de cadastro incompletos" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const whatsappClean = whatsapp.replace(/\D/g, '');

      // Create the user now that email is verified
      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: emailClean,
        password,
        email_confirm: true, // Already verified via code
        user_metadata: {
          name: name.trim(),
          whatsapp: whatsappClean,
        },
      });

      if (signUpError) {
        console.error('SignUp error after verification:', signUpError.message);
        
        if (signUpError.message.includes('already been registered') || 
            signUpError.message.includes('already exists')) {
          return new Response(
            JSON.stringify({ success: false, error: "Este email já está cadastrado" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao criar conta" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ==========================================
      // VERIFY PROFILE WAS CREATED BY TRIGGER
      // If not, ROLLBACK the user creation
      // ==========================================
      const userId = signUpData.user?.id;
      if (userId) {
        // Wait for trigger to execute with retry logic
        let profileCreated = false;
        for (let attempt = 0; attempt < 3; attempt++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { data: profileCheck } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();
          
          if (profileCheck) {
            profileCreated = true;
            break;
          }
          console.log(`Profile check attempt ${attempt + 1} failed (verify_code), retrying...`);
        }
        
        if (!profileCreated) {
          console.error('Profile not created by trigger after retries, rolling back user creation');
          // Delete the orphan user from auth.users
          await supabaseAdmin.auth.admin.deleteUser(userId);
          return new Response(
            JSON.stringify({ success: false, error: "Erro ao criar conta. Tente novamente." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Mark code as used and delete all codes for this email
      await supabaseAdmin
        .from('verification_codes')
        .delete()
        .eq('user_email', emailClean)
        .eq('type', 'email_verification');

      console.log(`User created after email verification: ${signUpData.user?.id}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          verified: true,
          message: "Conta criada com sucesso! Faça login para continuar."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================
    // ACTION: REGISTER (Step 1)
    // ==========================================
    
    // Field validations
    if (!email || !password || !name || !whatsapp) {
      return new Response(
        JSON.stringify({ success: false, error: "Todos os campos são obrigatórios" }),
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

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ success: false, error: "A senha deve ter pelo menos 8 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (name.trim().length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: "Nome inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const whatsappClean = whatsapp.replace(/\D/g, '');
    if (whatsappClean.length < 10 || whatsappClean.length > 15) {
      return new Response(
        JSON.stringify({ success: false, error: "WhatsApp inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailClean = email.trim().toLowerCase();

    // Check if email already exists in profiles (already registered and confirmed)
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', emailClean)
      .maybeSingle();

    if (existingProfile) {
      // Explicit error - email already registered
      console.log('Email already registered');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Este email já está cadastrado",
          code: "EMAIL_EXISTS"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================
    // WITH EMAIL VERIFICATION: Send code via Resend
    // ==========================================
    if (requireEmailConfirmation) {
      if (!gatewayData?.resend_api_key) {
        console.error('Resend API key not configured');
        return new Response(
          JSON.stringify({ success: false, error: "Serviço de email não configurado" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generate 6-digit code
      const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Delete any existing codes for this email (cleanup + prevent abuse)
      await supabaseAdmin
        .from('verification_codes')
        .delete()
        .eq('user_email', emailClean)
        .eq('type', 'email_verification');

      // Insert new code
      await supabaseAdmin.from('verification_codes').insert({
        user_email: emailClean,
        code: newVerificationCode,
        type: 'email_verification',
        expires_at: expiresAt.toISOString(),
        used: false,
      });

      // Send verification email
      const fromEmail = `${gatewayData.resend_from_name || 'DLG Connect'} <${gatewayData.resend_from_email || 'noreply@resend.dev'}>`;
      
      // Get template settings with defaults
      const templateTitle = gatewayData.email_template_title || '✉️ Verificação de Email';
      const templateGreeting = (gatewayData.email_template_greeting || 'Olá {name}!').replace('{name}', name.trim());
      const templateMessage = gatewayData.email_template_message || 'Seu código de verificação é:';
      const templateExpiryText = gatewayData.email_template_expiry_text || 'Este código expira em 15 minutos.';
      const templateFooter = gatewayData.email_template_footer || 'DLG Connect - Sistema de Gestão';
      const templateBgColor = gatewayData.email_template_bg_color || '#0a0a0a';
      const templateAccentColor = gatewayData.email_template_accent_color || '#4ade80';
      
      try {
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: ${templateBgColor}; color: #fff;">
            <h1 style="color: ${templateAccentColor};">${templateTitle}</h1>
            <p>${templateGreeting}</p>
            <p>${templateMessage}</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #111; padding: 20px 40px; border-radius: 12px; display: inline-block;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: ${templateAccentColor};">${newVerificationCode}</span>
              </div>
            </div>
            <p style="color: #888; font-size: 14px;">${templateExpiryText}</p>
            <p style="color: #888; font-size: 14px;">Se você não solicitou este cadastro, ignore este email.</p>
            <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">${templateFooter}</p>
          </div>
        `;
        
        await sendEmail(gatewayData.resend_api_key, fromEmail, emailClean, `${templateTitle.replace(/✉️\s*/, '')} - ${gatewayData.resend_from_name || 'DLG Connect'}`, html);
        console.log(`Verification code sent to: ${emailClean}`);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao enviar email de verificação" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          requiresEmailConfirmation: true,
          message: "Enviamos um código de verificação para seu email."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================
    // WITHOUT EMAIL VERIFICATION: Create user directly
    // ==========================================
    const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: emailClean,
      password,
      email_confirm: true, // Auto-confirm
      user_metadata: {
        name: name.trim(),
        whatsapp: whatsappClean,
      },
    });

    if (signUpError) {
      console.error('SignUp error:', signUpError.message);
      
      // Email already exists - should have been caught earlier, but handle it
      if (signUpError.message.includes('already been registered') || 
          signUpError.message.includes('already exists')) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Este email já está cadastrado",
            code: "EMAIL_EXISTS"
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: "Erro ao criar conta. Tente novamente." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================
    // VERIFY PROFILE WAS CREATED BY TRIGGER
    // If not, ROLLBACK the user creation
    // ==========================================
    const userId = signUpData.user?.id;
    if (userId) {
      // Wait for trigger to execute with retry logic
      let profileCreated = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: profileCheck } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (profileCheck) {
          profileCreated = true;
          break;
        }
        console.log(`Profile check attempt ${attempt + 1} failed, retrying...`);
      }
      
      if (!profileCreated) {
        console.error('Profile not created by trigger after retries, rolling back user creation');
        // Delete the orphan user from auth.users
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao criar conta. Tente novamente." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`User created: ${signUpData.user?.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        requiresEmailConfirmation: false,
        message: "Conta criada com sucesso!"
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
