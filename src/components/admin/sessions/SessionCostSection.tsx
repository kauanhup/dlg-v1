interface SessionCostSectionProps {
  costBrasileiras: string;
  costEstrangeiras: string;
  onCostBrasileirasChange: (value: string) => void;
  onCostEstrangeirasChange: (value: string) => void;
}

export const SessionCostSection = ({
  costBrasileiras,
  costEstrangeiras,
  onCostBrasileirasChange,
  onCostEstrangeirasChange,
}: SessionCostSectionProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
        <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
          🇧🇷 Custo Brasileira (R$)
        </label>
        <input
          type="text"
          value={costBrasileiras}
          onChange={(e) => onCostBrasileirasChange(e.target.value)}
          className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-success/50 transition-all"
          placeholder="5.00"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Valor que você paga ao adquirir cada session
        </p>
      </div>
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
          🌍 Custo Estrangeira (R$)
        </label>
        <input
          type="text"
          value={costEstrangeiras}
          onChange={(e) => onCostEstrangeirasChange(e.target.value)}
          className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          placeholder="2.50"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Valor que você paga ao adquirir cada session
        </p>
      </div>
    </div>
  );
};
