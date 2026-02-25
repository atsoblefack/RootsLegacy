import * as db from "./db.tsx";

export interface AdminMetrics {
  activeFamilies: number;
  trialsInProgress: number;
  trialsExpiringIn7Days: number;
  activeReferrals: number;
  totalProfiles: number;
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  try {
    const supabase = await (await import('./db.tsx')).getSupabaseAdmin?.() || 
      (await import('@supabase/supabase-js')).createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

    // Count active families (status = 'active')
    const { count: activeFamilies } = await supabase
      .from('families')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Count trials in progress (status = 'trial')
    const { count: trialsInProgress } = await supabase
      .from('families')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'trial');

    // Count trials expiring in 7 days
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: trialsExpiringIn7Days } = await supabase
      .from('families')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'trial')
      .lte('trial_ends_at', sevenDaysFromNow);

    // Count active referrals (status = 'pending')
    const { count: activeReferrals } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Count total profiles
    const { count: totalProfiles } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    return {
      activeFamilies: activeFamilies || 0,
      trialsInProgress: trialsInProgress || 0,
      trialsExpiringIn7Days: trialsExpiringIn7Days || 0,
      activeReferrals: activeReferrals || 0,
      totalProfiles: totalProfiles || 0,
    };
  } catch (error: any) {
    console.error('Error getting admin metrics:', error);
    throw error;
  }
}
