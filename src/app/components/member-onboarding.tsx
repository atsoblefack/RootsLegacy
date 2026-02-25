import { Mic, Volume2, User, CheckCircle } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './language-context';

const memberConversations = [
  {
    ai: "Hi! Welcome to the Johnson Family Tree. 👋 Amara invited you to add your information. What's your name?",
    userExample: "My name is Kwame Mensah"
  },
  {
    ai: "Nice to meet you, Kwame! Where were you born?",
    userExample: "I was born in Kumasi, Ghana"
  },
  {
    ai: "Great! And when is your birthday?",
    userExample: "January 15, 1945"
  },
  {
    ai: "Perfect! That's all we need for now. Amara (the admin) will connect you to the rest of the family tree. Thank you! 🎉",
    userExample: ""
  }
];

interface MemberOnboardingProps {
  inviteCode?: string;
}

export function MemberOnboarding({ inviteCode = 'AMR-FAM-2024' }: MemberOnboardingProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      if (step < memberConversations.length - 1) {
        setStep(step + 1);
      }
    }, 2000);
  };

  const handleNext = () => {
    if (step < memberConversations.length - 1) {
      setStep(step + 1);
    }
  };

  const currentConversation = memberConversations[step];
  const isLastStep = step === memberConversations.length - 1;

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/90 text-xs font-bold uppercase tracking-wide">Member Setup</span>
            </div>
            <h1 className="text-xl font-bold text-white">Add Your Info</h1>
            <p className="text-sm text-white/80">Step {step + 1} of {memberConversations.length}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mt-3">
          <motion.div
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / memberConversations.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Member info banner */}
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-5 shadow-md mb-4 border-2 border-[#2E7D32]/20"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-[#2E7D32]" />
              </div>
              <div>
                <h3 className="font-bold text-[#5D4037] mb-1">Quick & Easy</h3>
                <p className="text-[#8D6E63] text-sm leading-relaxed">
                  Just add your personal information. The admin will handle connecting you to the family tree.
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

            {/* User Response */}
            {step > 0 && memberConversations[step - 1].userExample && (
              <div className="flex gap-3 justify-end mb-6">
                <div className="flex-1 max-w-[80%]">
                  <div className="bg-[#2E7D32] rounded-3xl rounded-tr-md p-4 shadow-md">
                    <p className="text-white leading-relaxed">{memberConversations[step - 1].userExample}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Final step success */}
        {isLastStep && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 mt-6"
          >
            <div className="bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] rounded-3xl p-6 text-center text-white mb-4">
              <div className="text-6xl mb-3">✓</div>
              <h3 className="text-xl font-bold mb-2">All Set!</h3>
              <p className="text-white/90 text-sm">
                Your information has been added. Amara will connect you to the family tree soon.
              </p>
            </div>

            <Link to="/home">
              <button className="w-full h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform">
                View Family Tree
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
                : 'bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] text-white'
            }`}
          >
            <Mic className="w-6 h-6" />
            {isListening ? 'Listening...' : 'Tap to Speak'}
          </button>
          <button
            onClick={handleNext}
            className="w-full mt-3 text-[#8D6E63] text-sm font-medium"
          >
            Skip • Type instead
          </button>
        </div>
      )}
    </div>
  );
}