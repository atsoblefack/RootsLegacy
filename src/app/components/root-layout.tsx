import { Outlet } from 'react-router';
import { LanguageProvider } from './language-context';

export function RootLayout() {
  return (
    <LanguageProvider>
      <Outlet />
    </LanguageProvider>
  );
}
