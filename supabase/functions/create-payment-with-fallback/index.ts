import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EVOPAY_BASE_URL = 'https://pix.evopay.cash/v1';

type Gateway = 'pixup' | 'evopay';

interface GatewayAttempt {
  gateway: Gateway;
  success: boolean;
  error?: string;
  response_time_ms: number;
}

interface PaymentResult {
  success: boolean;
  gateway_used?: Gateway;
  pixCode?: string;
  qrCodeBase64?: string;
  transactionId?: string;
  amount?: number;
  attempts: GatewayAttempt[];
  error?: string;
}

// SECURITY: Extract user from JWT token
async function getUserFromRequest(req: Request, supabase: any): Promise<{ userId: string | null; isAuthenticated: boolean }> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { userId: null, isAuthenticated: false };
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return { userId: null, isAuthenticated: false };
    }
    return { userId: user.id, isAuthenticated: true };
  } catch {
    return { userId: null, isAuthenticated: false };
  }
}

// Fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 30000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Get gateway settings
async function getGatewaySettings(supabase: any) {
  const { data, error } = await supabase
    .from('gateway_settings')
    .select('client_id, client_secret, is_active, evopay_api_key, evopay_enabled, pixup_weight, evopay_weight')
    .eq('provider', 'pixup')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching gateway settings:', error);
    return null;
  }

  return data;
}

// Log gateway attempt to database
async function logGatewayAttempt(
  supabase: any,
  gateway: string,
  status: string,
  orderId: string,
  attempt: number,
  error?: string
) {
  try {
    await supabase.from('gateway_logs').insert({
      gateway,
      status,
      order_id: orderId,
      attempt,
      error: error || null
    });
  } catch (err) {
    console.error('Failed to log gateway attempt:', err);
  }
}

// Create PIX with PixUp via proxy
async function createPixWithPixUp(
  supabase: any,
  settings: any,
  orderId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const PROXY_URL = Deno.env.get('PIXUP_PROXY_URL') || '';
  const PROXY_SECRET = Deno.env.get('PIXUP_PROXY_SECRET') || '';

  if (!PROXY_URL || !PROXY_SECRET || !settings?.client_id || !settings?.client_secret) {
    return { success: false, error: 'PixUp não configurado' };
  }

  if (!settings.is_active) {
    return { success: false, error: 'PixUp desativado' };
  }

  try {
    const response = await fetchWithTimeout(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Proxy-Secret': PROXY_SECRET
      },
      body: JSON.stringify({
        action: 'create_pix',
        amount,
        external_id: orderId,
        description
      })
    }, 30000);

    const data = await response.json();

    if (!response.ok || data.error) {
      return { success: false, error: data.error || `HTTP ${response.status}` };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro de conexão com PixUp' };
  }
}

// Create PIX with EvoPay
async function createPixWithEvoPay(
  settings: any,
  orderId: string,
  amount: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!settings?.evopay_api_key || !settings?.evopay_enabled) {
    return { success: false, error: 'EvoPay não configurado ou desativado' };
  }

  try {
    const webhookUrl = 'https://dlgconnect.com/evopay';

    const response = await fetchWithTimeout(`${EVOPAY_BASE_URL}/pix`, {
      method: 'POST',
      headers: {
        'API-Key': settings.evopay_api_key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        callbackUrl: webhookUrl,
      }),
    }, 30000);

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || `HTTP ${response.status}` };
    }

    return { 
      success: true, 
      data: {
        pixCode: data.qrCodeText,
        qrCodeBase64: data.qrCodeBase64,
        transactionId: data.id,
        amount: data.amount
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro de conexão com EvoPay' };
  }
}

// Notify admin about total gateway failure
async function notifyAdminGatewayFailure(
  supabase: any,
  orderId: string,
  userEmail: string,
  amount: number,
  attempts: GatewayAttempt[]
) {
  try {
    // Get email settings
    const { data: settings } = await supabase
      .from('gateway_settings')
      .select('resend_api_key, resend_from_email, resend_from_name, email_enabled')
      .eq('provider', 'pixup')
      .limit(1)
      .maybeSingle();

    if (!settings?.email_enabled || !settings?.resend_api_key) {
      console.log('Email not configured, skipping admin notification');
      return;
    }

    // Get admin emails
    const { data: admins } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (!admins || admins.length === 0) {
      console.log('No admins found for notification');
      return;
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('email')
      .in('user_id', admins.map((a: any) => a.user_id));

    const adminEmails = profiles?.map((p: any) => p.email).filter(Boolean) || [];
    
    if (adminEmails.length === 0) {
      console.log('No admin emails found');
      return;
    }

    const attemptsHtml = attempts.map(a => `
      <li style="margin-bottom: 8px;">
        <strong>${a.gateway}:</strong> ${a.success ? '✅ Sucesso' : '❌ Falhou'} 
        ${a.error ? `- ${a.error}` : ''} 
        (${a.response_time_ms}ms)
      </li>
    `).join('');

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: #e5e5e5; padding: 24px; border-radius: 8px;">
        <h1 style="color: #ef4444; margin-bottom: 24px;">🚨 URGENTE: Todos os gateways falharam</h1>
        
        <div style="background-color: #262626; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <p style="margin: 8px 0;"><strong>Order ID:</strong> ${orderId}</p>
          <p style="margin: 8px 0;"><strong>Usuário:</strong> ${userEmail}</p>
          <p style="margin: 8px 0;"><strong>Valor:</strong> R$ ${amount.toFixed(2)}</p>
          <p style="margin: 8px 0;"><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        </div>

        <h2 style="color: #fbbf24; margin-top: 24px;">Tentativas:</h2>
        <ul style="list-style: none; padding: 0;">
          ${attemptsHtml}
        </ul>

        <p style="color: #9ca3af; margin-top: 24px; font-size: 14px;">
          O cliente foi orientado que o pedido foi registrado e que entrarão em contato.
        </p>
      </div>
    `;

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.resend_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${settings.resend_from_name || 'DLG Connect'} <${settings.resend_from_email || 'noreply@dlgconnect.com'}>`,
        to: adminEmails,
        subject: '🚨 URGENTE: Todos os gateways de pagamento falharam',
        html: emailHtml,
      }),
    });

    if (resendResponse.ok) {
      console.log('Admin notification sent successfully');
    } else {
      console.error('Failed to send admin notification:', await resendResponse.text());
    }
  } catch (error) {
    console.error('Error notifying admin:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

    const { order_id, amount, description } = await req.json();

    // Validate authentication
    const { userId, isAuthenticated } = await getUserFromRequest(req, supabaseAuth);
    
    if (!isAuthenticated || !userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate order ownership
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, amount, product_name')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ success: false, error: 'Pedido não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (order.user_id !== userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Pedido não pertence ao usuário' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate amount
    const orderAmount = Number(order.amount);
    if (Math.abs(orderAmount - amount) > 0.01) {
      return new Response(
        JSON.stringify({ success: false, error: 'Valor do pagamento não confere' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get gateway settings
    const settings = await getGatewaySettings(supabaseAdmin);
    
    if (!settings) {
      return new Response(
        JSON.stringify({ success: false, error: 'Configurações de gateway não encontradas' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine gateway order based on weights (higher weight = more priority)
    const pixupWeight = settings.pixup_weight ?? 50;
    const evopayWeight = settings.evopay_weight ?? 50;
    const pixupEnabled = settings.is_active && settings.client_id && settings.client_secret;
    const evopayEnabled = settings.evopay_enabled && settings.evopay_api_key;

    // Build gateway order
    let gateways: Gateway[] = [];
    
    if (pixupEnabled && evopayEnabled) {
      // Both enabled - use weights to determine order (or random if equal)
      if (pixupWeight > evopayWeight) {
        gateways = ['pixup', 'evopay'];
      } else if (evopayWeight > pixupWeight) {
        gateways = ['evopay', 'pixup'];
      } else {
        // Equal weights - random
        gateways = Math.random() < 0.5 ? ['pixup', 'evopay'] : ['evopay', 'pixup'];
      }
    } else if (pixupEnabled) {
      gateways = ['pixup'];
    } else if (evopayEnabled) {
      gateways = ['evopay'];
    }

    if (gateways.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Nenhum gateway de pagamento está configurado',
          attempts: []
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Fallback] Trying gateways in order: ${gateways.join(', ')}`);

    const attempts: GatewayAttempt[] = [];
    let result: PaymentResult | null = null;

    // Try each gateway in order
    for (let i = 0; i < gateways.length; i++) {
      const gateway = gateways[i];
      const startTime = Date.now();
      
      console.log(`[Fallback] Attempting gateway: ${gateway} (attempt ${i + 1})`);

      let gatewayResult: { success: boolean; data?: any; error?: string };

      if (gateway === 'pixup') {
        gatewayResult = await createPixWithPixUp(supabaseAdmin, settings, order_id, amount, description || order.product_name);
      } else {
        gatewayResult = await createPixWithEvoPay(settings, order_id, amount);
      }

      const responseTime = Date.now() - startTime;

      attempts.push({
        gateway,
        success: gatewayResult.success,
        error: gatewayResult.error,
        response_time_ms: responseTime
      });

      // Log to database
      await logGatewayAttempt(
        supabaseAdmin,
        gateway,
        gatewayResult.success ? 'success' : 'failed',
        order_id,
        i + 1,
        gatewayResult.error
      );

      if (gatewayResult.success && gatewayResult.data) {
        console.log(`[Fallback] Gateway ${gateway} succeeded`);
        
        // Update payment record with PIX data
        const pixCode = gatewayResult.data.pixCode || gatewayResult.data.qrcode;
        const qrCodeBase64 = gatewayResult.data.qrCodeBase64 || gatewayResult.data.qrcode_base64;
        const transactionId = gatewayResult.data.transactionId || gatewayResult.data.id;

        await supabaseAdmin.from('payments').update({
          pix_code: pixCode,
          qr_code_base64: qrCodeBase64 || null,
          payment_method: gateway === 'evopay' ? 'evopay_pix' : 'pix',
          evopay_transaction_id: gateway === 'evopay' ? transactionId : null
        }).eq('order_id', order_id);

        result = {
          success: true,
          gateway_used: gateway,
          pixCode: pixCode,
          qrCodeBase64: qrCodeBase64,
          transactionId: transactionId,
          amount: amount,
          attempts
        };

        break;
      }

      console.log(`[Fallback] Gateway ${gateway} failed: ${gatewayResult.error}`);
    }

    // If no gateway succeeded
    if (!result) {
      console.log('[Fallback] All gateways failed, notifying admin');
      
      // Get user email for notification
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('user_id', userId)
        .single();

      // Notify admin
      await notifyAdminGatewayFailure(
        supabaseAdmin,
        order_id,
        profile?.email || 'unknown',
        amount,
        attempts
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Nossos sistemas de pagamento estão temporariamente indisponíveis. Seu pedido foi registrado e entraremos em contato em breve.',
          attempts
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in create-payment-with-fallback:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
