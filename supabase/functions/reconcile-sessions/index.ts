import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log("[reconcile-sessions] Starting reconciliation job");

  try {
    // 1. Find all session_files with status 'reserved'
    const { data: reservedSessions, error: fetchError } = await supabase
      .from("session_files")
      .select("id, file_name, type, reserved_for_order, reserved_at")
      .eq("status", "reserved");

    if (fetchError) {
      console.error("[reconcile-sessions] Error fetching reserved sessions:", fetchError);
      throw fetchError;
    }

    if (!reservedSessions || reservedSessions.length === 0) {
      console.log("[reconcile-sessions] No reserved sessions found");
      return new Response(
        JSON.stringify({ success: true, message: "No reserved sessions to reconcile", reconciled: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[reconcile-sessions] Found ${reservedSessions.length} reserved sessions`);

    // 2. Group by order_id to batch validate
    const orderIds = [...new Set(reservedSessions
      .map(s => s.reserved_for_order)
      .filter(Boolean))] as string[];

    // 3. Fetch all related orders to check their status
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, status, created_at")
      .in("id", orderIds.length > 0 ? orderIds : ["00000000-0000-0000-0000-000000000000"]);

    if (ordersError) {
      console.error("[reconcile-sessions] Error fetching orders:", ordersError);
      throw ordersError;
    }

    // Create a map for quick lookup
    const orderMap = new Map(orders?.map(o => [o.id, o]) || []);

    // 4. Determine which sessions are orphaned
    const orphanedSessions: typeof reservedSessions = [];
    const now = new Date();
    const RESERVATION_TIMEOUT_MINUTES = 30;

    for (const session of reservedSessions) {
      let isOrphaned = false;
      let reason = "";

      // Case 1: No order associated
      if (!session.reserved_for_order) {
        isOrphaned = true;
        reason = "no_order_associated";
      } 
      // Case 2: Order doesn't exist
      else if (!orderMap.has(session.reserved_for_order)) {
        isOrphaned = true;
        reason = "order_not_found";
      } 
      // Case 3: Order exists but is not pending (completed, cancelled, expired)
      else {
        const order = orderMap.get(session.reserved_for_order)!;
        if (order.status !== "pending") {
          isOrphaned = true;
          reason = `order_status_${order.status}`;
        } 
        // Case 4: Order is pending but reservation expired (>30 min)
        else if (session.reserved_at) {
          const reservedAt = new Date(session.reserved_at);
          const minutesSinceReservation = (now.getTime() - reservedAt.getTime()) / (1000 * 60);
          if (minutesSinceReservation > RESERVATION_TIMEOUT_MINUTES) {
            isOrphaned = true;
            reason = `reservation_expired_${Math.floor(minutesSinceReservation)}min`;
          }
        }
      }

      if (isOrphaned) {
        orphanedSessions.push({ ...session, orphan_reason: reason } as any);
      }
    }

    if (orphanedSessions.length === 0) {
      console.log("[reconcile-sessions] No orphaned sessions found");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "All reserved sessions have valid orders", 
          checked: reservedSessions.length,
          reconciled: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[reconcile-sessions] Found ${orphanedSessions.length} orphaned sessions to release`);

    // 5. Release orphaned sessions
    const orphanedIds = orphanedSessions.map(s => s.id);
    
    const { error: updateError } = await supabase
      .from("session_files")
      .update({
        status: "available",
        reserved_for_order: null,
        reserved_at: null
      })
      .in("id", orphanedIds);

    if (updateError) {
      console.error("[reconcile-sessions] Error releasing sessions:", updateError);
      throw updateError;
    }

    // 6. Update inventory counts
    const typeGroups = orphanedSessions.reduce((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sync inventory for each type
    for (const [type, count] of Object.entries(typeGroups)) {
      // Get actual available count
      const { count: actualCount, error: countError } = await supabase
        .from("session_files")
        .select("*", { count: "exact", head: true })
        .eq("type", type)
        .eq("status", "available");

      if (!countError && actualCount !== null) {
        await supabase
          .from("sessions_inventory")
          .update({ quantity: actualCount, updated_at: new Date().toISOString() })
          .eq("type", type);
        
        console.log(`[reconcile-sessions] Synced inventory for ${type}: ${actualCount} available`);
      }
    }

    // 7. Generate audit logs for each correction
    const auditLogs = orphanedSessions.map(session => ({
      user_id: "00000000-0000-0000-0000-000000000000", // System user
      action: "session_reconciliation",
      resource: "session_files",
      details: {
        session_id: session.id,
        file_name: session.file_name,
        type: session.type,
        previous_order_id: session.reserved_for_order,
        reserved_at: session.reserved_at,
        reason: (session as any).orphan_reason,
        reconciled_at: new Date().toISOString()
      }
    }));

    const { error: auditError } = await supabase
      .from("audit_logs")
      .insert(auditLogs);

    if (auditError) {
      console.error("[reconcile-sessions] Error creating audit logs:", auditError);
      // Don't throw - reconciliation was successful, audit is secondary
    }

    console.log(`[reconcile-sessions] Successfully reconciled ${orphanedSessions.length} sessions`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Reconciled ${orphanedSessions.length} orphaned sessions`,
        checked: reservedSessions.length,
        reconciled: orphanedSessions.length,
        by_type: typeGroups,
        details: orphanedSessions.map(s => ({
          id: s.id,
          type: s.type,
          reason: (s as any).orphan_reason
        }))
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[reconcile-sessions] Fatal error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
