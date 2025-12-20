interface SessionStats {
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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-1">Total Disponíveis</p>
        <p className="text-2xl font-bold text-foreground">{stats.totalAvailable}</p>
      </div>
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-1">Brasileiras</p>
        <p className="text-2xl font-bold text-success">{stats.totalBrasileiras}</p>
      </div>
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-1">Estrangeiras</p>
        <p className="text-2xl font-bold text-primary">{stats.totalEstrangeiras}</p>
      </div>
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-1">Total Arquivos</p>
        <p className="text-2xl font-bold text-foreground">{totalFiles}</p>
      </div>
    </div>
  );
};
