import { ArrowLeft, Book, FileText, Download, Heart, Check, Printer, BookOpen } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useLanguage } from './language-context';
import { useState } from 'react';

export function HeritageBook() {
  const { t } = useLanguage();
  const [exportType, setExportType] = useState<'digital' | 'print' | null>(null);
  const [hasUsedFreeExport, setHasUsedFreeExport] = useState(false);

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#8B4513] to-[#5D4037] px-6 py-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/settings">
            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Family Heritage Book</h1>
            <p className="text-white/80 text-sm">Your family story, beautifully preserved</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        {/* Free first export banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] rounded-3xl p-6 text-white mb-6"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Your First Export is FREE! 🎉</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                Included with your lifetime purchase. Create a beautiful digital heritage book at no extra cost.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Preview */}
        <div className="bg-white rounded-3xl p-6 shadow-xl mb-6">
          <h3 className="font-bold text-[#5D4037] mb-4">What's Included:</h3>
          
          {/* Sample preview */}
          <div className="bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] rounded-2xl p-6 mb-4 border-2 border-[#D2691E]/20">
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">📖</div>
              <div className="font-bold text-[#5D4037] text-lg">Johnson Family Legacy</div>
              <div className="text-sm text-[#8D6E63]">4 Generations • 24 Members</div>
            </div>
            
            <div className="space-y-2 text-sm text-[#5D4037]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#2E7D32]" />
                <span>Complete family tree visualization</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#2E7D32]" />
                <span>All photos and profiles</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#2E7D32]" />
                <span>Family stories and memories</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#2E7D32]" />
                <span>Birth dates and relationships</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#2E7D32]" />
                <span>Beautiful cultural design</span>
              </div>
            </div>
          </div>
        </div>

        {/* Export options */}
        <div className="space-y-3 mb-6">
          <h3 className="font-bold text-[#5D4037] px-2">Choose Export Type:</h3>
          
          {/* Digital export */}
          <button
            onClick={() => setExportType('digital')}
            className={`w-full rounded-3xl p-5 transition-all ${
              exportType === 'digital'
                ? 'bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white shadow-2xl'
                : 'bg-white text-[#5D4037] shadow-md border-2 border-[#5D4037]/10'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                exportType === 'digital' ? 'bg-white/20 backdrop-blur-sm' : 'bg-[#D2691E]/10'
              }`}>
                <Download className={`w-7 h-7 ${exportType === 'digital' ? 'text-white' : 'text-[#D2691E]'}`} strokeWidth={2.5} />
              </div>
              <div className="flex-1 text-left">
                <h4 className={`font-bold ${exportType === 'digital' ? 'text-white' : 'text-[#5D4037]'}`}>
                  Digital PDF
                </h4>
                <p className={`text-sm ${exportType === 'digital' ? 'text-white/80' : 'text-[#8D6E63]'}`}>
                  Share via email or WhatsApp
                </p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${exportType === 'digital' ? 'text-white' : 'text-[#D2691E]'}`}>
                  {hasUsedFreeExport ? '$19' : 'FREE'}
                </div>
                {!hasUsedFreeExport && (
                  <div className={`text-xs ${exportType === 'digital' ? 'text-white/70' : 'text-[#8D6E63]'}`}>
                    First one!
                  </div>
                )}
              </div>
            </div>
          </button>

          {/* Print export */}
          <button
            onClick={() => setExportType('print')}
            className={`w-full rounded-3xl p-5 transition-all ${
              exportType === 'print'
                ? 'bg-gradient-to-br from-[#8B4513] to-[#5D4037] text-white shadow-2xl'
                : 'bg-white text-[#5D4037] shadow-md border-2 border-[#5D4037]/10'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                exportType === 'print' ? 'bg-white/20 backdrop-blur-sm' : 'bg-[#8B4513]/10'
              }`}>
                <Printer className={`w-7 h-7 ${exportType === 'print' ? 'text-white' : 'text-[#8B4513]'}`} strokeWidth={2.5} />
              </div>
              <div className="flex-1 text-left">
                <h4 className={`font-bold ${exportType === 'print' ? 'text-white' : 'text-[#5D4037]'}`}>
                  Premium Print
                </h4>
                <p className={`text-sm ${exportType === 'print' ? 'text-white/80' : 'text-[#8D6E63]'}`}>
                  Hardcover, shipped to your door
                </p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${exportType === 'print' ? 'text-white' : 'text-[#8B4513]'}`}>
                  $49-79
                </div>
                <div className={`text-xs ${exportType === 'print' ? 'text-white/70' : 'text-[#8D6E63]'}`}>
                  varies by size
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Use cases */}
        <div className="bg-[#E8A05D]/10 rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-[#5D4037] mb-3">Perfect for:</h4>
          <div className="space-y-2 text-sm text-[#5D4037]">
            <div className="flex items-center gap-2">
              <span>🎄</span>
              <span>Christmas gifts for relatives</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💒</span>
              <span>Weddings and family reunions</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🎓</span>
              <span>Graduation keepsakes</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🕊️</span>
              <span>Memorial tributes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#5D4037]/10 p-6" style={{ maxWidth: '375px', margin: '0 auto' }}>
        {exportType && (
          <div className="mb-3 text-center">
            <div className="text-sm text-[#8D6E63]">
              {exportType === 'digital' ? 'Digital PDF Export' : 'Premium Print Edition'}
            </div>
            <div className="text-2xl font-bold text-[#D2691E]">
              {exportType === 'digital' 
                ? (hasUsedFreeExport ? '$19' : 'FREE') 
                : '$49-79'
              }
            </div>
          </div>
        )}
        <button 
          disabled={!exportType}
          onClick={() => {
            if (exportType === 'digital' && !hasUsedFreeExport) {
              // Generate free digital export
              setHasUsedFreeExport(true);
            }
            // In real app, would navigate to checkout or generate export
          }}
          className="w-full h-16 bg-gradient-to-br from-[#8B4513] to-[#5D4037] text-white rounded-3xl font-semibold shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <BookOpen className="w-5 h-5" />
          {exportType === 'digital' ? 'Generate Book' : 'Customize & Order'}
        </button>
      </div>
    </div>
  );
}