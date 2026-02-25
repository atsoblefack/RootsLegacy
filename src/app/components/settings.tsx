import { ArrowLeft, Bell, Lock, CreditCard, Users, LogOut, ChevronRight, Shield, Languages, HelpCircle, Link as LinkIcon, Gift, FileText, Crown } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { BottomNav } from './bottom-nav';
import { LanguageSelector } from './ui/language-selector';
import { useLanguage } from './language-context';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey, serverBaseUrl } from '../../../utils/supabase/info';
import { supabase } from '../../../utils/supabase/client';

export function Settings() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      // Clear session storage
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      // Sign out from Supabase (clears all auth state)
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      // Always redirect to splash/home screen
      navigate('/');
    }
  };
  const [userRole, setUserRole] = useState<'super_admin' | 'admin' | 'member'>('member');
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    loadUserRole();
    loadSubscription();
    // Load real user data
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser({
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Utilisateur',
          email: session.user.email || '',
        });
      }
    });
  }, []);

  const loadSubscription = async () => {
    try {
      const accessToken = sessionStorage.getItem('access_token');
      if (!accessToken) return;

      const response = await fetch(
        `${serverBaseUrl}/subscription`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        setDaysRemaining(data.daysRemaining);
      }
    } catch (err) {
      console.error('Error loading subscription:', err);
    }
  };

  const loadUserRole = async () => {
    try {
      const accessToken = sessionStorage.getItem('access_token');
      if (!accessToken) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${serverBaseUrl}/auth/role`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role);
      }
    } catch (err) {
      console.error('Error loading user role:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = () => {
    switch (userRole) {
      case 'super_admin':
        return (
          <span className="text-xs bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white px-2 py-0.5 rounded-full font-bold">
            Super Admin
          </span>
        );
      case 'admin':
        return (
          <span className="text-xs bg-[#8B4513]/10 text-[#8B4513] px-2 py-0.5 rounded-full font-semibold">
            {t('common.admin')}
          </span>
        );
      default:
        return null;
    }
  };

  const getPlanName = (plan: string) => {
    const names: Record<string, string> = {
      trial: 'Essai Gratuit',
      family: 'Family',
      clan: 'Clan',
      heritage: 'Heritage',
    };
    return names[plan] || plan;
  };
  
  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#8B4513] to-[#5D4037] px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/home">
            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">{t('settings.title')}</h1>
            <p className="text-sm text-white/80">Manage your preferences</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 px-6 py-6">
        {/* Account Section */}
        <div className="mb-6">
          <h3 className="text-xs text-[#8D6E63] uppercase tracking-wide font-semibold mb-3 px-2">
            Account
          </h3>
          
          <div className="bg-white rounded-3xl p-4 shadow-md mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex items-center justify-center text-2xl font-bold text-white">
                {currentUser?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <div className="font-bold text-[#5D4037]">{currentUser?.name || 'Chargement...'}</div>
                <div className="text-sm text-[#8D6E63]">{currentUser?.email || ''}</div>
                {!loading && (
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleBadge()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="mb-6">
          <h3 className="text-xs text-[#8D6E63] uppercase tracking-wide font-semibold mb-3 px-2">
            Preferences
          </h3>
          
          <div className="space-y-2">
            <LanguageSelector />
          </div>
        </div>

        {/* Subscription Section */}
        {subscription && (userRole === 'admin' || userRole === 'super_admin') && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-[#8D6E63] uppercase tracking-wide mb-3 px-2">
              Abonnement
            </h2>
            <div className="bg-white rounded-3xl shadow-md overflow-hidden">
              <Link to="/subscription-upgrade">
                <button className="w-full flex items-center gap-4 p-4 hover:bg-[#FFF8E7] transition-colors active:scale-98">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    subscription.plan === 'trial'
                      ? 'bg-[#E8A05D]/10'
                      : 'bg-gradient-to-br from-[#D2691E] to-[#E8A05D]'
                  }`}>
                    <Crown className={`w-6 h-6 ${
                      subscription.plan === 'trial' ? 'text-[#D2691E]' : 'text-white'
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-[#5D4037]">
                      {getPlanName(subscription.plan)}
                    </div>
                    <div className="text-sm text-[#8D6E63]">
                      {subscription.plan === 'trial' && daysRemaining !== null ? (
                        daysRemaining <= 7 ? (
                          <span className="text-[#D2691E] font-medium">
                            Plus que {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}
                          </span>
                        ) : (
                          `${daysRemaining} jours restants`
                        )
                      ) : subscription.status === 'expired' ? (
                        <span className="text-[#D2691E] font-medium">Expiré - Lecture seule</span>
                      ) : (
                        `Jusqu'à ${subscription.memberLimit} membres`
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#8D6E63]" />
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Referral Section */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[#8D6E63] uppercase tracking-wide mb-3 px-2">
            Parrainage
          </h2>
          <div className="bg-white rounded-3xl shadow-md overflow-hidden">
            <Link to="/referral">
              <button className="w-full flex items-center gap-4 p-4 hover:bg-[#FFF8E7] transition-colors active:scale-98 border-b border-[#5D4037]/5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-[#5D4037]">Programme de Parrainage</div>
                  <div className="text-sm text-[#8D6E63]">Invitez et gagnez du stockage</div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#8D6E63]" />
              </button>
            </Link>
            <Link to="/payment-test">
              <button className="w-full flex items-center gap-4 p-4 hover:bg-[#FFF8E7] transition-colors active:scale-98 border-b border-[#5D4037]/5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-[#5D4037]">Test de Paiement</div>
                  <div className="text-sm text-[#8D6E63]">Simuler un premier paiement</div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#8D6E63]" />
              </button>
            </Link>
            <Link to="/referral-test">
              <button className="w-full flex items-center gap-4 p-4 hover:bg-[#FFF8E7] transition-colors active:scale-98">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#9C27B0] to-[#E040FB] flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-[#5D4037]">Test de Parrainage</div>
                  <div className="text-sm text-[#8D6E63]">Tester le flux complet</div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#8D6E63]" />
              </button>
            </Link>
          </div>
        </div>

        {/* Admin Section - Only for Super Admin */}
        {userRole === 'super_admin' && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-[#8D6E63] uppercase tracking-wide mb-3 px-2">
              Administration
            </h2>
            <div className="bg-white rounded-3xl shadow-md overflow-hidden">
              <Link to="/manage-users">
                <button className="w-full flex items-center gap-4 p-4 hover:bg-[#FFF8E7] transition-colors active:scale-98 border-b border-[#5D4037]/5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-[#5D4037]">{t('users.manageTitle')}</div>
                    <div className="text-sm text-[#8D6E63]">{t('users.promoteAndRevoke')}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#8D6E63]" />
                </button>
              </Link>
              <Link to="/link-families">
                <button className="w-full flex items-center gap-4 p-4 hover:bg-[#FFF8E7] transition-colors active:scale-98">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex items-center justify-center">
                    <LinkIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-[#5D4037]">Lier les Familles</div>
                    <div className="text-sm text-[#8D6E63]">Fusionner les arbres par mariage</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#8D6E63]" />
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Admin Section - Only for Regular Admin */}
        {userRole === 'admin' && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-[#8D6E63] uppercase tracking-wide mb-3 px-2">
              Administration
            </h2>
            <div className="bg-white rounded-3xl shadow-md overflow-hidden">
              <Link to="/link-families">
                <button className="w-full flex items-center gap-4 p-4 hover:bg-[#FFF8E7] transition-colors active:scale-98">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex items-center justify-center">
                    <LinkIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-[#5D4037]">Lier les Familles</div>
                    <div className="text-sm text-[#8D6E63]">Fusionner les arbres par mariage</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#8D6E63]" />
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* App Settings Section */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[#8D6E63] uppercase tracking-wide mb-3 px-2">
            App Settings
          </h2>
          <div className="bg-white rounded-3xl shadow-md overflow-hidden">
            <div className="flex items-center gap-4 p-4 border-b border-[#5D4037]/5">
              <div className="w-12 h-12 rounded-2xl bg-[#E8A05D]/10 flex items-center justify-center">
                <Bell className="w-6 h-6 text-[#E8A05D]" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-[#5D4037]">Notifications</div>
                <div className="text-sm text-[#8D6E63]">Family updates & reminders</div>
              </div>
              <button
                className={`w-14 h-8 rounded-full transition-colors ${
                  'bg-[#2E7D32]'
                }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    'translate-x-7'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-2xl bg-[#5D4037]/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-[#5D4037]" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-[#5D4037]">Private Mode</div>
                <div className="text-sm text-[#8D6E63]">Hide sensitive information</div>
              </div>
              <button
                className={`w-14 h-8 rounded-full transition-colors ${
                  'bg-[#2E7D32]'
                }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    'translate-x-7'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[#8D6E63] uppercase tracking-wide mb-3 px-2">
            Support
          </h2>
          <div className="bg-white rounded-3xl shadow-md overflow-hidden">
            <Link to="/family-book-export">
              <button className="w-full flex items-center gap-4 p-4 hover:bg-[#FFF8E7] transition-colors active:scale-98 border-b border-[#5D4037]/5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B4513] to-[#5D4037] flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-[#5D4037]">Family Heritage Book</div>
                  <div className="text-sm text-[#8D6E63]">Export custom PDF</div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#8D6E63]" />
              </button>
            </Link>
            
            <button className="w-full flex items-center gap-4 p-4 hover:bg-[#FFF8E7] transition-colors active:scale-98 border-b border-[#5D4037]/5">
              <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-[#2E7D32]" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-[#5D4037]">Help & Support</div>
                <div className="text-sm text-[#8D6E63]">FAQs and contact us</div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#8D6E63]" />
            </button>

            <button onClick={handleSignOut} className="w-full flex items-center gap-4 p-4 hover:bg-[#FFF8E7] transition-colors active:scale-98">
              <div className="w-12 h-12 rounded-2xl bg-[#d4183d]/10 flex items-center justify-center">
                <LogOut className="w-6 h-6 text-[#d4183d]" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-[#d4183d]">Sign Out</div>
                <div className="text-sm text-[#8D6E63]">See you soon!</div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#8D6E63]" />
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center pb-6">
          <p className="text-sm text-[#8D6E63]">RootsLegacy v1.0.0</p>
          <p className="text-xs text-[#8D6E63] mt-1">Preserving African diaspora heritage</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}