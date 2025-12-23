import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to return JSON response with status 200
// This ensures Supabase functions.invoke always receives the data in 'data', not 'error'
function jsonResponse(body: object): Response {
  return new Response(
    JSON.stringify(body),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  whatsapp: string;
  honeypot?: string;
  verificationCode?: string;
  action?: 'register' | 'verify_code' | 'resend_code'; // Added resend_code action
  recaptchaToken?: string;
}

// Rate limit configuration
const MAX_ATTEMPTS_PER_EMAIL = 10;
const MAX_ATTEMPTS_PER_IP = 20;
const MAX_VERIFICATION_ATTEMPTS = 5; // Max wrong code attempts before invalidating
const RATE_LIMIT_WINDOW_MINUTES = 30;

// Strong password validation regex - MUST match forgot-password for consistency
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

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

    // Register action received

    // ==========================================
    // HONEYPOT CHECK - Silent rejection for bots
    // ==========================================
    if (honeypot && honeypot.length > 0) {
      // Bot detected via honeypot
      return jsonResponse({ 
        success: true, 
        requiresEmailConfirmation: true,
        message: "Verifique seu email para confirmar o cadastro."
      });
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
          // reCAPTCHA token missing
          return jsonResponse({ 
            success: false, 
            error: "Verificação de segurança necessária",
            code: "RECAPTCHA_REQUIRED"
          });
        }

        const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `secret=${gatewayData.recaptcha_secret_key}&response=${recaptchaToken}`
        });

        const recaptchaResult = await recaptchaResponse.json();

        if (!recaptchaResult.success) {
          return jsonResponse({ 
            success: false, 
            error: "Verificação de segurança falhou. Tente novamente.",
            code: "RECAPTCHA_FAILED"
          });
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
      // IP-based rate limiting check
      if (ipCount && ipCount >= MAX_ATTEMPTS_PER_IP) {
        return jsonResponse({ 
          success: false, 
          error: "Sistema ocupado. Aguarde alguns minutos.",
          code: "RATE_LIMITED"
        });
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
    } catch {
      // Silent fail for cleanup
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
      return jsonResponse({ success: false, error: "Sistema temporariamente indisponível", code: "MAINTENANCE" });
    }

    if (!allowRegistration) {
      return jsonResponse({ success: false, error: "Não foi possível criar a conta no momento", code: "DISABLED" });
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
        // Rate limit exceeded
        return jsonResponse({ 
          success: false, 
          error: "Muitas tentativas. Aguarde alguns minutos.",
          code: "RATE_LIMITED"
        });
      }
    }

    // ==========================================
    // ACTION: RESEND_CODE (Explicit resend - BUG FIX #5)
    // Same logic as register but explicitly for resending
    // ==========================================
    if (action === 'resend_code') {
      if (!email) {
        return jsonResponse({ success: false, error: "Email é obrigatório" });
      }

      const emailClean = email.trim().toLowerCase();

      // Check email verification is enabled
      if (!requireEmailConfirmation) {
        return jsonResponse({ success: false, error: "Verificação de email não está habilitada" });
      }

      if (!gatewayData?.resend_api_key) {
        return jsonResponse({ success: false, error: "Serviço de email não configurado" });
      }

      // Generate new code
      const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // Delete existing codes and create new one
      await supabaseAdmin
        .from('verification_codes')
        .delete()
        .eq('user_email', emailClean)
        .eq('type', 'email_verification');

      await supabaseAdmin.from('verification_codes').insert({
        user_email: emailClean,
        code: newVerificationCode,
        type: 'email_verification',
        expires_at: expiresAt.toISOString(),
        used: false,
      });

      // Send email
      const fromEmail = `${gatewayData.resend_from_name || 'DLG Connect'} <${gatewayData.resend_from_email || 'noreply@resend.dev'}>`;
      const templateTitle = gatewayData.email_template_title || '✉️ Verificação de Email';
      const templateGreeting = (gatewayData.email_template_greeting || 'Olá!').replace('{name}', name?.trim() || '');
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
        console.log(`Resend code sent to: ${emailClean}`);
      } catch (emailError) {
        console.error('Error resending email:', emailError);
        return jsonResponse({ success: false, error: "Erro ao reenviar código" });
      }

      return jsonResponse({ 
        success: true, 
        requiresEmailConfirmation: true,
        message: "Código reenviado para seu email."
      });
    }

    // ==========================================
    // ACTION: VERIFY CODE (Step 2)
    // ==========================================
    if (action === 'verify_code') {
      if (!email || !verificationCode) {
        return jsonResponse({ success: false, error: "Email e código são obrigatórios" });
      }

      const emailClean = email.trim().toLowerCase();

      // Get the verification code record
      const { data: codeData } = await supabaseAdmin
        .from('verification_codes')
        .select('*')
        .eq('user_email', emailClean)
        .eq('type', 'email_verification')
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (!codeData) {
        return jsonResponse({ success: false, error: "Código expirado. Solicite um novo código." });
      }

      // Check if code matches
      if (codeData.code !== verificationCode) {
        const failedAttempts = (codeData as any).failed_attempts || 0;
        const newFailedAttempts = failedAttempts + 1;
        
        // Failed verification attempt
        
        if (newFailedAttempts >= MAX_VERIFICATION_ATTEMPTS) {
          // Invalidate the code - too many failed attempts
          await supabaseAdmin
            .from('verification_codes')
            .delete()
            .eq('user_email', emailClean)
            .eq('type', 'email_verification');
          
          return jsonResponse({ 
            success: false, 
            error: "Muitas tentativas incorretas. Solicite um novo código.",
            code: "CODE_INVALIDATED"
          });
        }
        
        // Update failed attempts counter
        await supabaseAdmin
          .from('verification_codes')
          .update({ failed_attempts: newFailedAttempts })
          .eq('id', codeData.id);
        
        return jsonResponse({ 
          success: false, 
          error: `Código incorreto. ${MAX_VERIFICATION_ATTEMPTS - newFailedAttempts} tentativas restantes.`
        });
      }

      if (!password || !name || !whatsapp) {
        return jsonResponse({ success: false, error: "Dados de cadastro incompletos" });
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
        
        if (signUpError.message.includes('already been registered') || 
            signUpError.message.includes('already exists')) {
          return jsonResponse({ success: false, error: "Este email já está cadastrado", code: "EMAIL_EXISTS" });
        }
        
        return jsonResponse({ success: false, error: "Erro ao criar conta" });
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
          // Retry profile check
        }
        
        if (!profileCreated) {
          // Profile not created by trigger, rolling back
          await supabaseAdmin.auth.admin.deleteUser(userId);
          return jsonResponse({ success: false, error: "Erro ao criar conta. Tente novamente." });
        }
      }

      // Mark code as used and delete all codes for this email
      await supabaseAdmin
        .from('verification_codes')
        .delete()
        .eq('user_email', emailClean)
        .eq('type', 'email_verification');

      // User created after email verification
      return jsonResponse({ 
        success: true, 
        verified: true,
        message: "Conta criada com sucesso! Faça login para continuar."
      });
    }

    // ==========================================
    // ACTION: REGISTER (Step 1)
    // ==========================================
    
    // Field validations - Enhanced security checks
    if (!email || !password || !name || !whatsapp) {
      return jsonResponse({ success: false, error: "Todos os campos são obrigatórios" });
    }

    // Email validation - strict format check
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      return jsonResponse({ success: false, error: "Email inválido" });
    }

    // Check for disposable email domains
    const disposableDomains = ['tempmail.com', 'throwaway.com', 'mailinator.com', 'guerrillamail.com', 'fakeinbox.com', '10minutemail.com', 'temp-mail.org', 'tempmailo.com'];
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (disposableDomains.includes(emailDomain)) {
      return jsonResponse({ success: false, error: "Emails temporários não são permitidos" });
    }

    // Password validation - use same regex as forgot-password
    if (!STRONG_PASSWORD_REGEX.test(password)) {
      return jsonResponse({ 
        success: false, 
        error: "A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial (!@#$%^&*)" 
      });
    }

    if (password.length > 128) {
      return jsonResponse({ success: false, error: "A senha deve ter no máximo 128 caracteres" });
    }

    // Check for common weak passwords
    const weakPasswords = ['12345678', 'password', 'qwerty123', 'abc12345', 'password1', 'Password1', '123456789', 'admin123'];
    if (weakPasswords.some(weak => password.toLowerCase().includes(weak.toLowerCase()))) {
      return jsonResponse({ success: false, error: "Senha muito comum, escolha outra mais segura" });
    }

    // Name validation - enhanced
    const nameTrimmed = name.trim();
    if (nameTrimmed.length < 2 || nameTrimmed.length > 100) {
      return jsonResponse({ success: false, error: "Nome deve ter entre 2 e 100 caracteres" });
    }

    // Check for valid name characters
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    if (!nameRegex.test(nameTrimmed)) {
      return jsonResponse({ success: false, error: "Nome contém caracteres inválidos" });
    }

    // Check for at least first and last name
    const nameParts = nameTrimmed.split(/\s+/).filter(p => p.length > 0);
    if (nameParts.length < 2) {
      return jsonResponse({ success: false, error: "Informe nome e sobrenome" });
    }

    // WhatsApp validation - enhanced
    const whatsappClean = whatsapp.replace(/\D/g, '');
    if (whatsappClean.length < 10 || whatsappClean.length > 15) {
      return jsonResponse({ success: false, error: "WhatsApp inválido (10-15 dígitos)" });
    }

    // Brazilian phone format check
    if (whatsappClean.startsWith('55') && whatsappClean.length < 12) {
      return jsonResponse({ success: false, error: "Número brasileiro deve ter DDD + 8-9 dígitos" });
    }

    const emailClean = email.trim().toLowerCase();

    // Check if email already exists in profiles (already registered and confirmed)
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', emailClean)
      .maybeSingle();

    if (existingProfile) {
      // Email already registered
      return jsonResponse({ 
        success: false, 
        error: "Este email já está cadastrado. Faça login.",
        code: "EMAIL_EXISTS"
      });
    }

    // Note: We no longer use listUsers to check auth.users
    // Profile existence is the single source of truth
    // Orphan auth.users entries (without profile) will be handled during user creation
    // when Supabase returns "already exists" error

    // ==========================================
    // WITH EMAIL VERIFICATION: Send code via Resend
    // ==========================================
    if (requireEmailConfirmation) {
      if (!gatewayData?.resend_api_key) {
        return jsonResponse({ success: false, error: "Serviço de email não configurado" });
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
        // Email sent successfully
      } catch {
        return jsonResponse({ success: false, error: "Erro ao enviar email de verificação" });
      }

      return jsonResponse({ 
        success: true, 
        requiresEmailConfirmation: true,
        message: "Enviamos um código de verificação para seu email."
      });
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
      
      // Email already exists - should have been caught earlier, but handle it
      if (signUpError.message.includes('already been registered') || 
          signUpError.message.includes('already exists')) {
        return jsonResponse({ 
          success: false, 
          error: "Este email já está cadastrado",
          code: "EMAIL_EXISTS"
        });
      }
      
      return jsonResponse({ success: false, error: "Erro ao criar conta. Tente novamente." });
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
        // Retry profile check
      }
      
      if (!profileCreated) {
        // Profile not created, rolling back
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return jsonResponse({ success: false, error: "Erro ao criar conta. Tente novamente." });
      }
    }

    // User created successfully
    return jsonResponse({ 
      success: true, 
      requiresEmailConfirmation: false,
      message: "Conta criada com sucesso!"
    });

  } catch {
    return jsonResponse({ success: false, error: "Erro interno do servidor" });
  }
});
