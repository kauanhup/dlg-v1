import { motion, AnimatePresence } from "framer-motion";

interface SessionTypeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: 'brasileiras' | 'estrangeiras') => void;
}

export const SessionTypeSelectorModal = ({ 
  isOpen, 
  onClose, 
  onSelect 
}: SessionTypeSelectorModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm bg-card border border-border rounded-lg p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-foreground mb-4 text-center">
                Qual tipo de session?
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => onSelect('brasileiras')}
                  className="flex-1 p-4 rounded-lg bg-success/10 hover:bg-success/20 border border-success/30 transition-colors"
                >
                  <span className="text-3xl block mb-2">🇧🇷</span>
                  <span className="text-sm font-medium text-foreground">Brasileiras</span>
                </button>
                <button
                  onClick={() => onSelect('estrangeiras')}
                  className="flex-1 p-4 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 transition-colors"
                >
                  <span className="text-3xl block mb-2">🌍</span>
                  <span className="text-sm font-medium text-foreground">Estrangeiras</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
