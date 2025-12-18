import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ForgotPasswordRequest {
  action: 'request_code' | 'verify_code' | 'reset_password' | 'check_enabled';
  email?: string;
  code?: string;
  newPassword?: string;
  honeypot?: string;
  recaptchaToken?: string;
}

// Rate limit configuration
const MAX_ATTEMPTS_PER_EMAIL = 5;
const RATE_LIMIT_WINDOW_MINUTES = 15;

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
 * FORGOT PASSWORD EDGE FUNCTION
 * 
 * RESPONSABILIDADES:
 * - Verificar maintenance_mode
 * - Verificar password_recovery_enabled
 * - Validar usuário via profiles (NÃO listUsers)
 * - Rate limiting no backend
 * - Gerar/verificar códigos
 * - Limpeza de códigos expirados
 * - Redefinir senha
 * - Invalidar sessões com signOut(userId, 'global')
 */
serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const body: ForgotPasswordRequest = await req.json();
    const { action, email, code, newPassword, honeypot, recaptchaToken } = body;

    console.log(`Forgot password action: ${action}`);

    // ==========================================
    // CLEANUP EXPIRED VERIFICATION CODES
    // ==========================================
    try {
      await supabaseAdmin
        .from('verification_codes')
        .delete()
        .lt('expires_at', new Date().toISOString());
    } catch (cleanupErr) {
      console.error('Error cleaning up codes:', cleanupErr);
    }

    // ==========================================
    // HONEYPOT CHECK - Silent rejection for bots
    // ==========================================
    if (honeypot && honeypot.length > 0) {
      console.log('Bot detected via honeypot in password recovery');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Se este email estiver cadastrado, você receberá um código de recuperação."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================
    // CHECK SYSTEM SETTINGS
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

    if (maintenanceMode) {
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
    // CHECK IF PASSWORD RECOVERY IS ENABLED
    // ==========================================
    const { data: gatewayData } = await supabaseAdmin
      .from('gateway_settings')
      .select('password_recovery_enabled, resend_api_key, resend_from_email, resend_from_name, recaptcha_enabled, recaptcha_secret_key')
      .limit(1)
      .single();

    // ==========================================
    // ACTION: CHECK_ENABLED (for frontend to check if feature is enabled)
    // ==========================================
    if (action === 'check_enabled') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          enabled: gatewayData?.password_recovery_enabled ?? false
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!gatewayData?.password_recovery_enabled) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Recuperação de senha indisponível no momento",
          code: "DISABLED"
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!gatewayData?.resend_api_key) {
      console.error('Resend API key not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Serviço de email não configurado"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fromEmail = `${gatewayData.resend_from_name || 'SWEXTRACTOR'} <${gatewayData.resend_from_email || 'noreply@resend.dev'}>`;

    // ==========================================
    // ACTION: REQUEST CODE
    // ==========================================
    if (action === 'request_code') {
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

      // ==========================================
      // reCAPTCHA VALIDATION FOR REQUEST CODE
      // ==========================================
      if (gatewayData?.recaptcha_enabled && gatewayData?.recaptcha_secret_key) {
        if (!recaptchaToken) {
          console.log('reCAPTCHA token missing for password recovery');
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

      const emailClean = email.trim().toLowerCase();

      // ==========================================
      // BACKEND RATE LIMITING BY EMAIL
      // ==========================================
      const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
      
      const { count } = await supabaseAdmin
        .from('verification_codes')
        .select('*', { count: 'exact', head: true })
        .eq('user_email', emailClean)
        .eq('type', 'password_reset')
        .gte('created_at', windowStart);
      
      if (count && count >= MAX_ATTEMPTS_PER_EMAIL) {
        console.log(`Rate limit exceeded for password recovery: ${emailClean}`);
        // Return generic message to not reveal rate limit (could reveal email exists)
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Se este email estiver cadastrado, você receberá um código de recuperação."
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check user via PROFILES table (NOT listUsers)
      const { data: profileData } = await supabaseAdmin
        .from('profiles')
        .select('id, user_id, banned')
        .eq('email', emailClean)
        .maybeSingle();

      // Only send email if profile exists and user is not banned
      if (profileData && !profileData.banned) {
        // Generate 6-digit code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Delete any existing codes for this email (prevents accumulation)
        await supabaseAdmin
          .from('verification_codes')
          .delete()
          .eq('user_email', emailClean)
          .eq('type', 'password_reset');

        // Insert new code
        await supabaseAdmin.from('verification_codes').insert({
          user_email: emailClean,
          code: verificationCode,
          type: 'password_reset',
          expires_at: expiresAt.toISOString(),
          used: false,
        });

        // Send email
        try {
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #fff;">
              <h1 style="color: #4ade80;">🔐 Recuperação de Senha</h1>
              <p>Seu código de verificação é:</p>
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: #111; padding: 20px 40px; border-radius: 12px; display: inline-block;">
                  <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4ade80;">${verificationCode}</span>
                </div>
              </div>
              <p style="color: #888; font-size: 14px;">Este código expira em 15 minutos.</p>
              <p style="color: #888; font-size: 14px;">Se você não solicitou este código, ignore este email.</p>
              <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;" />
              <p style="color: #666; font-size: 12px;">SWEXTRACTOR - Sistema de Gestão</p>
            </div>
          `;
          await sendEmail(gatewayData.resend_api_key, fromEmail, emailClean, "🔐 Código de Recuperação - SWEXTRACTOR", html);
          console.log(`Password reset code sent to: ${emailClean}`);
        } catch (emailError) {
          console.error('Error sending email:', emailError);
        }
      }

      // ALWAYS return generic success message - never reveal if email exists
      console.log(`Password reset requested for: ${emailClean}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Se este email estiver cadastrado, você receberá um código de recuperação."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================
    // ACTION: VERIFY CODE
    // ==========================================
    if (action === 'verify_code') {
      if (!email || !code) {
        return new Response(
          JSON.stringify({ success: false, error: "Email e código são obrigatórios" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const emailClean = email.trim().toLowerCase();

      const { data: codeData } = await supabaseAdmin
        .from('verification_codes')
        .select('*')
        .eq('user_email', emailClean)
        .eq('code', code)
        .eq('type', 'password_reset')
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (!codeData) {
        return new Response(
          JSON.stringify({ success: false, error: "Código inválido ou expirado" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Código verificado" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================
    // ACTION: RESET PASSWORD
    // ==========================================
    if (action === 'reset_password') {
      if (!email || !code || !newPassword) {
        return new Response(
          JSON.stringify({ success: false, error: "Email, código e nova senha são obrigatórios" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (newPassword.length < 8) {
        return new Response(
          JSON.stringify({ success: false, error: "A senha deve ter pelo menos 8 caracteres" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const emailClean = email.trim().toLowerCase();

      // Verify code again (prevent reuse)
      const { data: codeData } = await supabaseAdmin
        .from('verification_codes')
        .select('*')
        .eq('user_email', emailClean)
        .eq('code', code)
        .eq('type', 'password_reset')
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (!codeData) {
        return new Response(
          JSON.stringify({ success: false, error: "Código inválido ou expirado" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ==========================================
      // FULL VALIDATION BEFORE RESET (via profiles, NOT listUsers)
      // ==========================================
      const { data: profileData } = await supabaseAdmin
        .from('profiles')
        .select('id, user_id, banned')
        .eq('email', emailClean)
        .maybeSingle();

      // Profile must exist (account activated)
      if (!profileData) {
        console.log('Password reset blocked: profile not found');
        return new Response(
          JSON.stringify({ success: false, error: "Não foi possível alterar a senha" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // User must not be banned
      if (profileData.banned) {
        console.log('Password reset blocked: user is banned');
        return new Response(
          JSON.stringify({ success: false, error: "Não foi possível alterar a senha" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update password using user_id from profile
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(profileData.user_id, {
        password: newPassword,
      });

      if (updateError) {
        console.error('Error updating password:', updateError);
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao alterar senha" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Mark code as used and delete all codes for this email
      await supabaseAdmin
        .from('verification_codes')
        .delete()
        .eq('user_email', emailClean)
        .eq('type', 'password_reset');

      // Invalidate all sessions using userId with 'global' scope
      try {
        await supabaseAdmin.auth.admin.signOut(profileData.user_id, 'global');
        console.log(`All sessions invalidated for user: ${profileData.user_id}`);
      } catch (signOutError) {
        console.error('Error signing out user:', signOutError);
      }

      console.log(`Password reset successful for: ${emailClean}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Senha alterada com sucesso. Faça login novamente."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Ação inválida" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in forgot-password function:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
