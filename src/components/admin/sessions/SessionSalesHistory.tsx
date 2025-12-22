import { useState } from "react";
import { DollarSign, TrendingUp, ChevronDown, ChevronUp, Package } from "lucide-react";
import { GroupedSale } from "@/hooks/useAdminSessions";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SessionSalesHistoryProps {
  sales: GroupedSale[];
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
  const [expandedSale, setExpandedSale] = useState<string | null>(null);

  const toggleExpand = (orderId: string) => {
    setExpandedSale(prev => prev === orderId ? null : orderId);
  };

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
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {sales.slice(0, 30).map((sale) => (
            <div key={sale.order_id} className="bg-muted/30 rounded-lg overflow-hidden">
              <div 
                className={cn(
                  "flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                  sale.quantity > 1 && "cursor-pointer"
                )}
                onClick={() => sale.quantity > 1 && toggleExpand(sale.order_id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg">{sale.type === 'brasileiras' ? '🇧🇷' : '🌍'}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {sale.quantity > 1 ? (
                          <span className="flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-primary" />
                            {sale.quantity} sessions {sale.type === 'brasileiras' ? 'brasileiras' : 'estrangeiras'}
                          </span>
                        ) : (
                          <span className="truncate">{sale.files[0]}</span>
                        )}
                      </p>
                      {sale.quantity > 1 && (
                        expandedSale === sale.order_id ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(sale.sold_at)}</p>
                  </div>
                </div>
                <div className="text-right min-w-0 max-w-[120px] sm:max-w-[180px]">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-sm font-medium text-foreground truncate cursor-default">{sale.buyer_name}</p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{sale.buyer_name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs text-muted-foreground truncate cursor-default">{sale.buyer_email}</p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{sale.buyer_email}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              {/* Expanded file list for combos */}
              {sale.quantity > 1 && expandedSale === sale.order_id && (
                <div className="px-3 pb-3 pt-1 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Arquivos vendidos:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                    {sale.files.map((file, idx) => (
                      <span 
                        key={idx} 
                        className="text-xs bg-background/50 px-2 py-1 rounded truncate"
                        title={file}
                      >
                        {file}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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