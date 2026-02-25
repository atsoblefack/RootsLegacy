import { Camera, MessageCircle, Link as LinkIcon, Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { useLanguage } from './language-context';

export function InputMethods() {
  const { t } = useLanguage();
  
  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#5D4037]/10 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/home">
            <button className="w-10 h-10 rounded-full bg-[#FFF8E7] flex items-center justify-center text-[#D2691E]">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#5D4037]">{t('input.howToAdd')}</h1>
            <p className="text-sm text-[#8D6E63]">{t('input.chooseMethod')}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <p className="text-[#8D6E63] mb-2 px-2">
          We make it easy to grow your family tree. Pick the method that works best for you:
        </p>

        {/* AI Voice - Already started */}
        <div className="bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] rounded-3xl p-6 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-white font-bold text-lg">{t('input.voiceInput')}</h3>
                <span className="text-xs bg-white/30 text-white px-2 py-0.5 rounded-full">✓ Started</span>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">
                {t('input.voiceDesc')}
              </p>
            </div>
          </div>
          <Link to="/conversational-onboarding">
            <button className="w-full h-12 bg-white text-[#2E7D32] rounded-2xl font-semibold shadow-md active:scale-95 transition-transform">
              {t('common.continue')} Conversation
            </button>
          </Link>
        </div>

        {/* Photo Scan */}
        <Link to="/photo-scan">
          <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-[#5D4037]/10 hover:border-[#D2691E]/30 transition-colors active:scale-98">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D2691E]/10 flex items-center justify-center flex-shrink-0">
                <Camera className="w-6 h-6 text-[#D2691E]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[#5D4037] font-bold text-lg mb-2">Photo Scan</h3>
                <p className="text-[#8D6E63] text-sm leading-relaxed">
                  Take a photo of old documents, birth certificates, or handwritten family records. Our AI will extract the information for you.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-[#E8A05D] border-2 border-white flex items-center justify-center text-xs">📄</div>
                    <div className="w-8 h-8 rounded-full bg-[#D2691E] border-2 border-white flex items-center justify-center text-xs">🎫</div>
                    <div className="w-8 h-8 rounded-full bg-[#2E7D32] border-2 border-white flex items-center justify-center text-xs">📝</div>
                  </div>
                  <span className="text-xs text-[#8D6E63]">Birth certificates, IDs, records...</span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* WhatsApp Import */}
        <Link to="/whatsapp-import">
          <div className="bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-3xl p-6 shadow-lg active:scale-98 transition-transform">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-2">Import from WhatsApp</h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  Already have a family WhatsApp group? Import names and phone numbers directly. The fastest way to get started!
                </p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 mb-4">
              <p className="text-white text-xs">
                💡 <span className="font-semibold">Tip:</span> Most families already organize on WhatsApp. We make it easy to turn that into your family tree.
              </p>
            </div>
            <button className="w-full h-12 bg-white text-[#25D366] rounded-2xl font-semibold shadow-md">
              Connect WhatsApp
            </button>
          </div>
        </Link>

        {/* Invite & Self-Fill */}
        <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-[#5D4037]/10">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8A05D]/10 flex items-center justify-center flex-shrink-0">
              <LinkIcon className="w-6 h-6 text-[#E8A05D]" />
            </div>
            <div className="flex-1">
              <h3 className="text-[#5D4037] font-bold text-lg mb-2">Invite Relatives</h3>
              <p className="text-[#8D6E63] text-sm leading-relaxed mb-3">
                Send a link to your relatives and let them fill in their own profile. Collaborative and grows naturally over time.
              </p>
              <div className="bg-[#FFF8E7] rounded-xl p-3 border-2 border-dashed border-[#D2691E]/20">
                <p className="text-xs text-[#8D6E63] mb-1">Share via:</p>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg shadow-sm">💬</div>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg shadow-sm">📧</div>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg shadow-sm">📱</div>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg shadow-sm">🔗</div>
                </div>
              </div>
            </div>
          </div>
          <Link to="/invite">
            <button className="w-full h-12 bg-[#E8A05D] text-white rounded-2xl font-semibold active:scale-95 transition-transform">
              Generate Invite Link
            </button>
          </Link>
        </div>

        {/* Manual Entry (last resort) */}
        <Link to="/profile/new">
          <button className="w-full p-4 border-2 border-dashed border-[#8D6E63]/30 rounded-2xl text-[#8D6E63] text-sm font-medium hover:bg-white hover:border-[#8D6E63]/50 transition-colors">
            Or fill a form manually (traditional way)
          </button>
        </Link>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 bg-white border-t border-[#5D4037]/10">
        <Link to="/home">
          <button className="w-full h-14 bg-[#FFF8E7] text-[#D2691E] rounded-2xl font-semibold border-2 border-[#D2691E]/20 active:scale-95 transition-transform">
            I'll Do This Later
          </button>
        </Link>
      </div>
    </div>
  );
}