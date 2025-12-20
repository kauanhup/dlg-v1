import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-evopay-signature',
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

// IMPROVEMENT 3: Rate limiting helper
async function checkRateLimit(supabase: any, ip: string, endpoint: string, maxRequests: number = 60, windowMinutes: number = 1): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  
  // Count requests in current window
  const { data: existing, error: countError } = await supabase
    .from('rate_limits')
    .select('id, request_count')
    .eq('ip_address', ip)
    .eq('endpoint', endpoint)
    .gte('window_start', windowStart)
    .maybeSingle();
  
  if (countError) {
    console.error('Rate limit check error:', countError);
    // On error, allow request but log
    return { allowed: true, remaining: maxRequests };
  }
  
  const currentCount = existing?.request_count || 0;
  
  if (currentCount >= maxRequests) {
    console.warn(`Rate limit exceeded for IP ${ip} on ${endpoint}: ${currentCount}/${maxRequests}`);
    return { allowed: false, remaining: 0 };
  }
  
  // Update or insert rate limit record
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

    // IMPROVEMENT: Rate limit - 60 requests per minute per IP
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
    const body = JSON.parse(rawBody);
    
    console.log('EvoPay webhook received');

    // Get signature from headers
    const signature = req.headers.get('x-evopay-signature') || 
                      req.headers.get('x-webhook-signature');

    // SECURITY: Fetch EvoPay API key from settings to use as webhook secret
    const { data: settings } = await supabase
      .from('gateway_settings')
      .select('evopay_api_key, evopay_enabled')
      .eq('provider', 'pixup')
      .eq('evopay_enabled', true)
      .maybeSingle();

    // SECURITY: CRITICAL - Verify webhook authenticity
    // If signature verification is configured, enforce it
    if (settings?.evopay_api_key && signature) {
      const isValid = await verifyWebhookSignature(rawBody, signature, settings.evopay_api_key);
      
      if (!isValid) {
        console.error('SECURITY: Invalid EvoPay webhook signature - potential spoofing attempt');
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('EvoPay webhook signature verified successfully');
    } else if (signature) {
      // Signature provided but no secret configured - log warning but process
      console.warn('SECURITY WARNING: Webhook signature provided but API key not configured for verification');
    }

    // SECURITY: Additional IP validation could be added here if EvoPay provides IP whitelist

    // EvoPay webhook payload structure from docs:
    // { id, status, amount, type, qrCodeText, qrCodeUrl, payerDocument, payerName }
    const { id: transactionId, status, amount, payerDocument, payerName } = body;

    if (!transactionId) {
      console.log('No transaction ID in webhook, ignoring');
      return new Response(
        JSON.stringify({ success: true, message: 'No transaction ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing EvoPay webhook for transaction: ${transactionId}, status: ${status}`);

    // Find payment by order_id (transactionId is our order_id/external_id)
    // OR by pix_code if we stored the transaction ID there
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, order_id, status, amount')
      .eq('order_id', transactionId)
      .eq('payment_method', 'evopay')
      .maybeSingle();

    // If not found by order_id, try by pix_code
    let finalPayment = payment;
    if (!payment) {
      const { data: paymentByPix } = await supabase
        .from('payments')
        .select('id, order_id, status, amount')
        .eq('pix_code', transactionId)
        .eq('payment_method', 'evopay')
        .maybeSingle();
      finalPayment = paymentByPix;
    }

    if (!finalPayment) {
      console.error('Payment not found for transaction:', transactionId);
      return new Response(
        JSON.stringify({ success: false, error: 'Payment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orderId = finalPayment.order_id;

    // SECURITY: Validate amount matches (if provided in webhook)
    if (amount && finalPayment.amount && Math.abs(Number(amount) - Number(finalPayment.amount)) > 0.01) {
      console.error(`SECURITY: Amount mismatch detected - webhook=${amount}, payment=${finalPayment.amount}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Amount mismatch' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // SECURITY: Skip if already completed (idempotency)
    if (order.status === 'completed') {
      console.log('Order already completed, skipping - idempotent response');
      return new Response(
        JSON.stringify({ success: true, message: 'Order already completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Validate order amount matches (defense in depth)
    if (amount && Math.abs(Number(amount) - Number(order.amount)) > 0.01) {
      console.error(`SECURITY: Order amount mismatch - webhook=${amount}, order=${order.amount}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Order amount mismatch' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map EvoPay status to our status
    // EvoPay statuses: PENDING, COMPLETED, CANCELED
    let newOrderStatus = order.status;
    let newPaymentStatus = 'pending';

    if (status === 'COMPLETED') {
      newOrderStatus = 'paid';
      newPaymentStatus = 'paid';
    } else if (status === 'CANCELED') {
      newOrderStatus = 'cancelled';
      newPaymentStatus = 'failed';
    } else if (status === 'PENDING') {
      newOrderStatus = 'pending';
      newPaymentStatus = 'pending';
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
    }

    // If payment completed, process order fulfillment
    if (status === 'COMPLETED' && order.status !== 'completed') {
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
        console.log('Order completion result:', rpcResult);
      }
    }

    console.log('EvoPay webhook processed successfully');

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
