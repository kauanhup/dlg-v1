import { Package } from "lucide-react";

interface SessionCustomQuantitySectionProps {
  customQtyBrEnabled: boolean;
  customQtyBrMin: string;
  customQtyBrPrice: string;
  customQtyEstEnabled: boolean;
  customQtyEstMin: string;
  customQtyEstPrice: string;
  onCustomQtyBrEnabledChange: (enabled: boolean) => void;
  onCustomQtyBrMinChange: (value: string) => void;
  onCustomQtyBrPriceChange: (value: string) => void;
  onCustomQtyEstEnabledChange: (enabled: boolean) => void;
  onCustomQtyEstMinChange: (value: string) => void;
  onCustomQtyEstPriceChange: (value: string) => void;
}

export const SessionCustomQuantitySection = ({
  customQtyBrEnabled,
  customQtyBrMin,
  customQtyBrPrice,
  customQtyEstEnabled,
  customQtyEstMin,
  customQtyEstPrice,
  onCustomQtyBrEnabledChange,
  onCustomQtyBrMinChange,
  onCustomQtyBrPriceChange,
  onCustomQtyEstEnabledChange,
  onCustomQtyEstMinChange,
  onCustomQtyEstPriceChange,
}: SessionCustomQuantitySectionProps) => {
  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
      {/* Brasileiras */}
      <div className="space-y-3 p-4 bg-success/5 border border-success/20 rounded-lg">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground flex items-center gap-2">
            🇧🇷 Sessions Brasileiras
          </span>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={customQtyBrEnabled}
              onChange={(e) => onCustomQtyBrEnabledChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-success peer-focus:ring-2 peer-focus:ring-success/50 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
          </label>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Permite que usuários escolham quantidade personalizada
        </p>
        
        {customQtyBrEnabled && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-success/20">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Qtd. Mínima</label>
              <input
                type="number"
                min="1"
                value={customQtyBrMin}
                onChange={(e) => onCustomQtyBrMinChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-success/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Preço/Un. (R$)</label>
              <input
                type="text"
                value={customQtyBrPrice}
                onChange={(e) => onCustomQtyBrPriceChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-success/50 transition-all"
                placeholder="5.00"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Estrangeiras */}
      <div className="space-y-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground flex items-center gap-2">
            🌍 Sessions Estrangeiras
          </span>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={customQtyEstEnabled}
              onChange={(e) => onCustomQtyEstEnabledChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/50 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
          </label>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Permite que usuários escolham quantidade personalizada
        </p>
        
        {customQtyEstEnabled && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-primary/20">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Qtd. Mínima</label>
              <input
                type="number"
                min="1"
                value={customQtyEstMin}
                onChange={(e) => onCustomQtyEstMinChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Preço/Un. (R$)</label>
              <input
                type="text"
                value={customQtyEstPrice}
                onChange={(e) => onCustomQtyEstPriceChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="2.50"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
