import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLevelLabel } from "@/components/dashboard/DashboardHeader";
import { Star } from "lucide-react";

interface LevelUpOverlayProps {
  level: number | null;
  onDismiss: () => void;
}

export function LevelUpOverlay({ level, onDismiss }: LevelUpOverlayProps) {
  useEffect(() => {
    if (level) {
      const timer = setTimeout(onDismiss, 4000);
      return () => clearTimeout(timer);
    }
  }, [level, onDismiss]);

  return (
    <AnimatePresence>
      {level && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="text-center"
          >
            {/* Glow circle */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-32 h-32 mx-auto rounded-full gradient-neon mb-6"
              style={{ filter: "blur(20px)" }}
            />

            <motion.div
              initial={{ y: 20 }}
              animate={{ y: -40 }}
              transition={{ delay: 0.2 }}
            >
              <Star size={48} className="text-primary mx-auto mb-3" fill="currentColor" />
              <h2 className="font-display font-bold text-3xl text-foreground mb-1">Level Up!</h2>
              <p className="text-xl font-display font-semibold text-primary mb-2">
                Level {level}: {getLevelLabel(level)}
              </p>
              <p className="text-sm text-muted-foreground">Weiter so! 🚀</p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
