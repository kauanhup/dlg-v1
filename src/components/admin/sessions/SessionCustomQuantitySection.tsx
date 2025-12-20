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
    <div className="bg-card border border-border rounded-lg p-5">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <Package className="w-4 h-4 text-primary" />
        Quantidade Personalizada
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Permite que usuários escolham uma quantidade personalizada além dos combos
      </p>
      
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Brasileiras */}
        <div className="space-y-3 p-4 bg-success/5 border border-success/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              🇧🇷 Sessions Brasileiras
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={customQtyBrEnabled}
                onChange={(e) => onCustomQtyBrEnabledChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-success peer-focus:ring-2 peer-focus:ring-success/50 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>
          {customQtyBrEnabled && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Quantidade Mín.</label>
                <input
                  type="number"
                  min="1"
                  value={customQtyBrMin}
                  onChange={(e) => onCustomQtyBrMinChange(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Preço/Unid. (R$)</label>
                <input
                  type="text"
                  value={customQtyBrPrice}
                  onChange={(e) => onCustomQtyBrPriceChange(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="5.00"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Estrangeiras */}
        <div className="space-y-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              🌍 Sessions Estrangeiras
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={customQtyEstEnabled}
                onChange={(e) => onCustomQtyEstEnabledChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/50 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>
          {customQtyEstEnabled && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Quantidade Mín.</label>
                <input
                  type="number"
                  min="1"
                  value={customQtyEstMin}
                  onChange={(e) => onCustomQtyEstMinChange(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Preço/Unid. (R$)</label>
                <input
                  type="text"
                  value={customQtyEstPrice}
                  onChange={(e) => onCustomQtyEstPriceChange(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="2.50"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
