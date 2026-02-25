import { Check, Crown, Users, Building2, Globe, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from './language-context';

interface PricingTier {
  id: string;
  name: string;
  icon: any;
  memberLimit: string;
  price: number;
  storageYears: number;
  storageFeePerYear: number;
  color: string;
  gradient: string;
  popular?: boolean;
}

export function Pricing() {
  const { t } = useLanguage();
  const [selectedTier, setSelectedTier] = useState<string | null>('family');

  const tiers: PricingTier[] = [
    {
      id: 'roots',
      name: t('pricing.roots'),
      icon: Users,
      memberLimit: `${t('pricing.upTo')} 30 ${t('pricing.members')}`,
      price: 29,
      storageYears: 2,
      storageFeePerYear: 9,
      color: '#E8A05D',
      gradient: 'from-[#E8A05D] to-[#D2691E]'
    },
    {
      id: 'family',
      name: t('pricing.family'),
      icon: Building2,
      memberLimit: `${t('pricing.upTo')} 80 ${t('pricing.members')}`,
      price: 59,
      storageYears: 2,
      storageFeePerYear: 14,
      color: '#D2691E',
      gradient: 'from-[#D2691E] to-[#C2591E]',
      popular: true
    },
    {
      id: 'clan',
      name: t('pricing.clan'),
      icon: Globe,
      memberLimit: `${t('pricing.upTo')} 200 ${t('pricing.members')}`,
      price: 99,
      storageYears: 2,
      storageFeePerYear: 19,
      color: '#2E7D32',
      gradient: 'from-[#2E7D32] to-[#1B5E20]'
    },

  ];

  const features = [
    t('pricing.fullAccess'),
    t('pricing.aiFeatures'),
    t('pricing.whatsapp'),
    t('pricing.familyTree'),
    t('pricing.quiz'),
    `2 ${t('pricing.cloudStorage')}`,
  ];

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#D2691E] to-[#E8A05D] px-6 py-8 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">{t('pricing.title')}</h1>
          <p className="text-white/90 text-base leading-relaxed">
            {t('pricing.noSubscription')}
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 pb-32">
        {/* Value proposition */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-[#2E7D32]" />
            </div>
            <div>
              <h3 className="font-bold text-[#5D4037] mb-1">Honest & Fair Pricing</h3>
              <p className="text-sm text-[#8D6E63] leading-relaxed">
                Pay once for lifetime access. After 2 free years, keep your family archive safe for the price of a coffee per year.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing tiers */}
        <div className="space-y-4 mb-6">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isSelected = selectedTier === tier.id;
            
            return (
              <motion.button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                whileTap={{ scale: 0.98 }}
                className={`w-full rounded-3xl p-5 transition-all relative ${
                  isSelected 
                    ? `bg-gradient-to-br ${tier.gradient} text-white shadow-2xl ring-4 ring-[#5D4037]/10` 
                    : 'bg-white text-[#5D4037] shadow-md border-2 border-[#5D4037]/10'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2E7D32] text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                    {t('pricing.popular')}
                  </div>
                )}

                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    isSelected ? 'bg-white/20 backdrop-blur-sm' : `bg-[${tier.color}]/10`
                  }`}>
                    <Icon className={`w-7 h-7 ${isSelected ? 'text-white' : `text-[${tier.color}]`}`} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-[#5D4037]'}`}>
                      {tier.name}
                    </h3>
                    <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-[#8D6E63]'}`}>
                      {tier.memberLimit}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${isSelected ? 'text-white' : 'text-[#D2691E]'}`}>
                      ${tier.price}
                    </div>
                    <div className={`text-xs ${isSelected ? 'text-white/70' : 'text-[#8D6E63]'}`}>
                      one-time
                    </div>
                  </div>
                </div>

                <div className={`pt-3 border-t ${isSelected ? 'border-white/20' : 'border-[#5D4037]/10'}`}>
                  <div className={`text-xs ${isSelected ? 'text-white/90' : 'text-[#8D6E63]'}`}>
                    Then ${tier.storageFeePerYear}/year after 2 free years
                  </div>
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-5 right-5 w-8 h-8 bg-white rounded-full flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 text-[#2E7D32]" strokeWidth={3} />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* What's included */}
        <div className="bg-white rounded-3xl p-6 shadow-md mb-6">
          <h3 className="font-bold text-[#5D4037] mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-[#2E7D32]" />
            Everything Included Forever
          </h3>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#2E7D32]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-[#2E7D32]" strokeWidth={3} />
                </div>
                <span className="text-sm text-[#5D4037]">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Upgrade logic explainer */}
        <div className="bg-[#E8A05D]/10 rounded-2xl p-4">
          <p className="text-xs text-[#5D4037] leading-relaxed">
            <span className="font-semibold">💡 Need more space later?</span> Upgrading is easy — you only pay the difference. 
            Start small and grow as your family grows.
          </p>
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#5D4037]/10 p-6" style={{ maxWidth: '375px', margin: '0 auto' }}>
        {selectedTier && (
          <div className="mb-3 text-center">
            <div className="text-sm text-[#8D6E63]">Selected: {tiers.find(t => t.id === selectedTier)?.name}</div>
            <div className="text-2xl font-bold text-[#D2691E]">
              ${tiers.find(t => t.id === selectedTier)?.price}
              <span className="text-sm font-normal text-[#8D6E63]"> one-time</span>
            </div>
          </div>
        )}
        <Link to="/payment">
          <button 
            disabled={!selectedTier}
            className="w-full h-16 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-3xl font-semibold shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Continue to Payment
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
        <Link to="/home">
          <button className="w-full mt-2 text-[#8D6E63] text-sm font-medium py-2">
            I'll decide later
          </button>
        </Link>
      </div>
    </div>
  );
}