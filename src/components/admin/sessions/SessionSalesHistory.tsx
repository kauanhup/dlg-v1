import { DollarSign, TrendingUp } from "lucide-react";
import { SoldSession } from "@/hooks/useAdminSessions";

interface SessionSalesHistoryProps {
  sales: SoldSession[];
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const SessionSalesHistory = ({ sales }: SessionSalesHistoryProps) => {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        Histórico de Vendas
      </h3>
      
      {sales.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhuma venda registrada ainda</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sales.slice(0, 30).map((sale) => (
            <div key={sale.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg">{sale.type === 'brasileiras' ? '🇧🇷' : '🌍'}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{sale.file_name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(sale.sold_at)}</p>
                </div>
              </div>
              <div className="text-right min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{sale.buyer_name}</p>
                <p className="text-xs text-muted-foreground truncate">{sale.buyer_email}</p>
              </div>
            </div>
          ))}
          {sales.length > 30 && (
            <p className="text-xs text-center text-muted-foreground pt-2">
              Mostrando 30 de {sales.length} vendas
            </p>
          )}
        </div>
      )}
    </div>
  );
};
