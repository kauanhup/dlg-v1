import { SessionInventory } from "@/hooks/useAdminSessions";
import { cn } from "@/lib/utils";

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

const StatCard = ({ 
  title, 
  value, 
  valueColor = "text-foreground",
  subtitle
}: { 
  title: string; 
  value: string | number; 
  valueColor?: string;
  subtitle?: string;
}) => (
  <div className="bg-card border border-border rounded-lg p-4 sm:p-5">
    <div className="flex items-center justify-between">
      <p className={cn("text-xl sm:text-2xl font-bold", valueColor)}>{value}</p>
      {subtitle && (
        <span className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-muted text-muted-foreground">
          {subtitle}
        </span>
      )}
    </div>
    <div className="mt-2">
      <p className="text-xs sm:text-sm text-muted-foreground">{title}</p>
    </div>
  </div>
);

export const SessionStatsCards = ({ stats, totalFiles }: SessionStatsCardsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <StatCard
        title="Total Disponíveis"
        value={stats.totalAvailable}
        valueColor="text-success"
      />
      <StatCard
        title="Brasileiras"
        value={stats.totalBrasileiras}
        subtitle="🇧🇷"
      />
      <StatCard
        title="Estrangeiras"
        value={stats.totalEstrangeiras}
        subtitle="🌍"
      />
      <StatCard
        title="Total Arquivos"
        value={totalFiles}
      />
    </div>
  );
};
