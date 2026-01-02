import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  action: 'test' | 'send_code' | 'verify_code' | 'reset_password' | 'order_confirmation' | 'renewal_reminder' | 'auto_renew_disabled';
  type?: 'password_reset' | 'email_verification';
  to?: string;
  email?: string;
  name?: string;
  code?: string;
  newPassword?: string;
  orderDetails?: {
    orderId: string;
    productName: string;
    amount: number;
  };
  subscriptionDetails?: {
    planName: string;
    expirationDate: string;
    daysLeft: number;
    cancelUrl?: string;
  };
}

async function getEmailSettings(supabase: any) {
  const { data, error } = await supabase
    .from('gateway_settings')
    .select('resend_api_key, resend_from_email, resend_from_name, email_enabled, password_recovery_enabled, email_verification_enabled, email_template_title, email_template_greeting, email_template_message, email_template_expiry_text, email_template_footer, email_template_bg_color, email_template_accent_color, email_template_show_logo, email_template_logo_url')
    .eq('provider', 'pixup')
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: EmailRequest = await req.json();
    const { action, type, to, email, name, code, newPassword, orderDetails, subscriptionDetails } = body;

    console.log(`send-email action: ${action}, type: ${type}`);

    const settings = await getEmailSettings(supabase);

    if (!settings?.resend_api_key || !settings?.email_enabled) {
      return new Response(
        JSON.stringify({ success: false, error: "Email não configurado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fromEmail = `${settings.resend_from_name || 'DLG Connect'} <${settings.resend_from_email}>`;

    switch (action) {
      case 'test': {
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4ade80;">✅ Teste Bem Sucedido!</h1>
            <p>Este é um email de teste do sistema DLG Connect.</p>
            <p>Se você recebeu este email, a configuração está funcionando corretamente.</p>
            <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;" />
            <p style="color: #888; font-size: 12px;">DLG Connect - Sistema de Gestão</p>
          </div>
        `;
        await sendEmail(settings.resend_api_key, fromEmail, to!, "✅ Teste de Email - DLG Connect", html);
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'send_code': {
        if (type === 'password_reset' && !settings.password_recovery_enabled) {
          return new Response(
            JSON.stringify({ success: false, error: "Recuperação de senha desabilitada" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (type === 'email_verification' && !settings.email_verification_enabled) {
          return new Response(
            JSON.stringify({ success: false, error: "Verificação de email desabilitada" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const verificationCode = generateCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Delete old codes for this email/type
        await supabase
          .from('verification_codes')
          .delete()
          .eq('user_email', to)
          .eq('type', type);

        // Insert new code
        const { error: insertError } = await supabase
          .from('verification_codes')
          .insert({
            user_email: to,
            code: verificationCode,
            type: type,
            expires_at: expiresAt.toISOString()
          });

        if (insertError) {
          console.error('Error inserting code:', insertError);
          throw new Error('Failed to create verification code');
        }

        // Use custom template settings or defaults
        const bgColor = settings.email_template_bg_color || '#0a0a0a';
        const accentColor = settings.email_template_accent_color || '#4ade80';
        const templateTitle = settings.email_template_title || (type === 'password_reset' ? '🔐 Recuperação de Senha' : '📧 Confirme seu Email');
        const templateGreeting = settings.email_template_greeting || 'Olá!';
        const templateMessage = settings.email_template_message || 'Seu código de verificação é:';
        const templateExpiryText = settings.email_template_expiry_text || 'Este código expira em 15 minutos.';
        const templateFooter = settings.email_template_footer || 'DLG Connect - Sistema de Gestão';
        const showLogo = settings.email_template_show_logo !== false;
        const logoUrl = settings.email_template_logo_url || '';

        // Build logo HTML if enabled and URL provided
        const logoHtml = showLogo && logoUrl 
          ? `<div style="text-align: center; margin-bottom: 20px;">
              <img src="${logoUrl}" alt="Logo" style="max-width: 150px; max-height: 60px; object-fit: contain;" />
            </div>`
          : '';

        const subject = type === 'password_reset' 
          ? "🔐 Código de Recuperação"
          : "📧 Confirme seu Email";

        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: ${bgColor}; color: #fff;">
            ${logoHtml}
            <h1 style="color: ${accentColor};">${templateTitle}</h1>
            <p>${templateGreeting.replace('{name}', name || 'Usuário')}</p>
            <p>${templateMessage}</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #111; padding: 20px 40px; border-radius: 12px; display: inline-block;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: ${accentColor};">${verificationCode}</span>
              </div>
            </div>
            <p style="font-size: 14px;">${templateExpiryText}</p>
            <p style="font-size: 14px;">Se você não solicitou este código, ignore este email.</p>
            <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;" />
            <p style="font-size: 12px;">${templateFooter}</p>
          </div>
        `;

        await sendEmail(settings.resend_api_key, fromEmail, to!, subject, html);

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'verify_code': {
        const { data: codeData, error: codeError } = await supabase
          .from('verification_codes')
          .select('*')
          .eq('user_email', email)
          .eq('type', type)
          .eq('code', code)
          .eq('used', false)
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();

        if (codeError || !codeData) {
          return new Response(
            JSON.stringify({ success: false, error: "Código inválido ou expirado" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Mark as used for email verification, but keep valid for password reset
        if (type === 'email_verification') {
          await supabase
            .from('verification_codes')
            .update({ used: true })
            .eq('id', codeData.id);
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'reset_password': {
        // Verify code again
        const { data: codeData, error: codeError } = await supabase
          .from('verification_codes')
          .select('*')
          .eq('user_email', email)
          .eq('type', 'password_reset')
          .eq('code', code)
          .eq('used', false)
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();

        if (codeError || !codeData) {
          return new Response(
            JSON.stringify({ success: false, error: "Código inválido ou expirado" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Find user by email
        const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
        
        if (userError) {
          console.error('Error listing users:', userError);
          throw new Error('Failed to find user');
        }

        const user = userData.users.find((u: any) => u.email === email);
        
        if (!user) {
          return new Response(
            JSON.stringify({ success: false, error: "Usuário não encontrado" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update password
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          user.id,
          { password: newPassword }
        );

        if (updateError) {
          console.error('Error updating password:', updateError);
          throw new Error('Failed to update password');
        }

        // Mark code as used
        await supabase
          .from('verification_codes')
          .update({ used: true })
          .eq('id', codeData.id);

        console.log(`Password reset successful for ${email}`);

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'order_confirmation': {
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #fff;">
            <h1 style="color: #4ade80;">✅ Pedido Confirmado!</h1>
            <p>Olá${name ? ` ${name}` : ''},</p>
            <p>Seu pedido foi confirmado com sucesso!</p>
            <div style="background: #111; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Pedido:</strong> #${orderDetails?.orderId?.slice(0, 8)}</p>
              <p><strong>Produto:</strong> ${orderDetails?.productName}</p>
              <p><strong>Valor:</strong> R$ ${orderDetails?.amount?.toFixed(2).replace('.', ',')}</p>
            </div>
            <p>Acesse sua conta para baixar suas sessions.</p>
            <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">DLG Connect - Sistema de Gestão</p>
          </div>
        `;
        await sendEmail(settings.resend_api_key, fromEmail, to!, "✅ Pedido Confirmado - DLG Connect", html);
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'renewal_reminder': {
        const bgColor = settings.email_template_bg_color || '#0a0a0a';
        const accentColor = settings.email_template_accent_color || '#4ade80';
        const footer = settings.email_template_footer || 'DLG Connect - Sistema de Gestão';
        const daysLeft = subscriptionDetails?.daysLeft || 3;
        const urgencyColor = daysLeft <= 1 ? '#ef4444' : '#f59e0b';
        
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: ${bgColor}; color: #fff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="background: ${urgencyColor}; color: #fff; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px;">
                🔄 RENOVAÇÃO EM ${daysLeft} DIA${daysLeft > 1 ? 'S' : ''}
              </span>
            </div>
            
            <h1 style="color: ${urgencyColor}; text-align: center;">Sua assinatura será renovada automaticamente</h1>
            
            <p style="text-align: center; color: #ccc;">Olá${name ? `, ${name}` : ''}!</p>
            
            <div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; color: #888;">Plano:</p>
              <p style="margin: 0 0 15px 0; color: #fff; font-size: 18px; font-weight: bold;">${subscriptionDetails?.planName}</p>
              
              <p style="margin: 0 0 10px 0; color: #888;">Data de renovação:</p>
              <p style="margin: 0; color: ${accentColor}; font-size: 20px; font-weight: bold;">${subscriptionDetails?.expirationDate}</p>
            </div>
            
            <p style="text-align: center; color: #ccc; margin-bottom: 25px;">
              Sua assinatura será renovada automaticamente na data acima. Se você não deseja continuar, 
              pode desativar a renovação automática no seu painel.
            </p>
            
            <div style="text-align: center; margin-bottom: 15px;">
              <a href="https://dlgconnect.com/dashboard" 
                 style="display: inline-block; background: #333; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; border: 1px solid #444;">
                ⚙️ Gerenciar assinatura
              </a>
            </div>
            
            <p style="text-align: center; color: #888; font-size: 12px;">
              Para desativar a renovação automática: Dashboard → Preferências → Assinatura
            </p>
            
            <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px; text-align: center;">${footer}</p>
          </div>
        `;
        
        await sendEmail(settings.resend_api_key, fromEmail, to!, `🔄 Renovação automática em ${daysLeft} dia${daysLeft > 1 ? 's' : ''} - DLG Connect`, html);
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'auto_renew_disabled': {
        const bgColor = settings.email_template_bg_color || '#0a0a0a';
        const accentColor = settings.email_template_accent_color || '#4ade80';
        const footer = settings.email_template_footer || 'DLG Connect - Sistema de Gestão';
        
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: ${bgColor}; color: #fff;">
            <h1 style="color: #f59e0b; text-align: center;">⚠️ Renovação automática desativada</h1>
            
            <p style="text-align: center; color: #ccc;">Olá${name ? `, ${name}` : ''}!</p>
            
            <div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; color: #888;">Plano:</p>
              <p style="margin: 0 0 15px 0; color: #fff; font-size: 18px; font-weight: bold;">${subscriptionDetails?.planName}</p>
              
              <p style="margin: 0 0 10px 0; color: #888;">Expira em:</p>
              <p style="margin: 0; color: #f59e0b; font-size: 20px; font-weight: bold;">${subscriptionDetails?.expirationDate}</p>
            </div>
            
            <div style="background: #1a1a1a; border: 1px solid #f59e0b30; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #f59e0b; font-size: 14px; text-align: center;">
                ⚠️ <strong>Importante:</strong> Sua licença NÃO será renovada automaticamente. 
                Após a data de expiração, você perderá acesso às funcionalidades premium.
              </p>
            </div>
            
            <p style="text-align: center; color: #ccc; margin-bottom: 25px;">
              Se mudar de ideia, você pode reativar a renovação automática a qualquer momento.
            </p>
            
            <div style="text-align: center; margin-bottom: 15px;">
              <a href="https://dlgconnect.com/dashboard" 
                 style="display: inline-block; background: ${accentColor}; color: #000; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold;">
                🔄 Reativar renovação
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px; text-align: center;">${footer}</p>
          </div>
        `;
        
        await sendEmail(settings.resend_api_key, fromEmail, to!, "⚠️ Renovação automática desativada - DLG Connect", html);
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
