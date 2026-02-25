import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from './gamification-system';
import { useLanguage } from './language-context';

interface BadgeUnlockModalProps {
  badge: Badge | null;
  onClose: () => void;
}

export function BadgeUnlockModal({ badge, onClose }: BadgeUnlockModalProps) {
  const { t } = useLanguage();

  if (!badge) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: "spring", duration: 0.7 }}
          className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Confetti animation effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  y: -20, 
                  x: Math.random() * 300,
                  opacity: 1 
                }}
                animate={{ 
                  y: 400,
                  x: Math.random() * 300 - 50,
                  opacity: 0,
                  rotate: Math.random() * 360
                }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
                className="absolute w-2 h-2 rounded-full"
                style={{ 
                  backgroundColor: ['#D2691E', '#E8A05D', '#2E7D32', '#66BB6A', '#D4183D'][i % 5]
                }}
              />
            ))}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#8D6E63]/10 flex items-center justify-center text-[#8D6E63] hover:bg-[#8D6E63]/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-7xl mb-4"
              style={{ backgroundColor: `${badge.color}20` }}
            >
              {badge.icon}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-[#5D4037] mb-2">
                Nouveau Badge!
              </h2>
              <h3 
                className="text-xl font-bold mb-3"
                style={{ color: badge.color }}
              >
                {badge.name}
              </h3>
              <p className="text-[#8D6E63] leading-relaxed mb-6">
                {badge.description}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-3"
            >
              <button
                onClick={onClose}
                className="w-full h-12 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform"
              >
                Génial! 🎉
              </button>

              <button
                onClick={() => {
                  // Share functionality
                  console.log('Share badge');
                }}
                className="w-full h-12 bg-white border-2 border-[#D2691E] text-[#D2691E] rounded-2xl font-semibold active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Partager
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}