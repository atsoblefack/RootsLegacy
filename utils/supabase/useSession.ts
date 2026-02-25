/**
 * useSession - Hook utilitaire pour lire la session Supabase sans déclencher de lock.
 *
 * Problème : supabase.auth.getSession() utilise un Navigator Lock exclusif.
 * Quand l'AuthProvider maintient ce lock, d'autres appels getSession() timeout après 10s.
 *
 * Solution : Lire directement depuis localStorage (sans lock) pour les appels ponctuels.
 * L'AuthProvider reste la source de vérité pour l'état global.
 */

import { projectId } from './info';

const STORAGE_KEY = `sb-${projectId}-auth-token`;

export interface SessionToken {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: {
    id: string;
    email: string;
    user_metadata?: Record<string, any>;
    [key: string]: any;
  };
}

/**
 * Lit la session depuis localStorage sans acquérir de lock.
 * Retourne null si pas de session ou session expirée.
 */
export function getSessionFromStorage(): SessionToken | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionToken;
    const now = Date.now() / 1000;
    // Considérer la session expirée si elle expire dans moins de 60 secondes
    if (parsed.expires_at < now + 60) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Retourne le token d'accès ou null si pas de session valide.
 */
export function getAccessToken(): string | null {
  return getSessionFromStorage()?.access_token ?? null;
}
