import { Trophy, Medal, Star, TrendingUp, Flame, Award, Crown } from 'lucide-react';
import { motion } from 'motion/react';

// Grade system with African-inspired titles
export interface Grade {
  id: number;
  name: string;
  nameLocal: string; // Nom en langue locale
  minPoints: number;
  icon: string;
  color: string;
  description: string;
}

export const grades: Grade[] = [
  { 
    id: 1, 
    name: 'Novice', 
    nameLocal: 'Ɔbotafowaa (Twi)', 
    minPoints: 0, 
    icon: '🌱', 
    color: '#8D6E63',
    description: 'Tu commences ton voyage dans l\'histoire familiale'
  },
  { 
    id: 2, 
    name: 'Apprenti', 
    nameLocal: 'Ɔsuani (Twi)', 
    minPoints: 100, 
    icon: '📚', 
    color: '#66BB6A',
    description: 'Tu apprends les histoires de tes ancêtres'
  },
  { 
    id: 3, 
    name: 'Conteur', 
    nameLocal: 'Anansesɛm (Twi)', 
    minPoints: 500, 
    icon: '🎭', 
    color: '#E8A05D',
    description: 'Tu partages les récits familiaux avec passion'
  },
  { 
    id: 4, 
    name: 'Gardien', 
    nameLocal: 'Ɔwɛmfo (Twi)', 
    minPoints: 1500, 
    icon: '🛡️', 
    color: '#D2691E',
    description: 'Gardien de la mémoire et des traditions'
  },
  { 
    id: 5, 
    name: 'Sage du Village', 
    nameLocal: 'Ɔkyerema (Twi)', 
    minPoints: 3000, 
    icon: '👴🏿', 
    color: '#2E7D32',
    description: 'Sage respecté, source de sagesse familiale'
  },
  { 
    id: 6, 
    name: 'Ancêtre Vivant', 
    nameLocal: 'Nananom Teasefo (Twi)', 
    minPoints: 5000, 
    icon: '👑', 
    color: '#D4183D',
    description: 'Trésor vivant de l\'histoire familiale'
  },
];

// Badge system with cultural themes
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: string;
  isUnlocked?: boolean;
  unlockedAt?: string;
}

export const badges: Badge[] = [
  {
    id: 'first-quiz',
    name: 'Premier Pas',
    description: 'Complète ton premier quiz',
    icon: '🎯',
    color: '#2E7D32',
    requirement: 'complete_1_quiz'
  },
  {
    id: 'perfect-score',
    name: 'Sans Faute',
    description: '100% de bonnes réponses',
    icon: '💯',
    color: '#D4183D',
    requirement: 'perfect_score'
  },
  {
    id: 'week-champion',
    name: 'Champion de la Semaine',
    description: 'Premier du classement hebdomadaire',
    icon: '🏆',
    color: '#E8A05D',
    requirement: 'weekly_rank_1'
  },
  {
    id: 'streak-7',
    name: 'Dévoué',
    description: '7 jours consécutifs de quiz',
    icon: '🔥',
    color: '#FF5722',
    requirement: 'streak_7'
  },
  {
    id: 'streak-30',
    name: 'Inébranlable',
    description: '30 jours consécutifs',
    icon: '⚡',
    color: '#FF9800',
    requirement: 'streak_30'
  },
  {
    id: 'speed-demon',
    name: 'Éclair',
    description: 'Réponds en moins de 2 secondes',
    icon: '⚡',
    color: '#FFD700',
    requirement: 'answer_under_2s'
  },
  {
    id: 'quiz-master',
    name: 'Maître Quiz',
    description: 'Complète 100 quiz',
    icon: '🎓',
    color: '#2E7D32',
    requirement: 'complete_100_quiz'
  },
  {
    id: 'elder-respect',
    name: 'Respect des Anciens',
    description: 'Connais tous les grands-parents',
    icon: '🙏🏿',
    color: '#D2691E',
    requirement: 'know_all_grandparents'
  },
  {
    id: 'village-historian',
    name: 'Historien du Village',
    description: 'Connais tous les villages d\'origine',
    icon: '🏡',
    color: '#66BB6A',
    requirement: 'know_all_villages'
  },
  {
    id: 'name-keeper',
    name: 'Gardien des Noms',
    description: 'Connais tous les noms d\'initiation',
    icon: '📜',
    color: '#E8A05D',
    requirement: 'know_all_local_names'
  },
];

// Leaderboard entry
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userPhoto: string;
  points: number;
  accuracy: number;
  quizCount: number;
  grade: Grade;
  isCurrentUser?: boolean;
}

interface GradeDisplayProps {
  grade: Grade;
  currentPoints: number;
  compact?: boolean;
}

export function GradeDisplay({ grade, currentPoints, compact = false }: GradeDisplayProps) {
  const nextGrade = grades.find(g => g.id === grade.id + 1);
  const progress = nextGrade 
    ? ((currentPoints - grade.minPoints) / (nextGrade.minPoints - grade.minPoints)) * 100
    : 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl">{grade.icon}</span>
        <div className="flex-1">
          <div className="text-sm font-bold" style={{ color: grade.color }}>
            {grade.name}
          </div>
          <div className="text-xs text-[#8D6E63]">{grade.nameLocal}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md">
      <div className="flex items-start gap-4 mb-4">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
          style={{ backgroundColor: `${grade.color}20` }}
        >
          {grade.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg" style={{ color: grade.color }}>
              {grade.name}
            </h3>
            {grade.id === grades.length && (
              <Crown className="w-5 h-5 text-[#D4183D]" />
            )}
          </div>
          <p className="text-sm text-[#8D6E63] mb-1">{grade.nameLocal}</p>
          <p className="text-xs text-[#8D6E63]">{grade.description}</p>
        </div>
      </div>

      {nextGrade && (
        <div>
          <div className="flex items-center justify-between text-xs text-[#8D6E63] mb-2">
            <span>Progrès vers {nextGrade.name}</span>
            <span className="font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-3 bg-[#FFF8E7] rounded-full overflow-hidden">
            <motion.div 
              className="h-full rounded-full"
              style={{ backgroundColor: nextGrade.color }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-[#8D6E63] mt-2 text-center">
            {nextGrade.minPoints - currentPoints} points restants
          </p>
        </div>
      )}
    </div>
  );
}

interface BadgeGridProps {
  userBadges: Badge[];
  allBadges?: Badge[];
}

export function BadgeGrid({ userBadges, allBadges = badges }: BadgeGridProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {allBadges.map((badge) => {
        const isUnlocked = userBadges.some(b => b.id === badge.id);
        return (
          <motion.div
            key={badge.id}
            whileHover={{ scale: 1.05 }}
            className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 ${
              isUnlocked 
                ? 'bg-white shadow-md' 
                : 'bg-[#8D6E63]/10 opacity-40'
            }`}
          >
            <span className="text-3xl mb-1">{badge.icon}</span>
            <span className="text-xs text-center font-semibold text-[#5D4037] leading-tight">
              {badge.name.split(' ')[0]}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  showStats?: boolean;
}

export function LeaderboardRow({ entry, showStats = false }: LeaderboardRowProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-[#FFD700]" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-[#C0C0C0]" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-[#CD7F32]" />;
    return <span className="text-lg font-bold text-[#8D6E63]">#{rank}</span>;
  };

  return (
    <div 
      className={`rounded-2xl p-4 ${
        entry.isCurrentUser 
          ? 'bg-gradient-to-br from-[#D2691E]/20 to-[#E8A05D]/20 border-2 border-[#D2691E]' 
          : 'bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 flex items-center justify-center">
          {getRankIcon(entry.rank)}
        </div>
        
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex items-center justify-center text-2xl">
          {entry.userPhoto}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#5D4037]">{entry.userName}</span>
            {entry.isCurrentUser && (
              <span className="text-xs bg-[#D2691E] text-white px-2 py-0.5 rounded-full font-semibold">
                Toi
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-[#8D6E63]">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-[#E8A05D]" />
              {entry.points} pts
            </span>
            {showStats && (
              <>
                <span>•</span>
                <span>{entry.accuracy}% précis</span>
                <span>•</span>
                <span>{entry.quizCount} quiz</span>
              </>
            )}
          </div>
        </div>

        <span className="text-2xl">{entry.grade.icon}</span>
      </div>
    </div>
  );
}

interface StreakDisplayProps {
  currentStreak: number;
  bestStreak: number;
}

export function StreakDisplay({ currentStreak, bestStreak }: StreakDisplayProps) {
  return (
    <div className="bg-gradient-to-br from-[#FF5722] to-[#FF9800] rounded-3xl p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <Flame className="w-8 h-8" />
        <div className="flex-1">
          <h3 className="font-bold text-lg">Série Active</h3>
          <p className="text-white/80 text-sm">Continue comme ça!</p>
        </div>
      </div>

      <div className="flex items-center justify-around">
        <div className="text-center">
          <div className="text-4xl font-bold mb-1">{currentStreak}</div>
          <div className="text-xs text-white/80">Jours</div>
        </div>
        
        <div className="w-px h-12 bg-white/20" />
        
        <div className="text-center">
          <div className="text-2xl font-bold mb-1 text-white/80">{bestStreak}</div>
          <div className="text-xs text-white/80">Record</div>
        </div>
      </div>

      <div className="mt-4 bg-white/20 rounded-xl p-3 text-center">
        <p className="text-xs">
          {currentStreak >= 7 
            ? '🔥 Incroyable! Continue ta série!' 
            : currentStreak >= 3
            ? '💪 Excellent! Continue!'
            : '🌟 Reviens demain pour continuer!'}
        </p>
      </div>
    </div>
  );
}

interface StatsCardProps {
  totalQuizzes: number;
  totalPoints: number;
  accuracy: number;
  bestWeeklyRank: number;
}

export function StatsCard({ totalQuizzes, totalPoints, accuracy, bestWeeklyRank }: StatsCardProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-md">
      <h3 className="font-bold text-[#5D4037] mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-[#2E7D32]" />
        Tes Statistiques
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#2E7D32]/10 rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-[#2E7D32] mb-1">{totalQuizzes}</div>
          <div className="text-xs text-[#5D4037]">Quiz Complétés</div>
        </div>

        <div className="bg-[#D2691E]/10 rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-[#D2691E] mb-1">{totalPoints}</div>
          <div className="text-xs text-[#5D4037]">Points Totaux</div>
        </div>

        <div className="bg-[#E8A05D]/10 rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-[#E8A05D] mb-1">{accuracy}%</div>
          <div className="text-xs text-[#5D4037]">Précision</div>
        </div>

        <div className="bg-[#FFD700]/10 rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-[#D4183D] mb-1">#{bestWeeklyRank}</div>
          <div className="text-xs text-[#5D4037]">Meilleur Rang</div>
        </div>
      </div>
    </div>
  );
}

export function calculatePoints(isCorrect: boolean, timeSeconds: number): number {
  if (!isCorrect) return 0;
  
  // Base points for correct answer
  let points = 10;
  
  // Speed bonus (max 10 points)
  if (timeSeconds < 2) points += 10;
  else if (timeSeconds < 5) points += 7;
  else if (timeSeconds < 10) points += 5;
  else if (timeSeconds < 15) points += 3;
  
  return points;
}

export function getCurrentGrade(points: number): Grade {
  const sortedGrades = [...grades].reverse();
  return sortedGrades.find(g => points >= g.minPoints) || grades[0];
}

export function checkBadgeUnlock(badge: Badge, userStats: any): boolean {
  switch (badge.requirement) {
    case 'complete_1_quiz':
      return userStats.totalQuizzes >= 1;
    case 'perfect_score':
      return userStats.hasPerfectScore;
    case 'weekly_rank_1':
      return userStats.weeklyRank === 1;
    case 'streak_7':
      return userStats.currentStreak >= 7;
    case 'streak_30':
      return userStats.currentStreak >= 30;
    case 'answer_under_2s':
      return userStats.hasFastAnswer;
    case 'complete_100_quiz':
      return userStats.totalQuizzes >= 100;
    case 'know_all_grandparents':
      return userStats.knowsAllGrandparents;
    case 'know_all_villages':
      return userStats.knowsAllVillages;
    case 'know_all_local_names':
      return userStats.knowsAllLocalNames;
    default:
      return false;
  }
}
