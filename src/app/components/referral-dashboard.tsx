import { useState, useEffect } from 'react';
import { ArrowLeft, Link as LinkIcon, Share2, Copy, Gift, TrendingUp, Users, Check, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { supabase } from '/utils/supabase/client';
import { toast } from 'sonner';
import { BottomNav } from './bottom-nav';
import { copyToClipboard } from '../utils/clipboard';

interface ReferralStats {
  referral: {
    referralCode: string;
    totalReferred: number;
    totalStorageEarned: number;
    referredFamilies: Array<{
      familyName: string;
      joinedAt: string;
      paidAt?: string;
      status: 'pending' | 'paid';
    }>;
  } | null;
  storageReward: {
    storageMonths: number;
    expiresAt?: string;
  } | null;
  progressToMax: number;
}

export function ReferralDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadReferralStats();
  }, []);

  const loadReferralStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-467d3bfa/referrals/stats`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
        
        // If no referral exists, show create modal
        if (!data.referral) {
          setShowCreateModal(true);
        }
      }
    } catch (error) {
      console.error('Load referral stats error:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const createReferral = async () => {
    if (!familyName.trim()) {
      toast.error('Veuillez entrer le nom de votre famille');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-467d3bfa/referrals/create`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ familyName }),
        }
      );

      if (response.ok) {
        toast.success('Lien de parrainage créé!');
        setShowCreateModal(false);
        await loadReferralStats();
      }
    } catch (error) {
      console.error('Create referral error:', error);
      toast.error('Erreur lors de la création');
    }
  };

  const handleCopyLink = async () => {
    if (!stats?.referral) return;
    
    const referralLink = `${window.location.origin}/join/${stats.referral.referralCode}`;
    const success = await copyToClipboard(referralLink);
    
    if (success) {
      setCopied(true);
      toast.success('Lien copié!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!stats?.referral) return;
    
    const referralLink = `${window.location.origin}/join/${stats.referral.referralCode}`;
    const text = `Rejoignez-moi sur RootsLegacy et recevez 3 mois de stockage gratuit! 🌳\n\n${referralLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoignez RootsLegacy',
          text,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      handleCopyLink();
    }
  };

  const yearsEarned = stats?.referral ? Math.floor(stats.referral.totalStorageEarned / 12) : 0;
  const monthsRemaining = stats?.referral ? stats.referral.totalStorageEarned % 12 : 0;

  if (loading) {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D2691E]/20 border-t-[#D2691E] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#D2691E] to-[#E8A05D] px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Programme de Parrainage</h1>
            <p className="text-sm text-white/90">Invitez des familles, gagnez du stockage</p>
          </div>
          <Gift className="w-6 h-6 text-white" />
        </div>

        {/* Progress Card */}
        {stats?.referral && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-3xl font-bold text-[#5D4037]">
                  {yearsEarned} an{yearsEarned > 1 ? 's' : ''}
                  {monthsRemaining > 0 && <span className="text-xl"> {monthsRemaining}m</span>}
                </div>
                <div className="text-sm text-[#8D6E63]">Stockage gratuit gagné</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#D2691E]">{stats.referral.totalReferred}</div>
                <div className="text-xs text-[#8D6E63]">Familles</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="h-3 bg-[#8D6E63]/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.progressToMax}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-[#D2691E] to-[#E8A05D]"
                />
              </div>
              <div className="flex justify-between text-xs text-[#8D6E63]">
                <span>{stats.referral.totalStorageEarned} mois gagnés</span>
                <span>🎯 Illimité!</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 px-6 py-6 space-y-4">
        {/* Total Storage Card */}
        {stats?.storageReward && stats.storageReward.storageMonths > 0 && (
          <div className="bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] rounded-3xl p-5 shadow-xl text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                🎁
              </div>
              <div>
                <h3 className="font-bold text-lg">Stockage Total Gratuit</h3>
                <p className="text-white/80 text-sm">Incluant bonus de bienvenue</p>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-4xl font-bold mb-1">
                {Math.floor(stats.storageReward.storageMonths / 12)} an{Math.floor(stats.storageReward.storageMonths / 12) > 1 ? 's' : ''}
                {stats.storageReward.storageMonths % 12 > 0 && (
                  <span className="text-2xl"> {stats.storageReward.storageMonths % 12}m</span>
                )}
              </div>
              <div className="text-sm text-white/90">
                ({stats.storageReward.storageMonths} mois disponibles)
              </div>
            </div>
          </div>
        )}

        {/* Referral Link */}
        {stats?.referral && (
          <div className="bg-white rounded-3xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <LinkIcon className="w-5 h-5 text-[#D2691E]" />
              <h3 className="font-semibold text-[#5D4037]">Votre lien unique</h3>
            </div>

            <div className="bg-[#FFF8E7] rounded-2xl p-3 mb-3 break-all text-sm text-[#5D4037] font-mono">
              {window.location.origin}/join/{stats.referral.referralCode}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 h-11 bg-[#5D4037] text-white rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-98 transition-transform"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copié!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copier
                  </>
                )}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 h-11 bg-gradient-to-r from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-98 transition-transform"
              >
                <Share2 className="w-4 h-4" />
                Partager
              </button>
            </div>
          </div>
        )}

        {/* How it Works */}
        <div className="bg-white rounded-3xl p-4 shadow-md">
          <h3 className="font-semibold text-[#5D4037] mb-3">Comment ça marche?</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#D2691E]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-[#D2691E]">1</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#5D4037]">
                  <strong>Partagez</strong> votre lien avec d'autres familles
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#D2691E]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-[#D2691E]">2</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#5D4037]">
                  Ils <strong>s'inscrivent et paient</strong> minimum $29
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#D2691E]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-[#D2691E]">3</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#5D4037]">
                  Vous recevez <strong>12 mois gratuits</strong> par famille!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-[#E8A05D]/10 rounded-2xl p-3">
            <p className="text-xs text-[#5D4037]">
              💡 <strong>Bonus:</strong> La nouvelle famille reçoit aussi 3 mois gratuits!
            </p>
          </div>
        </div>

        {/* Referred Families */}
        {stats?.referral && stats.referral.referredFamilies.length > 0 && (
          <div className="bg-white rounded-3xl p-4 shadow-md">
            <h3 className="font-semibold text-[#5D4037] mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#D2691E]" />
              Familles invitées ({stats.referral.referredFamilies.length})
            </h3>

            <div className="space-y-2">
              {stats.referral.referredFamilies.map((family, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-[#FFF8E7] rounded-2xl"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-[#5D4037]">
                      {family.familyName}
                    </div>
                    <div className="text-xs text-[#8D6E63]">
                      Rejoint le {new Date(family.joinedAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div>
                    {family.status === 'paid' ? (
                      <div className="flex items-center gap-1 bg-[#2E7D32] text-white text-xs px-2 py-1 rounded-full">
                        <Check className="w-3 h-3" />
                        Payé
                      </div>
                    ) : (
                      <div className="text-xs bg-[#8D6E63]/20 text-[#8D6E63] px-2 py-1 rounded-full">
                        En attente
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {stats?.referral && stats.referral.referredFamilies.length === 0 && (
          <div className="bg-white rounded-3xl p-8 shadow-md text-center">
            <div className="w-20 h-20 rounded-full bg-[#D2691E]/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-[#D2691E]" />
            </div>
            <h3 className="font-bold text-[#5D4037] mb-2">Commencez à inviter!</h3>
            <p className="text-sm text-[#8D6E63] mb-4">
              Partagez votre lien avec d'autres familles et gagnez du stockage gratuit illimité!
            </p>
            <button
              onClick={handleShare}
              className="h-11 bg-gradient-to-r from-[#D2691E] to-[#E8A05D] text-white px-6 rounded-2xl font-semibold active:scale-98 transition-transform"
            >
              Partager maintenant
            </button>
          </div>
        )}
      </div>

      {/* Create Referral Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex items-center justify-center mx-auto mb-3">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#5D4037] mb-2">
                Créer votre lien de parrainage
              </h2>
              <p className="text-sm text-[#8D6E63]">
                Entrez le nom de votre famille pour générer votre lien unique
              </p>
            </div>

            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Ex: Famille Diallo"
              className="w-full h-12 bg-[#FFF8E7] rounded-2xl px-4 text-[#5D4037] placeholder:text-[#8D6E63] focus:outline-none focus:ring-2 focus:ring-[#D2691E]/30 mb-4"
            />

            <button
              onClick={createReferral}
              disabled={!familyName.trim()}
              className="w-full h-12 bg-gradient-to-r from-[#D2691E] to-[#E8A05D] text-white font-semibold rounded-2xl active:scale-98 transition-transform disabled:opacity-50"
            >
              Créer mon lien
            </button>
          </motion.div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}