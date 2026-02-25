import { CheckCircle, Users, Trophy, Bell, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useLanguage } from './language-context';

export function JoinFamily() {
  const { t } = useLanguage();
  
  // Mock data - would fetch from backend based on code
  const familyInfo = {
    adminName: 'Amara Johnson',
    adminPhoto: '👩🏿',
    familyName: 'Johnson Family',
    memberCount: 24,
    inviteCode: 'AMARA-FAM-2024'
  };

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-gradient-to-br from-[#E8A05D] via-[#D2691E] to-[#5D4037] flex flex-col items-center justify-between p-8 overflow-hidden relative">
      {/* Decorative pattern */}
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

      <div className="flex-1 flex flex-col items-center justify-center z-10 w-full">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1 }}
          className="mb-8"
        >
          <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <CheckCircle className="w-20 h-20 text-white" strokeWidth={2} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-white" />
            <h2 className="text-white/90 font-semibold">You're Invited!</h2>
            <Trophy className="w-5 h-5 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Join the<br />{familyInfo.familyName}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-4xl">
              {familyInfo.adminPhoto}
            </div>
            <div className="flex-1 text-white">
              <div className="font-bold text-lg">{familyInfo.adminName}</div>
              <div className="text-white/80 text-sm">Family Admin</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-white mb-1">{familyInfo.memberCount}</div>
              <div className="text-xs text-white/80">Members</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-white mb-1">5</div>
              <div className="text-xs text-white/80">Generations</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4"
        >
          <p className="text-white/90 text-sm text-center leading-relaxed">
            <Users className="w-4 h-4 inline mr-1" />
            Add your information to complete the family tree
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="w-full z-10 space-y-3"
      >
        <Link to="/member-onboarding">
          <button className="w-full h-16 bg-white text-[#D2691E] rounded-3xl font-semibold text-lg shadow-2xl hover:bg-white/95 transition-all active:scale-95 flex items-center justify-center gap-2">
            Join Family Tree
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>

        <p className="text-center text-white/70 text-xs">
          Code: {familyInfo.inviteCode}
        </p>
      </motion.div>
    </div>
  );
}