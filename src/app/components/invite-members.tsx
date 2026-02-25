import { ArrowLeft, Link2, Copy, CheckCircle, MessageCircle, Mail, Share2, Users } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './language-context';
import { copyToClipboard } from '../utils/clipboard';

export function InviteMembers() {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [inviteMethod, setInviteMethod] = useState<'link' | 'whatsapp' | 'email' | null>(null);

  const inviteCode = 'AMARA-FAM-2024';
  const inviteLink = `https://rootslegacy.app/join/${inviteCode}`;

  const handleCopy = async () => {
    const success = await copyToClipboard(inviteLink);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const message = `👋 Hi! I'm building our family tree on RootsLegacy and would love you to add your information. Join here: ${inviteLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleEmailShare = () => {
    const subject = 'Join Our Family Tree on RootsLegacy';
    const body = `Hi!\n\nI'm building our family tree on RootsLegacy and would love you to be part of it.\n\nJust click this link and add your information:\n${inviteLink}\n\nIt only takes a few minutes!\n\nLooking forward to building our legacy together.\n\nBest regards`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] px-6 py-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/onboarding">
            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Invite Family</h1>
            <p className="text-white/80 text-sm">Let them add their own info</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-md mb-6"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 flex items-center justify-center flex-shrink-0">
              <Share2 className="w-6 h-6 text-[#2E7D32]" />
            </div>
            <div>
              <h3 className="font-bold text-[#5D4037] mb-1">How It Works</h3>
              <p className="text-[#8D6E63] text-sm leading-relaxed">
                Share your invite link with family members. They'll add their own information, and you'll connect them to the tree.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Your invite link */}
        <div className="bg-white rounded-3xl p-6 shadow-md mb-6">
          <h3 className="font-bold text-[#5D4037] mb-3">Your Invite Link</h3>
          
          <div className="bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] rounded-2xl p-4 mb-4 border-2 border-dashed border-[#2E7D32]/30">
            <div className="text-center mb-3">
              <div className="text-2xl font-bold text-[#2E7D32] mb-1">
                {inviteCode}
              </div>
              <div className="text-xs text-[#8D6E63] break-all">
                {inviteLink}
              </div>
            </div>
            
            <button
              onClick={handleCopy}
              className="w-full h-12 bg-[#2E7D32] text-white rounded-xl font-semibold active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="copied"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Copied!
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-5 h-5" />
                    Copy Link
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Share methods */}
        <div className="mb-6">
          <h3 className="font-bold text-[#5D4037] mb-3 px-2">Share via:</h3>
          <div className="space-y-3">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="w-full rounded-2xl p-4 bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-md active:scale-98 transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold">WhatsApp</h4>
                  <p className="text-white/80 text-sm">Send to family group or individuals</p>
                </div>
              </div>
            </button>

            {/* Email */}
            <button
              onClick={handleEmailShare}
              className="w-full rounded-2xl p-4 bg-white border-2 border-[#5D4037]/10 shadow-sm active:scale-98 transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#D2691E]/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-[#D2691E]" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-[#5D4037]">Email</h4>
                  <p className="text-[#8D6E63] text-sm">Send a personalized invitation</p>
                </div>
              </div>
            </button>

            {/* More options */}
            <button
              onClick={handleCopy}
              className="w-full rounded-2xl p-4 bg-white border-2 border-[#5D4037]/10 shadow-sm active:scale-98 transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#E8A05D]/10 flex items-center justify-center">
                  <Link2 className="w-6 h-6 text-[#E8A05D]" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-[#5D4037]">Copy Link</h4>
                  <p className="text-[#8D6E63] text-sm">Share via SMS, social media, etc.</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Who can you invite */}
        <div className="bg-[#2E7D32]/10 rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-[#5D4037] mb-3">💡 Who to invite:</h4>
          <div className="space-y-2 text-sm text-[#5D4037]">
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0">✓</span>
              <span>Parents, siblings, aunts, uncles</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0">✓</span>
              <span>Grandparents (they have the best stories!)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0">✓</span>
              <span>Cousins and extended family</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0">✓</span>
              <span>Anyone who wants to contribute</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link to="/home">
            <button className="w-full h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform">
              Done, Go to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}