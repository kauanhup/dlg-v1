import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  const fetchUsers = async () => {
    setIsLoading(true);
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

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

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

  const banUser = async (userId: string, banned: boolean = true) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ banned })
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.user_id === userId ? { ...user, banned } : user
      ));

      return { success: true };
    } catch (err) {
      console.error('Error banning user:', err);
      return { success: false, error: 'Erro ao banir usuário' };
    }
  };

  const updateUserProfile = async (userId: string, data: { name?: string; email?: string; whatsapp?: string }) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.user_id === userId ? { ...user, ...data } : user
      ));

      return { success: true };
    } catch (err) {
      console.error('Error updating profile:', err);
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
