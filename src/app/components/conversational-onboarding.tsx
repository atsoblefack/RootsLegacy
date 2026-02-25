import { Mic, Volume2, Languages } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './language-context';

const conversations = [
  {
    ai: "Hello! I'm here to help you build your family tree. 👋 What's your name?",
    userExample: "My name is Amara Johnson"
  },
  {
    ai: "Nice to meet you, Amara! 😊 Where were you born?",
    userExample: "I was born in Accra, Ghana"
  },
  {
    ai: "Beautiful! 🌍 When is your birthday?",
    userExample: "March 15, 2015"
  },
  {
    ai: "Perfect! Now, let's talk about your parents. What's your father's name?",
    userExample: "His name is Kwasi Johnson"
  },
  {
    ai: "Great! And your mother's name?",
    userExample: "Her name is Akosua Johnson"
  },
  {
    ai: "Wonderful! 🎉 You've created the foundation of your family tree. Would you like to add more family members, or explore other ways to grow your tree?",
    userExample: ""
  }
];

export function ConversationalOnboarding() {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [showLanguages, setShowLanguages] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
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
      if (step < conversations.length - 1) {
        setStep(step + 1);
      }
    }, 2000);
  };

  const handleNext = () => {
    if (step < conversations.length - 1) {
      setStep(step + 1);
    }
  };

  const currentConversation = conversations[step];
  const isLastStep = step === conversations.length - 1;

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#5D4037]/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#5D4037]">Let's Get Started</h1>
            <p className="text-sm text-[#8D6E63]">Step {step + 1} of {conversations.length}</p>
          </div>
          <button 
            onClick={() => setShowLanguages(!showLanguages)}
            className="flex items-center gap-2 px-3 py-2 bg-[#FFF8E7] rounded-xl text-sm font-medium text-[#D2691E]"
          >
            <Languages className="w-4 h-4" />
            <span className="hidden sm:inline">{selectedLanguage}</span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-[#F5E6D3] rounded-full overflow-hidden mt-4">
          <motion.div
            className="h-full bg-gradient-to-r from-[#D2691E] to-[#E8A05D]"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / conversations.length) * 100}%` }}
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
              <h3 className="text-lg font-bold text-[#5D4037] mb-4">Choose Language</h3>
              <div className="space-y-2 mb-4">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLanguage(lang.name);
                      setShowLanguages(false);
                    }}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-colors ${
                      selectedLanguage === lang.name
                        ? 'bg-[#D2691E] text-white'
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
            {step > 0 && conversations[step - 1].userExample && (
              <div className="flex gap-3 justify-end mb-6">
                <div className="flex-1 max-w-[80%]">
                  <div className="bg-[#D2691E] rounded-3xl rounded-tr-md p-4 shadow-md">
                    <p className="text-white leading-relaxed">{conversations[step - 1].userExample}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Input suggestion if there's an example */}
            {!isLastStep && currentConversation.userExample && (
              <div className="bg-[#E8A05D]/10 border-2 border-dashed border-[#E8A05D]/30 rounded-2xl p-4">
                <p className="text-xs text-[#8D6E63] mb-2">Example response:</p>
                <p className="text-[#5D4037] italic">"{currentConversation.userExample}"</p>
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
            <Link to="/input-methods">
              <button className="w-full h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform">
                Explore More Ways to Add Family
              </button>
            </Link>
            <Link to="/home">
              <button className="w-full h-14 bg-white text-[#D2691E] rounded-2xl font-semibold border-2 border-[#D2691E]/20 active:scale-95 transition-transform">
                View My Family Tree
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
                : 'bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white'
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