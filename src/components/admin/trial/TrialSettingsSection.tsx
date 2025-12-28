import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Clock, 
  Smartphone, 
  Save, 
  RefreshCw,
  Shield,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

interface TrialSettings {
  trial_enabled: boolean;
  trial_duration_days: number;
  trial_max_devices: number;
}

export const TrialSettingsSection = () => {
  const [settings, setSettings] = useState<TrialSettings>({
    trial_enabled: true,
    trial_duration_days: 3,
    trial_max_devices: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<TrialSettings | null>(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("key, value")
        .in("key", [
          "trial_enabled",
          "trial_duration_days",
          "trial_max_devices",
        ]);

      if (error) throw error;

      const newSettings: TrialSettings = {
        trial_enabled: true,
        trial_duration_days: 3,
        trial_max_devices: 1,
      };

      data?.forEach((item) => {
        switch (item.key) {
          case "trial_enabled":
            newSettings.trial_enabled = item.value === "true";
            break;
          case "trial_duration_days":
            newSettings.trial_duration_days = parseInt(item.value) || 3;
            break;
          case "trial_max_devices":
            newSettings.trial_max_devices = parseInt(item.value) || 1;
            break;
        }
      });

      setSettings(newSettings);
      setOriginalSettings(newSettings);
      setHasChanges(false);
    } catch (error) {
      console.error("Error fetching trial settings:", error);
      toast.error("Erro ao carregar configurações de trial");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (originalSettings) {
      const changed = 
        settings.trial_enabled !== originalSettings.trial_enabled ||
        settings.trial_duration_days !== originalSettings.trial_duration_days ||
        settings.trial_max_devices !== originalSettings.trial_max_devices;
      setHasChanges(changed);
    }
  }, [settings, originalSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = [
        { key: "trial_enabled", value: String(settings.trial_enabled) },
        { key: "trial_duration_days", value: String(settings.trial_duration_days) },
        { key: "trial_max_devices", value: String(settings.trial_max_devices) },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from("system_settings")
          .update({ value: update.value, updated_at: new Date().toISOString() })
          .eq("key", update.key);

        if (error) throw error;
      }

      setOriginalSettings(settings);
      setHasChanges(false);
      toast.success("Configurações de trial salvas!");
    } catch (error) {
      console.error("Error saving trial settings:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Configurações do Teste Grátis</h3>
            <p className="text-sm text-muted-foreground">
              Defina os limites e comportamento do período de trial
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchSettings}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Enable/Disable Trial */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.trial_enabled ? (
              <ToggleRight className="w-6 h-6 text-success" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium text-foreground">Teste Grátis Ativado</p>
              <p className="text-sm text-muted-foreground">
                {settings.trial_enabled 
                  ? "Novos usuários podem testar o bot gratuitamente"
                  : "Teste grátis desativado para novos usuários"}
              </p>
            </div>
          </div>
          <Button
            variant={settings.trial_enabled ? "default" : "outline"}
            size="sm"
            onClick={() => setSettings(prev => ({ ...prev, trial_enabled: !prev.trial_enabled }))}
          >
            {settings.trial_enabled ? "Desativar" : "Ativar"}
          </Button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Duration */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Clock className="w-4 h-4 text-primary" />
            Duração (dias)
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={settings.trial_duration_days}
            onChange={(e) => setSettings(prev => ({ 
              ...prev, 
              trial_duration_days: Math.max(1, parseInt(e.target.value) || 1) 
            }))}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <p className="text-xs text-muted-foreground">
            Quantos dias o trial ficará ativo após ativação
          </p>
        </div>

        {/* Max Devices */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Smartphone className="w-4 h-4 text-primary" />
            Máx. Dispositivos
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={settings.trial_max_devices}
            onChange={(e) => setSettings(prev => ({ 
              ...prev, 
              trial_max_devices: Math.max(1, parseInt(e.target.value) || 1) 
            }))}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <p className="text-xs text-muted-foreground">
            Dispositivos simultâneos permitidos no trial
          </p>
        </div>
      </div>

      {/* Anti-circumvention notice */}
      <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
        <p className="text-sm text-warning flex items-start gap-2">
          <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            <strong>Proteção anti-burla ativa:</strong> O sistema registra o fingerprint do dispositivo para impedir que o mesmo dispositivo use o trial novamente.
          </span>
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges || isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <Spinner size="sm" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
};
