import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EVOPAY_BASE_URL = 'https://pix.evopay.cash/v1';

// SECURITY: Helper to verify admin role
async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
  
  return !error && data?.role === 'admin';
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

// Get EvoPay API key from database
async function getEvoPayApiKey(supabase: any): Promise<string | null> {
  const { data, error } = await supabase
    .from('gateway_settings')
    .select('evopay_api_key, evopay_enabled')
    .eq('provider', 'pixup')
    .limit(1)
    .maybeSingle();

  if (error || !data?.evopay_enabled || !data?.evopay_api_key) {
    return null;
  }

  return data.evopay_api_key;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

    const { action, ...params } = await req.json();
    console.log(`EvoPay action: ${action}`);

    const { userId, isAuthenticated } = await getUserFromRequest(req, supabaseAuth);

    // Admin-only actions
    const adminOnlyActions = ['test_connection', 'get_balance'];
    const authRequiredActions = ['create_pix', 'check_pix_status'];

    if (adminOnlyActions.includes(action)) {
      if (!isAuthenticated || !userId) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const adminCheck = await isAdmin(supabaseAdmin, userId);
      if (!adminCheck) {
        return new Response(
          JSON.stringify({ error: 'Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (authRequiredActions.includes(action)) {
      if (!isAuthenticated || !userId) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    switch (action) {
      case 'test_connection':
        return await testConnection(supabaseAdmin);
      
      case 'get_balance':
        return await getBalance(supabaseAdmin);
      
      case 'create_pix':
        return await createPixCharge(supabaseAdmin, params, userId!);
      
      case 'get_public_settings':
        return await getPublicSettings(supabaseAdmin);
      
      case 'check_pix_status':
        return await checkPixStatus(supabaseAdmin, params, userId!);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in evopay function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function testConnection(supabase: any) {
  const apiKey = await getEvoPayApiKey(supabase);
  
  if (!apiKey) {
    return new Response(
      JSON.stringify({ success: false, error: 'EvoPay não configurado' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const response = await fetch(`${EVOPAY_BASE_URL}/account/balance`, {
      method: 'GET',
      headers: {
        'API-Key': apiKey,
      },
    });

    const data = await response.json();
    console.log('EvoPay balance response:', data);

    if (response.ok && data.balance !== undefined) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: { 
            balance: data.balance,
            connected: true 
          } 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, error: data.message || 'Erro ao conectar' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('EvoPay connection error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro de conexão com EvoPay' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getBalance(supabase: any) {
  const apiKey = await getEvoPayApiKey(supabase);
  
  if (!apiKey) {
    return new Response(
      JSON.stringify({ success: false, error: 'EvoPay não configurado' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const response = await fetch(`${EVOPAY_BASE_URL}/account/balance`, {
      method: 'GET',
      headers: {
        'API-Key': apiKey,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return new Response(
        JSON.stringify({ success: true, data: { balance: data.balance } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, error: data.message || 'Erro ao obter saldo' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('EvoPay balance error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro ao obter saldo' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getPublicSettings(supabase: any) {
  const { data, error } = await supabase
    .from('gateway_settings')
    .select('evopay_enabled')
    .eq('provider', 'pixup')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching EvoPay settings:', error);
    return new Response(
      JSON.stringify({ success: true, data: { evopay_enabled: false } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: { evopay_enabled: data?.evopay_enabled || false }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function createPixCharge(supabase: any, params: { amount: number; external_id: string; description?: string }, userId: string) {
  const { amount, external_id, description } = params;

  if (!amount || amount <= 0) {
    return new Response(
      JSON.stringify({ error: 'Valor inválido' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Validate order ownership
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, user_id, amount')
    .eq('id', external_id)
    .single();

  if (orderError || !order) {
    console.error('Order not found:', external_id);
    return new Response(
      JSON.stringify({ error: 'Pedido não encontrado' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (order.user_id !== userId) {
    console.error('Order ownership mismatch:', { orderId: external_id, orderUserId: order.user_id, requestUserId: userId });
    return new Response(
      JSON.stringify({ error: 'Pedido não pertence ao usuário' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Validate amount matches
  const orderAmount = Number(order.amount);
  if (Math.abs(orderAmount - amount) > 0.01) {
    console.error('Amount mismatch:', { orderAmount, requestAmount: amount });
    return new Response(
      JSON.stringify({ error: 'Valor do pagamento não confere com o pedido' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const apiKey = await getEvoPayApiKey(supabase);
  
  if (!apiKey) {
    console.log('EvoPay not configured, returning without PIX code');
    return new Response(
      JSON.stringify({ success: true, data: null, message: 'Gateway não configurado' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Webhook URL - MUST point to Hostinger proxy which forwards to Supabase
    // EvoPay will send payment confirmation to this URL
    const webhookUrl = 'https://dlgconnect.com/evopay';

    console.log('Creating EvoPay PIX charge:', { amount, external_id, webhookUrl });

    // According to EvoPay docs: POST /pix with amount, callbackUrl
    const response = await fetch(`${EVOPAY_BASE_URL}/pix`, {
      method: 'POST',
      headers: {
        'API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        callbackUrl: webhookUrl,
      }),
    });

    const data = await response.json();
    console.log('EvoPay create PIX response:', data);

    if (!response.ok) {
      console.error('EvoPay error response:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.message || 'Erro ao gerar PIX' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store PIX code and transaction ID in payments table for webhook matching
    const { error: updateError } = await supabase
      .from('payments')
      .update({ 
        pix_code: data.qrCodeText, // Store actual PIX code for QR display
        payment_method: 'evopay_pix',
        evopay_transaction_id: data.id // Store EvoPay transaction ID for webhook matching
      })
      .eq('order_id', external_id);
    
    if (updateError) {
      console.error('Error updating payment with EvoPay data:', updateError);
    } else {
      console.log('Payment updated with evopay_transaction_id:', data.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          pixCode: data.qrCodeText,
          qrCodeBase64: data.qrCodeBase64,
          qrCodeUrl: data.qrCodeUrl,
          transactionId: data.id,
          amount: data.amount,
          taxAmount: data.taxAmount,
          amountWithTax: data.amountWithTax,
          status: data.status,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('EvoPay create PIX error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro ao criar cobrança PIX' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// CHECK PIX STATUS - Polling for payment confirmation via EvoPay
async function checkPixStatus(supabase: any, params: { 
  orderId: string;
  transactionId?: string;
}, userId: string) {
  const { orderId, transactionId } = params;

  if (!orderId) {
    return new Response(
      JSON.stringify({ error: 'orderId is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // SECURITY: Verify order belongs to user
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('user_id, status, amount, product_type, quantity')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return new Response(
      JSON.stringify({ error: 'Order not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (order.user_id !== userId) {
    console.log(`User ${userId} attempted to check status for order owned by ${order.user_id}`);
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // If order is already completed, return immediately
  if (order.status === 'completed' || order.status === 'paid') {
    return new Response(
      JSON.stringify({ 
        success: true, 
        status: 'paid',
        orderStatus: order.status,
        message: 'Payment already confirmed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get payment with transaction ID
  const { data: payment } = await supabase
    .from('payments')
    .select('evopay_transaction_id, status')
    .eq('order_id', orderId)
    .maybeSingle();

  const txId = transactionId || payment?.evopay_transaction_id;

  // If no transaction ID, we can't check with gateway
  if (!txId) {
    return new Response(
      JSON.stringify({ 
        success: true, 
        status: 'pending',
        orderStatus: order.status,
        message: 'Awaiting payment'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get EvoPay API key
  const apiKey = await getEvoPayApiKey(supabase);

  if (!apiKey) {
    return new Response(
      JSON.stringify({ 
        success: true, 
        status: 'pending',
        orderStatus: order.status,
        message: 'Gateway not configured'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Call EvoPay API to check transaction status
    console.log('Checking EvoPay transaction status:', txId);
    
    const response = await fetch(`${EVOPAY_BASE_URL}/pix/${txId}`, {
      method: 'GET',
      headers: {
        'API-Key': apiKey,
      },
    });

    const data = await response.json();
    console.log('EvoPay status check result:', JSON.stringify(data));

    const gatewayStatus = data?.status?.toUpperCase() || 'PENDING';
    
    // Map gateway status to our status
    // EvoPay statuses: PENDING, COMPLETED, EXPIRED, etc.
    if (gatewayStatus === 'COMPLETED' || gatewayStatus === 'PAID' || gatewayStatus === 'APPROVED') {
      console.log(`PIX confirmed via polling for order ${orderId}! Completing order...`);
      
      // Complete the order atomically
      const { data: completeResult, error: completeError } = await supabase.rpc('complete_order_atomic', {
        _order_id: orderId,
        _user_id: userId,
        _product_type: order.product_type,
        _quantity: order.quantity
      });

      if (completeError) {
        console.error('Error completing order:', completeError);
      } else {
        console.log('Order completed successfully:', completeResult);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          status: 'paid',
          orderStatus: 'completed',
          gatewayStatus: data?.status,
          message: 'Payment confirmed!'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return current status
    return new Response(
      JSON.stringify({ 
        success: true, 
        status: gatewayStatus.toLowerCase(),
        orderStatus: order.status,
        gatewayStatus: data?.status,
        message: 'Payment pending'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking EvoPay PIX status:', errorMessage);
    
    // Return pending if we can't check
    return new Response(
      JSON.stringify({ 
        success: true, 
        status: 'pending',
        orderStatus: order.status,
        error: errorMessage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
