import { TreePine, Languages, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useLanguage } from './language-context';
import { supabase } from '../../../utils/supabase/client';

export function Splash() {
  const { language, setLanguage, t } = useLanguage();
  const [showLanguages, setShowLanguages] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // User is logged in, redirect to home
        navigate('/home');
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setCheckingSession(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-gradient-to-br from-[#E8A05D] via-[#D2691E] to-[#5D4037] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const languages = [
    { code: 'en' as const, name: 'English', flag: '🇬🇧' },
    { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
  ];

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-gradient-to-br from-[#E8A05D] via-[#D2691E] to-[#5D4037] flex flex-col items-center justify-between p-8 overflow-hidden relative">
      {/* Decorative pattern background */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="25" cy="25" r="2" fill="white" />
              <circle cx="75" cy="75" r="2" fill="white" />
              <path d="M 50 20 L 50 80" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern)" />
        </svg>
      </div>

      {/* Language selector button - top right */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="w-full flex justify-end z-10"
      >
        <button
          onClick={() => setShowLanguages(!showLanguages)}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-2xl text-white font-medium hover:bg-white/30 transition-all active:scale-95"
        >
          <Languages className="w-5 h-5" />
          <span className="text-sm">
            {languages.find(l => l.code === language)?.flag} {languages.find(l => l.code === language)?.name}
          </span>
        </button>
      </motion.div>

      {/* Language selection modal */}
      <AnimatePresence>
        {showLanguages && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowLanguages(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-50"
            >
              <h3 className="text-xl font-bold text-[#5D4037] mb-4 flex items-center gap-2">
                <Languages className="w-6 h-6 text-[#D2691E]" />
                {t('splash.selectLanguage')}
              </h3>
              <div className="space-y-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLanguages(false);
                    }}
                    className={`w-full rounded-2xl p-4 text-left transition-all flex items-center justify-between ${
                      language === lang.code
                        ? 'bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white shadow-md'
                        : 'bg-[#FFF8E7] text-[#5D4037] hover:bg-[#F5E6D3]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{lang.flag}</span>
                      <span className="font-semibold">{lang.name}</span>
                    </div>
                    {language === lang.code && (
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col items-center justify-center z-10">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1, delay: 0.2 }}
          className="mb-8"
        >
          <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <TreePine className="w-20 h-20 text-white" strokeWidth={2} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
            {t('splash.title')}
          </h1>
          <p className="text-xl text-white/90 font-normal italic">
            {t('splash.tagline')}
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="w-full z-10 space-y-3"
      >
        <Link to="/signup">
          <button className="w-full h-16 bg-white text-[#D2691E] rounded-3xl font-semibold text-lg shadow-2xl hover:bg-white/95 transition-all active:scale-95">
            {t('splash.getStarted')}
          </button>
        </Link>
        
        <Link to="/login">
          <button className="w-full h-14 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-3xl font-semibold transition-all active:scale-95">
            Déjà membre? Se connecter
          </button>
        </Link>
        
        <p className="text-center text-white/70 text-sm mt-6">
          {t('splash.connecting')}
        </p>
      </motion.div>
    </div>
  );
}