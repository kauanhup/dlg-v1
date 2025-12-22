import { DollarSign } from "lucide-react";

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
    <div className="bg-card border border-border rounded-lg p-3 sm:p-5">
      <h3 className="font-semibold text-foreground mb-2 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
        <DollarSign className="w-4 h-4 text-primary" />
        Custo Pago por Session
      </h3>
      <p className="text-[10px] sm:text-xs text-muted-foreground mb-3 sm:mb-4">
        Valor que você paga ao adquirir cada session
      </p>
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2 block">
            Custo Brasileira (R$)
          </label>
          <input
            type="text"
            value={costBrasileiras}
            onChange={(e) => onCostBrasileirasChange(e.target.value)}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="5.00"
          />
        </div>
        <div>
          <label className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2 block">
            Custo Estrangeira (R$)
          </label>
          <input
            type="text"
            value={costEstrangeiras}
            onChange={(e) => onCostEstrangeirasChange(e.target.value)}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="2.50"
          />
        </div>
      </div>
    </div>
  );
};
