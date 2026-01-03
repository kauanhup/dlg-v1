import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { logAdminAction, AuditActions } from "@/lib/auditLog";

// Profile update validation schema
const profileUpdateSchema = z.object({
  name: z.string()
    .min(2, 'Nome muito curto')
    .max(100, 'Nome muito longo')
    .optional(),
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email muito longo')
    .optional(),
  whatsapp: z.string()
    .regex(/^\+?[0-9]{10,15}$/, 'WhatsApp inválido')
    .optional(),
});

export interface AdminUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  whatsapp: string;
  avatar: string;
  role: string;
  banned: boolean;
  created_at: string;
  updated_at: string;
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for all users
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Merge profiles with roles
      const usersWithRoles: AdminUser[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        return {
          id: profile.id,
          user_id: profile.user_id,
          name: profile.name,
          email: profile.email,
          whatsapp: profile.whatsapp,
          avatar: profile.avatar || '😀',
          role: userRole?.role || 'user',
          banned: (profile as any).banned || false,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        };
      });

      setUsers(usersWithRoles);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  // updateUserRole is defined below with additional security checks

  const banUser = async (userId: string, banned: boolean = true, banReason?: string) => {
    try {
      console.log('[banUser] Starting ban action:', { userId, banned, banReason });
      
      // Use edge function to ban user AND invalidate sessions
      const { data, error } = await supabase.functions.invoke('admin-actions', {
        body: {
          action: 'ban_user',
          userId,
          banned,
          banReason
        }
      });

      console.log('[banUser] Edge function response:', { data, error });

      if (error) {
        console.error('[banUser] Edge function error:', error);
        throw error;
      }
      
      if (!data?.success) {
        console.error('[banUser] Edge function returned failure:', data);
        throw new Error(data?.error || 'Erro ao banir usuário');
      }

      // Log the action
      await logAdminAction(
        banned ? AuditActions.BAN_USER : AuditActions.UNBAN_USER,
        userId,
        { banned: !banned },
        { banned, ban_reason: banReason },
        banReason
      );

      // Update local state
      setUsers(prev => prev.map(user => 
        user.user_id === userId ? { ...user, banned } : user
      ));

      console.log('[banUser] Success! User banned status updated to:', banned);
      return { success: true };
    } catch (err: any) {
      console.error('[banUser] Error:', err);
      return { success: false, error: err?.message || 'Erro ao banir usuário' };
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      // Get current user to prevent self-demotion
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser?.id === userId) {
        return { success: false, error: 'Você não pode alterar seu próprio role!' };
      }

      // Get current role for audit log
      const currentUserData = users.find(u => u.user_id === userId);
      const oldRole = currentUserData?.role || 'user';

      // If removing admin, check if not the last one
      if (newRole === 'user' && oldRole === 'admin') {
        const adminCount = users.filter(u => u.role === 'admin').length;
        if (adminCount <= 1) {
          return { success: false, error: 'Sistema deve ter pelo menos 1 administrador!' };
        }
      }

      // Use upsert to handle cases where user might not have a role entry
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: newRole }, { onConflict: 'user_id' });

      if (error) throw error;

      // Log the action
      await logAdminAction(
        AuditActions.CHANGE_ROLE,
        userId,
        { role: oldRole },
        { role: newRole },
        `Alteração de role para ${newRole}`
      );

      // Update local state
      setUsers(prev => prev.map(user => 
        user.user_id === userId ? { ...user, role: newRole } : user
      ));

      return { success: true };
    } catch (err) {
      console.error('Error updating role:', err);
      return { success: false, error: 'Erro ao atualizar role' };
    }
  };

  const updateUserProfile = async (userId: string, data: { name?: string; email?: string; whatsapp?: string }) => {
    try {
      // Validate input data with Zod
      const validated = profileUpdateSchema.parse(data);
      
      const { error } = await supabase
        .from('profiles')
        .update(validated)
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.user_id === userId ? { ...user, ...validated } : user
      ));

      return { success: true };
    } catch (err) {
      if (err instanceof z.ZodError) {
        return { success: false, error: err.errors[0].message };
      }
      return { success: false, error: 'Erro ao atualizar perfil' };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
    updateUserRole,
    banUser,
    updateUserProfile,
    totalUsers: users.length,
    adminCount: users.filter(u => u.role === 'admin').length,
    userCount: users.filter(u => u.role === 'user').length,
    bannedCount: users.filter(u => u.banned).length,
  };
};
