import { Mic, Volume2, Languages, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './language-context';

export function AdminOnboarding() {
  const { t, language, setLanguage } = useLanguage();
  const [step, setStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);

  // Conversations with translations
  const adminConversations = [
    {
      ai: t('ai.welcomeMessage'),
      userExample: t('ai.exampleName')
    },
    {
      ai: t('ai.niceMeet').replace('{name}', 'Amara'),
      userExample: t('ai.exampleParents')
    },
    {
      ai: t('ai.askSiblings'),
      userExample: t('ai.exampleSiblings')
    },
    {
      ai: t('ai.askGrandparents'),
      userExample: t('ai.exampleGrandparents')
    },
    {
      ai: t('ai.continueOrInvite'),
      userExample: ""
    }
  ];

  const languages = [
    { code: 'en' as const, name: 'English', flag: '🇬🇧' },
    { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
    { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
    { code: 'yo', name: 'Yorùbá', flag: '🇳🇬' },
    { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
    { code: 'am', name: 'አማርኛ (Amharic)', flag: '🇪🇹' },
  ];

  const handleVoiceInput = () => {
    setIsListening(true);
    // Simulate voice input
    setTimeout(() => {
      setIsListening(false);
      if (step < adminConversations.length - 1) {
        setStep(step + 1);
      }
    }, 2000);
  };

  const handleNext = () => {
    if (step < adminConversations.length - 1) {
      setStep(step + 1);
    }
  };

  const currentConversation = adminConversations[step];
  const isLastStep = step === adminConversations.length - 1;

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#8B4513] to-[#5D4037] px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/90 text-xs font-bold uppercase tracking-wide">{t('onboarding.adminSetup')}</span>
            </div>
            <h1 className="text-xl font-bold text-white">{t('onboarding.buildTree')}</h1>
            <p className="text-sm text-white/80">{t('onboarding.step')} {step + 1} {t('quiz.of')} {adminConversations.length}</p>
          </div>
          <button 
            onClick={() => setShowLanguages(!showLanguages)}
            className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-sm font-medium text-white"
          >
            <Languages className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mt-3">
          <motion.div
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / adminConversations.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Language Selector Modal */}
      <AnimatePresence>
        {showLanguages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowLanguages(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full rounded-t-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-[#5D4037] mb-4">{t('onboarding.chooseLanguage')}</h3>
              <div className="space-y-2 mb-4">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLanguages(false);
                    }}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-colors ${
                      language === lang.code
                        ? 'bg-[#8B4513] text-white'
                        : 'bg-[#FFF8E7] text-[#5D4037]'
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conversation */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Admin privilege banner - shown at start */}
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#8B4513] to-[#5D4037] rounded-3xl p-5 text-white mb-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold mb-1">{t('onboarding.youreAdmin')}</h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  {t('onboarding.adminPrivilege')}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* AI Message */}
            <div className="flex gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex items-center justify-center flex-shrink-0">
                <Volume2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="bg-white rounded-3xl rounded-tl-md p-4 shadow-md">
                  <p className="text-[#5D4037] leading-relaxed">{currentConversation.ai}</p>
                </div>
              </div>
            </div>

            {/* User Response (if not first message) */}
            {step > 0 && adminConversations[step - 1].userExample && (
              <div className="flex gap-3 justify-end mb-6">
                <div className="flex-1 max-w-[80%]">
                  <div className="bg-[#8B4513] rounded-3xl rounded-tr-md p-4 shadow-md">
                    <p className="text-white leading-relaxed">{adminConversations[step - 1].userExample}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk add indicator for multi-person responses */}
            {step >= 1 && step < adminConversations.length - 1 && (
              <div className="bg-[#2E7D32]/10 border-2 border-[#2E7D32]/30 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-[#2E7D32]" />
                  <p className="text-xs font-semibold text-[#2E7D32] uppercase">{t('onboarding.adminPower')}</p>
                </div>
                <p className="text-sm text-[#5D4037]">
                  {t('onboarding.bulkAddDesc')}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Final step options */}
        {isLastStep && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 mt-6"
          >
            <button 
              onClick={handleNext}
              className="w-full h-14 bg-gradient-to-br from-[#8B4513] to-[#5D4037] text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform"
            >
              {t('onboarding.continueAddingFamily')}
            </button>
            <Link to="/input-methods">
              <button className="w-full h-14 bg-white text-[#8B4513] rounded-2xl font-semibold border-2 border-[#8B4513]/20 active:scale-95 transition-transform">
                {t('onboarding.switchInput')}
              </button>
            </Link>
            <Link to="/invite-members">
              <button className="w-full h-14 bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] text-white rounded-2xl font-semibold active:scale-95 transition-transform flex items-center justify-center gap-2">
                {t('onboarding.inviteFamilySelfFill')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Voice Input Button */}
      {!isLastStep && (
        <div className="p-6 bg-white border-t border-[#5D4037]/10">
          <button
            onClick={handleVoiceInput}
            disabled={isListening}
            className={`w-full h-16 rounded-3xl font-semibold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 ${
              isListening
                ? 'bg-[#d4183d] text-white animate-pulse'
                : 'bg-gradient-to-br from-[#8B4513] to-[#5D4037] text-white'
            }`}
          >
            <Mic className="w-6 h-6" />
            {isListening ? t('onboarding.listening') : t('onboarding.holdToSpeak')}
          </button>
          <button
            onClick={handleNext}
            className="w-full mt-3 text-[#8D6E63] text-sm font-medium"
          >
            {t('onboarding.skipType')}
          </button>
        </div>
      )}
    </div>
  );
}