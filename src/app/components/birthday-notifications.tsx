import { ArrowLeft, Cake, Calendar, Gift, Check } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useLanguage } from './language-context';

interface Birthday {
  id: string;
  name: string;
  photo: string;
  date: string;
  age?: number;
  daysUntil: number;
  relation: string;
}

export function BirthdayNotifications() {
  const { t } = useLanguage();
  
  const upcomingBirthdays: Birthday[] = [
    {
      id: '1',
      name: 'Kwame Mensah',
      photo: '👴🏿',
      date: 'Tomorrow, Feb 25',
      age: 79,
      daysUntil: 1,
      relation: 'Great-Grandfather'
    },
    {
      id: '2',
      name: 'Nia Johnson',
      photo: '👧🏿',
      date: 'Friday, Feb 28',
      age: 8,
      daysUntil: 4,
      relation: 'Sister'
    },
    {
      id: '3',
      name: 'Akosua Osei',
      photo: '👩🏿',
      date: 'March 5',
      age: 52,
      daysUntil: 10,
      relation: 'Grandmother'
    },
    {
      id: '4',
      name: 'Kofi Asante',
      photo: '👦🏿',
      date: 'March 12',
      age: 10,
      daysUntil: 17,
      relation: 'Brother'
    },
  ];

  const recentBirthdays: Birthday[] = [
    {
      id: '5',
      name: 'Yaa Johnson',
      photo: '👩🏿',
      date: 'Yesterday, Feb 23',
      age: 38,
      daysUntil: -1,
      relation: 'Mother'
    },
  ];

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#D2691E] to-[#E8A05D] px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/home">
            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Birthdays</h1>
            <p className="text-sm text-white/80">Celebrate with family</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-6">
        {/* Today/Tomorrow - Priority */}
        {upcomingBirthdays.filter(b => b.daysUntil <= 1).length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-[#D2691E] uppercase tracking-wide mb-3 px-2 flex items-center gap-2">
              <Cake className="w-4 h-4" />
              Coming Up Soon!
            </h2>
            <div className="space-y-3">
              {upcomingBirthdays
                .filter(b => b.daysUntil <= 1)
                .map((birthday) => (
                  <motion.div
                    key={birthday.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gradient-to-br from-[#D2691E] to-[#E8A05D] rounded-3xl p-5 shadow-xl"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-4xl border-4 border-white shadow-lg">
                        {birthday.photo}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg">{birthday.name}</h3>
                        <p className="text-white/90 text-sm">{birthday.relation}</p>
                        <p className="text-white/80 text-xs mt-1">
                          Turning {birthday.age} years old
                        </p>
                      </div>
                      <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl px-3 py-2">
                        <div className="text-2xl font-bold text-white">{birthday.daysUntil === 0 ? '🎉' : '⏰'}</div>
                        <div className="text-xs text-white/90 mt-1">
                          {birthday.daysUntil === 0 ? 'Today!' : 'Tomorrow'}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 h-11 bg-white text-[#D2691E] rounded-2xl font-semibold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
                        <Gift className="w-4 h-4" />
                        Send Wishes
                      </button>
                      <Link to={`/profile/${birthday.id}`} className="flex-1">
                        <button className="w-full h-11 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-semibold text-sm active:scale-95 transition-transform">
                          View Profile
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        )}

        {/* This Week */}
        {upcomingBirthdays.filter(b => b.daysUntil > 1 && b.daysUntil <= 7).length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-[#5D4037] uppercase tracking-wide mb-3 px-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              This Week
            </h2>
            <div className="bg-white rounded-3xl shadow-md overflow-hidden">
              {upcomingBirthdays
                .filter(b => b.daysUntil > 1 && b.daysUntil <= 7)
                .map((birthday, index) => (
                  <div key={birthday.id}>
                    <Link to={`/profile/${birthday.id}`}>
                      <div className="flex items-center gap-4 p-4 hover:bg-[#FFF8E7] transition-colors active:scale-98">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E8A05D] to-[#D2691E] flex items-center justify-center text-3xl border-4 border-white shadow-md">
                          {birthday.photo}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-[#5D4037] font-semibold">{birthday.name}</h3>
                          <p className="text-[#8D6E63] text-sm">{birthday.relation} • {birthday.age} years</p>
                          <p className="text-[#D2691E] text-xs font-medium mt-1">{birthday.date}</p>
                        </div>
                        <div className="text-center bg-[#FFF8E7] rounded-xl px-3 py-2">
                          <div className="text-lg font-bold text-[#D2691E]">{birthday.daysUntil}</div>
                          <div className="text-xs text-[#8D6E63]">days</div>
                        </div>
                      </div>
                    </Link>
                    {index < upcomingBirthdays.filter(b => b.daysUntil > 1 && b.daysUntil <= 7).length - 1 && (
                      <div className="h-px bg-[#5D4037]/5 mx-4" />
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Coming This Month */}
        {upcomingBirthdays.filter(b => b.daysUntil > 7).length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-[#5D4037] uppercase tracking-wide mb-3 px-2">
              Later This Month
            </h2>
            <div className="bg-white rounded-3xl shadow-md overflow-hidden">
              {upcomingBirthdays
                .filter(b => b.daysUntil > 7)
                .map((birthday, index) => (
                  <div key={birthday.id}>
                    <Link to={`/profile/${birthday.id}`}>
                      <div className="flex items-center gap-4 p-4 hover:bg-[#FFF8E7] transition-colors active:scale-98">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E8A05D] to-[#D2691E] flex items-center justify-center text-2xl border-2 border-white shadow-md">
                          {birthday.photo}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-[#5D4037] font-semibold text-sm">{birthday.name}</h3>
                          <p className="text-[#8D6E63] text-xs">{birthday.date}</p>
                        </div>
                        <div className="text-xs text-[#8D6E63]">
                          in {birthday.daysUntil} days
                        </div>
                      </div>
                    </Link>
                    {index < upcomingBirthdays.filter(b => b.daysUntil > 7).length - 1 && (
                      <div className="h-px bg-[#5D4037]/5 mx-4" />
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Recently Celebrated */}
        {recentBirthdays.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-[#8D6E63] uppercase tracking-wide mb-3 px-2 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Recently Celebrated
            </h2>
            <div className="bg-white rounded-3xl shadow-md overflow-hidden opacity-75">
              {recentBirthdays.map((birthday) => (
                <Link key={birthday.id} to={`/profile/${birthday.id}`}>
                  <div className="flex items-center gap-4 p-4 hover:bg-[#FFF8E7] transition-colors">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8D6E63] to-[#6D4C41] flex items-center justify-center text-2xl border-2 border-white shadow-md">
                      {birthday.photo}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[#5D4037] font-semibold text-sm">{birthday.name}</h3>
                      <p className="text-[#8D6E63] text-xs">{birthday.date}</p>
                    </div>
                    <span className="text-lg">🎂</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Enable WhatsApp Reminders CTA */}
        <div className="bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-3xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold">WhatsApp Reminders</h3>
              <p className="text-white/90 text-sm">Share with your family group</p>
            </div>
          </div>
          <Link to="/whatsapp-birthday-setup">
            <button className="w-full h-12 bg-white text-[#25D366] rounded-2xl font-semibold shadow-md active:scale-95 transition-transform">
              Enable for WhatsApp
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}