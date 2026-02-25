import { ArrowLeft, Trophy, Brain, Star, Zap, Award, TrendingUp } from 'lucide-react';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BottomNav } from './bottom-nav';
import { calculatePoints, getCurrentGrade, GradeDisplay, badges, Badge } from './gamification-system';
import { BadgeUnlockModal } from './badge-unlock-modal';
import { useLanguage } from './language-context';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  photo?: string;
  category: 'relation' | 'date' | 'place' | 'story';
}

export function Quiz() {
  const { t } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answerStartTime, setAnswerStartTime] = useState(Date.now());
  const [sessionPoints, setSessionPoints] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [questionPoints, setQuestionPoints] = useState<number[]>([]);
  const [unlockedBadge, setUnlockedBadge] = useState<Badge | null>(null);

  const questions: Question[] = [
    {
      id: 1,
      question: "Quel est le nom d'initiation de Kwame Mensah?",
      options: ['Nkrumah', 'Kofi', 'Adeola', 'Modou'],
      correctAnswer: 0,
      photo: '👴🏿',
      category: 'relation'
    },
    {
      id: 2,
      question: "Dans quel village est né Kwame Mensah?",
      options: ['Accra', 'Kumasi', 'Bantama', 'Lagos'],
      correctAnswer: 2,
      photo: '👴🏿',
      category: 'place'
    },
    {
      id: 3,
      question: "Combien d'enfants a Yaa Mensah?",
      options: ['2', '3', '4', '5'],
      correctAnswer: 2,
      photo: '👵🏿',
      category: 'relation'
    },
    {
      id: 4,
      question: "En quelle année Kwasi et Amara se sont-ils mariés?",
      options: ['1998', '2002', '2005', '2010'],
      correctAnswer: 1,
      photo: '💑',
      category: 'date'
    },
    {
      id: 5,
      question: "Quelle était la profession de grand-père Kwame?",
      options: ['Enseignant', 'Fermier de cacao', 'Médecin', 'Commerçant'],
      correctAnswer: 1,
      photo: '👴🏿',
      category: 'story'
    }
  ];

  const totalQuestions = questions.length;
  const currentQ = questions[currentQuestion];

  // User stats (would come from database)
  const totalPoints = 2340;
  const currentGrade = getCurrentGrade(totalPoints);

  useEffect(() => {
    setAnswerStartTime(Date.now());
  }, [currentQuestion]);

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    const timeElapsed = (Date.now() - answerStartTime) / 1000;
    const isCorrect = answerIndex === currentQ.correctAnswer;
    const points = calculatePoints(isCorrect, timeElapsed);

    setSelectedAnswer(answerIndex);
    
    if (isCorrect) {
      setScore(score + 1);
      setCorrectCount(correctCount + 1);
      setSessionPoints(sessionPoints + points);
      setQuestionPoints([...questionPoints, points]);
      
      // Check for badge unlock (speed demon)
      if (timeElapsed < 2 && !unlockedBadge) {
        const speedBadge = badges.find(b => b.id === 'speed-demon');
        if (speedBadge) {
          setTimeout(() => setUnlockedBadge(speedBadge), 2000);
        }
      }
    } else {
      setQuestionPoints([...questionPoints, 0]);
    }

    setTimeout(() => {
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
        
        // Check for perfect score badge
        if (score + (isCorrect ? 1 : 0) === totalQuestions) {
          const perfectBadge = badges.find(b => b.id === 'perfect-score');
          if (perfectBadge) {
            setTimeout(() => setUnlockedBadge(perfectBadge), 1000);
          }
        }
      }
    }, 1500);
  };

  const accuracy = totalQuestions > 0 ? Math.round((correctCount / (currentQuestion + 1)) * 100) : 0;

  if (showResult) {
    const finalAccuracy = Math.round((score / totalQuestions) * 100);
    const isPerfect = score === totalQuestions;
    
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex items-center justify-center mb-6 shadow-2xl"
          >
            <Trophy className="w-16 h-16 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-[#5D4037] mb-2 text-center"
          >
            {isPerfect ? 'Parfait! 💯' : finalAccuracy >= 80 ? 'Excellent! 🎉' : finalAccuracy >= 60 ? 'Bien joué! 👏' : 'Continue! 💪'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[#8D6E63] mb-8 text-center"
          >
            {isPerfect 
              ? 'Tu connais parfaitement ton histoire familiale!' 
              : 'Tu apprends de plus en plus chaque jour!'}
          </motion.p>

          <div className="w-full space-y-4 mb-8">
            {/* Points earned */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-[#D2691E] to-[#E8A05D] rounded-3xl p-6 text-white text-center"
            >
              <div className="text-5xl font-bold mb-2">+{sessionPoints}</div>
              <div className="text-sm text-white/80">Points Gagnés</div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-3xl p-6 shadow-md"
            >
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#2E7D32] mb-1">{score}/{totalQuestions}</div>
                  <div className="text-xs text-[#8D6E63]">Bonnes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#D2691E] mb-1">{finalAccuracy}%</div>
                  <div className="text-xs text-[#8D6E63]">Précision</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#E8A05D] mb-1">{sessionPoints}</div>
                  <div className="text-xs text-[#8D6E63]">Points</div>
                </div>
              </div>

              <div className="bg-[#FFF8E7] rounded-2xl p-3 text-center">
                <div className="text-xs text-[#8D6E63] mb-1">Total Carrière</div>
                <div className="font-bold text-[#5D4037]">{totalPoints + sessionPoints} points</div>
              </div>
            </motion.div>

            {/* New badges unlocked */}
            {isPerfect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] rounded-3xl p-6 text-white text-center"
              >
                <div className="text-4xl mb-2">💯</div>
                <div className="font-bold mb-1">Nouveau Badge!</div>
                <div className="text-sm text-white/80">"Sans Faute" débloqué</div>
              </motion.div>
            )}
          </div>

          <div className="w-full space-y-3">
            <Link to="/leaderboard" className="block">
              <button className="w-full h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5" />
                Voir le Classement
              </button>
            </Link>

            <Link to="/quiz-profile" className="block">
              <button className="w-full h-14 bg-white text-[#D2691E] rounded-2xl font-semibold shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 border-2 border-[#D2691E]">
                <Award className="w-5 h-5" />
                Ma Progression
              </button>
            </Link>

            <Link to="/quiz" className="block">
              <button className="w-full h-14 bg-[#FFF8E7] text-[#5D4037] rounded-2xl font-semibold active:scale-95 transition-transform">
                Rejouer
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Badge unlock modal */}
      <BadgeUnlockModal 
        badge={unlockedBadge} 
        onClose={() => setUnlockedBadge(null)} 
      />
      
      {/* Header */}
      <div className="bg-gradient-to-br from-[#D2691E] to-[#E8A05D] px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/home">
            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Quiz Familial</h1>
            <p className="text-sm text-white/80">Question {currentQuestion + 1}/{totalQuestions}</p>
          </div>
          <Link to="/quiz-profile">
            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <Award className="w-5 h-5" />
            </button>
          </Link>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mb-3">
          <motion.div 
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Live stats */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white">{sessionPoints} pts</span>
          </div>
          <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white">{accuracy}% précis</span>
          </div>
          <Link to="/leaderboard">
            <button className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2">
              <Trophy className="w-5 h-5 text-white" />
            </button>
          </Link>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {currentQ.photo && (
              <div className="text-center mb-6">
                <div className="inline-block w-24 h-24 rounded-full bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex items-center justify-center text-6xl shadow-lg">
                  {currentQ.photo}
                </div>
              </div>
            )}

            <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-[#D2691E]" />
                <span className="text-xs font-semibold text-[#8D6E63] uppercase tracking-wide">
                  {currentQ.category === 'relation' ? 'Relations' : 
                   currentQ.category === 'date' ? 'Dates' :
                   currentQ.category === 'place' ? 'Lieux' : 'Histoires'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#5D4037] leading-relaxed">
                {currentQ.question}
              </h2>
            </div>

            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
                  whileTap={{ scale: selectedAnswer === null ? 0.98 : 1 }}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full rounded-2xl p-5 font-semibold text-left transition-all shadow-md ${
                    selectedAnswer === null
                      ? 'bg-white text-[#5D4037] hover:shadow-lg'
                      : selectedAnswer === index
                        ? index === currentQ.correctAnswer
                          ? 'bg-[#2E7D32] text-white'
                          : 'bg-[#D4183D] text-white'
                        : index === currentQ.correctAnswer
                          ? 'bg-[#2E7D32] text-white'
                          : 'bg-[#8D6E63]/20 text-[#8D6E63]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      selectedAnswer === null
                        ? 'bg-[#FFF8E7] text-[#5D4037]'
                        : selectedAnswer === index
                          ? index === currentQ.correctAnswer
                            ? 'bg-white/20 text-white'
                            : 'bg-white/20 text-white'
                          : index === currentQ.correctAnswer
                            ? 'bg-white/20 text-white'
                            : 'bg-transparent text-[#8D6E63]'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1">{option}</span>
                    {selectedAnswer !== null && index === currentQ.correctAnswer && (
                      <span className="text-xl">✓</span>
                    )}
                    {selectedAnswer === index && index !== currentQ.correctAnswer && (
                      <span className="text-xl">✗</span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Points feedback */}
            <AnimatePresence>
              {selectedAnswer !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-center"
                >
                  {selectedAnswer === currentQ.correctAnswer ? (
                    <div className="bg-[#2E7D32]/10 rounded-2xl p-4 border-2 border-[#2E7D32]">
                      <div className="text-3xl mb-2">+{questionPoints[questionPoints.length - 1]} pts</div>
                      <div className="text-sm text-[#2E7D32] font-semibold">Bonne réponse! 🎉</div>
                    </div>
                  ) : (
                    <div className="bg-[#D4183D]/10 rounded-2xl p-4 border-2 border-[#D4183D]">
                      <div className="text-sm text-[#D4183D] font-semibold">Continue d'apprendre! 💪</div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
}