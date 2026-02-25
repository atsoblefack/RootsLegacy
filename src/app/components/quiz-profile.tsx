import { ArrowLeft, Award, Share2, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  GradeDisplay, 
  BadgeGrid, 
  StreakDisplay, 
  StatsCard,
  badges,
  Badge,
  getCurrentGrade
} from './gamification-system';
import { BottomNav } from './bottom-nav';
import { getSessionFromStorage } from '../../../utils/supabase/useSession';

export function QuizProfile() {
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    totalQuizzes: 0,
    accuracy: 0,
    currentStreak: 0,
    bestStreak: 0,
    bestWeeklyRank: null as number | null,
  });
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBadgeDetail, setShowBadgeDetail] = useState<Badge | null>(null);

  useEffect(() => {
    const session = getSessionFromStorage();
    const userId = session?.user?.id || 'guest';
    try {
      const raw = localStorage.getItem(`quiz_stats_${userId}`);
      if (raw) {
        const stats = JSON.parse(raw);
        setUserStats({
          totalPoints: stats.totalPoints || 0,
          totalQuizzes: stats.totalQuizzes || 0,
          accuracy: stats.accuracy || 0,
          currentStreak: stats.currentStreak || 0,
          bestStreak: stats.bestStreak || 0,
          bestWeeklyRank: stats.bestWeeklyRank || null,
        });
        // Calculate unlocked badges
        const unlocked: Badge[] = [];
        if ((stats.totalQuizzes || 0) >= 1) {
          const b = badges.find(b => b.id === 'first-quiz');
          if (b) unlocked.push(b);
        }
        const hasPerfect = localStorage.getItem(`quiz_perfect_${userId}`) === 'true';
        if (hasPerfect) {
          const b = badges.find(b => b.id === 'perfect-score');
          if (b) unlocked.push(b);
        }
        if ((stats.bestStreak || 0) >= 7) {
          const b = badges.find(b => b.id === 'streak-7');
          if (b) unlocked.push(b);
        }
        setUnlockedBadges(unlocked);
      }
    } catch { /* ignore */ }
    setIsLoading(false);
  }, []);

  const currentGrade = getCurrentGrade(userStats.totalPoints);

  if (isLoading) {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[#D2691E]/20 border-t-[#D2691E] animate-spin" />
      </div>
    );
  }

  if (userStats.totalQuizzes === 0) {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col items-center justify-center p-8 text-center">
        <div className="text-7xl mb-6">🏆</div>
        <h2 className="text-2xl font-bold text-[#5D4037] mb-3">Vous n'avez pas encore joué de quiz</h2>
        <p className="text-[#8D6E63] mb-8 leading-relaxed">
          Jouez votre premier quiz pour voir vos statistiques et débloquer des badges !
        </p>
        <button
          onClick={() => navigate('/quiz')}
          className="h-14 px-8 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform"
        >
          Jouer maintenant
        </button>
      </div>
    );
  }

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
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Ma Progression</h1>
            <p className="text-sm text-white/80">Ton parcours d'apprentissage</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Quick grade display */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
              {currentGrade.icon}
            </div>
            <div className="flex-1 text-white">
              <div className="font-bold text-lg">{currentGrade.name}</div>
              <div className="text-sm text-white/80">{currentGrade.nameLocal}</div>
              <div className="text-xs text-white/70 mt-1">{userStats.totalPoints} points totaux</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6">
        {/* Stats */}
        <StatsCard
          totalQuizzes={userStats.totalQuizzes}
          totalPoints={userStats.totalPoints}
          accuracy={userStats.accuracy}
          bestWeeklyRank={userStats.bestWeeklyRank}
        />

        {/* Streak */}
        <StreakDisplay
          currentStreak={userStats.currentStreak}
          bestStreak={userStats.bestStreak}
        />

        {/* Grade progress */}
        <GradeDisplay
          grade={currentGrade}
          currentPoints={userStats.totalPoints}
        />

        {/* Badges */}
        <div className="bg-white rounded-3xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#5D4037] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#E8A05D]" />
              Badges
            </h3>
            <span className="text-sm text-[#8D6E63]">
              {unlockedBadges.length}/{badges.length}
            </span>
          </div>

          <BadgeGrid userBadges={unlockedBadges} />

          <div className="mt-4 bg-[#E8A05D]/10 rounded-xl p-3">
            <p className="text-xs text-[#5D4037] text-center">
              💡 Complète plus de quiz et améliore ta précision pour débloquer tous les badges!
            </p>
          </div>
        </div>

        {/* Unlocked badges detail */}
        {unlockedBadges.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-md">
            <h3 className="font-bold text-[#5D4037] mb-4">Badges Débloqués</h3>
            <div className="space-y-3">
              {unlockedBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-2xl p-4 flex items-center gap-3"
                  style={{ backgroundColor: `${badge.color}10` }}
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${badge.color}20` }}
                  >
                    {badge.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-[#5D4037]">{badge.name}</div>
                    <div className="text-xs text-[#8D6E63]">{badge.description}</div>
                  </div>
                  <div className="text-xs text-[#2E7D32] font-semibold bg-[#2E7D32]/10 px-2 py-1 rounded-full">
                    ✓
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Share achievement */}
        <div className="bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] rounded-3xl p-6 text-white text-center">
          <div className="text-5xl mb-3">{currentGrade.icon}</div>
          <h3 className="font-bold text-lg mb-2">Partage Tes Progrès!</h3>
          <p className="text-white/90 text-sm mb-4">
            Montre à ta famille ton niveau {currentGrade.name}
          </p>
          <button className="w-full bg-white text-[#2E7D32] rounded-2xl py-3 font-semibold active:scale-95 transition-transform flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5" />
            Partager sur WhatsApp
          </button>
        </div>

        {/* All grades overview */}
        <div className="bg-white rounded-3xl p-6 shadow-md">
          <h3 className="font-bold text-[#5D4037] mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#2E7D32]" />
            Progression des Grades
          </h3>
          <div className="space-y-3">
            {[...badges].slice(0, 6).map((grade: any, index) => {
              const gradeObj = { 
                id: index + 1, 
                name: ['Novice', 'Apprenti', 'Conteur', 'Gardien', 'Sage', 'Ancêtre'][index],
                minPoints: [0, 100, 500, 1500, 3000, 5000][index],
                icon: ['🌱', '📚', '🎭', '🛡️', '👴🏿', '👑'][index],
                color: ['#8D6E63', '#66BB6A', '#E8A05D', '#D2691E', '#2E7D32', '#D4183D'][index]
              };
              const isAchieved = userStats.totalPoints >= gradeObj.minPoints;
              
              return (
                <div
                  key={gradeObj.id}
                  className={`rounded-2xl p-3 flex items-center gap-3 ${
                    isAchieved ? 'bg-[#2E7D32]/10' : 'bg-[#8D6E63]/5'
                  }`}
                >
                  <div 
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                      isAchieved ? 'opacity-100' : 'opacity-30'
                    }`}
                    style={{ backgroundColor: `${gradeObj.color}20` }}
                  >
                    {gradeObj.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`font-bold text-sm ${isAchieved ? 'text-[#5D4037]' : 'text-[#8D6E63]'}`}>
                      {gradeObj.name}
                    </div>
                    <div className="text-xs text-[#8D6E63]">{gradeObj.minPoints} points</div>
                  </div>
                  {isAchieved && (
                    <div className="w-6 h-6 rounded-full bg-[#2E7D32] flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
