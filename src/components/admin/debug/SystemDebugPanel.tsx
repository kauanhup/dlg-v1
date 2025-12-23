import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  RefreshCw, 
  Database, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Trash2,
  Play,
  Terminal
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface HealthInfo {
  realtime: { table: string; active: boolean }[];
  inventory: {
    brasileiras: { files: number | null; inventory: number; synced: boolean };
    estrangeiras: { files: number | null; inventory: number; synced: boolean };
  };
  reservations: { total: number; needsCleanup: boolean };
  orders: { pendingOld: number };
}

type LoadingState = 'setup' | 'health' | 'cleanup' | 'realtime' | 'sync' | null;

export function SystemDebugPanel() {
  const [loading, setLoading] = useState<LoadingState>(null);
  const [debugInfo, setDebugInfo] = useState<HealthInfo | null>(null);

  // 1. Executar Sync de Inventário
  const runInventorySync = async () => {
    setLoading('sync');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-sessions-inventory`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(`Inventário sincronizado: BR=${result.brasileiras}, EXT=${result.estrangeiras}`);
      } else {
        toast.error(result.error || 'Erro ao sincronizar');
      }
      
      await checkSystemHealth();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao sincronizar inventário');
    } finally {
      setLoading(null);
    }
  };

  // 2. Verificar Saúde do Sistema
  const checkSystemHealth = async () => {
    setLoading('health');
    try {
      const health: HealthInfo = {
        realtime: [],
        inventory: {
          brasileiras: { files: 0, inventory: 0, synced: true },
          estrangeiras: { files: 0, inventory: 0, synced: true }
        },
        reservations: { total: 0, needsCleanup: false },
        orders: { pendingOld: 0 }
      };

      // Verificar real-time (just test if channel creation works)
      const tables = ['session_files', 'orders', 'system_settings'];
      for (const table of tables) {
        try {
          const channel = supabase.channel(`test-${table}-${Date.now()}`);
          channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {});
          health.realtime.push({ table, active: true });
          supabase.removeChannel(channel);
        } catch {
          health.realtime.push({ table, active: false });
        }
      }

      // Verificar inventário vs arquivos reais - brasileiras
      const { count: brFiles } = await supabase
        .from('session_files')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'brasileiras')
        .eq('status', 'available');

      const { data: brInventory } = await supabase
        .from('sessions_inventory')
        .select('quantity')
        .eq('type', 'brasileiras')
        .maybeSingle();

      // estrangeiras
      const { count: extFiles } = await supabase
        .from('session_files')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'estrangeiras')
        .eq('status', 'available');

      const { data: extInventory } = await supabase
        .from('sessions_inventory')
        .select('quantity')
        .eq('type', 'estrangeiras')
        .maybeSingle();

      health.inventory = {
        brasileiras: {
          files: brFiles,
          inventory: brInventory?.quantity ?? 0,
          synced: brFiles === (brInventory?.quantity ?? 0)
        },
        estrangeiras: {
          files: extFiles,
          inventory: extInventory?.quantity ?? 0,
          synced: extFiles === (extInventory?.quantity ?? 0)
        }
      };

      // Verificar reservas antigas (mais de 30 min)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      
      const { data: oldReservations } = await supabase
        .from('session_files')
        .select('id')
        .eq('status', 'reserved')
        .not('reserved_at', 'is', null)
        .lt('reserved_at', thirtyMinutesAgo);

      health.reservations = {
        total: oldReservations?.length || 0,
        needsCleanup: (oldReservations?.length || 0) > 0
      };

      // Verificar pedidos pendentes antigos
      const { data: oldOrders } = await supabase
        .from('orders')
        .select('id')
        .eq('status', 'pending')
        .lt('created_at', thirtyMinutesAgo);

      health.orders = {
        pendingOld: oldOrders?.length || 0
      };

      setDebugInfo(health);
      
      const hasIssues = 
        !health.inventory.brasileiras.synced || 
        !health.inventory.estrangeiras.synced ||
        health.reservations.needsCleanup ||
        health.orders.pendingOld > 0;

      toast[hasIssues ? 'warning' : 'success'](
        hasIssues ? "Alguns itens precisam de atenção" : "Todos os sistemas funcionando"
      );

    } catch (error: any) {
      toast.error(error.message || 'Erro ao verificar saúde');
    } finally {
      setLoading(null);
    }
  };

  // 3. Forçar Limpeza de Reservas
  const forceCleanup = async () => {
    setLoading('cleanup');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cleanup-expired-reservations`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(`Limpeza executada: ${result.ordersExpired || 0} pedidos, ${result.sessionsReleased || 0} sessões`);
      } else {
        toast.error(result.error || 'Erro na limpeza');
      }

      await checkSystemHealth();

    } catch (error: any) {
      toast.error(error.message || 'Erro na limpeza');
    } finally {
      setLoading(null);
    }
  };

  // 4. Testar Real-time
  const testRealtime = async () => {
    setLoading('realtime');
    
    toast.info("Monitorando changes por 5 segundos...");

    let changesDetected = 0;

    const channel = supabase
      .channel('debug-test-' + Date.now())
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'session_files' },
        () => { changesDetected++; }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => { changesDetected++; }
      )
      .subscribe();

    setTimeout(() => {
      supabase.removeChannel(channel);
      
      toast[changesDetected > 0 ? 'success' : 'info'](
        changesDetected > 0 
          ? `Real-time funcionando! ${changesDetected} evento(s)` 
          : "Nenhuma mudança detectada (normal se não houve alterações)"
      );
      
      setLoading(null);
    }, 5000);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Terminal className="h-5 w-5 text-primary" />
            Painel de Debug e Testes
          </CardTitle>
          <CardDescription>
            Ferramentas para configurar, monitorar e debugar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Botões de Ação */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={runInventorySync}
              variant="outline"
              disabled={loading !== null}
              className="gap-2"
            >
              {loading === 'sync' ? <Spinner size="sm" /> : <Database className="h-4 w-4" />}
              {loading === 'sync' ? 'Sincronizando...' : 'Sync Inventário'}
            </Button>

            <Button
              onClick={checkSystemHealth}
              variant="outline"
              disabled={loading !== null}
              className="gap-2"
            >
              {loading === 'health' ? <Spinner size="sm" /> : <Activity className="h-4 w-4" />}
              {loading === 'health' ? 'Verificando...' : 'Verificar Saúde'}
            </Button>

            <Button
              onClick={forceCleanup}
              variant="outline"
              disabled={loading !== null}
              className="gap-2"
            >
              {loading === 'cleanup' ? <Spinner size="sm" /> : <Trash2 className="h-4 w-4" />}
              {loading === 'cleanup' ? 'Limpando...' : 'Forçar Limpeza'}
            </Button>

            <Button
              onClick={testRealtime}
              variant="outline"
              disabled={loading !== null}
              className="gap-2"
            >
              {loading === 'realtime' ? <Spinner size="sm" /> : <Play className="h-4 w-4" />}
              {loading === 'realtime' ? 'Testando...' : 'Testar Real-time'}
            </Button>
          </div>

          {/* Resultados */}
          {debugInfo && (
            <Card className="border-border bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Status do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Real-time Status */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Real-time:</p>
                  <div className="flex flex-wrap gap-2">
                    {debugInfo.realtime.map((item, i) => (
                      <Badge key={i} variant={item.active ? 'default' : 'destructive'}>
                        {item.table}: {item.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Inventory Sync */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Inventário:</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-background rounded border border-border">
                      <span className="text-sm text-foreground">
                        Brasileiras: Arquivos={debugInfo.inventory.brasileiras.files ?? 0} | Inventário={debugInfo.inventory.brasileiras.inventory}
                      </span>
                      <Badge variant={debugInfo.inventory.brasileiras.synced ? 'default' : 'destructive'}>
                        {debugInfo.inventory.brasileiras.synced ? 'Sincronizado' : 'Dessinc'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-background rounded border border-border">
                      <span className="text-sm text-foreground">
                        Estrangeiras: Arquivos={debugInfo.inventory.estrangeiras.files ?? 0} | Inventário={debugInfo.inventory.estrangeiras.inventory}
                      </span>
                      <Badge variant={debugInfo.inventory.estrangeiras.synced ? 'default' : 'destructive'}>
                        {debugInfo.inventory.estrangeiras.synced ? 'Sincronizado' : 'Dessinc'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Reservations */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Reservas Expiradas:</p>
                  <div className="flex items-center justify-between p-2 bg-background rounded border border-border">
                    <span className="text-sm text-foreground">
                      {debugInfo.reservations.total} sessões reservadas há mais de 30min
                    </span>
                    {debugInfo.reservations.needsCleanup ? (
                      <Badge variant="destructive" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Precisa Limpeza
                      </Badge>
                    ) : (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        OK
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Old Orders */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Pedidos Pendentes Antigos:</p>
                  <div className="flex items-center justify-between p-2 bg-background rounded border border-border">
                    <span className="text-sm text-foreground">
                      {debugInfo.orders.pendingOld} pedidos pendentes há mais de 30min
                    </span>
                    {debugInfo.orders.pendingOld > 0 ? (
                      <Badge variant="warning" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Atenção
                      </Badge>
                    ) : (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        OK
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Comandos SQL Úteis */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-foreground">Comandos SQL Úteis</CardTitle>
          <CardDescription>Referência rápida para debug manual</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-xs text-muted-foreground">
{`-- Ver sessões reservadas há mais de 30min
SELECT id, type, reserved_at, reserved_for_order 
FROM session_files 
WHERE status = 'reserved' 
AND reserved_at < NOW() - INTERVAL '30 minutes';

-- Liberar manualmente sessões antigas
UPDATE session_files
SET status = 'available', reserved_for_order = NULL, reserved_at = NULL
WHERE status = 'reserved' 
AND reserved_at < NOW() - INTERVAL '30 minutes';

-- Ver pedidos pendentes por usuário
SELECT user_id, COUNT(*) as pending_count
FROM orders
WHERE status = 'pending'
AND created_at > NOW() - INTERVAL '30 minutes'
GROUP BY user_id
HAVING COUNT(*) >= 3;

-- Verificar sincronização de inventário
SELECT 
  si.type, 
  si.quantity as inventory,
  (SELECT COUNT(*) FROM session_files sf 
   WHERE sf.type = si.type AND sf.status = 'available') as actual
FROM sessions_inventory si;`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
