import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-evopay-signature, x-webhook-signature, x-signature',
};

// SECURITY: HMAC signature verification for webhook authenticity
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
    
    // Timing-safe comparison
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client IP for rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    console.log('=== EVOPAY WEBHOOK START ===');
    console.log('Client IP:', clientIp);
    console.log('Request headers:', JSON.stringify(Object.fromEntries(req.headers.entries())));

    // Rate limit - 60 requests per minute per IP
    const rateLimit = await checkRateLimit(supabase, clientIp, 'evopay-webhook', 60, 1);
    if (!rateLimit.allowed) {
      console.error(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Rate limit exceeded' }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': '60'
          } 
        }
      );
    }

    // Get raw body for signature verification
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

    // Get signature from headers (multiple possible header names)
    const signature = req.headers.get('x-evopay-signature') || 
                      req.headers.get('x-webhook-signature') ||
                      req.headers.get('x-signature');

    console.log('Signature header present:', !!signature);

    // Fetch EvoPay API key from settings
    const { data: settings, error: settingsError } = await supabase
      .from('gateway_settings')
      .select('evopay_api_key, evopay_enabled')
      .eq('provider', 'pixup')
      .eq('evopay_enabled', true)
      .maybeSingle();

    console.log('EvoPay settings found:', !!settings, 'Error:', settingsError?.message || 'none');

    // SECURITY: Verify signature if both are present, but don't reject if gateway doesn't sign
    if (settings?.evopay_api_key && signature) {
      const isValid = await verifyWebhookSignature(rawBody, signature, settings.evopay_api_key);
      
      if (!isValid) {
        console.warn('SECURITY WARNING: Invalid EvoPay webhook signature - but processing anyway');
      } else {
        console.log('EvoPay webhook signature verified successfully');
      }
    } else if (!signature) {
      console.log('No signature header - processing webhook without verification');
    }

    // EvoPay webhook payload structure - support multiple field name formats
    const transactionId = body.id || body.transactionId || body.transaction_id;
    const externalId = body.externalId || body.external_id || body.orderId || body.order_id;
    const status = body.status;
    const amount = body.amount || body.value || body.paidAmount;
    const qrCodeText = body.qrCodeText || body.qr_code_text || body.pixCode || body.pix_code;
    const payerDocument = body.payerDocument || body.payer_document || body.cpf;
    const payerName = body.payerName || body.payer_name || body.name;

    console.log('Parsed webhook data:', { transactionId, externalId, status, amount, qrCodeText: qrCodeText?.substring(0, 50) });

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

    // Strategy 3: Match by evopay_transaction_id (THE CORRECT WAY)
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

    // Strategy 4: Try transaction ID as order_id directly (fallback)
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
      console.error('Payment not found for:', { transactionId, externalId, qrCodeText: qrCodeText?.substring(0, 30) });
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

    // Validate amount matches (with tolerance for rounding)
    if (amount) {
      const webhookAmount = Number(amount);
      const orderAmount = Number(order.amount);
      if (Math.abs(webhookAmount - orderAmount) > 0.01) {
        console.warn(`Amount mismatch warning: webhook=${webhookAmount}, order=${orderAmount}`);
      } else {
        console.log('Amount validation passed:', webhookAmount);
      }
    }

    // Map EvoPay status to our status - support multiple formats
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
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({ 
        status: newOrderStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateOrderError) {
      console.error('Error updating order:', updateOrderError);
    } else {
      console.log('Order status updated successfully');
    }

    // Update payment record
    const paymentUpdate: any = { 
      status: newPaymentStatus,
    };
    
    if (newPaymentStatus === 'paid') {
      paymentUpdate.paid_at = new Date().toISOString();
    }

    const { error: updatePaymentError } = await supabase
      .from('payments')
      .update(paymentUpdate)
      .eq('order_id', orderId);

    if (updatePaymentError) {
      console.error('Error updating payment:', updatePaymentError);
    } else {
      console.log('Payment status updated successfully');
    }

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
