import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Create a singleton instance of Supabase client
// This prevents multiple GoTrueClient instances warning
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey
    );
  }
  return supabaseInstance;
}

// Export the singleton instance
export const supabase = getSupabaseClient();
