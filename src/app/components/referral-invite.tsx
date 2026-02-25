import { useState, useEffect } from 'react';
import { Gift, Heart, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { projectId, serverBaseUrl } from '../../../utils/supabase/info';

interface ReferralInfo {
  familyName: string;
  bonusMonths: number;
}

export function ReferralInvite() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadReferralInfo();
  }, [code]);

  const loadReferralInfo = async () => {
    if (!code) {
      setError(true);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${serverBaseUrl}/referrals/code/${code}`
      );

      if (response.ok) {
        const data = await response.json();
        setReferralInfo(data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Load referral error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueSignup = () => {
    // Store referral code for signup process
    sessionStorage.setItem('referral_code', code || '');
    navigate('/signup');
  };

  if (loading) {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !referralInfo) {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4">
          <span className="text-4xl">❌</span>
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Lien invalide
        </h1>
        <p className="text-white/90 text-center mb-6">
          Ce lien de parrainage n'est pas valide ou a expiré.
        </p>
        <button
          onClick={() => navigate('/')}
          className="h-12 bg-white text-[#D2691E] px-6 rounded-2xl font-semibold active:scale-95 transition-transform"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex flex-col overflow-hidden relative">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white" />
        <div className="absolute bottom-32 right-10 w-24 h-24 rounded-full bg-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-white" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 p-8">
        {/* Gift Icon Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 1, bounce: 0.5 }}
          className="mb-6"
        >
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center relative">
            <Gift className="w-12 h-12 text-white" strokeWidth={2.5} />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ delay: 0.5, duration: 1, repeat: Infinity, repeatDelay: 2 }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-6 h-6 text-[#FFD700]" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-3">
            Bienvenue sur RootsLegacy! 🎉
          </h1>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-white" />
            <p className="text-lg text-white/95">
              Invité par <strong>{referralInfo.familyName}</strong>
            </p>
          </div>
        </motion.div>

        {/* Bonus Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6"
        >
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-[#5D4037] mb-2">
              Bonus de bienvenue!
            </h2>
            
            <div className="bg-[#FFF8E7] rounded-2xl p-4 mb-4">
              <div className="text-4xl font-bold text-[#D2691E] mb-1">
                {referralInfo.bonusMonths} mois
              </div>
              <div className="text-sm text-[#8D6E63]">
                de stockage cloud gratuit
              </div>
            </div>

            <p className="text-sm text-[#5D4037] leading-relaxed">
              En rejoignant via ce lien, vous recevrez automatiquement <strong>{referralInfo.bonusMonths} mois de stockage gratuit</strong> dès votre premier paiement de <strong>$29 minimum</strong>.
            </p>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full space-y-3 mb-8"
        >
          {[
            { icon: '🌳', text: 'Préservez votre héritage familial' },
            { icon: '📸', text: 'Partagez photos et histoires' },
            { icon: '🤝', text: 'Collaborez avec toute la famille' },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl p-3"
            >
              <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-xl flex-shrink-0">
                {item.icon}
              </div>
              <div className="text-white font-medium text-sm">{item.text}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinueSignup}
          className="w-full h-14 bg-white text-[#D2691E] font-bold text-lg rounded-3xl shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          Commencer maintenant
          <ArrowRight className="w-5 h-5" />
        </motion.button>

        {/* Terms */}
        <p className="text-xs text-white/70 text-center mt-4 px-4">
          Le bonus sera crédité après votre premier paiement
        </p>
      </div>
    </div>
  );
}