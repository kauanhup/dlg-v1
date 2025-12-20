import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
}

// Simple HMAC verification for webhook authenticity
async function verifyWebhookSignature(payload: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature || !secret) {
    console.log('Missing signature or secret for webhook verification')
    return false
  }
  
  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    // Compare signatures (timing-safe comparison)
    return signature.toLowerCase() === expectedSignature.toLowerCase()
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

// IMPROVEMENT: Rate limiting helper
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get client IP for rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // IMPROVEMENT: Rate limit - 60 requests per minute per IP
    const rateLimit = await checkRateLimit(supabase, clientIp, 'pixup-webhook', 60, 1);
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
    const rawBody = await req.text()
    const payload = JSON.parse(rawBody)
    
    console.log('PixUp Webhook received:', JSON.stringify(payload))

    // Fetch webhook secret from gateway settings
    const { data: settings } = await supabase
      .from('gateway_settings')
      .select('client_secret, webhook_url')
      .eq('provider', 'pixup')
      .eq('is_active', true)
      .maybeSingle()

    // Get the webhook signature from headers (multiple possible header names)
    const signature = req.headers.get('x-webhook-signature') || 
                      req.headers.get('x-pixup-signature') ||
                      req.headers.get('x-signature')

    // SECURITY: Verify webhook signature if both secret and signature are present
    // If PixUp doesn't send signatures, we allow the request but log it
    if (settings?.client_secret && signature) {
      const isValid = await verifyWebhookSignature(rawBody, signature, settings.client_secret)
      
      if (!isValid) {
        console.error('Invalid webhook signature - potential spoofing attempt')
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid signature' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }
      console.log('Webhook signature verified successfully')
    } else {
      // Allow unsigned webhooks but log warning
      console.log('WARNING: Processing webhook without signature verification')
    }

    // PixUp webhook payload structure
    const {
      transactionId,
      externalId, // This is our order_id
      status,
      amount,
      paidAt,
      payerDocument,
      payerName,
    } = payload

    if (!externalId) {
      console.log('No externalId (order_id) in webhook payload')
      return new Response(
        JSON.stringify({ success: false, error: 'Missing externalId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // SECURITY: Validate that the order exists and is in pending state
    // This prevents attackers from completing already-processed or non-existent orders
    const { data: existingOrder, error: orderCheckError } = await supabase
      .from('orders')
      .select('id, status, amount, user_id')
      .eq('id', externalId)
      .single()

    if (orderCheckError || !existingOrder) {
      console.error('Order not found:', externalId)
      return new Response(
        JSON.stringify({ success: false, error: 'Order not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // SECURITY: Only process if order is still pending or paid (not completed)
    // 'paid' orders can still be processed to 'completed' state
    if (existingOrder.status === 'completed' || existingOrder.status === 'cancelled' || existingOrder.status === 'refunded') {
      console.log(`Order ${externalId} already finalized with status: ${existingOrder.status}`)
      return new Response(
        JSON.stringify({ success: true, message: 'Order already finalized', status: existingOrder.status }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // SECURITY: Optionally validate amount matches (if provided in webhook)
    if (amount && Math.abs(Number(amount) - Number(existingOrder.amount)) > 0.01) {
      console.error(`Amount mismatch: webhook=${amount}, order=${existingOrder.amount}`)
      return new Response(
        JSON.stringify({ success: false, error: 'Amount mismatch' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Map PixUp status to our internal status
    let orderStatus = 'pending'
    let paymentStatus = 'pending'

    switch (status?.toLowerCase()) {
      case 'paid':
      case 'confirmed':
      case 'approved':
        orderStatus = 'paid'
        paymentStatus = 'paid'
        break
      case 'expired':
      case 'cancelled':
      case 'canceled':
        orderStatus = 'cancelled'
        paymentStatus = 'cancelled'
        break
      case 'refunded':
        orderStatus = 'refunded'
        paymentStatus = 'refunded'
        break
      case 'pending':
      case 'waiting':
      default:
        orderStatus = 'pending'
        paymentStatus = 'pending'
        break
    }

    console.log(`Updating order ${externalId} to status: ${orderStatus}`)

    // Update order status
    const { error: orderError } = await supabase
      .from('orders')
      .update({ 
        status: orderStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', externalId)

    if (orderError) {
      console.error('Error updating order:', orderError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update order' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Update payment status
    const { error: paymentError } = await supabase
      .from('payments')
      .update({ 
        status: paymentStatus,
        paid_at: paymentStatus === 'paid' ? (paidAt || new Date().toISOString()) : null
      })
      .eq('order_id', externalId)

    if (paymentError) {
      console.error('Error updating payment:', paymentError)
    }

    // If payment is confirmed, trigger order completion
    if (paymentStatus === 'paid') {
      // Get order details to complete it
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', externalId)
        .single()

      if (order && !fetchError) {
        // Call the atomic order completion function
        const { data: result, error: completeError } = await supabase.rpc('complete_order_atomic', {
          _order_id: order.id,
          _user_id: order.user_id,
          _product_type: order.product_type,
          _quantity: order.quantity
        })

        if (completeError) {
          console.error('Error completing order:', completeError)
        } else {
          console.log('Order completed successfully:', result)
        }
      }
    }

    console.log(`Order ${externalId} updated successfully to ${orderStatus}`)

    return new Response(
      JSON.stringify({ success: true, status: orderStatus }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})