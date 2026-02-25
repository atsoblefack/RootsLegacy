import { useState } from 'react';
import { ArrowLeft, CreditCard, Gift } from 'lucide-react';
import { useNavigate } from 'react-router';
import { projectId } from '../../../utils/supabase/info';
import { supabase } from '../../../utils/supabase/client';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function PaymentTest() {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(29);

  const handleProcessPayment = async () => {
    setProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Veuillez vous connecter');
        navigate('/');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-467d3bfa/referrals/process-payment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paymentAmount }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment failed');
      }

      const result = await response.json();
      
      // Show celebration notification
      let message = '🎉 Paiement traité avec succès!\n\n';
      
      if (result.refereeBonus) {
        message += '✨ Bonus de parrainage: 12 mois de stockage gratuit\n';
      }
      
      if (result.totalMonthsGranted > 0) {
        message += `\n📦 Total: ${result.totalMonthsGranted} mois ajoutés à votre compte!`;
      } else {
        message += '\n💡 Astuce: Utilisez un code de parrainage lors de l\'inscription pour obtenir 12 mois gratuits!';
      }

      toast.success(message);
      
      // Navigate to referral dashboard after a delay
      setTimeout(() => {
        navigate('/referral');
      }, 2000);

    } catch (error: any) {
      console.error('Payment processing error:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Test de Paiement</h1>
            <p className="text-sm text-white/90">Simuler un premier paiement</p>
          </div>
          <CreditCard className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {/* Info Card */}
        <div className="bg-gradient-to-br from-[#E8A05D]/20 to-[#D2691E]/20 rounded-3xl p-5 border-2 border-[#D2691E]/30">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#D2691E] flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#5D4037] mb-1">
                Récompenses du premier paiement
              </h3>
              <p className="text-sm text-[#5D4037]/80 leading-relaxed">
                En effectuant votre premier paiement, vous débloquerez toutes les récompenses en attente.
              </p>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <div className="bg-white/60 rounded-xl p-3 flex items-center gap-2">
              <span className="text-2xl">🎁</span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-[#5D4037]">Bonus de parrainage</div>
                <div className="text-xs text-[#8D6E63]">12 mois si vous avez utilisé un code</div>
              </div>
            </div>

            <div className="bg-white/60 rounded-xl p-3 flex items-center gap-2">
              <span className="text-2xl">👥</span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-[#5D4037]">Votre parrain aussi</div>
                <div className="text-xs text-[#8D6E63]">Le parrain reçoit aussi 12 mois</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Amount */}
        <div className="bg-white rounded-3xl p-5 shadow-md">
          <h3 className="font-semibold text-[#5D4037] mb-4">Montant du paiement</h3>
          
          <div className="space-y-3">
            {[29, 49, 99].map((amount) => (
              <button
                key={amount}
                onClick={() => setPaymentAmount(amount)}
                className={`w-full p-4 rounded-2xl border-2 transition-all ${
                  paymentAmount === amount
                    ? 'border-[#2E7D32] bg-[#2E7D32]/10'
                    : 'border-[#8D6E63]/20 bg-[#FFF8E7]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="font-bold text-[#5D4037]">${amount}</div>
                    <div className="text-xs text-[#8D6E63]">
                      {amount === 29 && 'Pack Starter'}
                      {amount === 49 && 'Pack Family'}
                      {amount === 99 && 'Pack Heritage'}
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 ${
                      paymentAmount === amount
                        ? 'border-[#2E7D32] bg-[#2E7D32]'
                        : 'border-[#8D6E63]/30'
                    }`}
                  >
                    {paymentAmount === amount && (
                      <div className="w-full h-full flex items-center justify-center text-white text-xs">
                        ✓
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 bg-[#FFF8E7] rounded-2xl p-3">
            <p className="text-xs text-[#8D6E63]">
              💡 <strong>Note:</strong> Ceci est une simulation. Dans la version finale, l'intégration de paiement réelle sera utilisée.
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-[#D2691E]/10 rounded-2xl p-4 border border-[#D2691E]/20">
          <p className="text-sm text-[#5D4037]">
            ⚠️ Cette page est uniquement pour tester le système de récompenses. Cliquez sur "Simuler le paiement" pour déclencher l'attribution des bonus.
          </p>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="bg-white border-t border-[#5D4037]/10 p-6">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleProcessPayment}
          disabled={processing}
          className="w-full h-14 bg-gradient-to-r from-[#2E7D32] to-[#66BB6A] text-white rounded-2xl font-bold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Traitement...
            </div>
          ) : (
            `Simuler le paiement - $${paymentAmount}`
          )}
        </motion.button>
      </div>
    </div>
  );
}