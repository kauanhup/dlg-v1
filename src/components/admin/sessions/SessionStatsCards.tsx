import { SessionInventory } from "@/hooks/useAdminSessions";
import { Package, Globe, FileText, CheckCircle } from "lucide-react";

interface SessionStats {
  brasileiras: SessionInventory | undefined;
  estrangeiras: SessionInventory | undefined;
  totalAvailable: number;
  totalBrasileiras: number;
  totalEstrangeiras: number;
}

interface SessionStatsCardsProps {
  stats: SessionStats;
  totalFiles: number;
}

export const SessionStatsCards = ({ stats, totalFiles }: SessionStatsCardsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Total Disponíveis</p>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalAvailable}</p>
      </div>
      <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success flex-shrink-0" />
          <p className="text-[10px] sm:text-xs text-muted-foreground">Brasileiras</p>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-success">{stats.totalBrasileiras}</p>
      </div>
      <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
          <p className="text-[10px] sm:text-xs text-muted-foreground">Estrangeiras</p>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-primary">{stats.totalEstrangeiras}</p>
      </div>
      <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
          <p className="text-[10px] sm:text-xs text-muted-foreground">Total Arquivos</p>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-foreground">{totalFiles}</p>
      </div>
    </div>
  );
};
