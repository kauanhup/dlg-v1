import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  action: 'test' | 'password_reset' | 'welcome' | 'order_confirmation';
  to: string;
  name?: string;
  resetLink?: string;
  orderDetails?: {
    orderId: string;
    productName: string;
    amount: number;
  };
}

async function getEmailSettings(supabase: any) {
  const { data, error } = await supabase
    .from('gateway_settings')
    .select('resend_api_key, resend_from_email, resend_from_name, email_enabled')
    .eq('provider', 'pixup')
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, to, name, resetLink, orderDetails }: EmailRequest = await req.json();

    // Get email settings from database
    const settings = await getEmailSettings(supabase);

    if (!settings?.resend_api_key || !settings?.email_enabled) {
      return new Response(
        JSON.stringify({ success: false, error: "Email not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use fetch to call Resend API directly
    const resendApiKey = settings.resend_api_key;
    const fromEmail = `${settings.resend_from_name || 'SWEXTRACTOR'} <${settings.resend_from_email}>`;

    let subject: string;
    let html: string;

    switch (action) {
      case 'test':
        subject = "✅ Teste de Email - SWEXTRACTOR";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4ade80;">Teste Bem Sucedido!</h1>
            <p>Este é um email de teste do sistema SWEXTRACTOR.</p>
            <p>Se você recebeu este email, a configuração está funcionando corretamente.</p>
            <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;" />
            <p style="color: #888; font-size: 12px;">SWEXTRACTOR - Sistema de Gestão</p>
          </div>
        `;
        break;

      case 'password_reset':
        subject = "🔐 Recuperação de Senha - SWEXTRACTOR";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #fff;">
            <h1 style="color: #4ade80;">Recuperação de Senha</h1>
            <p>Olá${name ? ` ${name}` : ''},</p>
            <p>Você solicitou a recuperação de senha da sua conta SWEXTRACTOR.</p>
            <p>Clique no botão abaixo para redefinir sua senha:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #4ade80; color: #0a0a0a; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Redefinir Senha
              </a>
            </div>
            <p style="color: #888; font-size: 14px;">Se você não solicitou esta recuperação, ignore este email.</p>
            <p style="color: #888; font-size: 14px;">O link expira em 1 hora.</p>
            <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">SWEXTRACTOR - Sistema de Gestão</p>
          </div>
        `;
        break;

      case 'welcome':
        subject = "🎉 Bem-vindo ao SWEXTRACTOR!";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #fff;">
            <h1 style="color: #4ade80;">Bem-vindo ao SWEXTRACTOR!</h1>
            <p>Olá${name ? ` ${name}` : ''},</p>
            <p>Sua conta foi criada com sucesso!</p>
            <p>Agora você pode acessar todos os recursos da plataforma.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('SITE_URL') || 'https://swextractor.com'}/login" style="background: #4ade80; color: #0a0a0a; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Acessar Plataforma
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">SWEXTRACTOR - Sistema de Gestão</p>
          </div>
        `;
        break;

      case 'order_confirmation':
        subject = "✅ Pedido Confirmado - SWEXTRACTOR";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #fff;">
            <h1 style="color: #4ade80;">Pedido Confirmado!</h1>
            <p>Olá${name ? ` ${name}` : ''},</p>
            <p>Seu pedido foi confirmado com sucesso!</p>
            <div style="background: #111; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Pedido:</strong> #${orderDetails?.orderId?.slice(0, 8)}</p>
              <p><strong>Produto:</strong> ${orderDetails?.productName}</p>
              <p><strong>Valor:</strong> R$ ${orderDetails?.amount?.toFixed(2).replace('.', ',')}</p>
            </div>
            <p>Acesse sua conta para baixar suas sessions.</p>
            <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">SWEXTRACTOR - Sistema de Gestão</p>
          </div>
        `;
        break;

      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    console.log(`Sending ${action} email to ${to}`);

    // Call Resend API directly via fetch
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailResult);
      return new Response(
        JSON.stringify({ success: false, error: emailResult.message || 'Failed to send email' }),
        { status: emailResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ success: true, data: emailResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
