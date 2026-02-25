import { Home, TreePine, Star, Settings, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useLanguage } from './language-context';

export function BottomNav() {
  const location = useLocation();
  const { t } = useLanguage();
  
  const navItems = [
    { icon: Home, label: t('nav.home'), path: '/home' },
    { icon: TreePine, label: t('nav.tree'), path: '/tree' },
    { icon: Star, label: t('nav.quiz'), path: '/quiz' },
    { icon: Settings, label: t('nav.settings'), path: '/settings' },
  ];
  
  // Count of unread birthday notifications (in real app, this would come from state/API)
  const birthdayCount = 2;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#5D4037]/10 pb-safe" style={{ maxWidth: '375px', margin: '0 auto' }}>
      <div className="flex justify-around items-center h-20 px-4">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className="flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[56px] rounded-2xl transition-all"
            >
              <Icon 
                className={`w-6 h-6 ${isActive ? 'text-[#D2691E]' : 'text-[#8D6E63]'}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-xs ${isActive ? 'text-[#D2691E] font-semibold' : 'text-[#8D6E63]'}`}>
                {label}
              </span>
            </Link>
          );
        })}
        
        {/* Birthday Notifications Button with Badge */}
        <Link
          to="/birthdays"
          className="flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[56px] rounded-2xl transition-all relative"
        >
          <div className="relative">
            <Bell 
              className={`w-6 h-6 ${location.pathname === '/birthdays' ? 'text-[#D2691E]' : 'text-[#8D6E63]'}`}
              strokeWidth={location.pathname === '/birthdays' ? 2.5 : 2}
            />
            {birthdayCount > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#D2691E] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{birthdayCount}</span>
              </div>
            )}
          </div>
          <span className={`text-xs ${location.pathname === '/birthdays' ? 'text-[#D2691E] font-semibold' : 'text-[#8D6E63]'}`}>
            {t('nav.birthdays')}
          </span>
        </Link>
      </div>
    </nav>
  );
}