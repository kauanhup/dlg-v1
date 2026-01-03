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
  
  return Deno.env.get('ASAAS_API_KEY') || null;
}

// Get or create Asaas customer for a user
async function getOrCreateCustomer(supabase: any, userId: string, apiKey: string, cpfCnpj?: string): Promise<{ success: boolean; customerId?: string; error?: string }> {
  // First check if we have a cached customer ID in profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, name, whatsapp, asaas_customer_id')
    .eq('user_id', userId)
    .single();

  if (!profile?.email) {
    return { success: false, error: 'Perfil não encontrado' };
  }

  // If we have a cached customer ID, verify it still exists
  if (profile.asaas_customer_id) {
    try {
      const verifyResponse = await fetchWithTimeout(`${ASAAS_API_URL}/customers/${profile.asaas_customer_id}`, {
        method: 'GET',
        headers: {
          'access_token': apiKey,
          'Content-Type': 'application/json',
        },
      }, 15000);
      
      const verifyData = await verifyResponse.json();
      if (verifyData.id) {
        // Customer exists, update CPF if needed
        if (cpfCnpj && !verifyData.cpfCnpj) {
          try {
            await fetchWithTimeout(`${ASAAS_API_URL}/customers/${profile.asaas_customer_id}`, {
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
        return { success: true, customerId: profile.asaas_customer_id };
      }
    } catch (error) {
      console.log('[Asaas] Cached customer not found, will search/create');
    }
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
      
      // Cache the customer ID in profile
      await supabase.from('profiles').update({ asaas_customer_id: existingCustomer.id }).eq('user_id', userId);
      
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
      // Cache the new customer ID
      await supabase.from('profiles').update({ asaas_customer_id: createData.id }).eq('user_id', userId);
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

// Create Recurring Subscription (Credit Card)
async function createSubscription(
  supabase: any,
  apiKey: string,
  customerId: string,
  orderId: string,
  planName: string,
  amount: number,
  periodDays: number,
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
  remoteIp: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Determine billing cycle based on period days
    let cycle: string;
    if (periodDays <= 7) {
      cycle = 'WEEKLY';
    } else if (periodDays <= 15) {
      cycle = 'BIWEEKLY';
    } else if (periodDays <= 31) {
      cycle = 'MONTHLY';
    } else if (periodDays <= 60) {
      cycle = 'BIMONTHLY';
    } else if (periodDays <= 93) {
      cycle = 'QUARTERLY';
    } else if (periodDays <= 186) {
      cycle = 'SEMIANNUALLY';
    } else {
      cycle = 'YEARLY';
    }

    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 1); // First charge tomorrow to give time for card processing

    const payload = {
      customer: customerId,
      billingType: 'CREDIT_CARD',
      value: amount,
      nextDueDate: nextDueDate.toISOString().split('T')[0],
      cycle: cycle,
      description: `Assinatura: ${planName}`,
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

    console.log('[Asaas] Creating subscription with cycle:', cycle, 'for order:', orderId);

    const response = await fetchWithTimeout(`${ASAAS_API_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }, 30000);

    const data = await response.json();
    console.log('[Asaas] Subscription response:', JSON.stringify(data));

    if (data.errors) {
      const errorMsg = data.errors[0]?.description || 'Erro ao criar assinatura';
      return { success: false, error: errorMsg };
    }

    if (!data.id) {
      return { success: false, error: 'Resposta inválida do gateway' };
    }

    return {
      success: true,
      data: {
        subscriptionId: data.id,
        customerId: customerId,
        status: data.status,
        cycle: data.cycle,
        value: data.value,
        nextDueDate: data.nextDueDate,
        externalReference: data.externalReference,
      },
    };
  } catch (error: any) {
    console.error('[Asaas] Subscription creation error:', error);
    return { success: false, error: error.message || 'Erro de conexão' };
  }
}

// Cancel subscription
async function cancelSubscription(apiKey: string, subscriptionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetchWithTimeout(`${ASAAS_API_URL}/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      },
    }, 15000);

    const data = await response.json();

    if (data.deleted || data.id) {
      return { success: true };
    }

    return { success: false, error: data.errors?.[0]?.description || 'Erro ao cancelar assinatura' };
  } catch (error: any) {
    console.error('[Asaas] Cancel subscription error:', error);
    return { success: false, error: error.message };
  }
}

// Create Credit Card payment (one-time)
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
    const authRequiredActions = ['create_pix', 'create_credit_card', 'create_subscription', 'cancel_subscription', 'check_status'];

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

    if (action === 'save_settings') {
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

        if (Math.abs(Number(order.amount) - amount) > 0.01) {
          return new Response(
            JSON.stringify({ error: 'Valor não confere com o pedido' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const customerResult = await getOrCreateCustomer(supabaseAdmin, userId!, apiKey);
        if (!customerResult.success) {
          return new Response(
            JSON.stringify({ success: false, error: customerResult.error }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

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

        await supabaseAdmin.from('payments').update({
          pix_code: pixResult.data.pixCode,
          qr_code_base64: pixResult.data.qrCodeBase64,
          payment_method: 'asaas_pix',
          evopay_transaction_id: pixResult.data.paymentId,
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

      case 'create_subscription': {
        const { order_id, amount, plan_name, period_days, card_data, holder_info } = params;

        if (!order_id || !amount || !card_data || !holder_info || !plan_name || !period_days) {
          return new Response(
            JSON.stringify({ error: 'Dados incompletos para criar assinatura' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: order, error: orderError } = await supabaseAdmin
          .from('orders')
          .select('id, user_id, amount, product_name, status, product_type')
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

        if (order.product_type !== 'subscription') {
          return new Response(
            JSON.stringify({ error: 'Pedido não é de assinatura' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (Math.abs(Number(order.amount) - amount) > 0.01) {
          return new Response(
            JSON.stringify({ error: 'Valor não confere com o pedido' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const customerResult = await getOrCreateCustomer(supabaseAdmin, userId!, apiKey, holder_info.cpfCnpj);
        if (!customerResult.success) {
          return new Response(
            JSON.stringify({ success: false, error: customerResult.error }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const remoteIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                         req.headers.get('x-real-ip') || 
                         '127.0.0.1';

        const subscriptionResult = await createSubscription(
          supabaseAdmin,
          apiKey,
          customerResult.customerId!,
          order_id,
          plan_name,
          amount,
          period_days,
          card_data,
          holder_info,
          remoteIp
        );

        if (!subscriptionResult.success) {
          return new Response(
            JSON.stringify({ success: false, error: subscriptionResult.error }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update payment record
        await supabaseAdmin.from('payments').update({
          payment_method: 'asaas_subscription',
          evopay_transaction_id: subscriptionResult.data.subscriptionId,
          status: 'paid',
          paid_at: new Date().toISOString(),
        }).eq('order_id', order_id);

        // Complete order - create subscription and license
        const { data: fullOrder } = await supabaseAdmin
          .from('orders')
          .select('product_type, quantity, plan_id_snapshot, plan_period_days, product_name')
          .eq('id', order_id)
          .single();

        if (fullOrder) {
          const { data: completeResult, error: completeError } = await supabaseAdmin.rpc('complete_order_atomic', {
            _order_id: order_id,
            _user_id: userId,
            _product_type: fullOrder.product_type,
            _quantity: fullOrder.quantity,
          });

          if (completeError) {
            console.error('[Asaas] Error completing subscription order:', completeError);
          } else {
            console.log('[Asaas] Subscription order completed:', JSON.stringify(completeResult));

            // Update the user_subscription with Asaas subscription ID
            await supabaseAdmin.from('user_subscriptions')
              .update({ 
                asaas_subscription_id: subscriptionResult.data.subscriptionId,
                asaas_customer_id: customerResult.customerId,
                auto_renew: true
              })
              .eq('user_id', userId)
              .eq('status', 'active');
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              subscriptionId: subscriptionResult.data.subscriptionId,
              status: subscriptionResult.data.status,
              nextDueDate: subscriptionResult.data.nextDueDate,
              confirmed: true,
            },
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'cancel_subscription': {
        const { subscription_id } = params;

        if (!subscription_id) {
          return new Response(
            JSON.stringify({ error: 'subscription_id é obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verify ownership
        const { data: subscription } = await supabaseAdmin
          .from('user_subscriptions')
          .select('id, user_id, asaas_subscription_id')
          .eq('asaas_subscription_id', subscription_id)
          .single();

        if (!subscription || subscription.user_id !== userId) {
          const adminCheck = await isAdmin(supabaseAdmin, userId!);
          if (!adminCheck) {
            return new Response(
              JSON.stringify({ error: 'Assinatura não encontrada ou não pertence ao usuário' }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        const cancelResult = await cancelSubscription(apiKey, subscription_id);

        if (!cancelResult.success) {
          return new Response(
            JSON.stringify({ success: false, error: cancelResult.error }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update local subscription
        await supabaseAdmin.from('user_subscriptions')
          .update({ auto_renew: false })
          .eq('asaas_subscription_id', subscription_id);

        return new Response(
          JSON.stringify({ success: true, message: 'Assinatura cancelada com sucesso' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create_credit_card': {
        const { order_id, amount, description, card_data, holder_info } = params;

        if (!order_id || !amount || !card_data || !holder_info) {
          return new Response(
            JSON.stringify({ error: 'Dados incompletos para pagamento com cartão' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: order, error: orderError } = await supabaseAdmin
          .from('orders')
          .select('id, user_id, amount, product_name, status, product_type')
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

        if (Math.abs(Number(order.amount) - amount) > 0.01) {
          return new Response(
            JSON.stringify({ error: 'Valor não confere com o pedido' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const customerResult = await getOrCreateCustomer(supabaseAdmin, userId!, apiKey, holder_info.cpfCnpj);
        if (!customerResult.success) {
          return new Response(
            JSON.stringify({ success: false, error: customerResult.error }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const remoteIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                         req.headers.get('x-real-ip') || 
                         '127.0.0.1';

        const cardResult = await createCreditCardPayment(
          supabaseAdmin,
          apiKey,
          customerResult.customerId!,
          order_id,
          amount,
          description || order.product_name,
          card_data,
          holder_info,
          remoteIp
        );

        if (!cardResult.success) {
          return new Response(
            JSON.stringify({ success: false, error: cardResult.error }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        await supabaseAdmin.from('payments').update({
          payment_method: 'asaas_credit_card',
          evopay_transaction_id: cardResult.data.paymentId,
        }).eq('order_id', order_id);

        const confirmedStatuses = ['CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH'];
        if (confirmedStatuses.includes(cardResult.data.status)) {
          console.log('[Asaas] Credit card payment confirmed, completing order...');
          
          await supabaseAdmin.from('payments').update({
            status: 'paid',
            paid_at: new Date().toISOString(),
          }).eq('order_id', order_id);

          const { data: fullOrder } = await supabaseAdmin
            .from('orders')
            .select('product_type, quantity')
            .eq('id', order_id)
            .single();

          if (fullOrder) {
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

      case 'tokenize_card': {
        // Tokenize card for future recurring payments
        // This creates a subscription with the card for auto-renewal
        const { card_data, holder_info, plan_name, period_days, current_price } = params;

        if (!card_data || !holder_info) {
          return new Response(
            JSON.stringify({ error: 'Dados do cartão e titular são obrigatórios' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get or create customer
        const customerResult = await getOrCreateCustomer(supabaseAdmin, userId!, apiKey, holder_info.cpfCnpj);
        if (!customerResult.success) {
          return new Response(
            JSON.stringify({ success: false, error: customerResult.error }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get current active subscription
        const { data: existingSubscription } = await supabaseAdmin
          .from('user_subscriptions')
          .select('id, plan_id, status, next_billing_date')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle();

        if (!existingSubscription) {
          return new Response(
            JSON.stringify({ success: false, error: 'Você precisa ter uma assinatura ativa para cadastrar um cartão' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get plan details
        const { data: plan } = await supabaseAdmin
          .from('subscription_plans')
          .select('name, price, period, promotional_price')
          .eq('id', existingSubscription.plan_id)
          .single();

        if (!plan) {
          return new Response(
            JSON.stringify({ success: false, error: 'Plano não encontrado' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Determine billing cycle
        let cycle: string;
        const periodDaysValue = plan.period || period_days || 30;
        if (periodDaysValue <= 7) {
          cycle = 'WEEKLY';
        } else if (periodDaysValue <= 15) {
          cycle = 'BIWEEKLY';
        } else if (periodDaysValue <= 31) {
          cycle = 'MONTHLY';
        } else if (periodDaysValue <= 60) {
          cycle = 'BIMONTHLY';
        } else if (periodDaysValue <= 93) {
          cycle = 'QUARTERLY';
        } else if (periodDaysValue <= 186) {
          cycle = 'SEMIANNUALLY';
        } else {
          cycle = 'YEARLY';
        }

        // Calculate next due date (use existing next_billing_date if available)
        let nextDueDate: Date;
        if (existingSubscription.next_billing_date) {
          nextDueDate = new Date(existingSubscription.next_billing_date);
        } else {
          // Use license end date
          const { data: license } = await supabaseAdmin
            .from('licenses')
            .select('end_date')
            .eq('user_id', userId)
            .eq('status', 'active')
            .maybeSingle();
          
          if (license?.end_date) {
            nextDueDate = new Date(license.end_date);
          } else {
            nextDueDate = new Date();
            nextDueDate.setDate(nextDueDate.getDate() + periodDaysValue);
          }
        }

        const remoteIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                         req.headers.get('x-real-ip') || 
                         '127.0.0.1';

        const price = plan.promotional_price || plan.price || current_price;

        const payload = {
          customer: customerResult.customerId,
          billingType: 'CREDIT_CARD',
          value: price,
          nextDueDate: nextDueDate.toISOString().split('T')[0],
          cycle: cycle,
          description: `Renovação automática: ${plan.name || plan_name}`,
          creditCard: {
            holderName: card_data.holderName,
            number: card_data.number.replace(/\s/g, ''),
            expiryMonth: card_data.expiryMonth,
            expiryYear: card_data.expiryYear,
            ccv: card_data.ccv,
          },
          creditCardHolderInfo: {
            name: holder_info.name,
            email: holder_info.email,
            cpfCnpj: holder_info.cpfCnpj.replace(/\D/g, ''),
            phone: holder_info.phone?.replace(/\D/g, '') || undefined,
            postalCode: holder_info.postalCode.replace(/\D/g, ''),
            addressNumber: holder_info.addressNumber,
          },
          remoteIp: remoteIp,
        };

        console.log('[Asaas] Creating subscription for card tokenization, cycle:', cycle, 'nextDueDate:', nextDueDate.toISOString().split('T')[0]);

        const response = await fetchWithTimeout(`${ASAAS_API_URL}/subscriptions`, {
          method: 'POST',
          headers: {
            'access_token': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }, 30000);

        const data = await response.json();
        console.log('[Asaas] Subscription response:', JSON.stringify(data));

        if (data.errors) {
          const errorMsg = data.errors[0]?.description || 'Erro ao cadastrar cartão';
          return new Response(
            JSON.stringify({ success: false, error: errorMsg }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!data.id) {
          return new Response(
            JSON.stringify({ success: false, error: 'Resposta inválida do gateway' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update user_subscription with Asaas subscription ID
        await supabaseAdmin.from('user_subscriptions')
          .update({ 
            asaas_subscription_id: data.id,
            asaas_customer_id: customerResult.customerId,
            auto_renew: true,
            next_billing_date: nextDueDate.toISOString(),
          })
          .eq('id', existingSubscription.id);

        // Also update license auto_renew
        await supabaseAdmin.from('licenses')
          .update({ auto_renew: true })
          .eq('user_id', userId)
          .eq('status', 'active');

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              subscriptionId: data.id,
              customerId: customerResult.customerId,
              nextDueDate: data.nextDueDate,
              cardRegistered: true,
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
