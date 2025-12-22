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
    <div className="bg-card border border-border rounded-lg p-3 sm:p-5">
      <h3 className="font-semibold text-foreground mb-2 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
        <Package className="w-4 h-4 text-primary" />
        Quantidade Personalizada
      </h3>
      <p className="text-[10px] sm:text-xs text-muted-foreground mb-3 sm:mb-4">
        Permite que usuários escolham uma quantidade personalizada além dos combos
      </p>
      
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Brasileiras */}
        <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-success/5 border border-success/20 rounded-lg">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1.5 sm:gap-2">
              🇧🇷 <span className="hidden xs:inline">Sessions</span> Brasileiras
            </span>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={customQtyBrEnabled}
                onChange={(e) => onCustomQtyBrEnabledChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 sm:w-11 sm:h-6 bg-muted rounded-full peer peer-checked:bg-success peer-focus:ring-2 peer-focus:ring-success/50 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:after:translate-x-4 sm:peer-checked:after:translate-x-full"></div>
            </label>
          </div>
          {customQtyBrEnabled && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1 sm:pt-2">
              <div>
                <label className="text-[10px] sm:text-xs text-muted-foreground mb-1 block">Qtd. Mín.</label>
                <input
                  type="number"
                  min="1"
                  value={customQtyBrMin}
                  onChange={(e) => onCustomQtyBrMinChange(e.target.value)}
                  className="w-full px-2 py-1 sm:py-1.5 text-xs sm:text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-[10px] sm:text-xs text-muted-foreground mb-1 block">Preço/Un. (R$)</label>
                <input
                  type="text"
                  value={customQtyBrPrice}
                  onChange={(e) => onCustomQtyBrPriceChange(e.target.value)}
                  className="w-full px-2 py-1 sm:py-1.5 text-xs sm:text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="5.00"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Estrangeiras */}
        <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1.5 sm:gap-2">
              🌍 <span className="hidden xs:inline">Sessions</span> Estrangeiras
            </span>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={customQtyEstEnabled}
                onChange={(e) => onCustomQtyEstEnabledChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 sm:w-11 sm:h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/50 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:after:translate-x-4 sm:peer-checked:after:translate-x-full"></div>
            </label>
          </div>
          {customQtyEstEnabled && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1 sm:pt-2">
              <div>
                <label className="text-[10px] sm:text-xs text-muted-foreground mb-1 block">Qtd. Mín.</label>
                <input
                  type="number"
                  min="1"
                  value={customQtyEstMin}
                  onChange={(e) => onCustomQtyEstMinChange(e.target.value)}
                  className="w-full px-2 py-1 sm:py-1.5 text-xs sm:text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-[10px] sm:text-xs text-muted-foreground mb-1 block">Preço/Un. (R$)</label>
                <input
                  type="text"
                  value={customQtyEstPrice}
                  onChange={(e) => onCustomQtyEstPriceChange(e.target.value)}
                  className="w-full px-2 py-1 sm:py-1.5 text-xs sm:text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
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
