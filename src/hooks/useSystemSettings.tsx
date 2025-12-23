import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SystemSettings {
  maintenanceMode: boolean;
  allowRegistration: boolean;
  allowBotDownload: boolean;
}

export const useSystemSettings = () => {
const [settings, setSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    allowRegistration: true,
    allowBotDownload: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value');

      if (error) throw error;

      const settingsMap: SystemSettings = {
        maintenanceMode: false,
        allowRegistration: true,
        allowBotDownload: true,
      };

      data?.forEach((setting) => {
        if (setting.key === 'maintenance_mode') {
          settingsMap.maintenanceMode = setting.value === 'true';
        }
        if (setting.key === 'allow_registrations') {
          settingsMap.allowRegistration = setting.value === 'true';
        }
        if (setting.key === 'allow_bot_download') {
          settingsMap.allowBotDownload = setting.value === 'true';
        }
      });

      setSettings(settingsMap);
    } catch (err) {
      console.error('Error fetching system settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    try {
      // Check if setting exists
      const { data: existing } = await supabase
        .from('system_settings')
        .select('id')
        .eq('key', key)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('system_settings')
          .update({ value: String(value) })
          .eq('key', key);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('system_settings')
          .insert({ key, value: String(value) });

        if (error) throw error;
      }

      // Update local state
      if (key === 'maintenance_mode') {
        setSettings(prev => ({ ...prev, maintenanceMode: value }));
      }
      if (key === 'allow_registrations') {
        setSettings(prev => ({ ...prev, allowRegistration: value }));
      }
      if (key === 'allow_bot_download') {
        setSettings(prev => ({ ...prev, allowBotDownload: value }));
      }

      return { success: true };
    } catch (err) {
      console.error('Error updating system setting:', err);
      return { success: false, error: 'Erro ao atualizar configuração' };
    }
  };

  // Maintenance mode uses edge function to also invalidate non-admin sessions
  const setMaintenanceMode = async (value: boolean) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-actions', {
        body: {
          action: 'enable_maintenance',
          enabled: value,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setSettings(prev => ({ ...prev, maintenanceMode: value }));
        return { success: true, message: data.message };
      } else {
        throw new Error(data?.error || 'Erro desconhecido');
      }
    } catch (err: any) {
      console.error('Error setting maintenance mode:', err);
      return { success: false, error: err.message || 'Erro ao atualizar manutenção' };
    }
  };

  // Allow registration can update directly (no session invalidation needed)
  const setAllowRegistration = (value: boolean) => updateSetting('allow_registrations', value);

  // Allow bot download can update directly
  const setAllowBotDownload = (value: boolean) => updateSetting('allow_bot_download', value);

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    setMaintenanceMode,
    setAllowRegistration,
    setAllowBotDownload,
    refetch: fetchSettings,
  };
};
