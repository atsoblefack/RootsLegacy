import { CheckCircle, Users, Trophy, Bell, ArrowRight, Loader, AlertCircle, XCircle } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useLanguage } from './language-context';
import { useState, useEffect } from 'react';
import { getSessionFromStorage } from '../../../utils/supabase/useSession';
import { serverBaseUrl, publicAnonKey } from '../../../utils/supabase/info';

interface FamilyInfo {
  familyId: string;
  familyName: string;
  memberCount: number;
  inviteCode: string;
}

export function JoinFamily() {
  const { t } = useLanguage();
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const [familyInfo, setFamilyInfo] = useState<FamilyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setError('Code d\'invitation manquant dans l\'URL.');
      setLoading(false);
      return;
    }
    fetchFamilyInfo(code);
  }, [code]);

  const fetchFamilyInfo = async (inviteCode: string) => {
    setLoading(true);
    setError(null);
    try {
      // GET /join/:code — pas besoin d'auth pour voir les infos de la famille
      const res = await fetch(`${serverBaseUrl}/join/${inviteCode}`, {
        headers: { 'apikey': publicAnonKey },
      });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || 'Code d\'invitation invalide ou expiré.');
        return;
      }
      const data = await res.json();
      setFamilyInfo(data);
    } catch (err) {
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!code || !familyInfo) return;
    const session = getSessionFromStorage();
    if (!session) {
      // Redirect to login with return path
      navigate(`/login?redirect=/join/${code}`);
      return;
    }
    setJoining(true);
    setError(null);
    try {
      const res = await fetch(`${serverBaseUrl}/join/${code}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': publicAnonKey,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || 'Impossible de rejoindre la famille.');
        return;
      }
      setJoined(true);
      // Redirect to home after 2 seconds
      setTimeout(() => navigate('/home'), 2000);
    } catch (err) {
      setError('Erreur de connexion au serveur.');
    } finally {
      setJoining(false);
    }
  };

  // --- Loading state ---
  if (loading) {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-gradient-to-br from-[#E8A05D] via-[#D2691E] to-[#5D4037] flex flex-col items-center justify-center gap-4">
        <Loader className="w-12 h-12 text-white animate-spin" />
        <p className="text-white/80 text-sm">Vérification du code d'invitation...</p>
      </div>
    );
  }

  // --- Error state (invalid code) ---
  if (error && !familyInfo) {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-gradient-to-br from-[#E8A05D] via-[#D2691E] to-[#5D4037] flex flex-col items-center justify-center gap-6 px-8">
        <XCircle className="w-16 h-16 text-white/80" />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Invitation invalide</h2>
          <p className="text-white/80 text-sm">{error}</p>
        </div>
        <Link to="/signup">
          <button className="px-8 py-3 bg-white text-[#D2691E] rounded-2xl font-semibold">
            Créer ma propre famille
          </button>
        </Link>
      </div>
    );
  }

  // --- Success state (joined) ---
  if (joined) {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-gradient-to-br from-[#E8A05D] via-[#D2691E] to-[#5D4037] flex flex-col items-center justify-center gap-6 px-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
        >
          <CheckCircle className="w-20 h-20 text-white" />
        </motion.div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Bienvenue !</h2>
          <p className="text-white/80 text-sm">
            Vous avez rejoint la famille <strong>{familyInfo?.familyName}</strong>. Redirection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-gradient-to-br from-[#E8A05D] via-[#D2691E] to-[#5D4037] flex flex-col items-center justify-between p-8 overflow-hidden relative">
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="25" cy="25" r="2" fill="white" />
              <circle cx="75" cy="75" r="2" fill="white" />
              <path d="M 50 20 L 50 80" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern)" />
        </svg>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center z-10 w-full">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1 }}
          className="mb-8"
        >
          <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <CheckCircle className="w-20 h-20 text-white" strokeWidth={2} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-white" />
            <h2 className="text-white/90 font-semibold">Vous êtes invité !</h2>
            <Trophy className="w-5 h-5 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Rejoignez<br />{familyInfo?.familyName}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-4xl">
              🌳
            </div>
            <div className="flex-1 text-white">
              <div className="font-bold text-lg">{familyInfo?.familyName}</div>
              <div className="text-white/80 text-sm">Famille sur RootsLegacy</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-white mb-1">{familyInfo?.memberCount || 0}</div>
              <div className="text-xs text-white/80">Membres</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-white mb-1">🌍</div>
              <div className="text-xs text-white/80">Arbre familial</div>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full bg-red-500/20 backdrop-blur-sm rounded-2xl p-4 mb-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-white flex-shrink-0" />
            <p className="text-white text-sm">{error}</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4"
        >
          <p className="text-white/90 text-sm text-center leading-relaxed">
            <Users className="w-4 h-4 inline mr-1" />
            Ajoutez vos informations pour compléter l'arbre familial
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="w-full z-10 space-y-3"
      >
        <button
          onClick={handleJoin}
          disabled={joining}
          className="w-full h-16 bg-white text-[#D2691E] rounded-3xl font-semibold text-lg shadow-2xl hover:bg-white/95 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {joining ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Connexion en cours...
            </>
          ) : (
            <>
              Rejoindre la famille
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-center text-white/70 text-xs">
          Code : {familyInfo?.inviteCode || code}
        </p>
      </motion.div>
    </div>
  );
}
