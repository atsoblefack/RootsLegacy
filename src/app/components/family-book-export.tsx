import { useState, useEffect } from 'react';
import { ArrowLeft, Download, FileText, Crown, Sparkles, Check, Loader2 } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useLanguage } from './language-context';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';

interface PdfExportStatus {
  hasAccess: boolean;
  reason: 'heritage_tier' | 'purchased' | 'not_purchased';
  purchaseDate?: string;
}

export function FamilyBookExport() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<PdfExportStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [familyName, setFamilyName] = useState('');

  useEffect(() => {
    loadPdfExportStatus();
    loadFamilyName();
  }, []);

  const loadPdfExportStatus = async () => {
    try {
      const accessToken = sessionStorage.getItem('access_token');
      if (!accessToken) {
        toast.error('Please log in to access this feature');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-467d3bfa/pdf-export/status`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        console.error('Failed to load PDF export status');
      }
    } catch (error) {
      console.error('Error loading PDF export status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFamilyName = async () => {
    try {
      const accessToken = sessionStorage.getItem('access_token');
      if (!accessToken) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-467d3bfa/profiles/me`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFamilyName(data.profile?.familyName || 'My Family');
      }
    } catch (error) {
      console.error('Error loading family name:', error);
    }
  };

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      const accessToken = sessionStorage.getItem('access_token');
      if (!accessToken) {
        toast.error('Please log in to continue');
        return;
      }

      // In production, this would integrate with a payment processor
      // For now, we'll simulate a successful purchase
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-467d3bfa/pdf-export/purchase`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: 19.99 }),
        }
      );

      if (response.ok) {
        toast.success('PDF Export access purchased successfully! 🎉');
        await loadPdfExportStatus(); // Reload status
      } else {
        const error = await response.json();
        toast.error(error.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Error purchasing PDF export:', error);
      toast.error('An error occurred during purchase');
    } finally {
      setPurchasing(false);
    }
  };

  const handleGeneratePdf = async () => {
    setGenerating(true);
    try {
      const accessToken = sessionStorage.getItem('access_token');
      if (!accessToken) {
        toast.error('Please log in to continue');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-467d3bfa/pdf-export/generate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ familyName }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        
        // Generate PDF on client side using the data
        await generateClientPdf(result.data);
        
        toast.success('Family Heritage Book downloaded! 📖');
      } else {
        const error = await response.json();
        if (error.requiresPurchase) {
          toast.error('Please purchase PDF export access or upgrade to Heritage tier');
        } else {
          toast.error(error.error || 'Failed to generate PDF');
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('An error occurred while generating PDF');
    } finally {
      setGenerating(false);
    }
  };

  const generateClientPdf = async (data: any) => {
    // Simple HTML-based PDF generation
    // In production, use jsPDF or similar library
    const htmlContent = generateHtmlBook(data);
    
    // Create a temporary window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow pop-ups to download PDF');
      return;
    }
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Trigger print dialog
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const generateHtmlBook = (data: any) => {
    const { familyName, generationDate, profiles, stats } = data;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${familyName} Heritage Book</title>
        <style>
          @page { size: A4; margin: 2cm; }
          body {
            font-family: 'Georgia', serif;
            color: #5D4037;
            line-height: 1.6;
          }
          .cover {
            text-align: center;
            padding: 100px 0;
            page-break-after: always;
          }
          .cover h1 {
            font-size: 48px;
            color: #D2691E;
            margin-bottom: 20px;
          }
          .cover p {
            font-size: 18px;
            color: #8D6E63;
          }
          .section {
            page-break-before: always;
            padding: 20px 0;
          }
          .profile {
            margin-bottom: 40px;
            padding: 20px;
            border-left: 4px solid #E8A05D;
          }
          .profile h3 {
            color: #D2691E;
            font-size: 24px;
            margin-bottom: 10px;
          }
          .profile-info {
            font-size: 14px;
            color: #5D4037;
          }
          .stats-box {
            background: #FFF8E7;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #E8A05D;
            color: #8D6E63;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <!-- Cover Page -->
        <div class="cover">
          <h1>${familyName}</h1>
          <p style="font-size: 32px; color: #D2691E; margin: 40px 0;">Heritage Book</p>
          <p>A Living Legacy</p>
          <p style="margin-top: 100px;">Generated on ${new Date(generationDate).toLocaleDateString()}</p>
        </div>

        <!-- Family Statistics -->
        <div class="section">
          <h2 style="color: #D2691E; font-size: 36px;">Family Overview</h2>
          <div class="stats-box">
            <p><strong>Total Members:</strong> ${stats.totalMembers}</p>
            <p><strong>Generations:</strong> ${stats.generations}</p>
            ${stats.oldestBirth ? `<p><strong>Oldest Birth:</strong> ${new Date(stats.oldestBirth).toLocaleDateString()}</p>` : ''}
            ${stats.youngestBirth ? `<p><strong>Youngest Birth:</strong> ${new Date(stats.youngestBirth).toLocaleDateString()}</p>` : ''}
          </div>
        </div>

        <!-- Family Members -->
        <div class="section">
          <h2 style="color: #D2691E; font-size: 36px; margin-bottom: 30px;">Family Members</h2>
          ${profiles.map((profile: any) => `
            <div class="profile">
              <h3>${profile.name}</h3>
              <div class="profile-info">
                ${profile.birthDate ? `<p><strong>Born:</strong> ${new Date(profile.birthDate).toLocaleDateString()}</p>` : ''}
                ${profile.birthPlace ? `<p><strong>Birthplace:</strong> ${profile.birthPlace}</p>` : ''}
                ${profile.profession ? `<p><strong>Profession:</strong> ${profile.profession}</p>` : ''}
                ${profile.bio ? `<p style="margin-top: 15px;">${profile.bio}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>Created with RootsLegacy</p>
          <p>Preserving African Heritage, One Story at a Time</p>
        </div>
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D2691E] animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#D2691E] to-[#E8A05D] px-6 py-6 text-white sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/settings">
            <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm active:scale-95 transition-transform">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Family Heritage Book</h1>
            <p className="text-white/80 text-sm">Custom PDF Export</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 pb-24">
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-lg mb-6"
        >
          <div className="flex items-start gap-4">
            {status?.hasAccess ? (
              <div className="w-14 h-14 rounded-2xl bg-[#2E7D32]/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-7 h-7 text-[#2E7D32]" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-[#D2691E]/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-7 h-7 text-[#D2691E]" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-bold text-[#5D4037] text-lg mb-2">
                {status?.hasAccess ? 'PDF Export Active' : 'PDF Export Not Available'}
              </h3>
              <p className="text-sm text-[#8D6E63] leading-relaxed">
                {status?.reason === 'heritage_tier' && 
                  'You have unlimited PDF exports with your Heritage subscription! 👑'}
                {status?.reason === 'purchased' && 
                  `You purchased PDF export access on ${status.purchaseDate ? new Date(status.purchaseDate).toLocaleDateString() : 'a previous date'}. You can generate unlimited family books! 📖`}
                {status?.reason === 'not_purchased' && 
                  'Generate a beautiful PDF book of your family tree with photos, stories, and relationships.'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* What's Included */}
        <div className="bg-white rounded-3xl p-6 shadow-md mb-6">
          <h3 className="font-bold text-[#5D4037] mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D2691E]" />
            What's Included in Your Book
          </h3>
          <div className="space-y-3">
            {[
              'Beautiful cover page with family name',
              'Complete family statistics & overview',
              'All family members with photos',
              'Birth dates, places & professions',
              'Personal stories & biographies',
              'Family relationships diagram',
              'Print-ready A4 format',
              'Professional heritage design'
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#2E7D32]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-[#2E7D32]" strokeWidth={3} />
                </div>
                <span className="text-sm text-[#5D4037]">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Purchase or Generate */}
        {!status?.hasAccess ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[#D2691E] to-[#E8A05D] rounded-3xl p-6 text-white shadow-xl mb-6"
          >
            <div className="text-center mb-6">
              <Crown className="w-16 h-16 mx-auto mb-4 text-white/90" />
              <h3 className="text-2xl font-bold mb-2">Unlock PDF Export</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                One-time purchase for unlimited family book exports
              </p>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">$19.99</div>
                <div className="text-sm text-white/80">One-time payment</div>
              </div>
            </div>

            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="w-full h-14 bg-white text-[#D2691E] rounded-2xl font-bold shadow-lg active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {purchasing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Purchase PDF Export
                </>
              )}
            </button>

            <p className="text-center text-xs text-white/70 mt-4">
              Or upgrade to Heritage tier for this and more features
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-md mb-6"
          >
            <h3 className="font-bold text-[#5D4037] mb-4">Generate Your Heritage Book</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#5D4037] mb-2">
                Family Name
              </label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="w-full h-12 px-4 rounded-2xl border-2 border-[#5D4037]/10 focus:border-[#D2691E] focus:outline-none text-[#5D4037]"
                placeholder="e.g., The Johnson Family"
              />
            </div>

            <button
              onClick={handleGeneratePdf}
              disabled={generating || !familyName.trim()}
              className="w-full h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Generate Heritage Book
                </>
              )}
            </button>

            <p className="text-center text-xs text-[#8D6E63] mt-4">
              Your browser will open a print dialog to save as PDF
            </p>
          </motion.div>
        )}

        {/* Info Box */}
        <div className="bg-[#E8A05D]/10 rounded-2xl p-4">
          <p className="text-xs text-[#5D4037] leading-relaxed">
            <span className="font-semibold">💡 Pro Tip:</span> Add detailed stories and photos to family members before generating your book for a richer heritage document.
          </p>
        </div>
      </div>
    </div>
  );
}
