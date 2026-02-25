import { useState, useEffect } from 'react';
import { ArrowLeft, Cake, Calendar } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { supabase } from '../../../utils/supabase/client';
import { projectId, publicAnonKey, serverBaseUrl } from '../../../utils/supabase/info';
import { BottomNav } from './bottom-nav';

interface Birthday {
  id: string;
  name: string;
  photo: string | null;
  date: string;
  age?: number;
  daysUntil: number;
  relation: string;
}

const RELATION_LABELS: Record<string, string> = {
  great_grandparent: 'Arrière-grand-parent',
  grandparent: 'Grand-parent',
  parent: 'Parent',
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

const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

export function BirthdayNotifications() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
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
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const withBirthdays: Birthday[] = profiles
            .filter((p: any) => p.birth_date)
            .map((p: any) => {
              const bday = new Date(p.birth_date);
              const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
              if (next < today) next.setFullYear(today.getFullYear() + 1);
              const diff = Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const age = today.getFullYear() - bday.getFullYear();

              let dateLabel = '';
              if (diff === 0) dateLabel = "Aujourd'hui";
              else if (diff === 1) dateLabel = 'Demain';
              else dateLabel = `${next.getDate()} ${MONTHS_FR[next.getMonth()]}`;

              return {
                id: p.id,
                name: p.full_name,
                photo: p.photo_url || null,
                date: dateLabel,
                age,
                daysUntil: diff,
                relation: RELATION_LABELS[p.relation_type] || p.relation_type || '',
              };
            })
            .sort((a: Birthday, b: Birthday) => a.daysUntil - b.daysUntil)
            .slice(0, 20);

          setBirthdays(withBirthdays);
        }
      } catch (err) {
        console.error('Error fetching birthdays:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBirthdays();
  }, []);

  const getDaysColor = (days: number) => {
    if (days === 0) return 'bg-[#D2691E] text-white';
    if (days <= 7) return 'bg-[#E8A05D]/20 text-[#D2691E]';
    return 'bg-[#FFF8E7] text-[#8D6E63]';
  };

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      <div className="bg-white border-b border-[#5D4037]/10 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/home">
            <button className="w-10 h-10 rounded-full bg-[#FFF8E7] flex items-center justify-center text-[#D2691E]">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#5D4037]">Anniversaires</h1>
            <p className="text-[#8D6E63] text-sm">
              {birthdays.length > 0 ? `${birthdays.length} à venir` : 'Prochains anniversaires'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-6 pt-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-[#D2691E]/20 border-t-[#D2691E] animate-spin" />
          </div>
        ) : birthdays.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🎂</div>
            <h3 className="text-lg font-bold text-[#5D4037] mb-2">Aucun anniversaire</h3>
            <p className="text-[#8D6E63] text-sm px-4">
              Les anniversaires apparaîtront ici une fois que vous aurez ajouté des membres avec leur date de naissance.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {birthdays.map((birthday, index) => (
              <motion.div
                key={birthday.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-3xl p-4 shadow-sm border ${
                  birthday.daysUntil === 0
                    ? 'border-[#D2691E]/30 bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3]'
                    : 'border-[#5D4037]/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-white shadow-md">
                    {birthday.photo ? (
                      <img src={birthday.photo} alt={birthday.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-xl">{birthday.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#5D4037] truncate">{birthday.name}</h3>
                    <p className="text-[#8D6E63] text-xs">{birthday.relation}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-[#8D6E63]" />
                      <span className="text-xs text-[#8D6E63]">{birthday.date}</span>
                      {birthday.age !== undefined && (
                        <span className="text-xs text-[#8D6E63]">• {birthday.age} ans</span>
                      )}
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-2xl text-center flex-shrink-0 ${getDaysColor(birthday.daysUntil)}`}>
                    {birthday.daysUntil === 0 ? (
                      <div className="flex items-center gap-1">
                        <Cake className="w-4 h-4" />
                        <span className="text-xs font-bold">Aujourd'hui</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-lg font-bold leading-none">{birthday.daysUntil}</div>
                        <div className="text-xs opacity-80">jours</div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
