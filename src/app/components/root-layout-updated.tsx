import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { LanguageProvider } from './language-context';
import { AuthProvider } from './auth-context';

export function RootLayout() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-[#FFF8E7]">
          <Outlet />
          <Toaster position="bottom-center" />
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}
