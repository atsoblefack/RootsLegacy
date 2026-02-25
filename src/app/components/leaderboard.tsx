import { ArrowLeft, Trophy, Clock, Users } from 'lucide-react';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { LeaderboardRow, LeaderboardEntry, grades } from './gamification-system';
import { BottomNav } from './bottom-nav';
import { useLanguage } from './language-context';
import { serverBaseUrl, publicAnonKey } from '../../../utils/supabase/info';
import { getSessionFromStorage } from '../../../utils/supabase/useSession';

type LeaderboardPeriod = 'week' | 'month' | 'alltime';

export function Leaderboard() {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<LeaderboardPeriod>('week');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const buildLeaderboard = async () => {
      try {
        const session = getSessionFromStorage();
        if (!session) { setIsLoading(false); return; }
        const res = await fetch(`${serverBaseUrl}/family-members`, {
          headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': publicAnonKey },
        });
        if (!res.ok) { setIsLoading(false); return; }
        const data = await res.json();
        const members = data.data || data || [];
        const entries: LeaderboardEntry[] = members.map((member: any, index: number) => {
          const userId = member.user_id || member.id || `member-${index}`;
          let stats = { totalPoints: 0, totalQuizzes: 0, accuracy: 0 };
          try {
            const raw = localStorage.getItem(`quiz_stats_${userId}`);
            if (raw) stats = JSON.parse(raw);
          } catch { /* ignore */ }
          return { userId, userName: member.full_name || member.name || 'Membre', userPhoto: member.avatar_url || '👤', points: stats.totalPoints || 0, quizzes: stats.totalQuizzes || 0, accuracy: stats.accuracy || 0, rank: 0, grade: 'Novice' } as LeaderboardEntry;
        });
        entries.sort((a, b) => b.points - a.points);
        entries.forEach((e, i) => { e.rank = i + 1; });
        setLeaderboardData(entries);
      } catch { /* silently fail */ }
      finally { setIsLoading(false); }
    };
    buildLeaderboard();
  }, []);

  const currentData = leaderboardData;
  const session = getSessionFromStorage();
  const currentUserId = session?.user?.id;
  const currentUserRank = currentData.find(e => e.userId === currentUserId) || null;

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#D2691E] to-[#E8A05D] px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/quiz">
            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">{t('leaderboard.title')}</h1>
            <p className="text-sm text-white/80">Challenge your family</p>
          </div>
        </div>
        <div className="flex gap-2 bg-white/20 backdrop-blur-sm rounded-2xl p-1">
          <button onClick={() => setPeriod('week')} className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${period === 'week' ? 'bg-white text-[#D2691E] shadow-md' : 'text-white/80'}`}>
            <Clock className="w-4 h-4 inline-block mr-1" />{t('leaderboard.week')}
          </button>
          <button onClick={() => setPeriod('month')} className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${period === 'month' ? 'bg-white text-[#D2691E] shadow-md' : 'text-white/80'}`}>
            {t('leaderboard.month')}
          </button>
          <button onClick={() => setPeriod('alltime')} className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${period === 'alltime' ? 'bg-white text-[#D2691E] shadow-md' : 'text-white/80'}`}>
            <Trophy className="w-4 h-4 inline-block mr-1" />{t('leaderboard.allTime')}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-[#D2691E]/20 border-t-[#D2691E] animate-spin" />
        </div>
      ) : currentData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="text-7xl mb-6">🏆</div>
          <h2 className="text-xl font-bold text-[#5D4037] mb-3">Aucun score pour le moment</h2>
          <p className="text-[#8D6E63] mb-8 leading-relaxed">Jouez un quiz pour apparaître dans le classement !</p>
          <Link to="/quiz">
            <button className="h-14 px-8 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform">
              Jouer un quiz
            </button>
          </Link>
        </div>
      ) : (
        <>
          {currentUserRank && (
            <div className="px-6 py-4 bg-white border-b border-[#5D4037]/10">
              <p className="text-xs text-[#8D6E63] uppercase tracking-wide font-semibold mb-2">Ta Position</p>
              <LeaderboardRow entry={currentUserRank} showStats />
            </div>
          )}
          {currentData.length >= 3 && (
            <div className="px-6 py-6 bg-white border-b border-[#5D4037]/10">
              <div className="flex items-end justify-center gap-2">
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-[#C0C0C0]/20 flex items-center justify-center text-3xl mb-2 border-4 border-[#C0C0C0]">{currentData[1].userPhoto}</div>
                  <div className="text-center mb-2"><div className="text-xs font-bold text-[#5D4037] truncate w-20">{currentData[1].userName}</div><div className="text-xs text-[#8D6E63]">{currentData[1].points} pts</div></div>
                  <div className="w-full bg-[#C0C0C0] rounded-t-xl h-20 flex items-center justify-center"><span className="text-white font-bold text-2xl">2</span></div>
                </div>
                <div className="flex-1 flex flex-col items-center -mt-4">
                  <div className="w-20 h-20 rounded-full bg-[#FFD700]/20 flex items-center justify-center text-4xl mb-2 border-4 border-[#FFD700] relative">
                    {currentData[0].userPhoto}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center"><Trophy className="w-5 h-5 text-white" /></div>
                  </div>
                  <div className="text-center mb-2"><div className="text-sm font-bold text-[#5D4037] truncate w-24">{currentData[0].userName}</div><div className="text-xs text-[#8D6E63]">{currentData[0].points} pts</div></div>
                  <div className="w-full bg-[#FFD700] rounded-t-xl h-28 flex items-center justify-center"><span className="text-white font-bold text-3xl">1</span></div>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-[#CD7F32]/20 flex items-center justify-center text-3xl mb-2 border-4 border-[#CD7F32]">{currentData[2].userPhoto}</div>
                  <div className="text-center mb-2"><div className="text-xs font-bold text-[#5D4037] truncate w-20">{currentData[2].userName}</div><div className="text-xs text-[#8D6E63]">{currentData[2].points} pts</div></div>
                  <div className="w-full bg-[#CD7F32] rounded-t-xl h-16 flex items-center justify-center"><span className="text-white font-bold text-2xl">3</span></div>
                </div>
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#5D4037] flex items-center gap-2"><Users className="w-5 h-5 text-[#D2691E]" />Classement Complet</h3>
              <span className="text-xs text-[#8D6E63]">{currentData.length} participants</span>
            </div>
            <div className="space-y-2">
              {currentData.slice(currentData.length >= 3 ? 3 : 0).map((entry) => (
                <LeaderboardRow key={entry.userId} entry={entry} showStats />
              ))}
            </div>
            <div className="bg-gradient-to-br from-[#2E7D32]/10 to-[#66BB6A]/10 rounded-2xl p-4 mt-6 border-2 border-[#2E7D32]/20">
              <h4 className="font-bold text-[#5D4037] mb-2">🏆 Comment Gagner des Points</h4>
              <ul className="text-xs text-[#5D4037] space-y-1">
                <li>• Bonne réponse: <span className="font-bold text-[#2E7D32]">10 pts</span></li>
                <li>• Réponse rapide (&lt;2s): <span className="font-bold text-[#2E7D32]">+10 pts bonus</span></li>
                <li>• Réponse moyenne (2-5s): <span className="font-bold text-[#E8A05D]">+7 pts bonus</span></li>
                <li>• Série de 7 jours: <span className="font-bold text-[#D2691E]">Badge spécial 🔥</span></li>
              </ul>
            </div>
          </div>
        </>
      )}
      <BottomNav />
    </div>
  );
}