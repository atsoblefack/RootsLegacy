import { motion, AnimatePresence } from 'motion/react';
import { Gift, Sparkles, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface RewardNotificationProps {
  familyName: string;
  storageMonths: number;
  show: boolean;
  onClose: () => void;
}

export function RewardNotification({ familyName, storageMonths, show, onClose }: RewardNotificationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([]);

  useEffect(() => {
    if (show) {
      // Generate confetti
      const confettiElements = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: ['#D2691E', '#E8A05D', '#FFD700', '#2E7D32'][Math.floor(Math.random() * 4)],
      }));
      setConfetti(confettiElements);

      // Auto close after 10 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const years = Math.floor(storageMonths / 12);
  const months = storageMonths % 12;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none"
        >
          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confetti.map((conf) => (
              <motion.div
                key={conf.id}
                initial={{ y: -20, x: `${conf.x}%`, opacity: 1, rotate: 0 }}
                animate={{
                  y: window.innerHeight + 50,
                  rotate: 360,
                  opacity: 0,
                }}
                transition={{
                  duration: 3,
                  delay: conf.delay,
                  ease: 'easeIn',
                }}
                className="absolute top-0 w-3 h-3 rounded-full"
                style={{ backgroundColor: conf.color }}
              />
            ))}
          </div>

          {/* Notification Card */}
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="w-full max-w-[375px] bg-gradient-to-br from-[#D2691E] to-[#E8A05D] rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white active:scale-95 transition-transform z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute top-10 left-10 w-32 h-32 rounded-full border-4 border-white"
              />
              <motion.div
                animate={{
                  rotate: [360, 0],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute bottom-10 right-10 w-24 h-24 rounded-full border-4 border-white"
              />
            </div>

            {/* Content */}
            <div className="relative p-6">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.2, duration: 0.8 }}
                  className="relative"
                >
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Gift className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="w-6 h-6 text-[#FFD700]" />
                  </motion.div>
                </motion.div>
              </div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-3"
              >
                <h2 className="text-2xl font-bold text-white mb-2">
                  Félicitations! 🎉
                </h2>
                <p className="text-white/95 text-lg leading-snug">
                  <strong>{familyName}</strong> a rejoint RootsLegacy
                </p>
              </motion.div>

              {/* Reward */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 mb-4"
              >
                <div className="text-center">
                  <div className="text-sm text-[#8D6E63] mb-1">Votre récompense:</div>
                  <div className="text-3xl font-bold text-[#D2691E] mb-1">
                    {years > 0 && (
                      <>
                        {years} an{years > 1 ? 's' : ''}
                        {months > 0 && <span className="text-2xl"> {months}m</span>}
                      </>
                    )}
                    {years === 0 && (
                      <>{months} mois</>
                    )}
                  </div>
                  <div className="text-sm text-[#8D6E63]">
                    de stockage gratuit!
                  </div>
                </div>
              </motion.div>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center text-white/90 text-sm leading-relaxed"
              >
                Le stockage gratuit a été ajouté automatiquement à votre compte. Merci d'avoir partagé RootsLegacy! ❤️
              </motion.p>
            </div>

            {/* Bottom Accent */}
            <div className="h-2 bg-gradient-to-r from-[#FFD700] via-[#E8A05D] to-[#2E7D32]" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to show reward notification
export function useRewardNotification() {
  const [notification, setNotification] = useState<{
    show: boolean;
    familyName: string;
    storageMonths: number;
  }>({
    show: false,
    familyName: '',
    storageMonths: 0,
  });

  const showReward = (familyName: string, storageMonths: number) => {
    setNotification({
      show: true,
      familyName,
      storageMonths,
    });
  };

  const hideReward = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  return {
    ...notification,
    showReward,
    hideReward,
  };
}
