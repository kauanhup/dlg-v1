import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ForgotPasswordRequest {
  action: 'request_code' | 'verify_code' | 'reset_password';
  email?: string;
  code?: string;
  newPassword?: string;
}

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

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const body: ForgotPasswordRequest = await req.json();
    const { action, email, code, newPassword } = body;

    console.log(`Forgot password action: ${action}`);

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
      .select('password_recovery_enabled, resend_api_key, resend_from_email, resend_from_name')
      .limit(1)
      .single();

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

      const emailClean = email.trim().toLowerCase();

      // Check if user exists in auth.users
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
      const userExists = authUsers?.users?.find(u => u.email?.toLowerCase() === emailClean);

      if (userExists) {
        // Check if profile exists (email confirmed) and not banned
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id, banned')
          .eq('user_id', userExists.id)
          .maybeSingle();

        if (profile && !profile.banned) {
          // Generate 6-digit code
          const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
          const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

          // Delete any existing codes for this email
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

      // Verify code again
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

      // Find user by email
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
      const user = authUsers?.users?.find(u => u.email?.toLowerCase() === emailClean);

      if (!user) {
        return new Response(
          JSON.stringify({ success: false, error: "Usuário não encontrado" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: newPassword,
      });

      if (updateError) {
        console.error('Error updating password:', updateError);
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao alterar senha" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Mark code as used
      await supabaseAdmin
        .from('verification_codes')
        .update({ used: true })
        .eq('id', codeData.id);

      // Invalidate all sessions for this user
      try {
        await supabaseAdmin.auth.admin.signOut(user.id, 'global');
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
