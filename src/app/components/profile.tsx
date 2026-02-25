import { ArrowLeft, Camera, MapPin, Calendar, Phone, Mail, Edit, Heart } from 'lucide-react';
import { Link } from 'react-router';
import { BottomNav } from './bottom-nav';
import { useLanguage } from './language-context';
import { VillageDisplay } from './cultural-fields';

export function Profile() {
  const { t } = useLanguage();
  
  // Mock data - in real app would fetch based on id
  const person = {
    id: '1',
    name: 'Kwame Mensah',
    localName: 'Nkrumah', // Nom d'initiation
    photo: '👴🏿',
    photoUrl: undefined, // Real photo URL if uploaded
    profession: 'Farmer & Master Cocoa Cultivator',
    birthDate: 'January 15, 1945',
    birthPlace: 'Kumasi, Ghana',
    phone: '+233 24 123 4567',
    relation: 'Great-Grandfather',
    age: '79 years',
    children: 4,
    grandchildren: 12,
    village: {
      country: 'Ghana',
      city: 'Ashanti Region, Kumasi',
      village: 'Bantama',
      isMainVillage: true
    },
    spouseVillage: {
      country: 'Ghana', 
      city: 'Ashanti Region',
      village: 'Ejisu'
    },
    story: 'Born in the historic Ashanti Kingdom, Kwame has been the pillar of our family. A master cocoa farmer and keeper of our ancestral stories.',
    memories: [
      { id: '1', text: 'Every harvest season, he would gather all the children to teach us the old songs of our ancestors.', author: 'Kofi' },
      { id: '2', text: 'His wisdom and patience shaped who I am today. He always said "Know where you come from to know where you\'re going."', author: 'Amara' }
    ]
  };

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header with photo */}
      <div className="bg-gradient-to-br from-[#D2691E] to-[#E8A05D] px-6 pt-12 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/tree">
            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex-1" />
          <Link to={`/profile/${person.id}/edit`}>
            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <Edit className="w-5 h-5" />
            </button>
          </Link>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-24 h-24 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-6xl border-4 border-white shadow-lg">
            {person.photo}
          </div>
          <div className="flex-1 pt-2">
            <h1 className="text-2xl font-bold text-white mb-1">{person.name}</h1>
            {person.localName && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full font-semibold">
                  🌍 {person.localName}
                </span>
              </div>
            )}
            <p className="text-white/90 text-sm">{person.relation}</p>
            <p className="text-white/80 text-xs">{person.age}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 px-6 pt-6">
        {/* Villages d'origine */}
        <div className="mb-6 space-y-3">
          <VillageDisplay village={person.village} isMain={true} />
          
          {person.spouseVillage && (
            <div>
              <p className="text-xs text-[#8D6E63] uppercase tracking-wide font-semibold mb-2 px-2">
                Village de l'Épouse
              </p>
              <VillageDisplay village={person.spouseVillage} isMain={false} />
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-3xl p-6 shadow-md mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#D2691E] mb-1">{person.children}</div>
              <div className="text-xs text-[#8D6E63]">Enfants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#2E7D32] mb-1">{person.grandchildren}</div>
              <div className="text-xs text-[#8D6E63]">Petits-enfants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#E8A05D] mb-1">5</div>
              <div className="text-xs text-[#8D6E63]">Générations</div>
            </div>
          </div>
        </div>

        {/* Profession */}
        {person.profession && (
          <div className="mb-6">
            <div className="bg-gradient-to-br from-[#E8A05D]/10 to-[#D2691E]/10 rounded-2xl p-4 border-2 border-[#D2691E]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D2691E]/20 flex items-center justify-center">
                  <span className="text-2xl">💼</span>
                </div>
                <div>
                  <div className="text-xs text-[#8D6E63] uppercase tracking-wide font-semibold mb-1">
                    {t('profession')}
                  </div>
                  <div className="text-[#5D4037] font-semibold">{person.profession}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bio */}
        <div className="p-4 bg-[#FFF8E7] rounded-2xl">
          <h3 className="text-sm font-semibold text-[#5D4037] mb-2">About</h3>
          <p className="text-[#8D6E63] text-sm leading-relaxed">
            {person.story}
          </p>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-3xl p-6 shadow-md mb-6">
          <div className="flex items-center gap-3 p-3 bg-[#FFF8E7] rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-[#D2691E]/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-[#D2691E]" />
            </div>
            <div>
              <div className="text-xs text-[#8D6E63]">Phone</div>
              <div className="text-[#5D4037] font-medium">{person.phone}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-[#FFF8E7] rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-[#2E7D32]/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <div>
              <div className="text-xs text-[#8D6E63]">Birthplace</div>
              <div className="text-[#5D4037] font-medium">{person.birthPlace}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-[#FFF8E7] rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-[#D2691E]/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#D2691E]" />
            </div>
            <div>
              <div className="text-xs text-[#8D6E63]">Born</div>
              <div className="text-[#5D4037] font-medium">{person.birthDate}</div>
            </div>
          </div>
        </div>

        {/* Memories Section */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
          <h2 className="text-lg font-semibold text-[#5D4037] mb-4">Family Memories</h2>
          <div className="space-y-3">
            {person.memories.map(memory => (
              <div key={memory.id} className="p-4 bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] rounded-2xl">
                <div className="text-xs text-[#8D6E63] mb-1">Shared by {memory.author}</div>
                <p className="text-sm text-[#5D4037]">
                  "{memory.text}"
                </p>
              </div>
            ))}
            <button className="w-full p-4 border-2 border-dashed border-[#D2691E]/30 rounded-2xl text-[#D2691E] text-sm font-medium hover:bg-[#D2691E]/5 transition-colors">
              + Add a Memory
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}