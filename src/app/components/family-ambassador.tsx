import { ArrowLeft, Crown, Users, FileText, BarChart3, Download, UserPlus, Check, Copy } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useLanguage } from './language-context';
import { copyToClipboard } from '../utils/clipboard';
import { useState } from 'react';

export function FamilyAmbassador() {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  
  const referralCode = 'AMARA-JF24';
  const referralLink = `rootslegacy.app/join/${referralCode}`;
  
  // Mock referral stats
  const referralStats = {
    totalReferrals: 3,
    rewards: [
      'Free Heritage Book earned',
      '2 years free storage',
      '30% lifetime discount'
    ]
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(referralLink);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#D2691E] to-[#E8A05D] px-6 py-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/settings">
            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Family Ambassador</h1>
            <p className="text-white/80 text-sm">Share & earn rewards</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Rewards earned */}
        <div className="bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] rounded-3xl p-6 text-white mb-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">
              🎁
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Your Rewards</h3>
              <p className="text-white/90 text-sm">{referralStats.totalReferrals} families joined</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {referralStats.rewards.map((reward, index) => (
              <div key={index} className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex items-center gap-2">
                <Check className="w-5 h-5 text-white" />
                <span className="font-medium">{reward}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-3xl p-6 shadow-md mb-6">
          <h3 className="font-bold text-[#5D4037] mb-4">How It Works</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#D2691E]/10 flex items-center justify-center flex-shrink-0 text-[#D2691E] font-bold text-sm">
                1
              </div>
              <div>
                <p className="text-[#5D4037] font-medium">Share your code</p>
                <p className="text-sm text-[#8D6E63]">Send to family, friends, or your community</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#D2691E]/10 flex items-center justify-center flex-shrink-0 text-[#D2691E] font-bold text-sm">
                2
              </div>
              <div>
                <p className="text-[#5D4037] font-medium">They sign up</p>
                <p className="text-sm text-[#8D6E63]">When they purchase any plan using your code</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#D2691E]/10 flex items-center justify-center flex-shrink-0 text-[#D2691E] font-bold text-sm">
                3
              </div>
              <div>
                <p className="text-[#5D4037] font-medium">You both win</p>
                <p className="text-sm text-[#8D6E63]">You get rewards, they get 10% off</p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral code */}
        <div className="bg-white rounded-3xl p-6 shadow-md mb-6">
          <h3 className="font-bold text-[#5D4037] mb-3">Your Referral Code</h3>
          
          <div className="bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] rounded-2xl p-4 mb-4 border-2 border-dashed border-[#D2691E]/30">
            <div className="text-center mb-3">
              <div className="text-3xl font-bold text-[#D2691E] tracking-wider mb-1">
                {referralCode}
              </div>
              <div className="text-sm text-[#8D6E63]">{referralLink}</div>
            </div>
            
            <button
              onClick={handleCopy}
              className="w-full h-12 bg-[#D2691E] text-white rounded-xl font-semibold active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <Copy className="w-5 h-5" />
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Share options */}
        <div className="bg-white rounded-3xl p-6 shadow-md mb-6">
          <h3 className="font-bold text-[#5D4037] mb-4">Share via:</h3>
          <div className="grid grid-cols-4 gap-3">
            <button className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors active:scale-95">
              <div className="text-3xl">💬</div>
              <span className="text-xs font-medium text-[#5D4037]">WhatsApp</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-[#E8A05D]/10 hover:bg-[#E8A05D]/20 transition-colors active:scale-95">
              <div className="text-3xl">📧</div>
              <span className="text-xs font-medium text-[#5D4037]">Email</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-[#D2691E]/10 hover:bg-[#D2691E]/20 transition-colors active:scale-95">
              <div className="text-3xl">📱</div>
              <span className="text-xs font-medium text-[#5D4037]">SMS</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-[#5D4037]/10 hover:bg-[#5D4037]/20 transition-colors active:scale-95">
              <div className="text-3xl">🔗</div>
              <span className="text-xs font-medium text-[#5D4037]">More</span>
            </button>
          </div>
        </div>

        {/* Rewards chart */}
        <div className="bg-gradient-to-br from-[#E8A05D]/20 to-[#D2691E]/20 rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-[#5D4037] mb-3">Earn More Rewards:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
              <span className="text-[#5D4037]">Every 3 referrals</span>
              <span className="font-bold text-[#D2691E]">Free Heritage Book</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
              <span className="text-[#5D4037]">Every 5 referrals</span>
              <span className="font-bold text-[#2E7D32]">Free Storage Year</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
              <span className="text-[#5D4037]">10+ referrals</span>
              <span className="font-bold text-[#8B4513]">Lifetime Storage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}