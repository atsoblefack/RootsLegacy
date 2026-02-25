import { ArrowLeft, Mail, Lock, User, TreePine, Gift } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from './language-context';
import { supabase } from '../../../utils/supabase/client';
import { projectId, publicAnonKey, serverBaseUrl } from '../../../utils/supabase/info';
import { toast } from 'sonner';

export function Signup() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralInfo, setReferralInfo] = useState<{ familyName: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    familyName: '',
  });

  useEffect(() => {
    // Check for referral code in sessionStorage
    const code = sessionStorage.getItem('referral_code');
    if (code) {
      setReferralCode(code);
      loadReferralInfo(code);
    }
  }, []);

  const loadReferralInfo = async (code: string) => {
    try {
      const response = await fetch(
        `${serverBaseUrl}/referrals/code/${code}`
      );

      if (response.ok) {
        const data = await response.json();
        setReferralInfo(data);
      }
    } catch (error) {
      console.error('Error loading referral info:', error);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.familyName) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      // Create account via backend
      const signupResponse = await fetch(
        `${serverBaseUrl}/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
          }),
        }
      );

      if (!signupResponse.ok) {
        const error = await signupResponse.json();
        throw new Error(error.error || 'Échec de la création du compte');
      }

      const signupData = await signupResponse.json();

      // Sign in immediately
      const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError || !sessionData.session) {
        throw new Error('Compte créé mais échec de la connexion');
      }

      // Store access token
      sessionStorage.setItem('access_token', sessionData.session.access_token);

      // If there's a referral code, register the signup
      if (referralCode) {
        try {
          await fetch(
            `${serverBaseUrl}/referrals/register-signup`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                referralCode,
                newFamilyId: sessionData.user.id,
                newFamilyName: formData.familyName,
              }),
            }
          );

          // Clear referral code from storage
          sessionStorage.removeItem('referral_code');
          
          toast.success('🎉 Compte créé! Vous recevrez 12 mois gratuits après votre premier paiement!');
        } catch (refError) {
          console.error('Error registering referral:', refError);
          // Don't fail signup if referral registration fails
          toast.success('Compte créé avec succès!');
        }
      } else {
        toast.success('Compte créé avec succès!');
      }

      // Redirect to home or onboarding
      navigate('/home');

    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-[375px] mx-auto bg-gradient-to-br from-[#E8A05D] via-[#D2691E] to-[#5D4037] flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4 sticky top-0 bg-gradient-to-br from-[#E8A05D] via-[#D2691E] to-[#5D4037] z-10">
        <Link to="/">
          <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-6 pb-8 pt-4">
        {/* Logo */}
        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
          <TreePine className="w-11 h-11 text-white" strokeWidth={2} />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Rejoignez RootsLegacy
        </h1>
        <p className="text-white/90 text-center mb-6">
          Préservez votre héritage familial
        </p>

        {/* Referral Bonus Badge */}
        {referralCode && referralInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-white/95 backdrop-blur-sm rounded-2xl p-4 mb-6 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex items-center justify-center flex-shrink-0">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-[#5D4037] text-sm">
                  Invité par {referralInfo.familyName}
                </div>
                <div className="text-xs text-[#8D6E63]">
                  🎁 12 mois gratuits après paiement
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="w-full space-y-4">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs text-white/80 uppercase tracking-wide font-semibold block mb-2">
                Nom complet
              </label>
              <div className="flex items-center gap-3 p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <User className="w-5 h-5 text-white/80" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Amara Johnson"
                  className="flex-1 bg-transparent text-white placeholder:text-white/50 font-medium outline-none"
                />
              </div>
            </div>

            {/* Family Name */}
            <div>
              <label className="text-xs text-white/80 uppercase tracking-wide font-semibold block mb-2">
                Nom de famille
              </label>
              <div className="flex items-center gap-3 p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <TreePine className="w-5 h-5 text-white/80" />
                <input
                  type="text"
                  value={formData.familyName}
                  onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                  placeholder="Famille Johnson"
                  className="flex-1 bg-transparent text-white placeholder:text-white/50 font-medium outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs text-white/80 uppercase tracking-wide font-semibold block mb-2">
                Email
              </label>
              <div className="flex items-center gap-3 p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Mail className="w-5 h-5 text-white/80" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="votre@email.com"
                  className="flex-1 bg-transparent text-white placeholder:text-white/50 font-medium outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-white/80 uppercase tracking-wide font-semibold block mb-2">
                Mot de passe
              </label>
              <div className="flex items-center gap-3 p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Lock className="w-5 h-5 text-white/80" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-white placeholder:text-white/50 font-medium outline-none"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs text-white/80 uppercase tracking-wide font-semibold block mb-2">
                Confirmer mot de passe
              </label>
              <div className="flex items-center gap-3 p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Lock className="w-5 h-5 text-white/80" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-white placeholder:text-white/50 font-medium outline-none"
                />
              </div>
            </div>
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-white text-[#D2691E] rounded-3xl font-bold text-lg shadow-2xl hover:bg-white/95 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-[#D2691E]/30 border-t-[#D2691E] rounded-full animate-spin" />
                Création...
              </div>
            ) : (
              "Créer mon compte"
            )}
          </button>

          {/* Login link */}
          <div className="text-center">
            <p className="text-white/80 text-sm">
              Vous avez déjà un compte?{' '}
              <Link to="/login" className="font-bold text-white underline">
                Se connecter
              </Link>
            </p>
          </div>

          {/* Terms */}
          <p className="text-xs text-white/70 text-center px-4">
            En créant un compte, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
          </p>
        </form>
      </div>
    </div>
  );
}
