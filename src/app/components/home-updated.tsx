import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Cake, TreePine, Star, UserPlus, PlusIcon, Heart, Calendar, Settings } from 'lucide-react';
import { BottomNav } from './bottom-nav';
import { useLanguage } from './language-context';
import { useAuth } from './auth-context';
import { getSessionFromStorage } from '../../../utils/supabase/useSession';
import { projectId, publicAnonKey, serverBaseUrl } from '../../../utils/supabase/info';

interface UpcomingBirthday {
  name: string;
  photo: string | null;
  daysUntil: number;
  relation: string;
}

export function Home() {
  const { t } = useLanguage();
  const { role, loading } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [upcomingBirthday, setUpcomingBirthday] = useState<UpcomingBirthday | null>(null);
  const [memberCount, setMemberCount] = useState<number>(0);

  const isAdmin = role === 'admin' || role === 'super_admin';
  const isSuperAdmin = role === 'super_admin';

  useEffect(() => {
    const init = async () => {
      // Get current user
      const session = getSessionFromStorage(); // Fixed: avoid lock deadlock
      if (!session) return;
      setUser(session.user);

      // Fetch profiles to find upcoming birthdays and member count
      try {
        const res = await fetch(
          `${serverBaseUrl}/profiles`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'apikey': publicAnonKey,
            }
          }
        );
        if (res.ok) {
          const data = await res.json();
          const profiles = data.data || [];
          setMemberCount(profiles.length);

          // Find next upcoming birthday
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const withBirthdays = profiles
            .filter((p: any) => p.birth_date)
            .map((p: any) => {
              const bday = new Date(p.birth_date);
              const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
              if (next < today) next.setFullYear(today.getFullYear() + 1);
              const diff = Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              return { ...p, daysUntil: diff };
            })
            .sort((a: any, b: any) => a.daysUntil - b.daysUntil);

          if (withBirthdays.length > 0) {
            const next = withBirthdays[0];
            setUpcomingBirthday({
              name: next.full_name,
              photo: next.photo_url || null,
              daysUntil: next.daysUntil,
              relation: next.relation_type || '',
            });
          }
        }
      } catch (err) {
        console.error('Error fetching profiles:', err);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#D2691E]/20 border-t-[#D2691E] animate-spin mx-auto mb-3" />
          <p className="text-[#8D6E63]">Chargement...</p>
        </div>
      </div>
    );
  }

  const birthdayLabel = upcomingBirthday
    ? upcomingBirthday.daysUntil === 0
      ? "Anniversaire aujourd'hui !"
      : upcomingBirthday.daysUntil === 1
      ? "Anniversaire demain"
      : `Anniversaire dans ${upcomingBirthday.daysUntil} jours`
    : null;

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      <div className="flex-1 overflow-y-auto pb-24 px-6 pt-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#5D4037] mb-1">
            Bonjour, {user?.user_metadata?.name || 'Ami'} 👋
          </h1>
          <p className="text-[#8D6E63] text-base flex items-center gap-2">
            Bienvenue sur RootsLegacy
            {isAdmin && (
              <span className="text-xs bg-[#8B4513]/10 text-[#8B4513] px-2 py-0.5 rounded-full font-semibold">
                Admin
              </span>
            )}
            {isSuperAdmin && (
              <span className="text-xs bg-[#D2691E]/10 text-[#D2691E] px-2 py-0.5 rounded-full font-semibold">
                Super Admin
              </span>
            )}
          </p>
          {memberCount > 0 && (
            <p className="text-xs text-[#8D6E63] mt-1">{memberCount} membre{memberCount > 1 ? 's' : ''} dans votre famille</p>
          )}
        </div>

        {/* Birthday Alert — only shown if there's a real upcoming birthday */}
        {upcomingBirthday && (
          <Link to="/birthdays">
            <div className="bg-gradient-to-br from-[#D2691E] to-[#E8A05D] rounded-3xl p-5 shadow-xl mb-6 active:scale-98 transition-transform">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-3xl border-4 border-white shadow-lg overflow-hidden">
                  {upcomingBirthday.photo ? (
                    <img src={upcomingBirthday.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    '🎂'
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Cake className="w-4 h-4 text-white" />
                    <span className="text-white/90 text-xs font-semibold uppercase tracking-wide">
                      {birthdayLabel}
                    </span>
                  </div>
                  <h3 className="text-white font-bold">{upcomingBirthday.name}</h3>
                  {upcomingBirthday.relation && (
                    <p className="text-white/80 text-sm">{upcomingBirthday.relation}</p>
                  )}
                </div>
                <div className="text-3xl">🎉</div>
              </div>
            </div>
          </Link>
        )}

        {/* Main Action Cards */}
        <div className="space-y-4 mb-8">
          <Link to="/tree">
            <div className="bg-gradient-to-br from-[#D2691E] to-[#E8A05D] rounded-3xl p-6 shadow-lg active:scale-98 transition-transform">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <TreePine className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-1">Arbre Familial</h3>
                  <p className="text-white/80 text-sm">
                    {memberCount > 0 ? `${memberCount} membre${memberCount > 1 ? 's' : ''}` : 'Explorez votre arbre'}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/quiz">
            <div className="bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] rounded-3xl p-6 shadow-lg active:scale-98 transition-transform">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <Star className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-1">Quiz Familial</h3>
                  <p className="text-white/80 text-sm">Testez vos connaissances</p>
                </div>
              </div>
            </div>
          </Link>

          {isAdmin && (
            <Link to="/admin/create-profile">
              <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-[#D2691E]/20 active:scale-98 transition-transform">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#D2691E]/10 flex items-center justify-center">
                    <UserPlus className="w-7 h-7 text-[#D2691E]" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[#5D4037] font-semibold text-lg mb-1">Ajouter un membre</h3>
                    <p className="text-[#8D6E63] text-sm">Agrandissez votre arbre</p>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {isAdmin && (
            <Link to="/input-methods">
              <div className="bg-gradient-to-br from-[#8B4513] to-[#A0522D] rounded-3xl p-6 shadow-lg active:scale-98 transition-transform">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center">
                    <PlusIcon className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-1">Méthodes d'ajout</h3>
                    <p className="text-white/80 text-sm">Photo, voix, WhatsApp...</p>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {isSuperAdmin && (
            <Link to="/admin">
              <div className="bg-gradient-to-br from-[#D2691E] to-[#8B4513] rounded-3xl p-6 shadow-lg active:scale-98 transition-transform">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center">
                    <Settings className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-1">Super Admin</h3>
                    <p className="text-white/80 text-sm">Gérer le système</p>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Quick Actions (Admin only) */}
        {isAdmin && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-[#8D6E63] uppercase tracking-wide mb-3 px-2">
              Actions rapides
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/family-events?type=marriage">
                <button className="w-full bg-white rounded-2xl p-4 shadow-sm border border-[#5D4037]/10 active:scale-95 transition-transform">
                  <div className="w-10 h-10 rounded-xl bg-[#D2691E]/10 flex items-center justify-center mx-auto mb-2">
                    <Heart className="w-5 h-5 text-[#D2691E]" />
                  </div>
                  <div className="text-xs font-semibold text-[#5D4037]">Mariage</div>
                </button>
              </Link>

              <Link to="/family-events?type=birth">
                <button className="w-full bg-white rounded-2xl p-4 shadow-sm border border-[#5D4037]/10 active:scale-95 transition-transform">
                  <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 flex items-center justify-center mx-auto mb-2">
                    <PlusIcon className="w-5 h-5 text-[#2E7D32]" />
                  </div>
                  <div className="text-xs font-semibold text-[#5D4037]">Naissance</div>
                </button>
              </Link>

              <Link to="/family-events?type=death">
                <button className="w-full bg-white rounded-2xl p-4 shadow-sm border border-[#5D4037]/10 active:scale-95 transition-transform">
                  <div className="w-10 h-10 rounded-xl bg-[#8D6E63]/10 flex items-center justify-center mx-auto mb-2">
                    <Calendar className="w-5 h-5 text-[#8D6E63]" />
                  </div>
                  <div className="text-xs font-semibold text-[#5D4037]">Décès</div>
                </button>
              </Link>

              <Link to="/settings">
                <button className="w-full bg-white rounded-2xl p-4 shadow-sm border border-[#5D4037]/10 active:scale-95 transition-transform">
                  <div className="w-10 h-10 rounded-xl bg-[#8D6E63]/10 flex items-center justify-center mx-auto mb-2">
                    <Settings className="w-5 h-5 text-[#8D6E63]" />
                  </div>
                  <div className="text-xs font-semibold text-[#5D4037]">Paramètres</div>
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Empty state for new users */}
        {memberCount === 0 && isAdmin && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#D2691E]/20 text-center mb-6">
            <div className="text-4xl mb-3">🌳</div>
            <h3 className="font-bold text-[#5D4037] mb-2">Commencez votre arbre !</h3>
            <p className="text-sm text-[#8D6E63] mb-4">
              Ajoutez votre premier membre de famille pour démarrer votre arbre généalogique.
            </p>
            <Link to="/admin/create-profile">
              <button className="bg-[#D2691E] text-white px-6 py-2 rounded-2xl font-semibold text-sm">
                Ajouter un membre
              </button>
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
