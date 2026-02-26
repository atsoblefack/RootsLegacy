import { useEffect, useState } from 'react';
import { supabase } from './client';

/**
 * Hook to get the current session from Supabase Auth
 * Avoids Navigator Lock issues by reading from localStorage directly when needed
 */
export function useSession() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  return { session, loading };
}

/**
 * Get session from localStorage directly (bypasses Navigator Lock)
 * Used when useSession hook causes deadlocks
 */
export function getSessionFromStorage() {
  if (typeof window === 'undefined') return null;
  
  try {
    const sessionStr = localStorage.getItem('sb-kywoiyxslihcinrlwecm-auth-token');
    if (!sessionStr) return null;
    
    const session = JSON.parse(sessionStr);
    return session;
  } catch (error) {
    console.error('Error reading session from storage:', error);
    return null;
  }
}

/**
 * Get access token from localStorage
 */
export function getAccessTokenFromStorage() {
  const session = getSessionFromStorage();
  return session?.access_token || null;
}
