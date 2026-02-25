import { ArrowLeft, Heart, Users, Calendar, Cake, PartyPopper, Plus } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useLanguage } from './language-context';
import { useState } from 'react';

export function FamilyEvents() {
  const { t } = useLanguage();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const familyMembers = [
    { id: '1', name: 'Kwasi Johnson', photo: '👨🏿' },
    { id: '2', name: 'Yaa Mensah', photo: '👩🏿' },
    { id: '3', name: 'Amara Johnson', photo: '👧🏿' },
    { id: '4', name: 'Kofi Johnson', photo: '👦🏿' },
  ];

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
            <h1 className="text-xl font-bold text-[#5D4037]">Family Events</h1>
            <p className="text-sm text-[#8D6E63]">Record important moments</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
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
                <h3 className="font-bold text-lg mb-1">Record Marriage</h3>
                <p className="text-white/80 text-sm">Voice or type • All structures welcome</p>
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
                <h3 className="font-bold text-lg mb-1">Record Birth</h3>
                <p className="text-white/80 text-sm">Voice or type • New generation</p>
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
                <h3 className="font-bold text-lg mb-1 text-[#5D4037]">Record Passing</h3>
                <p className="text-[#8D6E63] text-sm">Voice or type • Honor memories</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}