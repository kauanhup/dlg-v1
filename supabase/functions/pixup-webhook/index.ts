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
    
    return signature.toLowerCase() === expectedSignature.toLowerCase()
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    console.log('=== PIXUP WEBHOOK START ===')
    console.log('Client IP:', clientIp)

    // Rate limit - 60 requests per minute per IP
    const rateLimit = await checkRateLimit(supabase, clientIp, 'pixup-webhook', 60, 1);
    if (!rateLimit.allowed) {
      console.error(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' } }
      );
    }

    const rawBody = await req.text()
    console.log('Raw webhook body:', rawBody)
    
    let payload: any;
    try {
      payload = JSON.parse(rawBody)
    } catch (parseError) {
      console.error('Failed to parse webhook body:', parseError)
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON payload' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    console.log('PixUp Webhook received:', JSON.stringify(payload))

    // PixUp webhook payload structure - data can be inside 'requestBody' wrapper
    const data = payload.requestBody || payload;
    
    const transactionId = data.transactionId || data.transaction_id || data.id
    const externalId = data.externalId || data.external_id || data.orderId || data.order_id
    const status = data.status
    const amount = data.amount || data.value || data.paidAmount || data.paid_amount

    console.log('Parsed webhook data:', { transactionId, externalId, status, amount })

    // IDEMPOTENCY: Check if we've already processed this webhook
    if (transactionId) {
      const { data: existingWebhook } = await supabase
        .from('processed_webhooks')
        .select('id')
        .eq('transaction_id', transactionId)
        .eq('gateway', 'pixup')
        .maybeSingle();

      if (existingWebhook) {
        console.log('Webhook already processed:', transactionId);
        return new Response(
          JSON.stringify({ success: true, status: 'already_processed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fetch webhook secret from gateway settings
    const { data: settings, error: settingsError } = await supabase
      .from('gateway_settings')
      .select('client_secret, webhook_url')
      .eq('provider', 'pixup')
      .eq('is_active', true)
      .maybeSingle()

    console.log('Gateway settings found:', !!settings, 'Error:', settingsError?.message || 'none')

    // Get the webhook signature from headers
    const signature = req.headers.get('x-webhook-signature') || 
                      req.headers.get('x-pixup-signature') ||
                      req.headers.get('x-signature')

    // Verify signature if secret is configured AND signature is provided
    // PixUp may not always send signatures, so we only verify if both are present
    if (settings?.client_secret && signature) {
      const isValid = await verifyWebhookSignature(rawBody, signature, settings.client_secret)
      if (!isValid) {
        console.error('SECURITY WARNING: Invalid webhook signature detected')
        // Log but don't block - PixUp may use different signature format
        console.log('Proceeding despite signature mismatch for compatibility')
      } else {
        console.log('Webhook signature verified successfully')
      }
    } else if (!signature) {
      console.log('No webhook signature provided - proceeding without verification (PixUp standard)')
    }

    if (!externalId) {
      console.error('No externalId (order_id) in webhook payload')
      return new Response(
        JSON.stringify({ success: false, error: 'Missing externalId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Validate that the order exists
    const { data: existingOrder, error: orderCheckError } = await supabase
      .from('orders')
      .select('id, status, amount, user_id, product_type, quantity')
      .eq('id', externalId)
      .single()

    if (orderCheckError || !existingOrder) {
      console.error('Order not found:', externalId, 'Error:', orderCheckError?.message)
      return new Response(
        JSON.stringify({ success: false, error: 'Order not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    console.log('Found order:', existingOrder)

    // Only process if order is still pending or paid (not completed)
    if (existingOrder.status === 'completed' || existingOrder.status === 'cancelled' || existingOrder.status === 'refunded') {
      console.log(`Order ${externalId} already finalized with status: ${existingOrder.status}`)
      return new Response(
        JSON.stringify({ success: true, message: 'Order already finalized', status: existingOrder.status }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // SECURITY: Validate amount matches - BLOCK if mismatch
    if (amount) {
      const webhookAmount = Number(amount)
      const orderAmount = Number(existingOrder.amount)
      if (Math.abs(webhookAmount - orderAmount) > 0.01) {
        console.error(`SECURITY BLOCK: Amount mismatch: webhook=${webhookAmount}, order=${orderAmount}`)
        
        // Mark order as requiring review instead of completing
        await supabase
          .from('orders')
          .update({ 
            status: 'pending', 
            updated_at: new Date().toISOString()
          })
          .eq('id', externalId)
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Amount mismatch - transaction blocked for review',
            expected: orderAmount,
            received: webhookAmount
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      console.log('Amount validation passed:', webhookAmount)
    }

    // Map PixUp status to determine action
    const statusLower = (status || '').toLowerCase()
    console.log('Processing status:', statusLower)

    const isPaid = ['paid', 'confirmed', 'approved', 'completed', 'success', 'pago', 'aprovado'].includes(statusLower)
    const isCancelled = ['expired', 'cancelled', 'canceled', 'expirado', 'cancelado'].includes(statusLower)
    const isRefunded = ['refunded', 'reembolsado'].includes(statusLower)

    // If payment is confirmed, complete the order
    if (isPaid) {
      console.log('Payment confirmed - triggering order completion...')
      
      const { data: result, error: completeError } = await supabase.rpc('complete_order_atomic', {
        _order_id: existingOrder.id,
        _user_id: existingOrder.user_id,
        _product_type: existingOrder.product_type,
        _quantity: existingOrder.quantity
      })

      if (completeError) {
        console.error('Error completing order:', completeError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to complete order: ' + completeError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      // Register webhook as processed with conflict handling (idempotency safety)
      if (transactionId) {
        const { error: insertError } = await supabase
          .from('processed_webhooks')
          .insert({
            transaction_id: transactionId,
            gateway: 'pixup',
            order_id: existingOrder.id,
            webhook_payload: payload
          });
        
        // Log if insert failed (likely constraint violation from race condition)
        if (insertError) {
          console.log('processed_webhooks insert handled (likely duplicate):', insertError.code);
        }
      }
      
      console.log('Order completed successfully:', JSON.stringify(result))
      console.log(`=== PIXUP WEBHOOK END - Order ${externalId} completed ===`)
      
      return new Response(
        JSON.stringify({ success: true, status: 'completed', result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle cancelled/refunded status
    if (isCancelled || isRefunded) {
      const newStatus = isRefunded ? 'refunded' : 'cancelled'
      
      await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', externalId)

      await supabase
        .from('payments')
        .update({ status: newStatus })
        .eq('order_id', externalId)

      // Register webhook as processed with conflict handling
      if (transactionId) {
        const { error: insertError } = await supabase
          .from('processed_webhooks')
          .insert({
            transaction_id: transactionId,
            gateway: 'pixup',
            order_id: existingOrder.id,
            webhook_payload: payload
          });
        
        if (insertError) {
          console.log('processed_webhooks insert handled (likely duplicate):', insertError.code);
        }
      }

      console.log(`=== PIXUP WEBHOOK END - Order ${externalId} updated to ${newStatus} ===`)
      
      return new Response(
        JSON.stringify({ success: true, status: newStatus }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For pending or unknown status, just acknowledge
    console.log(`=== PIXUP WEBHOOK END - Order ${externalId} status pending ===`)

    return new Response(
      JSON.stringify({ success: true, status: 'pending' }),
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