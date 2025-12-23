import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NOTIFICATION_DAYS = [7, 3, 1]; // Notify 7, 3, and 1 day before expiration

interface NotificationResult {
  success: boolean;
  sent: number;
  errors: number;
  details: Array<{
    email: string;
    daysLeft: number;
    status: 'sent' | 'error';
    error?: string;
  }>;
}

async function getEmailSettings(supabase: any) {
  const { data, error } = await supabase
    .from('gateway_settings')
    .select('resend_api_key, resend_from_email, resend_from_name, email_enabled, email_template_bg_color, email_template_accent_color, email_template_footer, email_template_logo_url, email_template_show_logo')
    .eq('provider', 'pixup')
    .maybeSingle();

  if (error || !data) {
    console.error('Error fetching email settings:', error);
    return null;
  }

  return data;
}

async function sendEmail(apiKey: string, from: string, to: string, subject: string, html: string): Promise<boolean> {
  try {
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
      console.error('Resend API error:', result);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

function getExpirationEmailTemplate(
  userName: string,
  planName: string,
  daysLeft: number,
  expirationDate: string,
  settings: any
): string {
  const bgColor = settings?.email_template_bg_color || '#0a0a0a';
  const accentColor = settings?.email_template_accent_color || '#4ade80';
  const footer = settings?.email_template_footer || 'DLG Connect - Sistema de Gestão';
  const logoUrl = settings?.email_template_logo_url || '';
  const showLogo = settings?.email_template_show_logo !== false;

  const urgencyColor = daysLeft === 1 ? '#ef4444' : daysLeft <= 3 ? '#f59e0b' : accentColor;
  const urgencyText = daysLeft === 1 ? '⚠️ URGENTE' : daysLeft <= 3 ? '⚠️ ATENÇÃO' : '📅 LEMBRETE';

  const logoHtml = showLogo && logoUrl 
    ? `<div style="text-align: center; margin-bottom: 20px;">
        <img src="${logoUrl}" alt="Logo" style="max-width: 150px; max-height: 60px; object-fit: contain;" />
      </div>`
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: #111;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: ${bgColor}; color: #fff;">
        ${logoHtml}
        
        <div style="text-align: center; margin-bottom: 20px;">
          <span style="background: ${urgencyColor}; color: #fff; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px;">
            ${urgencyText}
          </span>
        </div>

        <h1 style="color: ${urgencyColor}; text-align: center; margin-bottom: 10px;">
          Sua licença expira em ${daysLeft} dia${daysLeft > 1 ? 's' : ''}
        </h1>

        <p style="color: #ccc; text-align: center; margin-bottom: 30px;">
          Olá, ${userName}!
        </p>

        <div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
          <p style="margin: 0 0 10px 0; color: #888;">Plano atual:</p>
          <p style="margin: 0 0 20px 0; color: #fff; font-size: 18px; font-weight: bold;">${planName}</p>
          
          <p style="margin: 0 0 10px 0; color: #888;">Data de expiração:</p>
          <p style="margin: 0; color: ${urgencyColor}; font-size: 24px; font-weight: bold;">${expirationDate}</p>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <p style="color: #ccc; margin-bottom: 20px;">
            ${daysLeft === 1 
              ? 'Sua licença expira amanhã! Renove agora para não perder acesso.' 
              : daysLeft <= 3 
                ? 'Sua licença está prestes a expirar. Renove para continuar aproveitando todos os recursos.'
                : 'Renove agora para garantir acesso ininterrupto aos nossos serviços.'}
          </p>
          <a href="https://dlgconnect.com/comprar" 
             style="display: inline-block; background: ${accentColor}; color: #000; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
            🔄 RENOVAR AGORA
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;" />
        
        <p style="color: #666; font-size: 12px; text-align: center;">
          ${footer}
        </p>
        
        <p style="color: #555; font-size: 11px; text-align: center; margin-top: 10px;">
          Você recebeu este email porque tem uma assinatura ativa. 
          Para não receber mais, desative as notificações de licença no seu dashboard.
        </p>
      </div>
    </body>
    </html>
  `;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('[notify-expiring-licenses] Starting notification job...');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get email settings
    const settings = await getEmailSettings(supabase);
    if (!settings?.resend_api_key || !settings?.email_enabled) {
      console.log('[notify-expiring-licenses] Email not configured or disabled');
      return new Response(
        JSON.stringify({ success: false, error: 'Email not configured' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fromEmail = `${settings.resend_from_name || 'DLG Connect'} <${settings.resend_from_email}>`;
    const result: NotificationResult = { success: true, sent: 0, errors: 0, details: [] };

    // Process each notification day
    for (const days of NOTIFICATION_DAYS) {
      console.log(`[notify-expiring-licenses] Checking subscriptions expiring in ${days} days...`);

      // Calculate date range for this notification day
      const now = new Date();
      const targetDateStart = new Date(now);
      targetDateStart.setDate(targetDateStart.getDate() + days);
      targetDateStart.setHours(0, 0, 0, 0);

      const targetDateEnd = new Date(targetDateStart);
      targetDateEnd.setHours(23, 59, 59, 999);

      // Find active subscriptions expiring on this day that haven't been notified
      const { data: expiringSubscriptions, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          user_id,
          next_billing_date,
          expiration_notified_at,
          subscription_plans (
            name
          )
        `)
        .eq('status', 'active')
        .gte('next_billing_date', targetDateStart.toISOString())
        .lt('next_billing_date', targetDateEnd.toISOString())
        .is('expiration_notified_at', null);

      if (fetchError) {
        console.error(`[notify-expiring-licenses] Error fetching subscriptions:`, fetchError);
        continue;
      }

      if (!expiringSubscriptions || expiringSubscriptions.length === 0) {
        console.log(`[notify-expiring-licenses] No subscriptions expiring in ${days} days need notification`);
        continue;
      }

      console.log(`[notify-expiring-licenses] Found ${expiringSubscriptions.length} subscriptions to notify`);

      // Get user profiles for these subscriptions
      const userIds = expiringSubscriptions.map(s => s.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .in('user_id', userIds);

      if (profileError) {
        console.error('[notify-expiring-licenses] Error fetching profiles:', profileError);
        continue;
      }

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Send notifications
      for (const subscription of expiringSubscriptions) {
        const profile = profileMap.get(subscription.user_id);
        if (!profile?.email) {
          console.log(`[notify-expiring-licenses] No email for user ${subscription.user_id}, skipping`);
          continue;
        }

        const planName = (subscription.subscription_plans as any)?.name || 'Plano';
        const expirationDate = new Date(subscription.next_billing_date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });

        const subject = days === 1 
          ? `⚠️ URGENTE: Sua licença expira AMANHÃ!`
          : days <= 3 
            ? `⚠️ Atenção: Sua licença expira em ${days} dias`
            : `📅 Lembrete: Sua licença expira em ${days} dias`;

        const emailHtml = getExpirationEmailTemplate(
          profile.name || 'Cliente',
          planName,
          days,
          expirationDate,
          settings
        );

        const sent = await sendEmail(settings.resend_api_key, fromEmail, profile.email, subject, emailHtml);

        if (sent) {
          // Mark as notified
          await supabase
            .from('user_subscriptions')
            .update({ expiration_notified_at: new Date().toISOString() })
            .eq('id', subscription.id);

          result.sent++;
          result.details.push({
            email: profile.email,
            daysLeft: days,
            status: 'sent'
          });

          console.log(`[notify-expiring-licenses] Notification sent to ${profile.email} (${days} days)`);
        } else {
          result.errors++;
          result.details.push({
            email: profile.email,
            daysLeft: days,
            status: 'error',
            error: 'Failed to send email'
          });
        }

        // Small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Reset notified_at for subscriptions that were notified but are still active
    // This allows re-notification if the subscription continues past previous notification
    const { error: resetError } = await supabase
      .from('user_subscriptions')
      .update({ expiration_notified_at: null })
      .eq('status', 'active')
      .lt('next_billing_date', new Date().toISOString());

    if (resetError) {
      console.log('[notify-expiring-licenses] Error resetting expired notifications:', resetError);
    }

    const duration = Date.now() - startTime;
    console.log(`[notify-expiring-licenses] Completed in ${duration}ms. Sent: ${result.sent}, Errors: ${result.errors}`);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error('[notify-expiring-licenses] Fatal error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
