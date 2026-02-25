import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../../../utils/supabase/client';
import { projectId } from '../../../utils/supabase/info';

export interface AuthContextType {
  user: any | null;
  role: 'guest' | 'member' | 'admin' | 'super_admin';
  familyId: string | null;
  userId: string | null;
  email: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<'guest' | 'member' | 'admin' | 'super_admin'>('guest');
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuthInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setUser(null);
        setRole('guest');
        setFamilyId(null);
        setUserId(null);
        setEmail(null);
        setLoading(false);
        return;
      }

      setUser(session.user);
      setUserId(session.user.id);
      setEmail(session.user.email || null);

      // Fetch role and family info from backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-467d3bfa/auth/role`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRole(data.role || 'member');
        setFamilyId(data.familyId || null);
      } else {
        setRole('member');
        setFamilyId(null);
      }
    } catch (err: any) {
      console.error('Error fetching auth info:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthInfo();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);
          setUserId(session.user.id);
          setEmail(session.user.email || null);
          await fetchAuthInfo();
        } else {
          setUser(null);
          setRole('guest');
          setFamilyId(null);
          setUserId(null);
          setEmail(null);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        familyId,
        userId,
        email,
        loading,
        error,
        refetch: fetchAuthInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
