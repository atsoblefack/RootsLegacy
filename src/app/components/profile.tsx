import { ArrowLeft, MapPin, Calendar, Phone, Mail, Edit, Loader, AlertCircle } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router';
import { BottomNav } from './bottom-nav';
import { useLanguage } from './language-context';
import { VillageDisplay } from './cultural-fields';
import { useState, useEffect } from 'react';
import { getSessionFromStorage } from '../../../utils/supabase/useSession';
import { serverBaseUrl, publicAnonKey } from '../../../utils/supabase/info';

interface ProfileData {
  id: string;
  full_name: string;
  local_name?: string;
  photo_url?: string;
  profession?: string;
  birth_date?: string;
  birth_place?: string;
  death_date?: string;
  gender?: string;
  bio?: string;
  phone?: string;
  email?: string;
  is_alive?: boolean;
  village_country?: string;
  village_city?: string;
  village_name?: string;
  family_id?: string;
  user_id?: string;
  created_at?: string;
}

export function Profile() {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Identifiant de profil manquant');
      setLoading(false);
      return;
    }
    fetchProfile(id);
  }, [id]);

  const fetchProfile = async (profileId: string) => {
    setLoading(true);
    setError(null);
    try {
      const session = getSessionFromStorage();
      if (!session) {
        navigate('/login');
        return;
      }
      const res = await fetch(`${serverBaseUrl}/profiles/${profileId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': publicAnonKey,
        },
      });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || 'Profil introuvable');
        return;
      }
      const data = await res.json();
      setProfile(data.profile);
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // --- Loading state ---
  if (loading) {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col items-center justify-center gap-4">
        <Loader className="w-10 h-10 text-[#D2691E] animate-spin" />
        <p className="text-[#8D6E63] text-sm">Chargement du profil...</p>
      </div>
    );
  }

  // --- Error state ---
  if (error || !profile) {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col items-center justify-center gap-4 px-6">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-[#5D4037] font-semibold text-center">{error || 'Profil introuvable'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-[#D2691E] text-white rounded-2xl font-medium"
        >
          Retour
        </button>
      </div>
    );
  }

  // --- Build village object if fields exist ---
  const village = (profile.village_country || profile.village_city || profile.village_name)
    ? {
        country: profile.village_country || '',
        city: profile.village_city || '',
        village: profile.village_name || '',
        isMainVillage: true,
      }
    : null;

  // --- Format birth date ---
  const formattedBirthDate = profile.birth_date
    ? new Date(profile.birth_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  // --- Compute age ---
  const age = profile.birth_date
    ? (() => {
        const birth = new Date(profile.birth_date);
        const end = profile.death_date ? new Date(profile.death_date) : new Date();
        const years = end.getFullYear() - birth.getFullYear();
        return `${years} ans`;
      })()
    : null;

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header with photo */}
      <div className="bg-gradient-to-br from-[#D2691E] to-[#E8A05D] px-6 pt-12 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <Link to={`/profile/${profile.id}/edit`}>
            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <Edit className="w-5 h-5" />
            </button>
          </Link>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-24 h-24 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt={profile.full_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl">{profile.gender === 'female' ? '👩🏿' : '👨🏿'}</span>
            )}
          </div>
          <div className="flex-1 pt-2">
            <h1 className="text-2xl font-bold text-white mb-1">{profile.full_name}</h1>
            {profile.local_name && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full font-semibold">
                  🌍 {profile.local_name}
                </span>
              </div>
            )}
            {age && <p className="text-white/80 text-xs">{age}</p>}
            {!profile.is_alive && profile.death_date && (
              <p className="text-white/70 text-xs mt-1">
                † {new Date(profile.death_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 px-6 pt-6">

        {/* Village d'origine */}
        {village && (
          <div className="mb-6">
            <VillageDisplay village={village} isMain={true} />
          </div>
        )}

        {/* Profession */}
        {profile.profession && (
          <div className="mb-6">
            <div className="bg-gradient-to-br from-[#E8A05D]/10 to-[#D2691E]/10 rounded-2xl p-4 border-2 border-[#D2691E]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D2691E]/20 flex items-center justify-center">
                  <span className="text-2xl">💼</span>
                </div>
                <div>
                  <div className="text-xs text-[#8D6E63] uppercase tracking-wide font-semibold mb-1">
                    Profession
                  </div>
                  <div className="text-[#5D4037] font-semibold">{profile.profession}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div className="p-4 bg-white rounded-2xl shadow-sm mb-6">
            <h3 className="text-sm font-semibold text-[#5D4037] mb-2">À propos</h3>
            <p className="text-[#8D6E63] text-sm leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Contact Info */}
        {(profile.phone || profile.email || profile.birth_place || formattedBirthDate) && (
          <div className="bg-white rounded-3xl p-6 shadow-md mb-6 space-y-3">
            {profile.phone && (
              <div className="flex items-center gap-3 p-3 bg-[#FFF8E7] rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-[#D2691E]/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-[#D2691E]" />
                </div>
                <div>
                  <div className="text-xs text-[#8D6E63]">Téléphone</div>
                  <div className="text-[#5D4037] font-medium">{profile.phone}</div>
                </div>
              </div>
            )}

            {profile.email && (
              <div className="flex items-center gap-3 p-3 bg-[#FFF8E7] rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-[#2E7D32]/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#2E7D32]" />
                </div>
                <div>
                  <div className="text-xs text-[#8D6E63]">Email</div>
                  <div className="text-[#5D4037] font-medium">{profile.email}</div>
                </div>
              </div>
            )}

            {profile.birth_place && (
              <div className="flex items-center gap-3 p-3 bg-[#FFF8E7] rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-[#2E7D32]/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#2E7D32]" />
                </div>
                <div>
                  <div className="text-xs text-[#8D6E63]">Lieu de naissance</div>
                  <div className="text-[#5D4037] font-medium">{profile.birth_place}</div>
                </div>
              </div>
            )}

            {formattedBirthDate && (
              <div className="flex items-center gap-3 p-3 bg-[#FFF8E7] rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-[#D2691E]/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#D2691E]" />
                </div>
                <div>
                  <div className="text-xs text-[#8D6E63]">Date de naissance</div>
                  <div className="text-[#5D4037] font-medium">{formattedBirthDate}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state si aucune info */}
        {!profile.bio && !profile.profession && !village && !profile.phone && !profile.email && !profile.birth_place && (
          <div className="text-center py-10 text-[#8D6E63]">
            <span className="text-4xl mb-3 block">📝</span>
            <p className="text-sm">Aucune information supplémentaire pour ce membre.</p>
            <Link to={`/profile/${profile.id}/edit`}>
              <button className="mt-4 px-5 py-2 bg-[#D2691E] text-white rounded-2xl text-sm font-medium">
                Compléter le profil
              </button>
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
