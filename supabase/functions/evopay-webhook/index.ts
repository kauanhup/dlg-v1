import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-evopay-signature, x-webhook-signature, x-signature',
};

// HMAC signature verification for webhook authenticity
async function verifyWebhookSignature(payload: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature || !secret) {
    console.log('Missing signature or secret for webhook verification');
    return false;
  }
  
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return signature.toLowerCase() === expectedSignature.toLowerCase();
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Rate limiting helper
async function checkRateLimit(supabase: any, ip: string, endpoint: string, maxRequests: number = 60, windowMinutes: number = 1): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  
  const { data: existing, error: countError } = await supabase
    .from('rate_limits')
    .select('id, request_count')
    .eq('ip_address', ip)
    .eq('endpoint', endpoint)
    .gte('window_start', windowStart)
    .maybeSingle();
  
  if (countError) {
    console.error('Rate limit check error:', countError);
    return { allowed: true, remaining: maxRequests };
  }
  
  const currentCount = existing?.request_count || 0;
  
  if (currentCount >= maxRequests) {
    console.warn(`Rate limit exceeded for IP ${ip} on ${endpoint}: ${currentCount}/${maxRequests}`);
    return { allowed: false, remaining: 0 };
  }
  
  if (existing) {
    await supabase
      .from('rate_limits')
      .update({ request_count: currentCount + 1 })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('rate_limits')
      .insert({
        ip_address: ip,
        endpoint: endpoint,
        request_count: 1,
        window_start: new Date().toISOString()
      });
  }
  
  return { allowed: true, remaining: maxRequests - currentCount - 1 };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    console.log('=== EVOPAY WEBHOOK START ===');
    console.log('Client IP:', clientIp);

    // Rate limit - 60 requests per minute per IP
    const rateLimit = await checkRateLimit(supabase, clientIp, 'evopay-webhook', 60, 1);
    if (!rateLimit.allowed) {
      console.error(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' } }
      );
    }

    const rawBody = await req.text();
    console.log('Raw webhook body:', rawBody);
    
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Failed to parse webhook body:', parseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON payload' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log('EvoPay webhook received:', JSON.stringify(body));

    // EvoPay webhook payload structure
    const transactionId = body.id || body.transactionId || body.transaction_id;
    const externalId = body.externalId || body.external_id || body.orderId || body.order_id;
    const status = body.status;
    const amount = body.amount || body.value || body.paidAmount;
    const qrCodeText = body.qrCodeText || body.qr_code_text || body.pixCode || body.pix_code;

    console.log('Parsed webhook data:', { transactionId, externalId, status, amount });

    // IDEMPOTENCY: Check if we've already processed this webhook
    if (transactionId) {
      const { data: existingWebhook } = await supabase
        .from('processed_webhooks')
        .select('id')
        .eq('transaction_id', transactionId)
        .eq('gateway', 'evopay')
        .maybeSingle();

      if (existingWebhook) {
        console.log('Webhook already processed:', transactionId);
        return new Response(
          JSON.stringify({ success: true, status: 'already_processed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get signature from headers
    const signature = req.headers.get('x-evopay-signature') || 
                      req.headers.get('x-webhook-signature') ||
                      req.headers.get('x-signature');

    // Fetch EvoPay API key from settings
    const { data: settings, error: settingsError } = await supabase
      .from('gateway_settings')
      .select('evopay_api_key, evopay_enabled')
      .eq('provider', 'pixup')
      .eq('evopay_enabled', true)
      .maybeSingle();

    console.log('EvoPay settings found:', !!settings, 'Error:', settingsError?.message || 'none');

    // Verify signature if API key is configured
    if (settings?.evopay_api_key) {
      if (!signature) {
        console.error('SECURITY BLOCK: Missing EvoPay webhook signature - request rejected');
        return new Response(
          JSON.stringify({ success: false, error: 'Missing signature' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
      
      const isValid = await verifyWebhookSignature(rawBody, signature, settings.evopay_api_key);
      if (!isValid) {
        console.error('SECURITY BLOCK: Invalid EvoPay webhook signature - request rejected');
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid signature' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
      
      console.log('EvoPay webhook signature verified successfully');
    }

    if (!transactionId && !externalId && !qrCodeText) {
      console.log('No identifiable data in webhook, ignoring');
      return new Response(
        JSON.stringify({ success: true, message: 'No identifiable data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find payment - try multiple strategies
    let finalPayment = null;
    let orderId = null;
    
    // Strategy 1: Direct order_id match
    if (externalId) {
      const { data: paymentByOrderId } = await supabase
        .from('payments')
        .select('id, order_id, status, amount, pix_code')
        .eq('order_id', externalId)
        .maybeSingle();
      
      if (paymentByOrderId) {
        finalPayment = paymentByOrderId;
        orderId = paymentByOrderId.order_id;
        console.log('Found payment by order_id:', orderId);
      }
    }
    
    // Strategy 2: Match by PIX code
    if (!finalPayment && qrCodeText) {
      const { data: paymentByQrCode } = await supabase
        .from('payments')
        .select('id, order_id, status, amount, pix_code')
        .eq('pix_code', qrCodeText)
        .maybeSingle();
      
      if (paymentByQrCode) {
        finalPayment = paymentByQrCode;
        orderId = paymentByQrCode.order_id;
        console.log('Found payment by pix_code:', orderId);
      }
    }

    // Strategy 3: Match by evopay_transaction_id
    if (!finalPayment && transactionId) {
      const { data: paymentByTransactionId } = await supabase
        .from('payments')
        .select('id, order_id, status, amount, pix_code, evopay_transaction_id')
        .eq('evopay_transaction_id', transactionId)
        .maybeSingle();
      
      if (paymentByTransactionId) {
        finalPayment = paymentByTransactionId;
        orderId = paymentByTransactionId.order_id;
        console.log('Found payment by evopay_transaction_id:', transactionId, '-> order:', orderId);
      }
    }

    // Strategy 4: Try transaction ID as order_id directly
    if (!finalPayment && transactionId) {
      const { data: paymentByTransactionAsOrderId } = await supabase
        .from('payments')
        .select('id, order_id, status, amount, pix_code')
        .eq('order_id', transactionId)
        .maybeSingle();
      
      if (paymentByTransactionAsOrderId) {
        finalPayment = paymentByTransactionAsOrderId;
        orderId = paymentByTransactionAsOrderId.order_id;
        console.log('Found payment by transaction ID as order_id:', orderId);
      }
    }

    if (!finalPayment || !orderId) {
      console.error('Payment not found for:', { transactionId, externalId });
      return new Response(
        JSON.stringify({ success: false, error: 'Payment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, status, product_type, quantity, amount')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderId);
      return new Response(
        JSON.stringify({ success: false, error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found order:', order);

    // Skip if already completed (idempotency)
    if (order.status === 'completed') {
      console.log('Order already completed, skipping - idempotent response');
      return new Response(
        JSON.stringify({ success: true, message: 'Order already completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Validate amount matches - BLOCK if mismatch
    if (amount) {
      const webhookAmount = Number(amount);
      const orderAmount = Number(order.amount);
      if (Math.abs(webhookAmount - orderAmount) > 0.01) {
        console.error(`SECURITY BLOCK: Amount mismatch: webhook=${webhookAmount}, order=${orderAmount}`);
        
        // Mark order as requiring review instead of completing
        await supabase
          .from('orders')
          .update({ 
            status: 'pending', 
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Amount mismatch - transaction blocked for review',
            expected: orderAmount,
            received: webhookAmount
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('Amount validation passed:', webhookAmount);
    }

    // Map EvoPay status to our status
    const statusLower = (status || '').toLowerCase();
    let newOrderStatus = order.status;
    let newPaymentStatus = 'pending';

    console.log('Processing status:', statusLower);

    switch (statusLower) {
      case 'completed':
      case 'paid':
      case 'confirmed':
      case 'approved':
      case 'success':
      case 'pago':
        newOrderStatus = 'paid';
        newPaymentStatus = 'paid';
        break;
      case 'canceled':
      case 'cancelled':
      case 'expired':
      case 'failed':
      case 'cancelado':
        newOrderStatus = 'cancelled';
        newPaymentStatus = 'failed';
        break;
      case 'pending':
      case 'waiting':
      case 'pendente':
        newOrderStatus = 'pending';
        newPaymentStatus = 'pending';
        break;
      default:
        console.log('Unknown status, keeping current:', statusLower);
    }

    console.log(`Updating order ${orderId} to status: ${newOrderStatus}`);

    // Update order status
    await supabase
      .from('orders')
      .update({ status: newOrderStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    // Update payment record
    const paymentUpdate: any = { status: newPaymentStatus };
    if (newPaymentStatus === 'paid') {
      paymentUpdate.paid_at = new Date().toISOString();
    }

    await supabase
      .from('payments')
      .update(paymentUpdate)
      .eq('order_id', orderId);

    // If payment completed, process order fulfillment
    if (newPaymentStatus === 'paid' && order.status !== 'completed') {
      console.log('Payment completed, processing order fulfillment...');
      
      const { data: rpcResult, error: rpcError } = await supabase.rpc('complete_order_atomic', {
        _order_id: orderId,
        _user_id: order.user_id,
        _product_type: order.product_type,
        _quantity: order.quantity
      });

      if (rpcError) {
        console.error('Error completing order:', rpcError);
      } else {
        console.log('Order completion result:', JSON.stringify(rpcResult));
      }

      // Register webhook as processed with conflict handling (idempotency safety)
      if (transactionId) {
        const { error: insertError } = await supabase
          .from('processed_webhooks')
          .insert({
            transaction_id: transactionId,
            gateway: 'evopay',
            order_id: orderId,
            webhook_payload: body
          });
        
        // Log if insert failed (likely constraint violation from race condition)
        if (insertError) {
          console.log('processed_webhooks insert handled (likely duplicate):', insertError.code);
        }
      }
    }

    console.log(`=== EVOPAY WEBHOOK END - Order ${orderId} updated to ${newOrderStatus} ===`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing EvoPay webhook:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});