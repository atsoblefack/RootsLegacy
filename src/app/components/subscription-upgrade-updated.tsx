import { getSessionFromStorage } from '../../../utils/supabase/useSession';
import { useState, useEffect } from 'react';
import { X, CreditCard, Crown, Check, AlertTriangle, Clock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { projectId, serverBaseUrl } from '../../../utils/supabase/info';
import { useAuth } from './auth-context';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  lifetimePrice: number;
  storageIncludedYears: number;
  storageAnnualPrice: number;
  memberLimit: number;
  icon: string;
}

export function SubscriptionUpgradeUpdated() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const session = getSessionFromStorage(); // Fixed: avoid lock deadlock
      if (!session) {
        navigate('/');
        return;
      }

      // Load pricing config
      const response = await fetch(
        `${serverBaseUrl}/pricing`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const formattedPlans: Plan[] = data.plans.map((p: any) => ({
          id: p.plan_id,
          name: p.plan_id.charAt(0).toUpperCase() + p.plan_id.slice(1),
          lifetimePrice: p.lifetime_price,
          storageIncludedYears: p.storage_included_years,
          storageAnnualPrice: p.storage_annual_price,
          memberLimit: p.member_limit,
          icon: p.plan_id === 'roots' ? '🌱' : p.plan_id === 'family' ? '👨‍👩‍👧‍👦' : '👑',
        }));
        setPlans(formattedPlans);
      }
    } catch (error: any) {
      console.error('Load plans error:', error);
      toast.error('Erreur lors du chargement des plans');
    } finally {
      setLoading(false);
    }
  };

  const handleContactUs = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    const subject = `Demande d'activation du plan ${plan?.name}`;
    const body = `Je souhaite activer le plan ${plan?.name} pour ma famille.`;
    window.location.href = `mailto:contact@rootslegacy.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

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
            <h1 className="text-2xl font-bold text-[#5D4037]">Plans</h1>
            <p className="text-sm text-[#8D6E63]">Paiement unique + stockage annuel</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Value Proposition */}
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 flex items-center justify-center flex-shrink-0">
              <Check className="w-6 h-6 text-[#2E7D32]" />
            </div>
            <div>
              <h3 className="font-bold text-[#5D4037] mb-1">Tarification honnête et juste</h3>
              <p className="text-sm text-[#8D6E63] leading-relaxed">
                Paiement unique pour accès à vie. Stockage inclus selon le plan. Renouvellement annuel optionnel après la période incluse.
              </p>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#5D4037]">Choisissez votre plan</h2>
          
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              className="relative bg-white rounded-3xl p-5 border-2 border-[#5D4037]/10 shadow-md transition-all hover:shadow-lg"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{plan.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#5D4037]">{plan.name}</h3>
                  <p className="text-sm text-[#8D6E63]">Jusqu'à {plan.memberLimit} membres</p>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-[#FFF8E7] rounded-2xl p-4 mb-4">
                <div className="mb-3">
                  <div className="text-xs font-semibold text-[#8D6E63] mb-1">PAIEMENT UNIQUE</div>
                  <div className="text-3xl font-bold text-[#D2691E]">${plan.lifetimePrice}</div>
                  <div className="text-xs text-[#8D6E63] mt-1">
                    Accès à vie + {plan.storageIncludedYears} an{plan.storageIncludedYears > 1 ? 's' : ''} de stockage inclus
                  </div>
                </div>

                <div className="border-t border-[#D2691E]/20 pt-3">
                  <div className="text-xs font-semibold text-[#8D6E63] mb-1">RENOUVELLEMENT ANNUEL (après {plan.storageIncludedYears} an{plan.storageIncludedYears > 1 ? 's' : ''})</div>
                  <div className="text-lg font-bold text-[#5D4037]">${plan.storageAnnualPrice}/an</div>
                  <div className="text-xs text-[#8D6E63] mt-1">Stockage cloud illimité</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#D2691E] flex-shrink-0" />
                  <span className="text-sm text-[#5D4037]">Accès complet à vie</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#D2691E] flex-shrink-0" />
                  <span className="text-sm text-[#5D4037]">Upload de photos illimité</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#D2691E] flex-shrink-0" />
                  <span className="text-sm text-[#5D4037]">Intégration WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#D2691E] flex-shrink-0" />
                  <span className="text-sm text-[#5D4037]">Édition collaborative</span>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleContactUs(plan.id)}
                className="w-full h-11 rounded-2xl font-semibold transition-all active:scale-98 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D2691E] to-[#E8A05D] text-white hover:shadow-lg"
              >
                <Mail className="w-4 h-4" />
                Disponible bientôt — Contactez-nous
              </button>
            </motion.div>
          ))}
        </div>

        {/* Info Footer */}
        <div className="bg-white rounded-3xl p-4 border border-[#5D4037]/10">
          <p className="text-xs text-[#8D6E63] text-center">
            💳 Paiement sécurisé • Données jamais supprimées • Support 24/7
          </p>
        </div>
      </div>
    </div>
  );
}
