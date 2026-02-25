import { getSessionFromStorage } from '../../../utils/supabase/useSession';
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { projectId, serverBaseUrl } from '../../../utils/supabase/info';
import { useAuth } from './auth-context';
import { toast } from 'sonner';

interface Profile {
  id: string;
  full_name: string;
  local_name?: string;
}

interface Relation {
  id: string;
  profile_id_1: string;
  profile_id_2: string;
  relation_type: string;
  marriage_date?: string;
  marriage_place?: string;
  divorce_date?: string;
  notes?: string;
}

const RELATION_TYPES = [
  { value: 'spouse', label: 'Conjoint(e)' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Enfant' },
  { value: 'sibling', label: 'Frère/Sœur' },
  { value: 'uncle_aunt', label: 'Oncle/Tante' },
  { value: 'nephew_niece', label: 'Neveu/Nièce' },
  { value: 'cousin', label: 'Cousin(e)' },
  { value: 'guardian', label: 'Tuteur/Tutrice' },
  { value: 'godparent', label: 'Parrain/Marraine' },
];

export function FamilyRelationsUpdated() {
  const navigate = useNavigate();
  const { familyId, role } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    profileId1: '',
    profileId2: '',
    relationType: 'spouse',
    marriageDate: '',
    marriagePlace: '',
    divorceDate: '',
    notes: '',
  });

  useEffect(() => {
    if (!familyId) {
      navigate('/');
      return;
    }
    loadData();
  }, [familyId, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const session = getSessionFromStorage(); // Fixed: avoid lock deadlock
      if (!session) return;

      // Load profiles
      const profilesResponse = await fetch(
        `${serverBaseUrl}/profiles?limit=100`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (profilesResponse.ok) {
        const data = await profilesResponse.json();
        setProfiles(data.data || []);
      }

      // Load relations
      const relationsResponse = await fetch(
        `${serverBaseUrl}/relations?limit=100`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (relationsResponse.ok) {
        const data = await relationsResponse.json();
        setRelations(data.data || []);
      }
    } catch (error: any) {
      console.error('Load data error:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRelation = async () => {
    if (!formData.profileId1 || !formData.profileId2 || !formData.relationType) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      const session = getSessionFromStorage(); // Fixed: avoid lock deadlock
      if (!session) return;

      const response = await fetch(
        `${serverBaseUrl}/relations`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profileId1: formData.profileId1,
            profileId2: formData.profileId2,
            relationType: formData.relationType,
            marriage_date: formData.marriageDate || null,
            marriage_place: formData.marriagePlace || null,
            divorce_date: formData.divorceDate || null,
            notes: formData.notes || null,
          }),
        }
      );

      if (response.ok) {
        toast.success('Relation créée');
        setShowForm(false);
        setFormData({
          profileId1: '',
          profileId2: '',
          relationType: 'spouse',
          marriageDate: '',
          marriagePlace: '',
          divorceDate: '',
          notes: '',
        });
        await loadData();
      } else {
        toast.error('Erreur lors de la création');
      }
    } catch (error: any) {
      console.error('Add relation error:', error);
      toast.error(error.message);
    }
  };

  const getProfileName = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    return profile?.full_name || 'Inconnu';
  };

  const getRelationLabel = (type: string) => {
    return RELATION_TYPES.find(rt => rt.value === type)?.label || type;
  };

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

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#D2691E] to-[#E8A05D] px-6 py-4 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Relations familiales</h1>
            <p className="text-white/90 text-sm">{relations.length} relation{relations.length > 1 ? 's' : ''}</p>
          </div>
          {role === 'admin' || role === 'super_admin' ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center active:scale-95 transition-transform"
            >
              <Plus className="w-5 h-5" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {/* Add Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-lg mb-6 border-2 border-[#D2691E]/20"
          >
            <h3 className="text-lg font-bold text-[#5D4037] mb-4">Ajouter une relation</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-[#8D6E63] block mb-2">Personne 1</label>
                <select
                  value={formData.profileId1}
                  onChange={(e) => setFormData({ ...formData, profileId1: e.target.value })}
                  className="w-full px-4 py-2 rounded-2xl border-2 border-[#D2691E]/20 bg-white text-[#5D4037]"
                >
                  <option value="">Sélectionner...</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#8D6E63] block mb-2">Type de relation</label>
                <select
                  value={formData.relationType}
                  onChange={(e) => setFormData({ ...formData, relationType: e.target.value })}
                  className="w-full px-4 py-2 rounded-2xl border-2 border-[#D2691E]/20 bg-white text-[#5D4037]"
                >
                  {RELATION_TYPES.map((rt) => (
                    <option key={rt.value} value={rt.value}>
                      {rt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#8D6E63] block mb-2">Personne 2</label>
                <select
                  value={formData.profileId2}
                  onChange={(e) => setFormData({ ...formData, profileId2: e.target.value })}
                  className="w-full px-4 py-2 rounded-2xl border-2 border-[#D2691E]/20 bg-white text-[#5D4037]"
                >
                  <option value="">Sélectionner...</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {formData.relationType === 'spouse' && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-[#8D6E63] block mb-2">Date du mariage</label>
                    <input
                      type="date"
                      value={formData.marriageDate}
                      onChange={(e) => setFormData({ ...formData, marriageDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-2xl border-2 border-[#D2691E]/20 bg-white text-[#5D4037]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[#8D6E63] block mb-2">Lieu du mariage</label>
                    <input
                      type="text"
                      value={formData.marriagePlace}
                      onChange={(e) => setFormData({ ...formData, marriagePlace: e.target.value })}
                      placeholder="Ville, Pays"
                      className="w-full px-4 py-2 rounded-2xl border-2 border-[#D2691E]/20 bg-white text-[#5D4037]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[#8D6E63] block mb-2">Date du divorce (optionnel)</label>
                    <input
                      type="date"
                      value={formData.divorceDate}
                      onChange={(e) => setFormData({ ...formData, divorceDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-2xl border-2 border-[#D2691E]/20 bg-white text-[#5D4037]"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-semibold text-[#8D6E63] block mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informations supplémentaires..."
                  className="w-full px-4 py-2 rounded-2xl border-2 border-[#D2691E]/20 bg-white text-[#5D4037] resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddRelation}
                  className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-[#D2691E] to-[#E8A05D] text-white font-semibold active:scale-98 transition-transform"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 h-11 rounded-2xl bg-[#FFF8E7] text-[#5D4037] font-semibold border-2 border-[#D2691E]/20 active:scale-98 transition-transform"
                >
                  Annuler
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Relations List */}
        <div className="space-y-4">
          {relations.length === 0 ? (
            <div className="bg-white rounded-3xl p-6 text-center">
              <p className="text-[#8D6E63]">Aucune relation pour le moment</p>
            </div>
          ) : (
            relations.map((relation) => (
              <motion.div
                key={relation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-4 shadow-md border-2 border-[#D2691E]/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#8D6E63] mb-1">
                      {getProfileName(relation.profile_id_1)}
                    </div>
                    <div className="text-lg font-bold text-[#D2691E] mb-1">
                      {getRelationLabel(relation.relation_type)}
                    </div>
                    <div className="text-sm font-semibold text-[#8D6E63]">
                      {getProfileName(relation.profile_id_2)}
                    </div>
                  </div>
                </div>

                {relation.marriage_date && (
                  <div className="text-xs text-[#8D6E63] mb-2">
                    Mariage: {new Date(relation.marriage_date).toLocaleDateString('fr-FR')}
                    {relation.marriage_place && ` à ${relation.marriage_place}`}
                  </div>
                )}

                {relation.notes && (
                  <div className="text-xs text-[#8D6E63] italic mb-2">
                    "{relation.notes}"
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
