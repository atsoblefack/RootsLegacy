import { useState, useEffect } from 'react';
import { X, CreditCard, Crown, Check, AlertTriangle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { supabase } from '../../../utils/supabase/client';
import { toast } from 'sonner';

interface Subscription {
  plan: string;
  status: string;
  memberLimit: number;
  trialEndDate?: string;
  features: {
    maxMembers: number;
    photoUpload: boolean;
    pdfExport: boolean;
    whatsappIntegration: boolean;
    collaborativeEditing: boolean;
    advancedSearch: boolean;
    heritageBook: boolean;
  };
}

export function SubscriptionUpgrade() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expirée');
        navigate('/');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-467d3bfa/subscription`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors du chargement de l\'abonnement');
      }

      const data = await response.json();
      setSubscription(data.subscription);
      setDaysRemaining(data.daysRemaining);
    } catch (error: any) {
      console.error('Load subscription error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: string, price: number) => {
    setUpgrading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expirée');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-467d3bfa/subscription/upgrade`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan,
            paymentAmount: price,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la mise à niveau');
      }

      const data = await response.json();
      toast.success(`Félicitations! Vous êtes passé au plan ${plan.toUpperCase()} 🎉`);
      setSubscription(data.subscription);
      setSelectedPlan(null);
      await loadSubscription();
    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast.error(error.message);
    } finally {
      setUpgrading(false);
    }
  };

  const plans = [
    {
      id: 'family',
      name: 'Family',
      price: 29.99,
      members: 50,
      icon: '👨‍👩‍👧‍👦',
      features: [
        'Jusqu\'à 50 membres',
        'Upload de photos',
        'Intégration WhatsApp',
        'Édition collaborative',
        'Recherche avancée',
      ],
    },
    {
      id: 'clan',
      name: 'Clan',
      price: 59.99,
      members: 150,
      icon: '🌳',
      popular: true,
      features: [
        'Jusqu\'à 150 membres',
        'Upload de photos',
        'Intégration WhatsApp',
        'Édition collaborative',
        'Recherche avancée',
      ],
    },
    {
      id: 'heritage',
      name: 'Heritage',
      price: 99,
      members: 500,
      icon: '👑',
      features: [
        'Jusqu\'à 500 membres',
        'Upload de photos',
        'Export PDF',
        'Heritage Book',
        'Intégration WhatsApp',
        'Édition collaborative',
        'Recherche avancée',
      ],
    },
  ];

  if (loading) {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#D2691E]/20 border-t-[#D2691E] animate-spin mx-auto mb-3" />
          <p className="text-[#8D6E63]">Chargement...</p>
        </div>
      </div>
    );
  }

  const isExpired = subscription?.status === 'expired';
  const isTrial = subscription?.plan === 'trial' && subscription?.status === 'active';

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-[#5D4037]/10 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-[#FFF8E7] flex items-center justify-center text-[#5D4037] active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#5D4037]">Abonnement</h1>
            <p className="text-sm text-[#8D6E63]">Choisissez votre plan</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Current Status */}
        {isTrial && daysRemaining !== null && (
          <div className={`rounded-3xl p-4 border-2 ${
            daysRemaining <= 7 
              ? 'bg-[#E8A05D]/10 border-[#D2691E]' 
              : 'bg-white border-[#5D4037]/10'
          }`}>
            <div className="flex items-start gap-3">
              {daysRemaining <= 7 ? (
                <AlertTriangle className="w-5 h-5 text-[#D2691E] flex-shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-5 h-5 text-[#8D6E63] flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-[#5D4037] mb-1">Essai gratuit actif</h3>
                <p className="text-sm text-[#8D6E63]">
                  {daysRemaining === 1 
                    ? 'Dernier jour d\'essai gratuit !' 
                    : `Plus que ${daysRemaining} jours d'essai gratuit`}
                </p>
                <p className="text-xs text-[#8D6E63] mt-2">
                  Après l'essai, votre compte passera en lecture seule jusqu'à ce que vous choisissiez un plan.
                </p>
              </div>
            </div>
          </div>
        )}

        {isExpired && (
          <div className="bg-[#E8A05D]/10 border-2 border-[#D2691E] rounded-3xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#D2691E] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-[#5D4037] mb-1">Essai expiré</h3>
                <p className="text-sm text-[#8D6E63]">
                  Votre essai gratuit a expiré. Votre compte est maintenant en lecture seule.
                </p>
                <p className="text-xs text-[#8D6E63] mt-2">
                  Choisissez un plan ci-dessous pour continuer à utiliser toutes les fonctionnalités.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Plans */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#5D4037]">Plans disponibles</h2>
          
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              className={`relative bg-white rounded-3xl p-5 border-2 transition-all ${
                plan.popular 
                  ? 'border-[#D2691E] shadow-lg' 
                  : 'border-[#5D4037]/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D2691E] text-white text-xs font-bold px-4 py-1 rounded-full">
                  POPULAIRE
                </div>
              )}
              
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{plan.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#5D4037]">{plan.name}</h3>
                  <p className="text-sm text-[#8D6E63]">{plan.members} membres max</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#D2691E]">${plan.price}</div>
                  <div className="text-xs text-[#8D6E63]">/mois</div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#D2691E] flex-shrink-0" />
                    <span className="text-sm text-[#5D4037]">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleUpgrade(plan.id, plan.price)}
                disabled={upgrading || subscription?.plan === plan.id}
                className={`w-full h-11 rounded-2xl font-semibold transition-all active:scale-98 flex items-center justify-center gap-2 ${
                  subscription?.plan === plan.id
                    ? 'bg-[#FFF8E7] text-[#8D6E63] cursor-not-allowed'
                    : plan.popular
                    ? 'bg-gradient-to-r from-[#D2691E] to-[#E8A05D] text-white'
                    : 'bg-[#D2691E] text-white'
                }`}
              >
                {upgrading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Traitement...
                  </>
                ) : subscription?.plan === plan.id ? (
                  <>
                    <Crown className="w-4 h-4" />
                    Plan actuel
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Choisir ce plan
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Info Footer */}
        <div className="bg-white rounded-3xl p-4 border border-[#5D4037]/10">
          <p className="text-xs text-[#8D6E63] text-center">
            💳 Paiement sécurisé • Annulation à tout moment • Support 24/7
          </p>
        </div>
      </div>
    </div>
  );
}
