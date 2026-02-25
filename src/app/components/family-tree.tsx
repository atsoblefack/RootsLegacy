import { Plus, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { BottomNav } from './bottom-nav';
import { Link } from 'react-router';
import { useState } from 'react';

interface FamilyMember {
  id: string;
  name: string;
  photo: string;
  generation: number;
  position: number;
}

const familyData: FamilyMember[] = [
  // Generation 0 (Great-grandparents)
  { id: '1', name: 'Kwame', photo: '👴🏿', generation: 0, position: 0 },
  { id: '2', name: 'Abena', photo: '👵🏿', generation: 0, position: 1 },
  { id: '3', name: 'Kofi', photo: '👴🏿', generation: 0, position: 2 },
  { id: '4', name: 'Ama', photo: '👵🏿', generation: 0, position: 3 },
  
  // Generation 1 (Grandparents)
  { id: '5', name: 'Nkrumah', photo: '👨🏿', generation: 1, position: 0.5 },
  { id: '6', name: 'Akosua', photo: '👩🏿', generation: 1, position: 2.5 },
  
  // Generation 2 (Parents)
  { id: '7', name: 'Kwasi', photo: '👨🏿', generation: 2, position: 1.5 },
  
  // Generation 3 (Current)
  { id: '8', name: 'Amara', photo: '👧🏿', generation: 3, position: 1.5 },
];

export function FamilyTree() {
  const [showHint, setShowHint] = useState(true);

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#5D4037]/10 px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-[#5D4037]">Family Tree</h1>
        <p className="text-[#8D6E63] text-sm mt-1">4 generations • 24 members</p>
      </div>

      {/* Tree Canvas */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#FFF8E7] to-[#F5E6D3]">
        {/* Hint overlay */}
        {showHint && (
          <div 
            className="absolute top-4 left-6 right-6 bg-[#D2691E] text-white p-4 rounded-2xl shadow-lg z-20"
            onClick={() => setShowHint(false)}
          >
            <p className="text-sm font-medium">
              👆 Tap any member to view their profile
            </p>
            <p className="text-xs mt-1 opacity-90">
              Pinch to zoom • Drag to explore
            </p>
          </div>
        )}

        {/* Tree visualization */}
        <div className="absolute inset-0 p-8" style={{ paddingBottom: '120px' }}>
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
            {/* Connection lines */}
            <line x1="50%" y1="15%" x2="35%" y2="30%" stroke="#D2691E" strokeWidth="2" opacity="0.4" />
            <line x1="50%" y1="15%" x2="65%" y2="30%" stroke="#D2691E" strokeWidth="2" opacity="0.4" />
            <line x1="35%" y1="30%" x2="50%" y2="48%" stroke="#D2691E" strokeWidth="2" opacity="0.4" />
            <line x1="65%" y1="30%" x2="50%" y2="48%" stroke="#D2691E" strokeWidth="2" opacity="0.4" />
            <line x1="50%" y1="48%" x2="50%" y2="70%" stroke="#D2691E" strokeWidth="2" opacity="0.4" />
          </svg>

          {/* Generation 0 - Great-grandparents */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-12">
            <div className="flex gap-3">
              <Link to="/profile/1" className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex items-center justify-center text-2xl shadow-lg border-4 border-white">
                  {familyData[0].photo}
                </div>
                <span className="text-xs font-medium text-[#5D4037]">{familyData[0].name}</span>
              </Link>
              <Link to="/profile/2" className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex items-center justify-center text-2xl shadow-lg border-4 border-white">
                  {familyData[1].photo}
                </div>
                <span className="text-xs font-medium text-[#5D4037]">{familyData[1].name}</span>
              </Link>
            </div>
            <div className="flex gap-3">
              <Link to="/profile/3" className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex items-center justify-center text-2xl shadow-lg border-4 border-white">
                  {familyData[2].photo}
                </div>
                <span className="text-xs font-medium text-[#5D4037]">{familyData[2].name}</span>
              </Link>
              <Link to="/profile/4" className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex items-center justify-center text-2xl shadow-lg border-4 border-white">
                  {familyData[3].photo}
                </div>
                <span className="text-xs font-medium text-[#5D4037]">{familyData[3].name}</span>
              </Link>
            </div>
          </div>

          {/* Generation 1 - Grandparents */}
          <div className="absolute top-[28%] left-1/2 -translate-x-1/2 flex gap-32">
            <Link to="/profile/5" className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E8A05D] to-[#D2691E] flex items-center justify-center text-3xl shadow-lg border-4 border-white">
                {familyData[4].photo}
              </div>
              <span className="text-xs font-medium text-[#5D4037]">{familyData[4].name}</span>
            </Link>
            <Link to="/profile/6" className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E8A05D] to-[#D2691E] flex items-center justify-center text-3xl shadow-lg border-4 border-white">
                {familyData[5].photo}
              </div>
              <span className="text-xs font-medium text-[#5D4037]">{familyData[5].name}</span>
            </Link>
          </div>

          {/* Generation 2 - Parents */}
          <div className="absolute top-[48%] left-1/2 -translate-x-1/2">
            <Link to="/profile/7" className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center text-4xl shadow-xl border-4 border-white">
                {familyData[6].photo}
              </div>
              <span className="text-sm font-semibold text-[#5D4037]">{familyData[6].name}</span>
            </Link>
          </div>

          {/* Generation 3 - You */}
          <div className="absolute top-[70%] left-1/2 -translate-x-1/2">
            <Link to="/profile/8" className="flex flex-col items-center gap-2">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex items-center justify-center text-5xl shadow-2xl border-4 border-white ring-4 ring-[#D2691E]/20">
                {familyData[7].photo}
              </div>
              <span className="text-base font-bold text-[#D2691E]">{familyData[7].name} (You)</span>
            </Link>
          </div>
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-28 right-6 flex flex-col gap-2 z-10">
          <button className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-[#D2691E] active:scale-95 transition-transform">
            <ZoomIn className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-[#D2691E] active:scale-95 transition-transform">
            <ZoomOut className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-[#D2691E] active:scale-95 transition-transform">
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Add Button */}
        <Link to="/profile/new">
          <button className="absolute bottom-28 left-6 w-14 h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] rounded-full shadow-2xl flex items-center justify-center text-white active:scale-95 transition-transform z-10">
            <Plus className="w-7 h-7" strokeWidth={2.5} />
          </button>
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}
