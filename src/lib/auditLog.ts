import { supabase } from '@/integrations/supabase/client';

export async function logAdminAction(
  action: string,
  targetUserId: string | null,
  oldValue: any,
  newValue: any,
  reason?: string
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No user found for audit log');
      return;
    }
    
    // Get IP address (optional, may fail in some environments)
    let ipAddress = 'unknown';
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      ipAddress = data.ip || 'unknown';
    } catch {
      // IP fetch failed, use unknown
    }
    
    const details: any = {
      old_value: oldValue,
      new_value: newValue,
    };
    
    if (reason) {
      details.reason = reason;
    }

    const { error } = await supabase.from('audit_logs').insert({
      user_id: user.id,
      action,
      resource: targetUserId ? `user:${targetUserId}` : 'system',
      details,
      ip_address: ipAddress,
      user_agent: navigator.userAgent
    });

    if (error) {
      console.error('Failed to create audit log:', error);
    }
  } catch (error) {
    console.error('Error in logAdminAction:', error);
  }
}

// Pre-defined action types for consistency
export const AuditActions = {
  BAN_USER: 'ban_user',
  UNBAN_USER: 'unban_user',
  CHANGE_ROLE: 'change_role',
  DELETE_SESSIONS: 'delete_sessions',
  CANCEL_SUBSCRIPTION: 'cancel_subscription',
  UPDATE_PROFILE: 'update_profile',
  UPDATE_SETTINGS: 'update_settings',
  UPLOAD_SESSIONS: 'upload_sessions',
  COMPLETE_ORDER: 'complete_order',
  CANCEL_ORDER: 'cancel_order',
} as const;

export type AuditAction = typeof AuditActions[keyof typeof AuditActions];