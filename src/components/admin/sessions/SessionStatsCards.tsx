import { SessionInventory } from "@/hooks/useAdminSessions";
import { Package, Globe, FileText, CheckCircle, ArrowUpRight } from "lucide-react";
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
  icon: Icon, 
  iconColor = "text-primary",
  bgColor = "bg-primary/10",
  valueColor = "text-foreground",
  subtitle
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  iconColor?: string;
  bgColor?: string;
  valueColor?: string;
  subtitle?: string;
}) => (
  <div className="bg-card border border-border rounded-lg p-4 sm:p-5">
    <div className="flex items-center justify-between">
      <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center", bgColor)}>
        <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5", iconColor)} />
      </div>
      {subtitle && (
        <span className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-muted text-muted-foreground">
          {subtitle}
        </span>
      )}
    </div>
    <div className="mt-3 sm:mt-4">
      <p className={cn("text-xl sm:text-2xl font-bold", valueColor)}>{value}</p>
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
        icon={CheckCircle}
        iconColor="text-success"
        bgColor="bg-success/10"
        valueColor="text-success"
      />
      <StatCard
        title="Brasileiras"
        value={stats.totalBrasileiras}
        icon={Package}
        iconColor="text-success"
        bgColor="bg-success/10"
        subtitle="🇧🇷"
      />
      <StatCard
        title="Estrangeiras"
        value={stats.totalEstrangeiras}
        icon={Globe}
        iconColor="text-primary"
        bgColor="bg-primary/10"
        subtitle="🌍"
      />
      <StatCard
        title="Total Arquivos"
        value={totalFiles}
        icon={FileText}
        iconColor="text-muted-foreground"
        bgColor="bg-muted"
      />
    </div>
  );
};
