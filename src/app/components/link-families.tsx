import { useState, useEffect } from 'react';
import { Search, X, CheckCircle, UserPlus, AlertCircle, Heart, Calendar, MapPin, Check, Link2, Copy } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { projectId, publicAnonKey, serverBaseUrl } from '../../../utils/supabase/info';
import { supabase } from '../../../utils/supabase/client';
import { toast } from 'sonner';

interface Profile {
  id: string;
  name: string;
  photoUrl?: string;
  birthDate?: string;
  birthPlace?: string;
  profession?: string;
  gender?: string;
}

interface Spouse {
  id: string;
  name: string;
  photoUrl?: string;
  marriageDate?: string;
  marriagePlace?: string;
}

export function LinkFamilies() {
  const navigate = useNavigate();
  const [myProfiles, setMyProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [fusionCode, setFusionCode] = useState('');
  const [marriageDate, setMarriageDate] = useState('');
  const [marriagePlace, setMarriagePlace] = useState('');
  const [linking, setLinking] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    loadMyProfiles();
  }, []);

  const loadMyProfiles = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expirée');
        navigate('/');
        return;
      }

      const response = await fetch(
        `${serverBaseUrl}/my-profiles`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des profils');
      }

      const data = await response.json();
      setMyProfiles(data.profiles || []);
    } catch (error: any) {
      console.error('Load my profiles error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = myProfiles.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerateCode = async () => {
    if (!selectedProfile) return;

    setGeneratingCode(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expirée');
        return;
      }

      const response = await fetch(
        `${serverBaseUrl}/generate-fusion-code`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profileId: selectedProfile.id,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la génération du code');
      }

      const data = await response.json();
      setGeneratedCode(data.code);
      toast.success('Code de fusion généré! 🔗');
    } catch (error: any) {
      console.error('Generate fusion code error:', error);
      toast.error(error.message);
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleLinkWithCode = async () => {
    if (!selectedProfile || !fusionCode.trim()) return;

    setLinking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expirée');
        return;
      }

      const response = await fetch(
        `${serverBaseUrl}/link-with-fusion-code`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profileId: selectedProfile.id,
            fusionCode: fusionCode.trim(),
            metadata: {
              marriageDate: marriageDate || undefined,
              marriagePlace: marriagePlace || undefined,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la liaison');
      }

      toast.success('Familles liées avec succès! 🎉');
      setSelectedProfile(null);
      setFusionCode('');
      setMarriageDate('');
      setMarriagePlace('');
      
      // Reload profiles
      await loadMyProfiles();
    } catch (error: any) {
      console.error('Link with fusion code error:', error);
      toast.error(error.message);
    } finally {
      setLinking(false);
    }
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success('Code copié! 📋');
  };

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#5D4037]/10 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-[#FFF8E7] flex items-center justify-center text-[#5D4037] active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#5D4037]">Lier les Familles</h1>
            <p className="text-sm text-[#8D6E63]">Fusion sécurisée d'arbres</p>
          </div>
        </div>

        <div className="bg-[#E8A05D]/10 border border-[#E8A05D]/30 rounded-2xl p-3">
          <div className="flex items-start gap-2">
            <Link2 className="w-5 h-5 text-[#D2691E] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#5D4037] space-y-1">
              <p className="font-semibold">Comment ça marche:</p>
              <p>1. Sélectionnez une personne de VOTRE famille</p>
              <p>2. Générez un code de fusion OU entrez un code reçu</p>
              <p>3. Partagez le code avec l'autre famille</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-[#D2691E]/20 border-t-[#D2691E] animate-spin mx-auto mb-3" />
            <p className="text-[#8D6E63]">Chargement...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Profile Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#D2691E] text-white flex items-center justify-center text-sm font-bold">
                1
              </div>
              <h2 className="font-semibold text-[#5D4037]">Sélectionner une personne de ma famille</h2>
            </div>

            {selectedProfile ? (
              <div className="bg-white rounded-3xl p-4 border-2 border-[#D2691E] shadow-lg">
                <div className="flex items-center gap-3">
                  {selectedProfile.photoUrl ? (
                    <img
                      src={selectedProfile.photoUrl}
                      alt={selectedProfile.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-md">
                      {selectedProfile.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-[#5D4037]">{selectedProfile.name}</h3>
                    {selectedProfile.profession && (
                      <p className="text-xs text-[#8D6E63]">{selectedProfile.profession}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProfile(null);
                      setGeneratedCode('');
                      setFusionCode('');
                    }}
                    className="w-8 h-8 rounded-full bg-[#FFF8E7] flex items-center justify-center text-[#8D6E63] active:scale-95 transition-transform"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher dans ma famille..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 bg-white rounded-2xl pl-11 pr-4 text-[#5D4037] placeholder:text-[#8D6E63] border border-[#5D4037]/10 focus:outline-none focus:ring-2 focus:ring-[#D2691E]/30"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D6E63]" />
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredProfiles.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => {
                        setSelectedProfile(profile);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center gap-3 p-3 bg-white rounded-2xl hover:bg-[#FFF8E7] transition-colors border border-[#5D4037]/10 active:scale-98"
                    >
                      {profile.photoUrl ? (
                        <img
                          src={profile.photoUrl}
                          alt={profile.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8D6E63] to-[#6D4C41] flex items-center justify-center text-white text-sm font-bold">
                          {profile.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <div className="text-sm font-semibold text-[#5D4037]">{profile.name}</div>
                        {profile.profession && (
                          <div className="text-xs text-[#8D6E63]">{profile.profession}</div>
                        )}
                      </div>
                    </button>
                  ))}
                  {filteredProfiles.length === 0 && (
                    <div className="text-center py-8 text-[#8D6E63]">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Aucune personne trouvée</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Code Actions */}
          {selectedProfile && (
            <>
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-[#D2691E]">
                  <Link2 className="w-6 h-6 text-[#D2691E]" />
                </div>
              </div>

              {/* Option A: Generate Code */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#E8A05D] text-white flex items-center justify-center text-sm font-bold">
                    A
                  </div>
                  <h2 className="font-semibold text-[#5D4037]">Générer un code de fusion</h2>
                </div>

                <div className="bg-white rounded-3xl p-4 border border-[#5D4037]/10">
                  <p className="text-xs text-[#8D6E63] mb-3">
                    Générez un code unique à partager avec l'autre famille
                  </p>
                  
                  {generatedCode ? (
                    <div className="space-y-3">
                      <div className="bg-[#FFF8E7] rounded-2xl p-4 text-center">
                        <p className="text-xs text-[#8D6E63] mb-2">Code de fusion</p>
                        <p className="text-2xl font-bold text-[#D2691E] tracking-wider">{generatedCode}</p>
                      </div>
                      <button
                        onClick={copyCodeToClipboard}
                        className="w-full h-10 bg-[#D2691E] text-white font-semibold rounded-2xl active:scale-98 transition-transform flex items-center justify-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copier le code
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleGenerateCode}
                      disabled={generatingCode}
                      className="w-full h-10 bg-gradient-to-r from-[#D2691E] to-[#E8A05D] text-white font-semibold rounded-2xl active:scale-98 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {generatingCode ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Génération...
                        </>
                      ) : (
                        <>
                          <Link2 className="w-4 h-4" />
                          Générer le code
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#5D4037]/10" />
                <span className="text-sm text-[#8D6E63] font-medium">OU</span>
                <div className="flex-1 h-px bg-[#5D4037]/10" />
              </div>

              {/* Option B: Enter Code */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#6D4C41] text-white flex items-center justify-center text-sm font-bold">
                    B
                  </div>
                  <h2 className="font-semibold text-[#5D4037]">Utiliser un code reçu</h2>
                </div>

                <div className="bg-white rounded-3xl p-4 border border-[#5D4037]/10 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#5D4037] mb-2">
                      Code de fusion
                    </label>
                    <input
                      type="text"
                      value={fusionCode}
                      onChange={(e) => setFusionCode(e.target.value.toUpperCase())}
                      placeholder="Entrez le code..."
                      className="w-full h-11 bg-[#FFF8E7] rounded-2xl px-4 text-[#5D4037] placeholder:text-[#8D6E63] focus:outline-none focus:ring-2 focus:ring-[#D2691E]/30 text-center font-bold tracking-wider"
                    />
                  </div>

                  {/* Marriage Date */}
                  <div>
                    <label className="block text-sm font-medium text-[#5D4037] mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#D2691E]" />
                        Date de mariage (optionnel)
                      </div>
                    </label>
                    <input
                      type="date"
                      value={marriageDate}
                      onChange={(e) => setMarriageDate(e.target.value)}
                      className="w-full h-11 bg-[#FFF8E7] rounded-2xl px-4 text-[#5D4037] focus:outline-none focus:ring-2 focus:ring-[#D2691E]/30"
                    />
                  </div>

                  {/* Marriage Place */}
                  <div>
                    <label className="block text-sm font-medium text-[#5D4037] mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#D2691E]" />
                        Lieu de mariage (optionnel)
                      </div>
                    </label>
                    <input
                      type="text"
                      value={marriagePlace}
                      onChange={(e) => setMarriagePlace(e.target.value)}
                      placeholder="Ex: Dakar, Sénégal"
                      className="w-full h-11 bg-[#FFF8E7] rounded-2xl px-4 text-[#5D4037] placeholder:text-[#8D6E63] focus:outline-none focus:ring-2 focus:ring-[#D2691E]/30"
                    />
                  </div>

                  <button
                    onClick={handleLinkWithCode}
                    disabled={linking || !fusionCode.trim()}
                    className="w-full h-12 bg-gradient-to-r from-[#D2691E] to-[#E8A05D] text-white font-semibold rounded-2xl active:scale-98 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {linking ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Liaison...
                      </>
                    ) : (
                      <>
                        <Heart className="w-5 h-5" />
                        Lier les familles
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}