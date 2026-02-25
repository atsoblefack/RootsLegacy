import { ArrowLeft, MessageCircle, Bell, CheckCircle, Calendar } from 'lucide-react';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from './language-context';
import { getSessionFromStorage } from '../../../utils/supabase/useSession';

const STORAGE_KEY = 'whatsapp_birthday_setup';

export function WhatsAppBirthdaySetup() {
  const { t } = useLanguage();
  const [daysBefore, setDaysBefore] = useState(3);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [groupName, setGroupName] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    try {
      const session = getSessionFromStorage();
      const userId = session?.user?.id || 'guest';
      const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (raw) {
        const saved = JSON.parse(raw);
        setDaysBefore(saved.daysBefore ?? 3);
        setReminderTime(saved.reminderTime ?? '09:00');
        setGroupName(saved.groupName ?? '');
        setIsConnected(saved.isConnected ?? false);
      }
    } catch { /* ignore */ }
  }, []);

  const handleConnect = () => {
    try {
      const session = getSessionFromStorage();
      const userId = session?.user?.id || 'guest';
      const settings = { daysBefore, reminderTime, groupName: groupName.trim() || 'Famille', isConnected: true };
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(settings));
      setIsConnected(true);
    } catch { /* ignore */ }
  };

  const handleDisconnect = () => {
    try {
      const session = getSessionFromStorage();
      const userId = session?.user?.id || 'guest';
      localStorage.removeItem(`${STORAGE_KEY}_${userId}`);
    } catch { /* ignore */ }
    setIsConnected(false);
    setGroupName('');
  };

  if (isConnected) {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center mb-6 shadow-2xl"
          >
            <CheckCircle className="w-14 h-14 text-white" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center w-full"
          >
            <h1 className="text-3xl font-bold text-[#5D4037] mb-3">Tout est prêt ! 🎉</h1>
            <p className="text-[#8D6E63] mb-8 leading-relaxed">
              Les rappels d'anniversaire seront envoyés automatiquement.
            </p>

            <div className="bg-white rounded-3xl p-6 shadow-xl mb-6 text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-[#25D366]" />
                </div>
                <div>
                  <div className="font-bold text-[#5D4037]">{groupName || 'Famille'}</div>
                  <div className="text-sm text-[#8D6E63]">Groupe configuré</div>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-[#5D4037]/10">
                <div className="flex justify-between">
                  <span className="text-sm text-[#8D6E63]">Délai de rappel</span>
                  <span className="text-sm font-semibold text-[#5D4037]">
                    {daysBefore === 0 ? 'Le jour même' : `${daysBefore} jour${daysBefore > 1 ? 's' : ''} avant`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#8D6E63]">Heure d'envoi</span>
                  <span className="text-sm font-semibold text-[#5D4037]">{reminderTime}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#E8A05D]/10 rounded-2xl p-4 mb-6">
              <p className="text-xs text-[#8D6E63] mb-2">Aperçu du message :</p>
              <div className="bg-white rounded-xl p-3 text-left">
                <p className="text-sm text-[#5D4037]">
                  🎂 <span className="font-semibold">Rappel d'anniversaire !</span><br/>
                  {daysBefore === 0 ? "Aujourd'hui" : daysBefore === 1 ? 'Demain' : `Dans ${daysBefore} jours`} c'est l'anniversaire de [Membre] 🎉<br/>
                  <span className="text-xs text-[#8D6E63]">— RootsLegacy</span>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Link to="/settings" className="block">
                <button className="w-full h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform">
                  Terminé
                </button>
              </Link>
              <button
                onClick={handleDisconnect}
                className="w-full h-12 bg-white text-[#8D6E63] rounded-2xl font-medium border-2 border-[#5D4037]/10 active:scale-95 transition-transform"
              >
                Désactiver les rappels
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#5D4037]/10 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/settings">
            <button className="w-10 h-10 rounded-full bg-[#FFF8E7] flex items-center justify-center text-[#D2691E]">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#5D4037]">Rappels d'Anniversaire</h1>
            <p className="text-sm text-[#8D6E63]">Configurer les rappels WhatsApp</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Info banner */}
        <div className="bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-3xl p-6 text-white mb-6">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Ne ratez plus un anniversaire !</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                Configurez des rappels automatiques pour les anniversaires de votre famille.
              </p>
            </div>
          </div>
        </div>

        {/* Group name */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[#5D4037] mb-3 px-2">Nom du groupe WhatsApp</h3>
          <div className="bg-white rounded-3xl p-4 shadow-md">
            <input
              type="text"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="Ex: Famille Tsoblefack"
              className="w-full h-12 px-4 rounded-2xl border-2 border-[#5D4037]/10 bg-[#FFF8E7] text-[#5D4037] focus:outline-none focus:border-[#25D366]"
            />
            <p className="text-xs text-[#8D6E63] mt-2 px-1">
              Entrez le nom de votre groupe pour personnaliser les rappels.
            </p>
          </div>
        </div>

        {/* Reminder Settings */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[#5D4037] mb-3 px-2">Paramètres des rappels</h3>
          <div className="bg-white rounded-3xl p-6 shadow-md space-y-4">
            <div>
              <label className="text-sm font-semibold text-[#5D4037] mb-2 block">Envoyer le rappel</label>
              <select
                value={daysBefore}
                onChange={e => setDaysBefore(parseInt(e.target.value))}
                className="w-full p-3 bg-[#FFF8E7] rounded-xl text-[#5D4037] font-medium"
              >
                <option value="0">Le jour même</option>
                <option value="1">1 jour avant</option>
                <option value="2">2 jours avant</option>
                <option value="3">3 jours avant</option>
                <option value="7">1 semaine avant</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-[#5D4037] mb-2 block">Heure d'envoi</label>
              <input
                type="time"
                value={reminderTime}
                onChange={e => setReminderTime(e.target.value)}
                className="w-full p-3 bg-[#FFF8E7] rounded-xl text-[#5D4037] font-medium"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-[#E8A05D]/10 rounded-2xl p-4 mb-6">
          <p className="text-xs font-semibold text-[#5D4037] mb-2">📱 Aperçu du message :</p>
          <div className="bg-white rounded-xl p-3">
            <p className="text-sm text-[#5D4037]">
              🎂 <span className="font-semibold">Rappel d'anniversaire !</span><br/>
              {daysBefore === 0 ? "Aujourd'hui" : daysBefore === 1 ? 'Demain' : `Dans ${daysBefore} jours`} c'est l'anniversaire de [Membre] 🎉<br/>
              <span className="text-xs text-[#8D6E63]">— RootsLegacy</span>
            </p>
          </div>
        </div>

        {/* Privacy note */}
        <div className="bg-white rounded-2xl p-4 border-2 border-dashed border-[#5D4037]/10">
          <p className="text-xs text-[#8D6E63] leading-relaxed">
            <span className="font-semibold text-[#5D4037]">Note de confidentialité :</span> Vos préférences sont sauvegardées localement sur votre appareil. Aucune donnée WhatsApp n'est collectée.
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 bg-white border-t border-[#5D4037]/10">
        <button
          onClick={handleConnect}
          className="w-full h-16 bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white rounded-3xl font-semibold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3"
        >
          <Bell className="w-6 h-6" />
          Activer les rappels
        </button>
      </div>
    </div>
  );
}
