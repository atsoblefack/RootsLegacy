import { ArrowLeft, User, Lock, Mail } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { useLanguage } from './language-context';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { supabase } from '../../../utils/supabase/client';
import { toast } from 'sonner';

export function InvitationPage() {
  const { t } = useLanguage();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-467d3bfa/profiles/invitation/${token}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Invalid invitation');
      }

      const data = await response.json();
      
      if (data.accountCreated) {
        setError(t('invitation.alreadyClaimed'));
      } else {
        setProfile(data);
      }
    } catch (err) {
      setError(t('invitation.invalidToken'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    // Validation
    if (!formData.email || !formData.password) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setCreating(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-467d3bfa/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: profile.name,
            invitationToken: token,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create account');
      }

      const data = await response.json();
      
      // Automatically sign in the user after account creation
      if (data.user) {
        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (signInError) {
            throw signInError;
          }

          if (signInData.session) {
            toast.success('Compte créé et connexion réussie!');
            navigate('/home');
          }
        } catch (signInErr: any) {
          console.error('Auto sign-in error:', signInErr);
          alert('Compte créé! Veuillez vous connecter.');
          navigate('/login');
        }
      }
    } catch (err: any) {
      console.error('Error creating account:', err);
      alert(`Erreur: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⏳</div>
          <p className="text-[#5D4037]">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="text-7xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-[#5D4037] mb-2">Erreur</h2>
            <p className="text-[#8D6E63] mb-6">{error}</p>
            <Link to="/">
              <button className="px-6 py-3 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold">
                Retour à l'Accueil
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#D2691E] to-[#E8A05D] px-6 py-12 text-white text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-2">{t('invitation.claimProfile')}</h1>
        <p className="text-white/90">Bienvenue dans la famille!</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-32 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-md">
          <div className="text-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D2691E]/20 to-[#E8A05D]/20 flex items-center justify-center text-4xl mx-auto mb-3">
              👤
            </div>
            <h2 className="text-xl font-bold text-[#5D4037] mb-1">{profile?.name}</h2>
            <p className="text-sm text-[#8D6E63]">{profile?.relation}</p>
          </div>

          <div className="bg-gradient-to-br from-[#2E7D32]/10 to-[#66BB6A]/10 rounded-2xl p-4 border-2 border-[#2E7D32]/20">
            <p className="text-sm text-[#5D4037] text-center">
              Un profil a été créé pour vous! Créez votre compte pour le compléter et accéder à l'arbre familial.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-md space-y-4">
          <h3 className="font-bold text-[#5D4037] mb-2">{t('invitation.createAccount')}</h3>

          <div>
            <label className="text-xs text-[#8D6E63] uppercase tracking-wide font-semibold block mb-2">
              Email *
            </label>
            <div className="flex items-center gap-3 p-3 bg-[#FFF8E7] rounded-xl">
              <Mail className="w-5 h-5 text-[#8D6E63]" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="votre@email.com"
                className="flex-1 bg-transparent text-[#5D4037] font-medium outline-none placeholder:text-[#8D6E63]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#8D6E63] uppercase tracking-wide font-semibold block mb-2">
              {t('invitation.password')} *
            </label>
            <div className="flex items-center gap-3 p-3 bg-[#FFF8E7] rounded-xl">
              <Lock className="w-5 h-5 text-[#8D6E63]" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 6 caractères"
                className="flex-1 bg-transparent text-[#5D4037] font-medium outline-none placeholder:text-[#8D6E63]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#8D6E63] uppercase tracking-wide font-semibold block mb-2">
              {t('invitation.confirmPassword')} *
            </label>
            <div className="flex items-center gap-3 p-3 bg-[#FFF8E7] rounded-xl">
              <Lock className="w-5 h-5 text-[#8D6E63]" />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirmez le mot de passe"
                className="flex-1 bg-transparent text-[#5D4037] font-medium outline-none placeholder:text-[#8D6E63]"
              />
            </div>
          </div>

          <div className="bg-[#FFF8E7] rounded-2xl p-4">
            <p className="text-xs text-[#8D6E63] leading-relaxed">
              En créant un compte, vous pourrez compléter votre profil, consulter l'arbre familial, et participer aux quiz familiaux.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#5D4037]/10 p-6" style={{ maxWidth: '375px', margin: '0 auto' }}>
        <button
          onClick={handleCreateAccount}
          disabled={creating || !formData.email || !formData.password || !formData.confirmPassword}
          className="w-full h-14 bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] text-white rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
        >
          {creating ? 'Création du compte...' : t('invitation.createAccountBtn')}
        </button>
      </div>
    </div>
  );
}