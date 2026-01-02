import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Asaas API - Produção
const ASAAS_API_URL = 'https://api.asaas.com/v3';

// Helper: Get user from JWT
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

// Helper: Check if user is admin
async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
  
  return !error && data?.role === 'admin';
}

// Helper: Fetch with timeout
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

// Get Asaas API Key from database or env
async function getAsaasApiKey(supabase: any): Promise<string | null> {
  // First try to get from database (gateway_settings)
  try {
    const { data: settings } = await supabase
      .from('gateway_settings')
      .select('asaas_api_key')
      .eq('provider', 'pixup')
      .maybeSingle();
    
    if (settings?.asaas_api_key) {
      return settings.asaas_api_key;
    }
  } catch (error) {
    console.log('[Asaas] Could not fetch API key from database, falling back to env');
  }
  
  // Fallback to environment variable
  return Deno.env.get('ASAAS_API_KEY') || null;
}

// Get or create Asaas customer for a user
async function getOrCreateCustomer(supabase: any, userId: string, apiKey: string, cpfCnpj?: string): Promise<{ success: boolean; customerId?: string; error?: string }> {
  // First check if we have a cached customer ID in profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, name, whatsapp')
    .eq('user_id', userId)
    .single();

  if (!profile?.email) {
    return { success: false, error: 'Perfil não encontrado' };
  }

  // Search for existing customer by email
  try {
    const searchResponse = await fetchWithTimeout(`${ASAAS_API_URL}/customers?email=${encodeURIComponent(profile.email)}`, {
      method: 'GET',
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      },
    }, 15000);

    const searchData = await searchResponse.json();
    
    if (searchData.data && searchData.data.length > 0) {
      const existingCustomer = searchData.data[0];
      
      // If customer exists but doesn't have CPF and we have one, update it
      if (cpfCnpj && !existingCustomer.cpfCnpj) {
        try {
          await fetchWithTimeout(`${ASAAS_API_URL}/customers/${existingCustomer.id}`, {
            method: 'PUT',
            headers: {
              'access_token': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cpfCnpj: cpfCnpj.replace(/\D/g, '') }),
          }, 15000);
        } catch (updateError) {
          console.log('[Asaas] Could not update customer CPF:', updateError);
        }
      }
      
      return { success: true, customerId: existingCustomer.id };
    }

    // Create new customer with CPF if provided
    const customerData: any = {
      name: profile.name || profile.email.split('@')[0],
      email: profile.email,
      mobilePhone: profile.whatsapp?.replace(/\D/g, '') || undefined,
      notificationDisabled: false,
    };
    
    if (cpfCnpj) {
      customerData.cpfCnpj = cpfCnpj.replace(/\D/g, '');
    }

    const createResponse = await fetchWithTimeout(`${ASAAS_API_URL}/customers`, {
      method: 'POST',
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    }, 15000);

    const createData = await createResponse.json();

    if (createData.id) {
      return { success: true, customerId: createData.id };
    }

    console.error('[Asaas] Failed to create customer:', createData);
    return { success: false, error: createData.errors?.[0]?.description || 'Erro ao criar cliente' };
  } catch (error: any) {
    console.error('[Asaas] Customer error:', error);
    return { success: false, error: error.message };
  }
}

// Create PIX payment
async function createPixPayment(
  supabase: any,
  apiKey: string,
  customerId: string,
  orderId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Due date = today (immediate payment)
    const today = new Date();
    const dueDate = today.toISOString().split('T')[0];

    const response = await fetchWithTimeout(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: 'PIX',
        value: amount,
        dueDate: dueDate,
        description: description,
        externalReference: orderId,
      }),
    }, 30000);

    const data = await response.json();
    console.log('[Asaas] PIX payment response:', JSON.stringify(data));

    if (data.errors) {
      return { success: false, error: data.errors[0]?.description || 'Erro ao criar cobrança' };
    }

    if (!data.id) {
      return { success: false, error: 'Resposta inválida do gateway' };
    }

    // Get PIX QR Code
    const qrResponse = await fetchWithTimeout(`${ASAAS_API_URL}/payments/${data.id}/pixQrCode`, {
      method: 'GET',
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      },
    }, 15000);

    const qrData = await qrResponse.json();
    console.log('[Asaas] QR Code response received');

    return {
      success: true,
      data: {
        paymentId: data.id,
        pixCode: qrData.payload || qrData.encodedImage,
        qrCodeBase64: qrData.encodedImage,
        value: data.value,
        status: data.status,
        externalReference: data.externalReference,
      },
    };
  } catch (error: any) {
    console.error('[Asaas] PIX creation error:', error);
    return { success: false, error: error.message || 'Erro de conexão' };
  }
}

// Create Credit Card payment
async function createCreditCardPayment(
  supabase: any,
  apiKey: string,
  customerId: string,
  orderId: string,
  amount: number,
  description: string,
  cardData: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  },
  holderInfo: {
    name: string;
    email: string;
    cpfCnpj: string;
    phone?: string;
    postalCode: string;
    addressNumber: string;
  },
  installmentCount: number = 1,
  remoteIp: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const today = new Date();
    const dueDate = today.toISOString().split('T')[0];

    const payload: any = {
      customer: customerId,
      billingType: 'CREDIT_CARD',
      value: amount,
      dueDate: dueDate,
      description: description,
      externalReference: orderId,
      creditCard: {
        holderName: cardData.holderName,
        number: cardData.number.replace(/\s/g, ''),
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear,
        ccv: cardData.ccv,
      },
      creditCardHolderInfo: {
        name: holderInfo.name,
        email: holderInfo.email,
        cpfCnpj: holderInfo.cpfCnpj.replace(/\D/g, ''),
        phone: holderInfo.phone?.replace(/\D/g, '') || undefined,
        postalCode: holderInfo.postalCode.replace(/\D/g, ''),
        addressNumber: holderInfo.addressNumber,
      },
      remoteIp: remoteIp,
    };

    // Add installments if more than 1
    if (installmentCount > 1) {
      payload.installmentCount = installmentCount;
      payload.installmentValue = Math.ceil((amount / installmentCount) * 100) / 100;
    }

    console.log('[Asaas] Creating credit card payment for order:', orderId);

    const response = await fetchWithTimeout(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }, 30000);

    const data = await response.json();
    console.log('[Asaas] Credit card response:', JSON.stringify(data));

    if (data.errors) {
      const errorMsg = data.errors[0]?.description || 'Erro no pagamento';
      return { success: false, error: errorMsg };
    }

    if (!data.id) {
      return { success: false, error: 'Resposta inválida do gateway' };
    }

    return {
      success: true,
      data: {
        paymentId: data.id,
        status: data.status,
        confirmedDate: data.confirmedDate,
        value: data.value,
        netValue: data.netValue,
        externalReference: data.externalReference,
      },
    };
  } catch (error: any) {
    console.error('[Asaas] Credit card error:', error);
    return { success: false, error: error.message || 'Erro de conexão' };
  }
}

// Create Boleto payment
async function createBoletoPayment(
  supabase: any,
  apiKey: string,
  customerId: string,
  orderId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Due date = 3 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const response = await fetchWithTimeout(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: 'BOLETO',
        value: amount,
        dueDate: dueDateStr,
        description: description,
        externalReference: orderId,
      }),
    }, 30000);

    const data = await response.json();
    console.log('[Asaas] Boleto payment response:', JSON.stringify(data));

    if (data.errors) {
      return { success: false, error: data.errors[0]?.description || 'Erro ao criar boleto' };
    }

    if (!data.id) {
      return { success: false, error: 'Resposta inválida do gateway' };
    }

    // Get boleto identificationField (linha digitável)
    const identResponse = await fetchWithTimeout(`${ASAAS_API_URL}/payments/${data.id}/identificationField`, {
      method: 'GET',
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      },
    }, 15000);

    const identData = await identResponse.json();

    return {
      success: true,
      data: {
        paymentId: data.id,
        boletoCode: identData.identificationField || data.nossoNumero,
        boletoUrl: data.bankSlipUrl,
        dueDate: data.dueDate,
        value: data.value,
        status: data.status,
        externalReference: data.externalReference,
      },
    };
  } catch (error: any) {
    console.error('[Asaas] Boleto creation error:', error);
    return { success: false, error: error.message || 'Erro de conexão' };
  }
}

// Check payment status
async function checkPaymentStatus(apiKey: string, paymentId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetchWithTimeout(`${ASAAS_API_URL}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      },
    }, 15000);

    const data = await response.json();

    if (data.errors) {
      return { success: false, error: data.errors[0]?.description || 'Erro ao consultar pagamento' };
    }

    return {
      success: true,
      data: {
        status: data.status,
        value: data.value,
        paymentDate: data.paymentDate,
        confirmedDate: data.confirmedDate,
        externalReference: data.externalReference,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Test connection
async function testConnection(apiKey: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetchWithTimeout(`${ASAAS_API_URL}/finance/balance`, {
      method: 'GET',
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      },
    }, 15000);

    const data = await response.json();

    if (data.errors) {
      return { success: false, error: data.errors[0]?.description || 'Erro de autenticação' };
    }

    return {
      success: true,
      data: {
        balance: data.balance,
        connected: true,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
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

    const body = await req.json();
    const { action, ...params } = body;
    
    console.log(`[Asaas] Action: ${action}`);

    const apiKey = await getAsaasApiKey(supabaseAdmin);

    // Public actions (no auth required)
    if (action === 'get_public_settings') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: { 
            asaas_enabled: !!apiKey,
            credit_card_enabled: !!apiKey 
          } 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userId, isAuthenticated } = await getUserFromRequest(req, supabaseAuth);

    // Admin-only actions
    const adminOnlyActions = ['test_connection', 'get_balance', 'save_settings'];
    const authRequiredActions = ['create_pix', 'create_credit_card', 'check_status'];

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

    // save_settings doesn't require apiKey to be set (it's about enabling/disabling)
    if (action === 'save_settings') {
      // Asaas API key is stored in secrets, not in DB
      // This action just acknowledges the setting was saved
      console.log('[Asaas] save_settings called - API key is stored in secrets');
      return new Response(
        JSON.stringify({ success: true, message: 'Configurações do Asaas são gerenciadas via secrets' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Asaas não configurado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    switch (action) {
      case 'test_connection': {
        const result = await testConnection(apiKey);
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_balance': {
        const result = await testConnection(apiKey);
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create_pix': {
        const { order_id, amount, description } = params;

        if (!order_id || !amount) {
          return new Response(
            JSON.stringify({ error: 'order_id e amount são obrigatórios' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
            JSON.stringify({ error: 'Pedido não encontrado' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (order.user_id !== userId) {
          return new Response(
            JSON.stringify({ error: 'Pedido não pertence ao usuário' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate amount
        if (Math.abs(Number(order.amount) - amount) > 0.01) {
          return new Response(
            JSON.stringify({ error: 'Valor não confere com o pedido' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get or create customer
        const customerResult = await getOrCreateCustomer(supabaseAdmin, userId!, apiKey);
        if (!customerResult.success) {
          return new Response(
            JSON.stringify({ success: false, error: customerResult.error }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Create PIX payment
        const pixResult = await createPixPayment(
          supabaseAdmin,
          apiKey,
          customerResult.customerId!,
          order_id,
          amount,
          description || order.product_name
        );

        if (!pixResult.success) {
          return new Response(
            JSON.stringify({ success: false, error: pixResult.error }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update payment record
        await supabaseAdmin.from('payments').update({
          pix_code: pixResult.data.pixCode,
          qr_code_base64: pixResult.data.qrCodeBase64,
          payment_method: 'asaas_pix',
          evopay_transaction_id: pixResult.data.paymentId, // Reusing this field for Asaas ID
        }).eq('order_id', order_id);

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              pixCode: pixResult.data.pixCode,
              qrCodeBase64: pixResult.data.qrCodeBase64,
              transactionId: pixResult.data.paymentId,
              amount: pixResult.data.value,
              status: pixResult.data.status,
            },
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create_credit_card': {
        const { order_id, amount, description, card_data, holder_info, installments } = params;

        if (!order_id || !amount || !card_data || !holder_info) {
          return new Response(
            JSON.stringify({ error: 'Dados incompletos para pagamento com cartão' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate order ownership
        const { data: order, error: orderError } = await supabaseAdmin
          .from('orders')
          .select('id, user_id, amount, product_name, status')
          .eq('id', order_id)
          .single();

        if (orderError || !order) {
          return new Response(
            JSON.stringify({ error: 'Pedido não encontrado' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (order.user_id !== userId) {
          return new Response(
            JSON.stringify({ error: 'Pedido não pertence ao usuário' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (order.status !== 'pending') {
          return new Response(
            JSON.stringify({ error: 'Pedido não está pendente' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate amount
        if (Math.abs(Number(order.amount) - amount) > 0.01) {
          return new Response(
            JSON.stringify({ error: 'Valor não confere com o pedido' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get or create customer
        const customerResult = await getOrCreateCustomer(supabaseAdmin, userId!, apiKey);
        if (!customerResult.success) {
          return new Response(
            JSON.stringify({ success: false, error: customerResult.error }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get client IP
        const remoteIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                         req.headers.get('x-real-ip') || 
                         '127.0.0.1';

        // Create credit card payment
        const cardResult = await createCreditCardPayment(
          supabaseAdmin,
          apiKey,
          customerResult.customerId!,
          order_id,
          amount,
          description || order.product_name,
          card_data,
          holder_info,
          installments || 1,
          remoteIp
        );

        if (!cardResult.success) {
          return new Response(
            JSON.stringify({ success: false, error: cardResult.error }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update payment record
        await supabaseAdmin.from('payments').update({
          payment_method: 'asaas_credit_card',
          evopay_transaction_id: cardResult.data.paymentId,
        }).eq('order_id', order_id);

        // If payment was confirmed immediately, complete the order
        const confirmedStatuses = ['CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH'];
        if (confirmedStatuses.includes(cardResult.data.status)) {
          console.log('[Asaas] Credit card payment confirmed, completing order...');
          
          await supabaseAdmin.from('payments').update({
            status: 'paid',
            paid_at: new Date().toISOString(),
          }).eq('order_id', order_id);

          // Get full order details for completion
          const { data: fullOrder } = await supabaseAdmin
            .from('orders')
            .select('product_type, quantity')
            .eq('id', order_id)
            .single();

          if (fullOrder) {
            // Complete order atomically
            const { data: completeResult, error: completeError } = await supabaseAdmin.rpc('complete_order_atomic', {
              _order_id: order_id,
              _user_id: userId,
              _product_type: fullOrder.product_type,
              _quantity: fullOrder.quantity,
            });

            if (completeError) {
              console.error('[Asaas] Error completing order:', completeError);
            } else {
              console.log('[Asaas] Order completed:', JSON.stringify(completeResult));
            }
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              transactionId: cardResult.data.paymentId,
              status: cardResult.data.status,
              confirmed: confirmedStatuses.includes(cardResult.data.status),
              value: cardResult.data.value,
            },
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'check_status': {
        const { payment_id, order_id } = params;

        let paymentIdToCheck = payment_id;

        // If no payment_id, get it from order
        if (!paymentIdToCheck && order_id) {
          const { data: payment } = await supabaseAdmin
            .from('payments')
            .select('evopay_transaction_id')
            .eq('order_id', order_id)
            .maybeSingle();

          paymentIdToCheck = payment?.evopay_transaction_id;
        }

        if (!paymentIdToCheck) {
          return new Response(
            JSON.stringify({ error: 'payment_id ou order_id é obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const statusResult = await checkPaymentStatus(apiKey, paymentIdToCheck);

        return new Response(
          JSON.stringify(statusResult),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create_boleto': {
        const { order_id, amount, description, cpf_cnpj } = params;

        if (!order_id || !amount) {
          return new Response(
            JSON.stringify({ error: 'order_id e amount são obrigatórios' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!cpf_cnpj) {
          return new Response(
            JSON.stringify({ success: false, error: 'CPF/CNPJ é obrigatório para boleto' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: order, error: orderError } = await supabaseAdmin
          .from('orders')
          .select('id, user_id, amount, product_name')
          .eq('id', order_id)
          .single();

        if (orderError || !order) {
          return new Response(
            JSON.stringify({ error: 'Pedido não encontrado' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (order.user_id !== userId) {
          return new Response(
            JSON.stringify({ error: 'Pedido não pertence ao usuário' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Pass CPF to customer creation/update
        const customerResult = await getOrCreateCustomer(supabaseAdmin, userId!, apiKey, cpf_cnpj);
        if (!customerResult.success) {
          return new Response(
            JSON.stringify({ success: false, error: customerResult.error }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const boletoResult = await createBoletoPayment(
          supabaseAdmin,
          apiKey,
          customerResult.customerId!,
          order_id,
          amount,
          description || order.product_name
        );

        if (!boletoResult.success) {
          return new Response(
            JSON.stringify({ success: false, error: boletoResult.error }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        await supabaseAdmin.from('payments').update({
          payment_method: 'asaas_boleto',
          evopay_transaction_id: boletoResult.data.paymentId,
        }).eq('order_id', order_id);

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              boletoCode: boletoResult.data.boletoCode,
              boletoUrl: boletoResult.data.boletoUrl,
              transactionId: boletoResult.data.paymentId,
              dueDate: boletoResult.data.dueDate,
              amount: boletoResult.data.value,
              status: boletoResult.data.status,
            },
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Ação inválida' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: any) {
    console.error('[Asaas] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
