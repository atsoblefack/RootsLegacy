import { TreePine, Star, UserPlus, Cake, Heart, Plus as PlusIcon, Calendar } from 'lucide-react';
import { Link } from 'react-router';
import { BottomNav } from './bottom-nav';
import { useLanguage } from './language-context';

export function Home() {
  const { t } = useLanguage();
  
  const upcomingBirthday = {
    name: 'Kwame Mensah',
    photo: '👴🏿',
    daysUntil: 1,
    relation: 'Great-Grandfather'
  };

  const isAdmin = true; // In real app, this would come from auth/state

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      <div className="flex-1 overflow-y-auto pb-24 px-6 pt-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#5D4037] mb-1">
            {t('home.hello')}, Amara 👋
          </h1>
          <p className="text-[#8D6E63] text-base flex items-center gap-2">
            {t('home.welcome')}
            {isAdmin && (
              <span className="text-xs bg-[#8B4513]/10 text-[#8B4513] px-2 py-0.5 rounded-full font-semibold">
                {t('common.admin')}
              </span>
            )}
          </p>
        </div>

        {/* Birthday Alert */}
        <Link to="/birthdays">
          <div className="bg-gradient-to-br from-[#D2691E] to-[#E8A05D] rounded-3xl p-5 shadow-xl mb-6 active:scale-98 transition-transform">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-3xl border-4 border-white shadow-lg">
                {upcomingBirthday.photo}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Cake className="w-4 h-4 text-white" />
                  <span className="text-white/90 text-xs font-semibold uppercase tracking-wide">
                    {t('home.birthdayTomorrow')}
                  </span>
                </div>
                <h3 className="text-white font-bold">{upcomingBirthday.name}</h3>
                <p className="text-white/80 text-sm">{upcomingBirthday.relation}</p>
              </div>
              <div className="text-3xl">🎉</div>
            </div>
          </div>
        </Link>

        {/* Main Action Cards */}
        <div className="space-y-4 mb-8">
          <Link to="/tree">
            <div className="bg-gradient-to-br from-[#D2691E] to-[#E8A05D] rounded-3xl p-6 shadow-lg active:scale-98 transition-transform">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <TreePine className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-1">View Family Tree</h3>
                  <p className="text-white/80 text-sm">Explore your ancestry</p>
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
                  <h3 className="text-white font-semibold text-lg mb-1">Play Quiz</h3>
                  <p className="text-white/80 text-sm">Test your family knowledge</p>
                </div>
              </div>
            </div>
          </Link>

          {isAdmin && (
            <Link to="/input-methods">
              <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-[#D2691E]/20 active:scale-98 transition-transform">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#D2691E]/10 flex items-center justify-center">
                    <UserPlus className="w-7 h-7 text-[#D2691E]" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[#5D4037] font-semibold text-lg mb-1">Add Family Member</h3>
                    <p className="text-[#8D6E63] text-sm">Grow your family tree</p>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin/create-profile">
              <div className="bg-gradient-to-br from-[#8B4513] to-[#A0522D] rounded-3xl p-6 shadow-lg active:scale-98 transition-transform">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center">
                    <PlusIcon className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-1">{t('admin.createProfile')}</h3>
                    <p className="text-white/80 text-sm">{t('admin.sendInvitation')}</p>
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
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/family-events?type=marriage">
                <button className="w-full bg-white rounded-2xl p-4 shadow-sm border border-[#5D4037]/10 active:scale-95 transition-transform">
                  <div className="w-10 h-10 rounded-xl bg-[#D2691E]/10 flex items-center justify-center mx-auto mb-2">
                    <Heart className="w-5 h-5 text-[#D2691E]" />
                  </div>
                  <div className="text-xs font-semibold text-[#5D4037]">Marriage</div>
                </button>
              </Link>

              <Link to="/family-events?type=birth">
                <button className="w-full bg-white rounded-2xl p-4 shadow-sm border border-[#5D4037]/10 active:scale-95 transition-transform">
                  <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 flex items-center justify-center mx-auto mb-2">
                    <PlusIcon className="w-5 h-5 text-[#2E7D32]" />
                  </div>
                  <div className="text-xs font-semibold text-[#5D4037]">Birth</div>
                </button>
              </Link>

              <Link to="/family-events?type=death">
                <button className="w-full bg-white rounded-2xl p-4 shadow-sm border border-[#5D4037]/10 active:scale-95 transition-transform">
                  <div className="w-10 h-10 rounded-xl bg-[#8D6E63]/10 flex items-center justify-center mx-auto mb-2">
                    <Calendar className="w-5 h-5 text-[#8D6E63]" />
                  </div>
                  <div className="text-xs font-semibold text-[#5D4037]">Passing</div>
                </button>
              </Link>

              <Link to="/family-events">
                <button className="w-full bg-white rounded-2xl p-4 shadow-sm border border-[#5D4037]/10 active:scale-95 transition-transform">
                  <div className="w-10 h-10 rounded-xl bg-[#E8A05D]/10 flex items-center justify-center mx-auto mb-2">
                    <Calendar className="w-5 h-5 text-[#E8A05D]" />
                  </div>
                  <div className="text-xs font-semibold text-[#5D4037]">All Events</div>
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="text-[#5D4037] font-semibold text-lg mb-4">Your Legacy Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#D2691E] mb-1">24</div>
              <div className="text-xs text-[#8D6E63]">Family Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#2E7D32] mb-1">5</div>
              <div className="text-xs text-[#8D6E63]">Generations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#E8A05D] mb-1">12</div>
              <div className="text-xs text-[#8D6E63]">Stories Shared</div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}