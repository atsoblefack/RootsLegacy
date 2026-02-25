import { ArrowLeft, MessageCircle, Bell, CheckCircle, Calendar } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from './language-context';

export function WhatsAppBirthdaySetup() {
  const { t } = useLanguage();
  const [daysBefore, setDaysBefore] = useState(3);
  const [includeMessage, setIncludeMessage] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [isConnected, setIsConnected] = useState(false);

  const whatsappGroups = [
    { id: '1', name: 'Johnson Family 👨‍👩‍👧‍👦', members: 24, lastMessage: '2 hours ago' },
    { id: '2', name: 'Mensah Relatives 🌍', members: 45, lastMessage: '1 day ago' },
    { id: '3', name: 'Accra Family Circle', members: 18, lastMessage: '3 days ago' },
  ];

  const handleConnect = () => {
    if (selectedGroup) {
      // Simulate connection
      setTimeout(() => {
        setIsConnected(true);
      }, 1000);
    }
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
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-[#5D4037] mb-3">
              All Set! 🎉
            </h1>
            <p className="text-[#8D6E63] mb-8 leading-relaxed">
              Birthday reminders will now be sent to your WhatsApp group automatically.
            </p>

            {/* Summary card */}
            <div className="bg-white rounded-3xl p-6 shadow-xl mb-6 text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-[#25D366]" />
                </div>
                <div>
                  <div className="font-bold text-[#5D4037]">
                    {whatsappGroups.find(g => g.id === selectedGroup)?.name}
                  </div>
                  <div className="text-sm text-[#8D6E63]">Connected group</div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#5D4037]/10">
                <div className="flex justify-between">
                  <span className="text-sm text-[#8D6E63]">Reminder timing</span>
                  <span className="text-sm font-semibold text-[#5D4037]">{daysBefore} day before</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#8D6E63]">Send time</span>
                  <span className="text-sm font-semibold text-[#5D4037]">{reminderTime}</span>
                </div>
              </div>
            </div>

            {/* Sample message preview */}
            <div className="bg-[#E8A05D]/10 rounded-2xl p-4 mb-8">
              <p className="text-xs text-[#8D6E63] mb-2">Sample reminder message:</p>
              <div className="bg-white rounded-xl p-3 text-left">
                <p className="text-sm text-[#5D4037]">
                  🎂 <span className="font-semibold">Birthday Reminder!</span><br/>
                  Tomorrow is Kwame Mensah's birthday 🎉<br/>
                  <span className="text-xs text-[#8D6E63]">— RootsLegacy</span>
                </p>
              </div>
            </div>

            <Link to="/settings" className="block">
              <button className="w-full h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform">
                Done
              </button>
            </Link>
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
            <h1 className="text-xl font-bold text-[#5D4037]">Birthday Reminders</h1>
            <p className="text-sm text-[#8D6E63]">Connect to WhatsApp</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Info banner */}
        <div className="bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-3xl p-6 text-white mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Never Miss a Birthday!</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                Automatically send birthday reminders to your family WhatsApp group. 
                Keep everyone connected and celebrating together.
              </p>
            </div>
          </div>
        </div>

        {/* Select WhatsApp Group */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[#5D4037] mb-3 px-2">
            Select Your Family Group
          </h3>
          <div className="bg-white rounded-3xl shadow-md overflow-hidden">
            {whatsappGroups.map((group, index) => (
              <div key={group.id}>
                <button
                  onClick={() => setSelectedGroup(group.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-[#FFF8E7] transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-[#5D4037]">{group.name}</div>
                    <div className="text-sm text-[#8D6E63]">{group.members} members • {group.lastMessage}</div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedGroup === group.id
                      ? 'bg-[#25D366] border-[#25D366]'
                      : 'border-[#8D6E63]/30'
                  }`}>
                    {selectedGroup === group.id && (
                      <div className="w-3 h-3 bg-white rounded-full" />
                    )}
                  </div>
                </button>
                {index < whatsappGroups.length - 1 && (
                  <div className="h-px bg-[#5D4037]/5 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reminder Settings */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[#5D4037] mb-3 px-2">
            Reminder Settings
          </h3>
          <div className="bg-white rounded-3xl p-6 shadow-md space-y-4">
            <div>
              <label className="text-sm font-semibold text-[#5D4037] mb-2 block">
                Send reminder
              </label>
              <select 
                value={daysBefore}
                onChange={(e) => setDaysBefore(parseInt(e.target.value))}
                className="w-full p-3 bg-[#FFF8E7] rounded-xl text-[#5D4037] font-medium"
              >
                <option value="0">On the birthday</option>
                <option value="1">1 day before</option>
                <option value="2">2 days before</option>
                <option value="7">1 week before</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-[#5D4037] mb-2 block">
                Time of day
              </label>
              <input 
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full p-3 bg-[#FFF8E7] rounded-xl text-[#5D4037] font-medium"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-[#E8A05D]/10 rounded-2xl p-4 mb-6">
          <p className="text-xs font-semibold text-[#5D4037] mb-2">📱 Message preview:</p>
          <div className="bg-white rounded-xl p-3">
            <p className="text-sm text-[#5D4037]">
              🎂 <span className="font-semibold">Birthday Reminder!</span><br/>
              {daysBefore === 0 ? 'Today' : daysBefore === 1 ? 'Tomorrow' : `In ${daysBefore} days`} is [Family Member]'s birthday 🎉<br/>
              <span className="text-xs text-[#8D6E63]">— RootsLegacy</span>
            </p>
          </div>
        </div>

        {/* Privacy note */}
        <div className="bg-white rounded-2xl p-4 border-2 border-dashed border-[#5D4037]/10">
          <p className="text-xs text-[#8D6E63] leading-relaxed">
            <span className="font-semibold text-[#5D4037]">Privacy note:</span> We only send birthday reminders. 
            No other messages or data from your WhatsApp are accessed.
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 bg-white border-t border-[#5D4037]/10">
        <button
          onClick={handleConnect}
          disabled={!selectedGroup}
          className="w-full h-16 bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white rounded-3xl font-semibold shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <Bell className="w-6 h-6" />
          Connect Birthday Reminders
        </button>
      </div>
    </div>
  );
}