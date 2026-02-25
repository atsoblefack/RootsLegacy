import { createClient } from 'npm:@supabase/supabase-js';

// Initialize Supabase client
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

// ============= FAMILIES =============

export async function createFamily(
  name: string,
  createdBy: string,
  plan: string = 'trial'
): Promise<any> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('families')
    .insert({
      name,
      created_by: createdBy,
      plan,
      status: 'trial',
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      member_limit: 30,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create family: ${error.message}`);
  return data;
}

export async function getFamilyByFamilyId(familyId: string): Promise<any> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('families')
    .select('*')
    .eq('family_id', familyId)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error(`Failed to get family: ${error.message}`);
  return data || null;
}

export async function updateFamilyStatus(
  familyId: string,
  status: string,
  metadata: any = {}
): Promise<any> {
  const supabase = getSupabaseAdmin();
  
  const updateData: any = { status };
  if (status === 'grace') {
    updateData.grace_ends_at = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  }

  const { data, error } = await supabase
    .from('families')
    .update(updateData)
    .eq('family_id', familyId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update family: ${error.message}`);
  return data;
}

// ============= PROFILES =============

export async function createProfile(
  familyId: string,
  fullName: string,
  createdBy: string,
  profileData: any = {}
): Promise<any> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      family_id: familyId,
      full_name: fullName,
      created_by: createdBy,
      ...profileData,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create profile: ${error.message}`);
  return data;
}

export async function getProfilesByFamilyId(
  familyId: string,
  limit: number = 20,
  cursor?: string
): Promise<{ data: any[], nextCursor: string | null }> {
  const supabase = getSupabaseAdmin();
  
  let query = supabase
    .from('profiles')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to get profiles: ${error.message}`);
  
  const hasMore = data && data.length > limit;
  const profiles = hasMore ? data.slice(0, limit) : data || [];
  const nextCursor = hasMore ? profiles[profiles.length - 1]?.created_at : null;

  return { data: profiles, nextCursor };
}

export async function getProfileById(profileId: string): Promise<any> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error(`Failed to get profile: ${error.message}`);
  return data || null;
}

export async function updateProfile(
  profileId: string,
  updates: any
): Promise<any> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', profileId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update profile: ${error.message}`);
  return data;
}

export async function countProfilesByFamilyId(familyId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('family_id', familyId);

  if (error) throw new Error(`Failed to count profiles: ${error.message}`);
  return count || 0;
}

// ============= RELATIONS =============

export async function createRelation(
  familyId: string,
  profileId1: string,
  profileId2: string,
  relationType: string,
  createdBy: string,
  metadata: any = {}
): Promise<any> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('relations')
    .insert({
      family_id: familyId,
      profile_id_1: profileId1,
      profile_id_2: profileId2,
      relation_type: relationType,
      created_by: createdBy,
      ...metadata,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create relation: ${error.message}`);
  return data;
}

export async function getRelationsByFamilyId(
  familyId: string,
  limit: number = 20,
  cursor?: string
): Promise<{ data: any[], nextCursor: string | null }> {
  const supabase = getSupabaseAdmin();
  
  let query = supabase
    .from('relations')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to get relations: ${error.message}`);
  
  const hasMore = data && data.length > limit;
  const relations = hasMore ? data.slice(0, limit) : data || [];
  const nextCursor = hasMore ? relations[relations.length - 1]?.created_at : null;

  return { data: relations, nextCursor };
}

// ============= FAMILY MEMBERS =============

export async function addFamilyMember(
  familyId: string,
  userId: string,
  role: string = 'member',
  invitedBy?: string
): Promise<any> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('family_members')
    .insert({
      family_id: familyId,
      user_id: userId,
      role,
      invited_by: invitedBy,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to add family member: ${error.message}`);
  return data;
}

export async function getFamilyMembersByFamilyId(
  familyId: string,
  limit: number = 20,
  cursor?: string
): Promise<{ data: any[], nextCursor: string | null }> {
  const supabase = getSupabaseAdmin();
  
  let query = supabase
    .from('family_members')
    .select('*')
    .eq('family_id', familyId)
    .order('joined_at', { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    query = query.lt('joined_at', cursor);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to get family members: ${error.message}`);
  
  const hasMore = data && data.length > limit;
  const members = hasMore ? data.slice(0, limit) : data || [];
  const nextCursor = hasMore ? members[members.length - 1]?.joined_at : null;

  return { data: members, nextCursor };
}

export async function getUserFamilies(userId: string): Promise<any[]> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('family_members')
    .select('family_id, families(*)')
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to get user families: ${error.message}`);
  return data?.map((fm: any) => fm.families) || [];
}

export async function countAdminsByFamilyId(familyId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  
  const { count, error } = await supabase
    .from('family_members')
    .select('*', { count: 'exact', head: true })
    .eq('family_id', familyId)
    .eq('role', 'admin');

  if (error) throw new Error(`Failed to count admins: ${error.message}`);
  return count || 0;
}

export async function updateFamilyMemberRole(
  familyId: string,
  userId: string,
  role: string
): Promise<any> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('family_members')
    .update({ role })
    .eq('family_id', familyId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update member role: ${error.message}`);
  return data;
}

// ============= REFERRALS =============

export async function createReferral(
  referrerFamilyId: string,
  referredFamilyId: string,
  referralCode: string
): Promise<any> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('referrals')
    .insert({
      referrer_family_id: referrerFamilyId,
      referred_family_id: referredFamilyId,
      referral_code: referralCode,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create referral: ${error.message}`);
  return data;
}

export async function getReferralByCode(code: string): Promise<any> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referral_code', code)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error(`Failed to get referral: ${error.message}`);
  return data || null;
}

export async function updateReferralStatus(
  referralId: string,
  status: string,
  storageMonths: number = 0
): Promise<any> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('referrals')
    .update({
      status,
      storage_months_granted: storageMonths,
      rewarded_at: status === 'rewarded' ? new Date().toISOString() : null,
    })
    .eq('id', referralId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update referral: ${error.message}`);
  return data;
}

// ============= APP CONFIG =============

export async function getAppConfig(key: string): Promise<any> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', key)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error(`Failed to get config: ${error.message}`);
  return data?.value || null;
}

export async function setAppConfig(key: string, value: any): Promise<void> {
  const supabase = getSupabaseAdmin();
  
  const { error } = await supabase
    .from('app_config')
    .upsert({ key, value, updated_at: new Date().toISOString() })
    .eq('key', key);

  if (error) throw new Error(`Failed to set config: ${error.message}`);
}

export async function getAllAppConfig(): Promise<Record<string, any>> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('app_config')
    .select('key, value');

  if (error) throw new Error(`Failed to get all config: ${error.message}`);
  
  const config: Record<string, any> = {};
  data?.forEach((item: any) => {
    config[item.key] = item.value;
  });
  return config;
}

// ============= ADMIN ACTIONS (AUDIT LOG) =============

export async function logAdminAction(
  adminUserId: string,
  actionType: string,
  targetFamilyId?: string,
  targetUserId?: string,
  metadata?: any
): Promise<any> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('admin_actions')
    .insert({
      admin_user_id: adminUserId,
      action_type: actionType,
      target_family_id: targetFamilyId,
      target_user_id: targetUserId,
      metadata,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to log admin action: ${error.message}`);
  return data;
}

export async function getAdminActions(
  limit: number = 20,
  cursor?: string
): Promise<{ data: any[], nextCursor: string | null }> {
  const supabase = getSupabaseAdmin();
  
  let query = supabase
    .from('admin_actions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to get admin actions: ${error.message}`);
  
  const hasMore = data && data.length > limit;
  const actions = hasMore ? data.slice(0, limit) : data || [];
  const nextCursor = hasMore ? actions[actions.length - 1]?.created_at : null;

  return { data: actions, nextCursor };
}
