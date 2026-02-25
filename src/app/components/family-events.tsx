import { ArrowLeft, Heart, Calendar, Plus, X, Loader2, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { useLanguage } from './language-context';
import { serverBaseUrl, publicAnonKey } from '../../../utils/supabase/info';
import { getSessionFromStorage } from '../../../utils/supabase/useSession';

type EventType = 'marriage' | 'birth' | 'death' | null;

interface FamilyMember {
  id: string;
  full_name: string;
}

export function FamilyEvents() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<EventType>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [personName, setPersonName] = useState('');
  const [date, setDate] = useState('');
  const [place, setPlace] = useState('');
  const [spouseName, setSpouseName] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      const session = getSessionFromStorage();
      if (!session) return;
      try {
        const res = await fetch(`${serverBaseUrl}/profiles`, {
          headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': publicAnonKey },
        });
        if (res.ok) {
          const data = await res.json();
          setFamilyMembers(data.data || []);
        }
      } catch { /* ignore */ }
    };
    fetchMembers();
  }, []);

  const resetForm = () => {
    setPersonName(''); setDate(''); setPlace('');
    setSpouseName(''); setSelectedMemberId(''); setNotes('');
    setError(''); setSuccess(false);
  };

  const handleClose = () => {
    setSelectedEvent(null);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!selectedEvent) return;
    const session = getSessionFromStorage();
    if (!session) { setError('Vous devez être connecté.'); return; }

    setIsSubmitting(true);
    setError('');

    try {
      if (selectedEvent === 'birth') {
        if (!personName.trim()) { setError('Le nom est requis.'); setIsSubmitting(false); return; }
        const body: any = { full_name: personName.trim(), birth_date: date || null, birth_place: place || null, is_alive: true };
        if (notes) body.bio = notes;
        const res = await fetch(`${serverBaseUrl}/profiles`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': publicAnonKey, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Erreur lors de l\'enregistrement.'); }

      } else if (selectedEvent === 'death') {
        if (!selectedMemberId) { setError('Sélectionnez un membre.'); setIsSubmitting(false); return; }
        const body: any = { is_alive: false, death_date: date || null };
        if (notes) body.bio = notes;
        const res = await fetch(`${serverBaseUrl}/profiles/${selectedMemberId}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': publicAnonKey, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Erreur lors de la mise à jour.'); }

      } else if (selectedEvent === 'marriage') {
        if (!selectedMemberId || !spouseName.trim()) { setError('Sélectionnez un membre et entrez le nom du conjoint.'); setIsSubmitting(false); return; }
        // Create spouse profile
        const spouseRes = await fetch(`${serverBaseUrl}/profiles`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': publicAnonKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ full_name: spouseName.trim(), birth_place: place || null }),
        });
        if (!spouseRes.ok) { const d = await spouseRes.json(); throw new Error(d.error || 'Erreur lors de la création du profil conjoint.'); }
        const spouseData = await spouseRes.json();
        const spouseId = spouseData.data?.id || spouseData.id;
        // Create marriage relation
        if (spouseId) {
          await fetch(`${serverBaseUrl}/relations`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': publicAnonKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ person1_id: selectedMemberId, person2_id: spouseId, relation_type: 'spouse', start_date: date || null }),
          });
        }
      }

      setSuccess(true);
      setTimeout(() => { handleClose(); navigate('/tree'); }, 2000);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      <div className="bg-white border-b border-[#5D4037]/10 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/home">
            <button className="w-10 h-10 rounded-full bg-[#FFF8E7] flex items-center justify-center text-[#D2691E]">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#5D4037]">Événements Familiaux</h1>
            <p className="text-sm text-[#8D6E63]">Enregistrez les moments importants</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {!selectedEvent ? (
          <div className="space-y-3">
            <button
              onClick={() => setSelectedEvent('marriage')}
              className="w-full rounded-3xl p-6 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white shadow-lg active:scale-98 transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Heart className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-lg mb-1">Enregistrer un Mariage</h3>
                  <p className="text-white/80 text-sm">Toutes les structures familiales bienvenues</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedEvent('birth')}
              className="w-full rounded-3xl p-6 bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] text-white shadow-lg active:scale-98 transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-lg mb-1">Enregistrer une Naissance</h3>
                  <p className="text-white/80 text-sm">Nouvelle génération</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedEvent('death')}
              className="w-full rounded-3xl p-6 bg-white border-2 border-[#5D4037]/20 shadow-md active:scale-98 transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#8D6E63]/10 flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-[#8D6E63]" strokeWidth={2.5} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-lg mb-1 text-[#5D4037]">Enregistrer un Décès</h3>
                  <p className="text-[#8D6E63] text-sm">Honorer la mémoire</p>
                </div>
              </div>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-md">
            {/* Form header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#5D4037]">
                {selectedEvent === 'marriage' ? '💍 Mariage' : selectedEvent === 'birth' ? '👶 Naissance' : '🕊️ Décès'}
              </h2>
              <button onClick={handleClose} className="w-8 h-8 rounded-full bg-[#FFF8E7] flex items-center justify-center">
                <X className="w-4 h-4 text-[#8D6E63]" />
              </button>
            </div>

            {success ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle className="w-16 h-16 text-[#2E7D32] mb-4" />
                <p className="text-lg font-bold text-[#5D4037]">Enregistré avec succès !</p>
                <p className="text-sm text-[#8D6E63] mt-2">Redirection vers l'arbre...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Birth: name field */}
                {selectedEvent === 'birth' && (
                  <div>
                    <label className="block text-sm font-semibold text-[#5D4037] mb-1">Nom complet *</label>
                    <input
                      type="text"
                      value={personName}
                      onChange={e => setPersonName(e.target.value)}
                      placeholder="Ex: Amara Kofi"
                      className="w-full h-12 px-4 rounded-2xl border-2 border-[#5D4037]/10 bg-[#FFF8E7] text-[#5D4037] focus:outline-none focus:border-[#D2691E]"
                    />
                  </div>
                )}

                {/* Marriage: member selector + spouse name */}
                {selectedEvent === 'marriage' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[#5D4037] mb-1">Membre de la famille *</label>
                      <select
                        value={selectedMemberId}
                        onChange={e => setSelectedMemberId(e.target.value)}
                        className="w-full h-12 px-4 rounded-2xl border-2 border-[#5D4037]/10 bg-[#FFF8E7] text-[#5D4037] focus:outline-none focus:border-[#D2691E]"
                      >
                        <option value="">Sélectionner un membre</option>
                        {familyMembers.map(m => (
                          <option key={m.id} value={m.id}>{m.full_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#5D4037] mb-1">Nom du conjoint(e) *</label>
                      <input
                        type="text"
                        value={spouseName}
                        onChange={e => setSpouseName(e.target.value)}
                        placeholder="Ex: Yaa Mensah"
                        className="w-full h-12 px-4 rounded-2xl border-2 border-[#5D4037]/10 bg-[#FFF8E7] text-[#5D4037] focus:outline-none focus:border-[#D2691E]"
                      />
                    </div>
                  </>
                )}

                {/* Death: member selector */}
                {selectedEvent === 'death' && (
                  <div>
                    <label className="block text-sm font-semibold text-[#5D4037] mb-1">Membre concerné *</label>
                    <select
                      value={selectedMemberId}
                      onChange={e => setSelectedMemberId(e.target.value)}
                      className="w-full h-12 px-4 rounded-2xl border-2 border-[#5D4037]/10 bg-[#FFF8E7] text-[#5D4037] focus:outline-none focus:border-[#D2691E]"
                    >
                      <option value="">Sélectionner un membre</option>
                      {familyMembers.map(m => (
                        <option key={m.id} value={m.id}>{m.full_name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date field */}
                <div>
                  <label className="block text-sm font-semibold text-[#5D4037] mb-1">
                    {selectedEvent === 'birth' ? 'Date de naissance' : selectedEvent === 'marriage' ? 'Date du mariage' : 'Date du décès'}
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full h-12 px-4 rounded-2xl border-2 border-[#5D4037]/10 bg-[#FFF8E7] text-[#5D4037] focus:outline-none focus:border-[#D2691E]"
                  />
                </div>

                {/* Place field */}
                {selectedEvent !== 'death' && (
                  <div>
                    <label className="block text-sm font-semibold text-[#5D4037] mb-1">Lieu</label>
                    <input
                      type="text"
                      value={place}
                      onChange={e => setPlace(e.target.value)}
                      placeholder="Ex: Accra, Ghana"
                      className="w-full h-12 px-4 rounded-2xl border-2 border-[#5D4037]/10 bg-[#FFF8E7] text-[#5D4037] focus:outline-none focus:border-[#D2691E]"
                    />
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-[#5D4037] mb-1">Notes (optionnel)</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Informations supplémentaires..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-[#5D4037]/10 bg-[#FFF8E7] text-[#5D4037] focus:outline-none focus:border-[#D2691E] resize-none"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
