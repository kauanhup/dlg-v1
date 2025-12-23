import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReconciliationResult {
  category: string;
  detected: number;
  corrected: number;
  details: Array<{
    id: string;
    issue: string;
    action: string;
    success: boolean;
    error?: string;
  }>;
  uncorrectable: Array<{
    id: string;
    reason: string;
  }>;
}

interface AuditLogEntry {
  user_id: string;
  action: string;
  resource: string;
  details: Record<string, unknown>;
}

// deno-lint-ignore no-explicit-any
type SupabaseClientAny = any;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase: SupabaseClientAny = createClient(supabaseUrl, supabaseServiceKey);

  const SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000000";
  const startTime = Date.now();
  const auditLogs: AuditLogEntry[] = [];
  const results: ReconciliationResult[] = [];

  console.log("[reconciliation-global] ========== STARTING GLOBAL RECONCILIATION ==========");

  try {
    // ============================================================
    // 1. PAYMENTS PAID BUT ORDER NOT COMPLETED
    // ============================================================
    const paidPaymentsWithIncompleteOrders = await reconcilePaymentsPaidOrdersIncomplete(supabase, SYSTEM_USER_ID, auditLogs);
    results.push(paidPaymentsWithIncompleteOrders);

    // ============================================================
    // 2. ORDERS COMPLETED BUT LICENSE MISSING
    // ============================================================
    const ordersCompletedNoLicense = await reconcileOrdersCompletedNoLicense(supabase, SYSTEM_USER_ID, auditLogs);
    results.push(ordersCompletedNoLicense);

    // ============================================================
    // 3. LICENSE ACTIVE BUT SUBSCRIPTION MISSING
    // ============================================================
    const licensesWithoutSubscription = await reconcileLicensesWithoutSubscription(supabase, SYSTEM_USER_ID, auditLogs);
    results.push(licensesWithoutSubscription);

    // ============================================================
    // 4. SUBSCRIPTION ACTIVE BUT LICENSE MISSING
    // ============================================================
    const subscriptionsWithoutLicense = await reconcileSubscriptionsWithoutLicense(supabase, SYSTEM_USER_ID, auditLogs);
    results.push(subscriptionsWithoutLicense);

    // ============================================================
    // 5. ORDERS PENDING/EXPIRED WITH SIDE EFFECTS
    // ============================================================
    const expiredOrdersWithReservations = await reconcileExpiredOrdersWithReservations(supabase, SYSTEM_USER_ID, auditLogs);
    results.push(expiredOrdersWithReservations);

    // ============================================================
    // 6. SESSION ORPHANS
    // ============================================================
    const orphanedSessions = await reconcileOrphanedSessions(supabase, SYSTEM_USER_ID, auditLogs);
    results.push(orphanedSessions);

    // ============================================================
    // 7. LICENSES EXPIRED BUT STATUS STILL ACTIVE
    // ============================================================
    const expiredLicensesStillActive = await reconcileExpiredLicenses(supabase, SYSTEM_USER_ID, auditLogs);
    results.push(expiredLicensesStillActive);

    // ============================================================
    // 8. SUBSCRIPTIONS EXPIRED BUT STATUS STILL ACTIVE
    // ============================================================
    const expiredSubscriptionsStillActive = await reconcileExpiredSubscriptions(supabase, SYSTEM_USER_ID, auditLogs);
    results.push(expiredSubscriptionsStillActive);

    // ============================================================
    // INSERT ALL AUDIT LOGS
    // ============================================================
    if (auditLogs.length > 0) {
      const { error: auditError } = await supabase
        .from("audit_logs")
        .insert(auditLogs);

      if (auditError) {
        console.error("[reconciliation-global] Error inserting audit logs:", auditError);
      } else {
        console.log(`[reconciliation-global] Inserted ${auditLogs.length} audit logs`);
      }
    }

    // ============================================================
    // STORE RUN HISTORY
    // ============================================================
    const totalDetected = results.reduce((sum, r) => sum + r.detected, 0);
    const totalCorrected = results.reduce((sum, r) => sum + r.corrected, 0);
    const totalUncorrectable = results.reduce((sum, r) => sum + r.uncorrectable.length, 0);
    const elapsedMs = Date.now() - startTime;

    await supabase.from("reconciliation_runs").insert({
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
      duration_ms: elapsedMs,
      total_detected: totalDetected,
      total_corrected: totalCorrected,
      total_uncorrectable: totalUncorrectable,
      categories: results.map(r => ({
        category: r.category,
        detected: r.detected,
        corrected: r.corrected,
        uncorrectable: r.uncorrectable.length
      })),
      status: "completed"
    });

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      duration_ms: elapsedMs,
      total_detected: totalDetected,
      total_corrected: totalCorrected,
      total_uncorrectable: totalUncorrectable,
      audit_logs_created: auditLogs.length,
      categories: results.map(r => ({
        category: r.category,
        detected: r.detected,
        corrected: r.corrected,
        uncorrectable: r.uncorrectable.length
      })),
      details: results,
    };

    console.log(`[reconciliation-global] ========== COMPLETED ==========`);
    console.log(`[reconciliation-global] Detected: ${totalDetected}, Corrected: ${totalCorrected}, Uncorrectable: ${totalUncorrectable}`);
    console.log(`[reconciliation-global] Duration: ${elapsedMs}ms`);

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[reconciliation-global] FATAL ERROR:", error);

    await supabase.from("reconciliation_runs").insert({
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
      status: "failed",
      error: errorMessage,
      categories: results.map(r => ({
        category: r.category,
        detected: r.detected,
        corrected: r.corrected,
        uncorrectable: r.uncorrectable.length
      }))
    });

    await supabase.from("audit_logs").insert({
      user_id: SYSTEM_USER_ID,
      action: "reconciliation_fatal_error",
      resource: "system",
      details: {
        error: errorMessage,
        timestamp: new Date().toISOString(),
        partial_results: results
      }
    });

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        partial_results: results 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ============================================================
// RECONCILIATION FUNCTIONS
// ============================================================

async function reconcilePaymentsPaidOrdersIncomplete(
  supabase: SupabaseClientAny,
  systemUserId: string,
  auditLogs: AuditLogEntry[]
): Promise<ReconciliationResult> {
  const result: ReconciliationResult = {
    category: "payments_paid_orders_incomplete",
    detected: 0,
    corrected: 0,
    details: [],
    uncorrectable: []
  };

  console.log("[reconciliation-global] Checking payments paid but orders not completed...");

  const { data: paidPayments, error } = await supabase
    .from("payments")
    .select(`
      id,
      order_id,
      user_id,
      amount,
      paid_at,
      orders!inner (
        id,
        status,
        product_type,
        product_name,
        quantity,
        plan_period_days,
        plan_id_snapshot
      )
    `)
    .eq("status", "paid")
    .neq("orders.status", "completed");

  if (error) {
    console.error("[reconciliation-global] Error fetching paid payments:", error);
    return result;
  }

  if (!paidPayments || paidPayments.length === 0) {
    console.log("[reconciliation-global] No payments paid with incomplete orders found");
    return result;
  }

  result.detected = paidPayments.length;
  console.log(`[reconciliation-global] Found ${paidPayments.length} payments paid with incomplete orders`);

  for (const payment of paidPayments) {
    const order = payment.orders;

    try {
      const { data: rpcResult, error: rpcError } = await supabase.rpc("complete_order_atomic", {
        _order_id: order.id,
        _user_id: payment.user_id,
        _product_type: order.product_type,
        _quantity: order.quantity
      });

      if (rpcError) {
        result.details.push({
          id: payment.id,
          issue: `Payment paid but order ${order.id} status is ${order.status}`,
          action: "complete_order_atomic",
          success: false,
          error: rpcError.message
        });
        result.uncorrectable.push({
          id: payment.id,
          reason: `RPC failed: ${rpcError.message}`
        });
      } else if (rpcResult && !rpcResult.success) {
        result.details.push({
          id: payment.id,
          issue: `Payment paid but order ${order.id} status is ${order.status}`,
          action: "complete_order_atomic",
          success: false,
          error: rpcResult.error
        });
        result.uncorrectable.push({
          id: payment.id,
          reason: `RPC returned error: ${rpcResult.error}`
        });
      } else {
        result.corrected++;
        result.details.push({
          id: payment.id,
          issue: `Payment paid but order ${order.id} status is ${order.status}`,
          action: "complete_order_atomic",
          success: true
        });
        
        auditLogs.push({
          user_id: systemUserId,
          action: "reconciliation_order_completed",
          resource: `order:${order.id}`,
          details: {
            payment_id: payment.id,
            order_id: order.id,
            user_id: payment.user_id,
            product_type: order.product_type,
            previous_status: order.status,
            corrected_at: new Date().toISOString()
          }
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      result.details.push({
        id: payment.id,
        issue: `Payment paid but order ${order.id} status is ${order.status}`,
        action: "complete_order_atomic",
        success: false,
        error: errorMsg
      });
      result.uncorrectable.push({
        id: payment.id,
        reason: `Exception: ${errorMsg}`
      });
    }
  }

  return result;
}

async function reconcileOrdersCompletedNoLicense(
  supabase: SupabaseClientAny,
  systemUserId: string,
  auditLogs: AuditLogEntry[]
): Promise<ReconciliationResult> {
  const result: ReconciliationResult = {
    category: "orders_completed_no_license",
    detected: 0,
    corrected: 0,
    details: [],
    uncorrectable: []
  };

  console.log("[reconciliation-global] Checking completed subscription orders without licenses...");

  const { data: completedOrders, error } = await supabase
    .from("orders")
    .select("id, user_id, product_name, product_type, plan_period_days, plan_id_snapshot, updated_at")
    .eq("status", "completed")
    .eq("product_type", "subscription");

  if (error) {
    console.error("[reconciliation-global] Error fetching completed orders:", error);
    return result;
  }

  if (!completedOrders || completedOrders.length === 0) {
    return result;
  }

  const { data: activeLicenses, error: licError } = await supabase
    .from("licenses")
    .select("user_id, plan_name, status")
    .eq("status", "active");

  if (licError) {
    console.error("[reconciliation-global] Error fetching licenses:", licError);
    return result;
  }

  // deno-lint-ignore no-explicit-any
  const usersWithLicenses = new Set((activeLicenses || []).map((l: any) => l.user_id));

  // deno-lint-ignore no-explicit-any
  const ordersWithoutLicense = completedOrders.filter((o: any) => !usersWithLicenses.has(o.user_id));

  if (ordersWithoutLicense.length === 0) {
    console.log("[reconciliation-global] All completed subscription orders have licenses");
    return result;
  }

  result.detected = ordersWithoutLicense.length;
  console.log(`[reconciliation-global] Found ${ordersWithoutLicense.length} completed orders without licenses`);

  // deno-lint-ignore no-explicit-any
  for (const order of ordersWithoutLicense as any[]) {
    const periodDays = order.plan_period_days || 30;
    const startDate = new Date(order.updated_at);
    const endDate = new Date(startDate.getTime() + periodDays * 24 * 60 * 60 * 1000);

    try {
      const { error: insertError } = await supabase
        .from("licenses")
        .insert({
          user_id: order.user_id,
          plan_name: order.product_name,
          status: "active",
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        });

      if (insertError) {
        result.details.push({
          id: order.id,
          issue: `Order completed but no license exists`,
          action: "create_license",
          success: false,
          error: insertError.message
        });
        result.uncorrectable.push({
          id: order.id,
          reason: `Insert failed: ${insertError.message}`
        });
      } else {
        result.corrected++;
        result.details.push({
          id: order.id,
          issue: `Order completed but no license exists`,
          action: "create_license",
          success: true
        });

        auditLogs.push({
          user_id: systemUserId,
          action: "reconciliation_license_created",
          resource: `order:${order.id}`,
          details: {
            order_id: order.id,
            user_id: order.user_id,
            plan_name: order.product_name,
            period_days: periodDays,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            corrected_at: new Date().toISOString()
          }
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      result.uncorrectable.push({
        id: order.id,
        reason: `Exception: ${errorMsg}`
      });
    }
  }

  return result;
}

async function reconcileLicensesWithoutSubscription(
  supabase: SupabaseClientAny,
  systemUserId: string,
  auditLogs: AuditLogEntry[]
): Promise<ReconciliationResult> {
  const result: ReconciliationResult = {
    category: "licenses_without_subscription",
    detected: 0,
    corrected: 0,
    details: [],
    uncorrectable: []
  };

  console.log("[reconciliation-global] Checking active licenses without subscriptions...");

  const { data: activeLicenses, error: licError } = await supabase
    .from("licenses")
    .select("id, user_id, plan_name, start_date, end_date")
    .eq("status", "active");

  if (licError || !activeLicenses) {
    return result;
  }

  const { data: activeSubscriptions, error: subError } = await supabase
    .from("user_subscriptions")
    .select("user_id, plan_id")
    .eq("status", "active");

  if (subError) {
    return result;
  }

  // deno-lint-ignore no-explicit-any
  const usersWithSubscriptions = new Set((activeSubscriptions || []).map((s: any) => s.user_id));

  // deno-lint-ignore no-explicit-any
  const licensesWithoutSub = activeLicenses.filter((l: any) => !usersWithSubscriptions.has(l.user_id));

  if (licensesWithoutSub.length === 0) {
    return result;
  }

  result.detected = licensesWithoutSub.length;
  console.log(`[reconciliation-global] Found ${licensesWithoutSub.length} active licenses without subscriptions`);

  const { data: plans } = await supabase
    .from("subscription_plans")
    .select("id, name");

  // deno-lint-ignore no-explicit-any
  const planNameToId = new Map((plans || []).map((p: any) => [p.name, p.id]));

  // deno-lint-ignore no-explicit-any
  for (const license of licensesWithoutSub as any[]) {
    const planId = planNameToId.get(license.plan_name);

    if (!planId) {
      result.uncorrectable.push({
        id: license.id,
        reason: `Plan '${license.plan_name}' not found in subscription_plans`
      });
      continue;
    }

    try {
      const { error: insertError } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: license.user_id,
          plan_id: planId,
          status: "active",
          start_date: license.start_date,
          next_billing_date: license.end_date
        });

      if (insertError) {
        result.uncorrectable.push({
          id: license.id,
          reason: `Insert failed: ${insertError.message}`
        });
      } else {
        result.corrected++;
        result.details.push({
          id: license.id,
          issue: `License active but no subscription`,
          action: "create_subscription",
          success: true
        });

        auditLogs.push({
          user_id: systemUserId,
          action: "reconciliation_subscription_created",
          resource: `license:${license.id}`,
          details: {
            license_id: license.id,
            user_id: license.user_id,
            plan_id: planId,
            corrected_at: new Date().toISOString()
          }
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      result.uncorrectable.push({
        id: license.id,
        reason: `Exception: ${errorMsg}`
      });
    }
  }

  return result;
}

async function reconcileSubscriptionsWithoutLicense(
  supabase: SupabaseClientAny,
  systemUserId: string,
  auditLogs: AuditLogEntry[]
): Promise<ReconciliationResult> {
  const result: ReconciliationResult = {
    category: "subscriptions_without_license",
    detected: 0,
    corrected: 0,
    details: [],
    uncorrectable: []
  };

  console.log("[reconciliation-global] Checking active subscriptions without licenses...");

  const { data: activeSubscriptions, error: subError } = await supabase
    .from("user_subscriptions")
    .select(`
      id,
      user_id,
      start_date,
      next_billing_date,
      subscription_plans (
        id,
        name,
        period
      )
    `)
    .eq("status", "active");

  if (subError || !activeSubscriptions) {
    return result;
  }

  const { data: activeLicenses, error: licError } = await supabase
    .from("licenses")
    .select("user_id")
    .eq("status", "active");

  if (licError) {
    return result;
  }

  // deno-lint-ignore no-explicit-any
  const usersWithLicenses = new Set((activeLicenses || []).map((l: any) => l.user_id));

  // deno-lint-ignore no-explicit-any
  const subsWithoutLicense = activeSubscriptions.filter((s: any) => !usersWithLicenses.has(s.user_id));

  if (subsWithoutLicense.length === 0) {
    return result;
  }

  result.detected = subsWithoutLicense.length;
  console.log(`[reconciliation-global] Found ${subsWithoutLicense.length} active subscriptions without licenses`);

  // deno-lint-ignore no-explicit-any
  for (const sub of subsWithoutLicense as any[]) {
    const plan = sub.subscription_plans;

    if (!plan) {
      result.uncorrectable.push({
        id: sub.id,
        reason: "Subscription has no associated plan"
      });
      continue;
    }

    try {
      const { error: insertError } = await supabase
        .from("licenses")
        .insert({
          user_id: sub.user_id,
          plan_name: plan.name,
          status: "active",
          start_date: sub.start_date,
          end_date: sub.next_billing_date || new Date(Date.now() + plan.period * 24 * 60 * 60 * 1000).toISOString()
        });

      if (insertError) {
        result.uncorrectable.push({
          id: sub.id,
          reason: `Insert failed: ${insertError.message}`
        });
      } else {
        result.corrected++;
        result.details.push({
          id: sub.id,
          issue: `Subscription active but no license`,
          action: "create_license",
          success: true
        });

        auditLogs.push({
          user_id: systemUserId,
          action: "reconciliation_license_from_subscription",
          resource: `subscription:${sub.id}`,
          details: {
            subscription_id: sub.id,
            user_id: sub.user_id,
            plan_name: plan.name,
            corrected_at: new Date().toISOString()
          }
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      result.uncorrectable.push({
        id: sub.id,
        reason: `Exception: ${errorMsg}`
      });
    }
  }

  return result;
}

async function reconcileExpiredOrdersWithReservations(
  supabase: SupabaseClientAny,
  systemUserId: string,
  auditLogs: AuditLogEntry[]
): Promise<ReconciliationResult> {
  const result: ReconciliationResult = {
    category: "expired_orders_with_reservations",
    detected: 0,
    corrected: 0,
    details: [],
    uncorrectable: []
  };

  console.log("[reconciliation-global] Checking cancelled/expired orders with active reservations...");

  const { data: invalidReservations, error } = await supabase
    .from("session_files")
    .select(`
      id,
      file_name,
      type,
      reserved_for_order,
      orders!inner (
        id,
        status
      )
    `)
    .eq("status", "reserved")
    .in("orders.status", ["cancelled", "expired", "refunded"]);

  if (error) {
    console.error("[reconciliation-global] Error fetching invalid reservations:", error);
    return result;
  }

  if (!invalidReservations || invalidReservations.length === 0) {
    return result;
  }

  result.detected = invalidReservations.length;
  console.log(`[reconciliation-global] Found ${invalidReservations.length} sessions reserved for invalid orders`);

  // deno-lint-ignore no-explicit-any
  const sessionIds = invalidReservations.map((s: any) => s.id);

  try {
    const { error: updateError } = await supabase
      .from("session_files")
      .update({
        status: "available",
        reserved_for_order: null,
        reserved_at: null
      })
      .in("id", sessionIds);

    if (updateError) {
      // deno-lint-ignore no-explicit-any
      for (const session of invalidReservations as any[]) {
        result.uncorrectable.push({
          id: session.id,
          reason: `Update failed: ${updateError.message}`
        });
      }
    } else {
      result.corrected = invalidReservations.length;
      
      // deno-lint-ignore no-explicit-any
      for (const session of invalidReservations as any[]) {
        const order = session.orders;
        result.details.push({
          id: session.id,
          issue: `Session reserved for ${order.status} order`,
          action: "release_reservation",
          success: true
        });

        auditLogs.push({
          user_id: systemUserId,
          action: "reconciliation_reservation_released",
          resource: `session_file:${session.id}`,
          details: {
            session_id: session.id,
            order_id: session.reserved_for_order,
            order_status: order.status,
            corrected_at: new Date().toISOString()
          }
        });
      }

      // Sync inventory
      // deno-lint-ignore no-explicit-any
      const typeGroups = invalidReservations.reduce((acc: any, s: any) => {
        acc[s.type] = (acc[s.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      for (const type of Object.keys(typeGroups)) {
        const { count } = await supabase
          .from("session_files")
          .select("*", { count: "exact", head: true })
          .eq("type", type)
          .eq("status", "available");

        if (count !== null) {
          await supabase
            .from("sessions_inventory")
            .update({ quantity: count, updated_at: new Date().toISOString() })
            .eq("type", type);
        }
      }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    // deno-lint-ignore no-explicit-any
    for (const session of invalidReservations as any[]) {
      result.uncorrectable.push({
        id: session.id,
        reason: `Exception: ${errorMsg}`
      });
    }
  }

  return result;
}

async function reconcileOrphanedSessions(
  supabase: SupabaseClientAny,
  systemUserId: string,
  auditLogs: AuditLogEntry[]
): Promise<ReconciliationResult> {
  const result: ReconciliationResult = {
    category: "orphaned_sessions",
    detected: 0,
    corrected: 0,
    details: [],
    uncorrectable: []
  };

  console.log("[reconciliation-global] Checking orphaned session reservations...");

  const RESERVATION_TIMEOUT_MINUTES = 30;
  const cutoffTime = new Date(Date.now() - RESERVATION_TIMEOUT_MINUTES * 60 * 1000).toISOString();

  const { data: orphanedSessions, error } = await supabase
    .from("session_files")
    .select("id, file_name, type, reserved_for_order, reserved_at")
    .eq("status", "reserved")
    .or(`reserved_for_order.is.null,reserved_at.lt.${cutoffTime}`);

  if (error) {
    console.error("[reconciliation-global] Error fetching orphaned sessions:", error);
    return result;
  }

  if (!orphanedSessions || orphanedSessions.length === 0) {
    return result;
  }

  // deno-lint-ignore no-explicit-any
  const orderIds = [...new Set(orphanedSessions.map((s: any) => s.reserved_for_order).filter(Boolean))] as string[];
  
  let validOrderIds = new Set<string>();
  if (orderIds.length > 0) {
    const { data: pendingOrders } = await supabase
      .from("orders")
      .select("id")
      .in("id", orderIds)
      .eq("status", "pending");
    
    // deno-lint-ignore no-explicit-any
    validOrderIds = new Set((pendingOrders || []).map((o: any) => o.id));
  }

  // deno-lint-ignore no-explicit-any
  const trulyOrphaned = orphanedSessions.filter((s: any) => {
    if (!s.reserved_for_order) return true;
    if (!validOrderIds.has(s.reserved_for_order)) return true;
    if (s.reserved_at && new Date(s.reserved_at) < new Date(cutoffTime)) return true;
    return false;
  });

  if (trulyOrphaned.length === 0) {
    return result;
  }

  result.detected = trulyOrphaned.length;
  console.log(`[reconciliation-global] Found ${trulyOrphaned.length} truly orphaned sessions`);

  try {
    const { error: updateError } = await supabase
      .from("session_files")
      .update({
        status: "available",
        reserved_for_order: null,
        reserved_at: null
      })
      // deno-lint-ignore no-explicit-any
      .in("id", trulyOrphaned.map((s: any) => s.id));

    if (updateError) {
      // deno-lint-ignore no-explicit-any
      for (const session of trulyOrphaned as any[]) {
        result.uncorrectable.push({
          id: session.id,
          reason: `Update failed: ${updateError.message}`
        });
      }
    } else {
      result.corrected = trulyOrphaned.length;
      
      // deno-lint-ignore no-explicit-any
      for (const session of trulyOrphaned as any[]) {
        result.details.push({
          id: session.id,
          issue: "Orphaned reservation",
          action: "release_reservation",
          success: true
        });

        auditLogs.push({
          user_id: systemUserId,
          action: "reconciliation_orphan_released",
          resource: `session_file:${session.id}`,
          details: {
            session_id: session.id,
            previous_order: session.reserved_for_order,
            reserved_at: session.reserved_at,
            corrected_at: new Date().toISOString()
          }
        });
      }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    // deno-lint-ignore no-explicit-any
    for (const session of trulyOrphaned as any[]) {
      result.uncorrectable.push({
        id: session.id,
        reason: `Exception: ${errorMsg}`
      });
    }
  }

  return result;
}

async function reconcileExpiredLicenses(
  supabase: SupabaseClientAny,
  systemUserId: string,
  auditLogs: AuditLogEntry[]
): Promise<ReconciliationResult> {
  const result: ReconciliationResult = {
    category: "expired_licenses_still_active",
    detected: 0,
    corrected: 0,
    details: [],
    uncorrectable: []
  };

  console.log("[reconciliation-global] Checking expired licenses still marked active...");

  const now = new Date().toISOString();

  const { data: expiredLicenses, error } = await supabase
    .from("licenses")
    .select("id, user_id, plan_name, end_date")
    .eq("status", "active")
    .lt("end_date", now);

  if (error || !expiredLicenses || expiredLicenses.length === 0) {
    return result;
  }

  result.detected = expiredLicenses.length;
  console.log(`[reconciliation-global] Found ${expiredLicenses.length} expired licenses still active`);

  try {
    const { error: updateError } = await supabase
      .from("licenses")
      .update({ status: "expired", updated_at: now })
      // deno-lint-ignore no-explicit-any
      .in("id", expiredLicenses.map((l: any) => l.id));

    if (updateError) {
      // deno-lint-ignore no-explicit-any
      for (const lic of expiredLicenses as any[]) {
        result.uncorrectable.push({
          id: lic.id,
          reason: `Update failed: ${updateError.message}`
        });
      }
    } else {
      result.corrected = expiredLicenses.length;
      
      // deno-lint-ignore no-explicit-any
      for (const lic of expiredLicenses as any[]) {
        result.details.push({
          id: lic.id,
          issue: "License expired but status active",
          action: "mark_expired",
          success: true
        });

        auditLogs.push({
          user_id: systemUserId,
          action: "reconciliation_license_expired",
          resource: `license:${lic.id}`,
          details: {
            license_id: lic.id,
            user_id: lic.user_id,
            end_date: lic.end_date,
            corrected_at: now
          }
        });
      }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    // deno-lint-ignore no-explicit-any
    for (const lic of expiredLicenses as any[]) {
      result.uncorrectable.push({
        id: lic.id,
        reason: `Exception: ${errorMsg}`
      });
    }
  }

  return result;
}

async function reconcileExpiredSubscriptions(
  supabase: SupabaseClientAny,
  systemUserId: string,
  auditLogs: AuditLogEntry[]
): Promise<ReconciliationResult> {
  const result: ReconciliationResult = {
    category: "expired_subscriptions_still_active",
    detected: 0,
    corrected: 0,
    details: [],
    uncorrectable: []
  };

  console.log("[reconciliation-global] Checking expired subscriptions still marked active...");

  const now = new Date().toISOString();

  const { data: expiredSubs, error } = await supabase
    .from("user_subscriptions")
    .select("id, user_id, next_billing_date")
    .eq("status", "active")
    .lt("next_billing_date", now);

  if (error || !expiredSubs || expiredSubs.length === 0) {
    return result;
  }

  result.detected = expiredSubs.length;
  console.log(`[reconciliation-global] Found ${expiredSubs.length} expired subscriptions still active`);

  try {
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({ status: "expired", updated_at: now })
      // deno-lint-ignore no-explicit-any
      .in("id", expiredSubs.map((s: any) => s.id));

    if (updateError) {
      // deno-lint-ignore no-explicit-any
      for (const sub of expiredSubs as any[]) {
        result.uncorrectable.push({
          id: sub.id,
          reason: `Update failed: ${updateError.message}`
        });
      }
    } else {
      result.corrected = expiredSubs.length;
      
      // deno-lint-ignore no-explicit-any
      for (const sub of expiredSubs as any[]) {
        result.details.push({
          id: sub.id,
          issue: "Subscription expired but status active",
          action: "mark_expired",
          success: true
        });

        auditLogs.push({
          user_id: systemUserId,
          action: "reconciliation_subscription_expired",
          resource: `subscription:${sub.id}`,
          details: {
            subscription_id: sub.id,
            user_id: sub.user_id,
            next_billing_date: sub.next_billing_date,
            corrected_at: now
          }
        });
      }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    // deno-lint-ignore no-explicit-any
    for (const sub of expiredSubs as any[]) {
      result.uncorrectable.push({
        id: sub.id,
        reason: `Exception: ${errorMsg}`
      });
    }
  }

  return result;
}
