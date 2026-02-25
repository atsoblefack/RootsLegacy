import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import { BottomNav } from './bottom-nav';
import { Filter, Search, Maximize2, User, Plus } from 'lucide-react';
import { getSessionFromStorage } from '../../../utils/supabase/useSession';
import { projectId, publicAnonKey, serverBaseUrl } from '../../../utils/supabase/info';

interface FamilyMember {
  id: string;
  name: string;
  photo: string | null;
  generation: number;
  relation?: string;
}

type ViewMode = 'my-view' | 'ancestor' | 'birds-eye';

const RELATION_TO_GENERATION: Record<string, number> = {
  great_grandparent: -2,
  grandparent: -1,
  parent: -1,
  self: 0,
  sibling: 0,
  spouse: 0,
  child: 1,
  grandchild: 2,
  uncle_aunt: -1,
  cousin: 0,
  nephew_niece: 1,
  guardian: -1,
  godparent: -1,
};

const RELATION_LABELS: Record<string, string> = {
  great_grandparent: 'Arrière-grand-parent',
  grandparent: 'Grand-parent',
  parent: 'Parent',
  self: 'Vous',
  sibling: 'Frère/Sœur',
  spouse: 'Conjoint(e)',
  child: 'Enfant',
  grandchild: 'Petit-enfant',
  uncle_aunt: 'Oncle/Tante',
  cousin: 'Cousin(e)',
  nephew_niece: 'Neveu/Nièce',
  guardian: 'Tuteur',
  godparent: 'Parrain/Marraine',
};

export function FamilyTreeEgoCentric() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [centerPerson, setCenterPerson] = useState<string>('self');
  const [viewMode, setViewMode] = useState<ViewMode>('my-view');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showViewModes, setShowViewModes] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const session = getSessionFromStorage(); // Fixed: avoid lock deadlock
        if (!session) { setLoading(false); return; }

        const res = await fetch(
          `${serverBaseUrl}/profiles`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'apikey': publicAnonKey,
            }
          }
        );

        if (res.ok) {
          const data = await res.json();
          const profiles = data.data || [];
          const mapped: FamilyMember[] = profiles.map((p: any) => ({
            id: p.id,
            name: p.full_name,
            photo: p.photo_url || null,
            generation: RELATION_TO_GENERATION[p.relation_type] ?? 0,
            relation: RELATION_LABELS[p.relation_type] || p.relation_type || '',
          }));

          // Add "self" node for current user
          const selfNode: FamilyMember = {
            id: 'self',
            name: session.user.user_metadata?.name || 'Vous',
            photo: null,
            generation: 0,
            relation: 'Vous',
          };
          setMembers([selfNode, ...mapped]);
          setCenterPerson('self');
        }
      } catch (err) {
        console.error('Error fetching profiles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const center = members.find(m => m.id === centerPerson) || members.find(m => m.id === 'self') || members[0];

  const getVisibleMembers = () => {
    if (!center) return [];
    if (viewMode === 'ancestor') {
      return members.filter(m => m.generation <= center.generation);
    } else if (viewMode === 'my-view') {
      const currentGen = center.generation;
      return members.filter(m =>
        m.generation >= currentGen - 1 && m.generation <= currentGen + 1
      );
    }
    return members;
  };

  const visibleMembers = getVisibleMembers();

  const searchResults = searchQuery
    ? members.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const getGenerationColor = (generation: number) => {
    if (generation === -2) return 'from-[#8D6E63] to-[#6D4C41]';
    if (generation === -1) return 'from-[#D2691E] to-[#C2591E]';
    if (generation === 0) return 'from-[#E8A05D] to-[#D2691E]';
    return 'from-[#2E7D32] to-[#1B5E20]';
  };

  const getNodeSize = (memberId: string) => {
    if (memberId === centerPerson) return 'w-24 h-24 text-5xl';
    return 'w-16 h-16 text-3xl';
  };

  const renderMemberNode = (member: FamilyMember) => (
    <button
      key={member.id}
      onClick={() => setCenterPerson(member.id)}
      className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
    >
      <div className={`${getNodeSize(member.id)} rounded-full bg-gradient-to-br ${getGenerationColor(member.generation)} flex items-center justify-center shadow-xl border-4 border-white overflow-hidden`}>
        {member.photo ? (
          <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white font-bold text-lg">
            {member.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <span className="text-xs font-medium text-[#5D4037] max-w-[70px] text-center truncate">{member.name}</span>
      {member.relation && <span className="text-xs text-[#8D6E63]">{member.relation}</span>}
    </button>
  );

  // Group members by generation
  const byGeneration = visibleMembers.reduce((acc, m) => {
    const g = m.generation;
    if (!acc[g]) acc[g] = [];
    acc[g].push(m);
    return acc;
  }, {} as Record<number, FamilyMember[]>);

  const sortedGenerations = Object.keys(byGeneration)
    .map(Number)
    .sort((a, b) => a - b);

  if (loading) {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#D2691E]/20 border-t-[#D2691E] animate-spin mx-auto mb-3" />
          <p className="text-[#8D6E63]">Chargement de l'arbre...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#5D4037]/10 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-[#5D4037]">Arbre Familial</h1>
            <p className="text-[#8D6E63] text-sm">
              {center ? `Centré sur : ${center.name}` : `${members.length} membres`}
            </p>
          </div>
          <button
            onClick={() => setShowViewModes(!showViewModes)}
            className="w-10 h-10 rounded-full bg-[#FFF8E7] flex items-center justify-center text-[#D2691E]"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un membre..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearch(e.target.value.length > 0);
            }}
            className="w-full h-11 bg-[#FFF8E7] rounded-2xl pl-11 pr-4 text-[#5D4037] placeholder:text-[#8D6E63] focus:outline-none focus:ring-2 focus:ring-[#D2691E]/30"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D6E63]" />
        </div>

        {/* Search Results */}
        <AnimatePresence>
          {showSearch && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-6 right-6 bg-white rounded-2xl shadow-xl mt-2 overflow-hidden z-20 max-h-64 overflow-y-auto"
            >
              {searchResults.map((member) => (
                <button
                  key={member.id}
                  onClick={() => {
                    setCenterPerson(member.id);
                    setSearchQuery('');
                    setShowSearch(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-[#FFF8E7] transition-colors border-b border-[#5D4037]/5 last:border-0"
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGenerationColor(member.generation)} flex items-center justify-center text-white font-bold overflow-hidden`}>
                    {member.photo ? (
                      <img src={member.photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      member.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-[#5D4037]">{member.name}</div>
                    {member.relation && <div className="text-xs text-[#8D6E63]">{member.relation}</div>}
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* View Mode Selector */}
      <AnimatePresence>
        {showViewModes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b border-[#5D4037]/10 px-6 overflow-hidden"
          >
            <div className="py-4 space-y-2">
              {(['my-view', 'ancestor', 'birds-eye'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => { setViewMode(mode); setShowViewModes(false); }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-colors ${
                    viewMode === mode ? 'bg-[#D2691E] text-white' : 'bg-[#FFF8E7] text-[#5D4037]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {mode === 'my-view' && <User className="w-5 h-5" />}
                    {mode === 'ancestor' && <span className="text-lg">🌳</span>}
                    {mode === 'birds-eye' && <Maximize2 className="w-5 h-5" />}
                    <div className="text-left">
                      <div className="font-semibold text-sm">
                        {mode === 'my-view' ? 'Ma vue' : mode === 'ancestor' ? 'Mode ancêtres' : 'Vue globale'}
                      </div>
                    </div>
                  </div>
                  {viewMode === mode && <span className="text-lg">✓</span>}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tree Canvas */}
      <div className="flex-1 relative overflow-auto bg-gradient-to-b from-[#FFF8E7] to-[#F5E6D3] pb-24">
        {members.length <= 1 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-bold text-[#5D4037] mb-2">Votre arbre est vide</h3>
            <p className="text-[#8D6E63] mb-6">
              Commencez par ajouter des membres de votre famille pour construire votre arbre généalogique.
            </p>
            <Link to="/admin/create-profile">
              <button className="bg-[#D2691E] text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Ajouter un membre
              </button>
            </Link>
          </div>
        ) : (
          /* Tree visualization by generation */
          <div className="p-6 space-y-8 pt-8">
            {sortedGenerations.map((gen) => (
              <div key={gen}>
                <div className="text-xs text-[#8D6E63] font-semibold uppercase tracking-wide mb-3 text-center">
                  {gen === -2 ? 'Arrière-grands-parents' :
                   gen === -1 ? 'Grands-parents / Parents' :
                   gen === 0 ? 'Votre génération' :
                   gen === 1 ? 'Enfants' : 'Petits-enfants'}
                </div>
                <div className="flex flex-wrap justify-center gap-6">
                  {byGeneration[gen].map(renderMemberNode)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
