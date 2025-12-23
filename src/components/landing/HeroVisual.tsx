import { motion } from "framer-motion";
import { Users, ArrowRight, Check, Shield, Clock } from "lucide-react";

export const HeroVisual = () => {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Main Bot Interface Preview */}
      <motion.div
        className="relative bg-[hsl(220,15%,8%)] border border-[hsl(220,15%,18%)] rounded-xl overflow-hidden shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Header */}
        <div className="bg-[hsl(220,15%,12%)] px-4 py-3 border-b border-[hsl(220,15%,18%)] flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-muted-foreground ml-2">TeleGrow Bot</span>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Action in Progress */}
          <motion.div
            className="bg-[hsl(220,15%,12%)] rounded-lg p-3 border border-primary/30"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-xs font-medium text-foreground">Extraindo membros</span>
              </div>
              <span className="text-[10px] text-primary font-medium">Em andamento</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Grupo: Marketing Digital BR</span>
                <span>847 / 1.200</span>
              </div>
              <div className="h-1.5 bg-[hsl(220,15%,18%)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "70%" }}
                  transition={{ duration: 2, delay: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>

          {/* Completed Actions */}
          <motion.div
            className="bg-[hsl(220,15%,12%)] rounded-lg p-3 border border-[hsl(220,15%,18%)]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-green-500" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-medium text-foreground">Membros adicionados</span>
                <p className="text-[10px] text-muted-foreground">+156 membros • Cripto Traders</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            className="grid grid-cols-3 gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="bg-[hsl(220,15%,12%)] rounded-lg p-2 text-center border border-[hsl(220,15%,18%)]">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Users className="w-3 h-3 text-primary" />
              </div>
              <p className="text-sm font-bold text-foreground">3</p>
              <p className="text-[9px] text-muted-foreground">Contas</p>
            </div>
            <div className="bg-[hsl(220,15%,12%)] rounded-lg p-2 text-center border border-[hsl(220,15%,18%)]">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Shield className="w-3 h-3 text-green-500" />
              </div>
              <p className="text-sm font-bold text-foreground">100%</p>
              <p className="text-[9px] text-muted-foreground">Seguro</p>
            </div>
            <div className="bg-[hsl(220,15%,12%)] rounded-lg p-2 text-center border border-[hsl(220,15%,18%)]">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Clock className="w-3 h-3 text-yellow-500" />
              </div>
              <p className="text-sm font-bold text-foreground">Auto</p>
              <p className="text-[9px] text-muted-foreground">Delay</p>
            </div>
          </motion.div>

          {/* Next Action */}
          <motion.div
            className="flex items-center justify-between bg-[hsl(220,15%,12%)] rounded-lg p-2.5 border border-[hsl(220,15%,18%)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                <ArrowRight className="w-3 h-3 text-primary" />
              </div>
              <span className="text-[10px] text-muted-foreground">Próximo: Adicionar ao grupo Vendas</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        className="absolute -top-3 -right-3 bg-green-500/20 border border-green-500/30 rounded-lg px-2.5 py-1.5 backdrop-blur-sm"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-medium text-green-500">Ativo</span>
        </div>
      </motion.div>

      <motion.div
        className="absolute -bottom-2 -left-2 bg-[hsl(220,15%,10%)] border border-[hsl(220,15%,20%)] rounded-lg px-2.5 py-1.5 backdrop-blur-sm"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.4 }}
      >
        <span className="text-[10px] text-muted-foreground">Delay inteligente: 45-90s</span>
      </motion.div>
    </div>
  );
};
