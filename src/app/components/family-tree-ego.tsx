import { Search, User, ZoomIn, ZoomOut, Maximize2, Filter, Plus } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import { BottomNav } from './bottom-nav';
import { useLanguage } from './language-context';

interface FamilyMember {
  id: string;
  name: string;
  photo: string;
  generation: number;
  relation?: string;
}

// Simulated large family data - in reality, this would come from the backend
const fullFamilyData: FamilyMember[] = [
  // Great-grandparents (generation -2)
  { id: 'gg1', name: 'Kwame', photo: '👴🏿', generation: -2 },
  { id: 'gg2', name: 'Abena', photo: '👵🏿', generation: -2 },
  { id: 'gg3', name: 'Kofi', photo: '👴🏿', generation: -2 },
  { id: 'gg4', name: 'Ama', photo: '👵🏿', generation: -2 },
  
  // Grandparents (generation -1)
  { id: 'g1', name: 'Nkrumah', photo: '👨🏿', generation: -1, relation: 'Grandfather' },
  { id: 'g2', name: 'Akosua', photo: '👩🏿', generation: -1, relation: 'Grandmother' },
  
  // Parents (generation 0)
  { id: 'p1', name: 'Kwasi', photo: '👨🏿', generation: 0, relation: 'Father' },
  { id: 'p2', name: 'Yaa', photo: '👩🏿', generation: 0, relation: 'Mother' },
  
  // Siblings (generation 0)
  { id: 's1', name: 'Kofi', photo: '👦🏿', generation: 0, relation: 'Brother' },
  { id: 's2', name: 'Nia', photo: '👧🏿', generation: 0, relation: 'Sister' },
  
  // Current user (generation 0)
  { id: 'user', name: 'Amara', photo: '👧🏿', generation: 0, relation: 'You' },
];

type ViewMode = 'my-view' | 'ancestor' | 'birds-eye';

export function FamilyTreeEgoCentric() {
  const [centerPerson, setCenterPerson] = useState('user');
  const [viewMode, setViewMode] = useState<ViewMode>('my-view');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showViewModes, setShowViewModes] = useState(false);
  const language = useLanguage();
  
  // Get the center person's data
  const center = fullFamilyData.find(m => m.id === centerPerson) || fullFamilyData.find(m => m.id === 'user')!;
  
  // Filter visible nodes based on view mode and center person
  const getVisibleMembers = () => {
    if (viewMode === 'ancestor') {
      // Only show upward lineage
      return fullFamilyData.filter(m => m.generation <= center.generation);
    } else if (viewMode === 'my-view') {
      // Show 3 levels: 1 up, current, 1 down
      const currentGen = center.generation;
      return fullFamilyData.filter(m => 
        m.generation >= currentGen - 1 && m.generation <= currentGen + 1
      );
    }
    return fullFamilyData;
  };

  const visibleMembers = getVisibleMembers();
  
  // Search filtered results
  const searchResults = searchQuery 
    ? fullFamilyData.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  // Color coding by generation relative to user
  const getGenerationColor = (generation: number) => {
    if (generation === -2) return 'from-[#8D6E63] to-[#6D4C41]'; // Great-grandparents - muted brown
    if (generation === -1) return 'from-[#D2691E] to-[#C2591E]'; // Grandparents - terracotta
    if (generation === 0) return 'from-[#E8A05D] to-[#D2691E]'; // Parents/Siblings - ochre
    return 'from-[#2E7D32] to-[#1B5E20]'; // Children - green
  };

  const getNodeSize = (memberId: string, generation: number) => {
    if (memberId === centerPerson) {
      return 'w-24 h-24 text-5xl'; // Center person - largest
    }
    if (generation === center.generation) {
      return 'w-20 h-20 text-4xl'; // Same generation
    }
    return 'w-16 h-16 text-3xl'; // Other generations
  };

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#5D4037]/10 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-[#5D4037]">Family Tree</h1>
            <p className="text-[#8D6E63] text-sm">Centered on: {center.name}</p>
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
            placeholder="Search family members..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearch(e.target.value.length > 0);
            }}
            className="w-full h-11 bg-[#FFF8E7] rounded-2xl pl-11 pr-4 text-[#5D4037] placeholder:text-[#8D6E63] focus:outline-none focus:ring-2 focus:ring-[#D2691E]/30"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D6E63]" />
        </div>

        {/* Search Results Dropdown */}
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
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGenerationColor(member.generation)} flex items-center justify-center text-xl`}>
                    {member.photo}
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
              <button
                onClick={() => {
                  setViewMode('my-view');
                  setShowViewModes(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-colors ${
                  viewMode === 'my-view' ? 'bg-[#D2691E] text-white' : 'bg-[#FFF8E7] text-[#5D4037]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold text-sm">My View</div>
                    <div className={`text-xs ${viewMode === 'my-view' ? 'text-white/80' : 'text-[#8D6E63]'}`}>
                      3 levels around you
                    </div>
                  </div>
                </div>
                {viewMode === 'my-view' && <span className="text-lg">✓</span>}
              </button>

              <button
                onClick={() => {
                  setViewMode('ancestor');
                  setShowViewModes(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-colors ${
                  viewMode === 'ancestor' ? 'bg-[#D2691E] text-white' : 'bg-[#FFF8E7] text-[#5D4037]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-lg">🌳</div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">Ancestor Mode</div>
                    <div className={`text-xs ${viewMode === 'ancestor' ? 'text-white/80' : 'text-[#8D6E63]'}`}>
                      Your heritage lineage
                    </div>
                  </div>
                </div>
                {viewMode === 'ancestor' && <span className="text-lg">✓</span>}
              </button>

              <button
                onClick={() => {
                  setViewMode('birds-eye');
                  setShowViewModes(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-colors ${
                  viewMode === 'birds-eye' ? 'bg-[#D2691E] text-white' : 'bg-[#FFF8E7] text-[#5D4037]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Maximize2 className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold text-sm">Bird's Eye View</div>
                    <div className={`text-xs ${viewMode === 'birds-eye' ? 'text-white/80' : 'text-[#8D6E63]'}`}>
                      See the full structure
                    </div>
                  </div>
                </div>
                {viewMode === 'birds-eye' && <span className="text-lg">✓</span>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tree Canvas */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#FFF8E7] to-[#F5E6D3]">
        {/* Hint overlay */}
        <div className="absolute top-4 left-6 right-6 bg-[#D2691E]/90 backdrop-blur-sm text-white p-3 rounded-2xl shadow-lg z-10 text-sm">
          <p className="font-medium">👆 Tap anyone to center the view</p>
        </div>

        {/* Generation Labels */}
        {viewMode !== 'birds-eye' && (
          <div className="absolute left-4 top-24 space-y-2 z-10">
            {viewMode === 'ancestor' ? (
              <>
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-[#8D6E63]">
                  Great-grandparents
                </div>
                <div className="h-16" />
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-[#D2691E]">
                  Grandparents
                </div>
                <div className="h-16" />
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-[#E8A05D]">
                  Parents
                </div>
                <div className="h-16" />
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-[#2E7D32]">
                  You
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#8D6E63] to-[#6D4C41]"></div>
                  <span className="text-xs text-[#5D4037]">Great-grandparents</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#D2691E] to-[#C2591E]"></div>
                  <span className="text-xs text-[#5D4037]">Grandparents</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#E8A05D] to-[#D2691E]"></div>
                  <span className="text-xs text-[#5D4037]">Parents/Siblings</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tree visualization - Ego-centric */}
        {viewMode === 'my-view' && (
          <motion.div
            key={centerPerson}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 p-8 flex flex-col justify-center items-center"
            style={{ paddingBottom: '120px' }}
          >
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
              {/* Connection lines - dynamic based on center person */}
              {centerPerson === 'user' && (
                <>
                  <line x1="50%" y1="40%" x2="35%" y2="55%" stroke="#D2691E" strokeWidth="2" opacity="0.4" />
                  <line x1="50%" y1="40%" x2="65%" y2="55%" stroke="#D2691E" strokeWidth="2" opacity="0.4" />
                  <line x1="50%" y1="70%" x2="50%" y2="55%" stroke="#D2691E" strokeWidth="2" opacity="0.4" />
                </>
              )}
            </svg>

            {/* Grandparents level (if viewing user) */}
            {centerPerson === 'user' && (
              <div className="absolute top-[20%] left-1/2 -translate-x-1/2 flex gap-16">
                <button
                  onClick={() => setCenterPerson('g1')}
                  className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                >
                  <div className={`${getNodeSize('g1', -1)} rounded-full bg-gradient-to-br ${getGenerationColor(-1)} flex items-center justify-center shadow-xl border-4 border-white`}>
                    👨🏿
                  </div>
                  <span className="text-xs font-medium text-[#5D4037]">Nkrumah</span>
                  <span className="text-xs text-[#8D6E63]">Grandfather</span>
                </button>
                <button
                  onClick={() => setCenterPerson('g2')}
                  className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                >
                  <div className={`${getNodeSize('g2', -1)} rounded-full bg-gradient-to-br ${getGenerationColor(-1)} flex items-center justify-center shadow-xl border-4 border-white`}>
                    👩🏿
                  </div>
                  <span className="text-xs font-medium text-[#5D4037]">Akosua</span>
                  <span className="text-xs text-[#8D6E63]">Grandmother</span>
                </button>
              </div>
            )}

            {/* Parents/Siblings level */}
            <div className="absolute top-[50%] -translate-y-1/2 left-1/2 -translate-x-1/2 flex gap-8">
              <button
                onClick={() => setCenterPerson('p1')}
                className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
              >
                <div className={`${getNodeSize('p1', 0)} rounded-full bg-gradient-to-br ${getGenerationColor(0)} flex items-center justify-center shadow-xl border-4 border-white`}>
                  👨🏿
                </div>
                <span className="text-xs font-medium text-[#5D4037]">Kwasi</span>
                <span className="text-xs text-[#8D6E63]">Father</span>
              </button>
              <button
                onClick={() => setCenterPerson('p2')}
                className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
              >
                <div className={`${getNodeSize('p2', 0)} rounded-full bg-gradient-to-br ${getGenerationColor(0)} flex items-center justify-center shadow-xl border-4 border-white`}>
                  👩🏿
                </div>
                <span className="text-xs font-medium text-[#5D4037]">Yaa</span>
                <span className="text-xs text-[#8D6E63]">Mother</span>
              </button>
            </div>

            {/* Center person (User) */}
            <div className="absolute top-[75%] -translate-y-1/2 left-1/2 -translate-x-1/2">
              <div className="flex flex-col items-center gap-2">
                <div className={`${getNodeSize('user', 0)} rounded-full bg-gradient-to-br ${getGenerationColor(0)} flex items-center justify-center shadow-2xl border-4 border-white ring-4 ring-[#D2691E]/30`}>
                  👧🏿
                </div>
                <span className="text-base font-bold text-[#D2691E]">Amara (You)</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tree visualization - Ancestor Mode */}
        {viewMode === 'ancestor' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 p-8 flex flex-col pt-24"
            style={{ paddingBottom: '120px' }}
          >
            {/* Vertical timeline */}
            <div className="flex-1 flex flex-col justify-between relative">
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-[#D2691E]/20" />

              {/* Great-grandparents */}
              <div className="flex justify-center gap-4 relative z-10">
                {fullFamilyData.filter(m => m.generation === -2).slice(0, 2).map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setCenterPerson(member.id)}
                    className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#8D6E63] to-[#6D4C41] flex items-center justify-center text-2xl shadow-lg border-4 border-white">
                      {member.photo}
                    </div>
                    <span className="text-xs font-medium text-[#5D4037]">{member.name}</span>
                  </button>
                ))}
              </div>

              {/* Grandparents */}
              <div className="flex justify-center gap-8 relative z-10">
                {fullFamilyData.filter(m => m.generation === -1).map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setCenterPerson(member.id)}
                    className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D2691E] to-[#C2591E] flex items-center justify-center text-3xl shadow-lg border-4 border-white">
                      {member.photo}
                    </div>
                    <span className="text-xs font-medium text-[#5D4037]">{member.name}</span>
                  </button>
                ))}
              </div>

              {/* Parents */}
              <div className="flex justify-center gap-8 relative z-10">
                {fullFamilyData.filter(m => m.generation === 0 && (m.id === 'p1' || m.id === 'p2')).map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setCenterPerson(member.id)}
                    className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                  >
                    <div className="w-18 h-18 rounded-full bg-gradient-to-br from-[#E8A05D] to-[#D2691E] flex items-center justify-center text-4xl shadow-xl border-4 border-white">
                      {member.photo}
                    </div>
                    <span className="text-sm font-medium text-[#5D4037]">{member.name}</span>
                  </button>
                ))}
              </div>

              {/* You */}
              <div className="flex justify-center relative z-10">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center text-5xl shadow-2xl border-4 border-white ring-4 ring-[#2E7D32]/20">
                    👧🏿
                  </div>
                  <span className="text-base font-bold text-[#2E7D32]">Amara (You)</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tree visualization - Minimap */}
        {viewMode === 'birds-eye' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 p-8 flex items-center justify-center"
            style={{ paddingBottom: '120px' }}
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl max-w-sm">
              <h3 className="text-lg font-bold text-[#5D4037] mb-4 text-center">Full Family Overview</h3>
              
              {/* Abstract tree structure */}
              <div className="space-y-4">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8D6E63] to-[#6D4C41] border-2 border-white shadow-md" />
                  ))}
                </div>
                <div className="flex justify-center gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D2691E] to-[#C2591E] border-2 border-white shadow-md" />
                  ))}
                </div>
                <div className="flex justify-center gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E8A05D] to-[#D2691E] border-2 border-white shadow-md" />
                  ))}
                </div>
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] border-4 border-white shadow-xl ring-4 ring-[#2E7D32]/20" />
                </div>
              </div>

              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-[#5D4037]">
                  <span className="font-bold">11</span> family members across <span className="font-bold">4</span> generations
                </p>
                <button
                  onClick={() => setViewMode('my-view')}
                  className="w-full h-10 bg-[#D2691E] text-white rounded-2xl font-medium text-sm active:scale-95 transition-transform"
                >
                  Explore Tree
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Floating Add Button */}
        <Link to="/input-methods">
          <button className="absolute bottom-28 left-6 w-14 h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] rounded-full shadow-2xl flex items-center justify-center text-white active:scale-95 transition-transform z-20">
            <Plus className="w-7 h-7" strokeWidth={2.5} />
          </button>
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}