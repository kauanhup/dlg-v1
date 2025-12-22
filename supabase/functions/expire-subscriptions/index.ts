import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Expire subscriptions: Starting...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date().toISOString();
    console.log(`Checking for expired subscriptions at: ${now}`);

    // Find active subscriptions where next_billing_date has passed
    const { data: expiredSubscriptions, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('id, user_id, plan_id, next_billing_date')
      .eq('status', 'active')
      .not('next_billing_date', 'is', null)
      .lt('next_billing_date', now);

    if (fetchError) {
      console.error('Error fetching expired subscriptions:', fetchError);
      throw fetchError;
    }

    if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
      console.log('No expired subscriptions found');
      return new Response(
        JSON.stringify({ success: true, expired: 0, message: 'No expired subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${expiredSubscriptions.length} expired subscriptions`);

    // Get plan names for all expired subscriptions
    const planIds = [...new Set(expiredSubscriptions.map(s => s.plan_id))];
    const { data: plansData } = await supabase
      .from('subscription_plans')
      .select('id, name')
      .in('id', planIds);

    const planNameMap: Record<string, string> = {};
    (plansData || []).forEach(p => {
      planNameMap[p.id] = p.name;
    });

    let expiredCount = 0;
    const errors: string[] = [];

    for (const sub of expiredSubscriptions) {
      try {
        console.log(`Expiring subscription ${sub.id} (expired: ${sub.next_billing_date})`);

        // Update subscription status to expired
        const { error: subError } = await supabase
          .from('user_subscriptions')
          .update({ 
            status: 'expired', 
            updated_at: now 
          })
          .eq('id', sub.id)
          .eq('status', 'active'); // Extra safety

        if (subError) {
          console.error(`Error expiring subscription ${sub.id}:`, subError);
          errors.push(`Subscription ${sub.id}: ${subError.message}`);
          continue;
        }

        // Also update the corresponding license
        const planName = planNameMap[sub.plan_id];
        if (planName) {
          const { error: licenseError } = await supabase
            .from('licenses')
            .update({ 
              status: 'expired',
              updated_at: now
            })
            .eq('user_id', sub.user_id)
            .eq('plan_name', planName)
            .eq('status', 'active');

          if (licenseError) {
            console.error(`Error expiring license for subscription ${sub.id}:`, licenseError);
            // Non-blocking, subscription was already updated
          }
        }

        expiredCount++;
        console.log(`Successfully expired subscription ${sub.id}`);
      } catch (err) {
        console.error(`Unexpected error expiring subscription ${sub.id}:`, err);
        errors.push(`Subscription ${sub.id}: Unexpected error`);
      }
    }

    console.log(`Expire complete: expired ${expiredCount}/${expiredSubscriptions.length} subscriptions`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        expired: expiredCount,
        total: expiredSubscriptions.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Expire subscriptions failed:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
