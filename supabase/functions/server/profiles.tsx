import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';

// Initialize Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

const BUCKET_NAME = 'make-467d3bfa-profiles';

// Initialize storage bucket
export async function initializeStorage() {
  const supabase = getSupabaseClient();
  
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
  
  if (!bucketExists) {
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: false,
      fileSizeLimit: 5242880, // 5MB limit
    });
    console.log(`Created bucket: ${BUCKET_NAME}`);
  }
}

// Generate invitation token
export function generateInvitationToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Create profile (by admin)
export async function createProfile(profileData: any, createdBy: string) {
  const profileId = crypto.randomUUID();
  const invitationToken = generateInvitationToken();
  
  const profile = {
    id: profileId,
    ...profileData,
    createdBy,
    createdAt: new Date().toISOString(),
    invitationToken,
    invitationSent: false,
    accountCreated: false,
    userId: null, // Will be set when user creates their account
  };
  
  await kv.set(`profile:${profileId}`, profile);
  await kv.set(`invitation:${invitationToken}`, profileId);
  
  return { profile, invitationToken };
}

// Get profile by ID
export async function getProfile(profileId: string) {
  return await kv.get(`profile:${profileId}`);
}

// Get profile by invitation token
export async function getProfileByInvitation(token: string) {
  const profileId = await kv.get(`invitation:${token}`);
  if (!profileId) return null;
  return await kv.get(`profile:${profileId}`);
}

// Update profile
export async function updateProfile(profileId: string, updates: any, userId: string) {
  const profile = await kv.get(`profile:${profileId}`);
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  // Check permissions: user can only update their own profile, or admin can update any
  const isAdmin = await checkIsAdmin(userId);
  if (!isAdmin && profile.userId !== userId) {
    throw new Error('Unauthorized: You can only update your own profile');
  }
  
  const updatedProfile = {
    ...profile,
    ...updates,
    updatedAt: new Date().toISOString(),
    updatedBy: userId,
  };
  
  await kv.set(`profile:${profileId}`, updatedProfile);
  return updatedProfile;
}

// Link profile to user account
export async function linkProfileToUser(profileId: string, userId: string, invitationToken: string) {
  const storedProfileId = await kv.get(`invitation:${invitationToken}`);
  
  if (storedProfileId !== profileId) {
    throw new Error('Invalid invitation token');
  }
  
  const profile = await kv.get(`profile:${profileId}`);
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  if (profile.accountCreated) {
    throw new Error('Account already created for this profile');
  }
  
  const updatedProfile = {
    ...profile,
    userId,
    accountCreated: true,
    accountCreatedAt: new Date().toISOString(),
  };
  
  await kv.set(`profile:${profileId}`, updatedProfile);
  return updatedProfile;
}

// Upload and compress photo
export async function uploadPhoto(photoData: Uint8Array, profileId: string, originalFilename: string) {
  const supabase = getSupabaseClient();
  
  // Generate unique filename
  const fileExt = originalFilename.split('.').pop();
  const fileName = `${profileId}-${Date.now()}.${fileExt}`;
  const filePath = `profiles/${fileName}`;
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, photoData, {
      contentType: `image/${fileExt}`,
      upsert: true,
    });
  
  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload photo: ${error.message}`);
  }
  
  // Get signed URL (valid for 1 year)
  const { data: urlData, error: urlError } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, 31536000); // 1 year
  
  if (urlError) {
    throw new Error(`Failed to generate signed URL: ${urlError.message}`);
  }
  
  return {
    path: filePath,
    url: urlData.signedUrl,
  };
}

// Delete photo
export async function deletePhoto(filePath: string) {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);
  
  if (error) {
    console.error('Delete error:', error);
    throw new Error(`Failed to delete photo: ${error.message}`);
  }
}

// Check if user is admin
async function checkIsAdmin(userId: string): Promise<boolean> {
  const adminList = await kv.get('admin_users') || [];
  return adminList.includes(userId);
}

// Check if user is super admin
async function checkIsSuperAdmin(userId: string): Promise<boolean> {
  const superAdminList = await kv.get('super_admin_users') || [];
  return superAdminList.includes(userId);
}

// Set user as admin (for initial setup)
export async function setAdmin(userId: string) {
  const adminList = await kv.get('admin_users') || [];
  if (!adminList.includes(userId)) {
    adminList.push(userId);
    await kv.set('admin_users', adminList);
  }
}

// Set user as super admin (for initial setup)
export async function setSuperAdmin(userId: string) {
  const superAdminList = await kv.get('super_admin_users') || [];
  if (!superAdminList.includes(userId)) {
    superAdminList.push(userId);
    await kv.set('super_admin_users', superAdminList);
  }
}

// Promote user to admin (super admin only)
export async function promoteToAdmin(userId: string, targetUserId: string) {
  const isSuperAdmin = await checkIsSuperAdmin(userId);
  if (!isSuperAdmin) {
    throw new Error('Unauthorized: Only super admin can promote users to admin');
  }
  
  const adminList = await kv.get('admin_users') || [];
  if (!adminList.includes(targetUserId)) {
    adminList.push(targetUserId);
    await kv.set('admin_users', adminList);
  }
  
  return { success: true, message: 'User promoted to admin' };
}

// Revoke admin privileges (super admin only)
export async function revokeAdmin(userId: string, targetUserId: string) {
  const isSuperAdmin = await checkIsSuperAdmin(userId);
  if (!isSuperAdmin) {
    throw new Error('Unauthorized: Only super admin can revoke admin privileges');
  }
  
  // Cannot revoke super admin
  const superAdminList = await kv.get('super_admin_users') || [];
  if (superAdminList.includes(targetUserId)) {
    throw new Error('Cannot revoke super admin privileges');
  }
  
  const adminList = await kv.get('admin_users') || [];
  const updatedList = adminList.filter((id: string) => id !== targetUserId);
  await kv.set('admin_users', updatedList);
  
  return { success: true, message: 'Admin privileges revoked' };
}

// Get user role
export async function getUserRole(userId: string) {
  const isSuperAdmin = await checkIsSuperAdmin(userId);
  if (isSuperAdmin) return 'super_admin';
  
  const isAdmin = await checkIsAdmin(userId);
  if (isAdmin) return 'admin';
  
  return 'member';
}

// Get all users with roles (super admin only)
export async function getAllUsers(userId: string) {
  console.log('🔵 getAllUsers called with userId:', userId);
  
  const isSuperAdmin = await checkIsSuperAdmin(userId);
  console.log('🔵 isSuperAdmin check result:', isSuperAdmin);
  
  if (!isSuperAdmin) {
    console.error('❌ User is not super admin');
    throw new Error('Unauthorized: Only super admin can view all users');
  }
  
  console.log('🔵 Fetching all profiles...');
  // Get all profiles
  const allProfiles = await kv.getByPrefix('profile:');
  console.log('✅ Got', allProfiles.length, 'profiles');
  
  // Get admin and super admin lists
  console.log('🔵 Fetching admin lists...');
  const adminList = await kv.get('admin_users') || [];
  const superAdminList = await kv.get('super_admin_users') || [];
  console.log('✅ Admin lists:', { adminCount: adminList.length, superAdminCount: superAdminList.length });
  
  // Add role information to each profile
  const usersWithRoles = allProfiles
    .filter((p: any) => p.userId) // Only users with accounts
    .map((profile: any) => {
      let role = 'member';
      if (superAdminList.includes(profile.userId)) {
        role = 'super_admin';
      } else if (adminList.includes(profile.userId)) {
        role = 'admin';
      }
      
      return {
        userId: profile.userId,
        profileId: profile.id,
        name: profile.name,
        email: profile.email,
        photoUrl: profile.photoUrl,
        role,
        accountCreatedAt: profile.createdAt,
      };
    });
  
  console.log('✅ Returning', usersWithRoles.length, 'users with roles');
  return usersWithRoles;
}

// Get all profiles (admin only)
export async function getAllProfiles(userId: string) {
  console.log('🔵 getAllProfiles called with userId:', userId);
  
  const isAdmin = await checkIsAdmin(userId);
  console.log('🔵 isAdmin check result:', isAdmin);
  
  if (!isAdmin) {
    console.error('❌ User is not admin');
    throw new Error('Unauthorized: Admin access required');
  }
  
  console.log('🔵 Fetching all profiles...');
  const profiles = await kv.getByPrefix('profile:');
  console.log('✅ Got', profiles.length, 'profiles');
  return profiles;
}

// Get user's own profile
export async function getUserProfile(userId: string) {
  const allProfiles = await kv.getByPrefix('profile:');
  const userProfile = allProfiles.find((p: any) => p.userId === userId);
  return userProfile || null;
}

// Get profiles in user's family (profiles created by the user or linked to them)
export async function getMyFamilyProfiles(userId: string) {
  const allProfiles = await kv.getByPrefix('profile:');
  
  // Get profiles where:
  // 1. The user created them (createdBy === userId)
  // 2. OR the profile belongs to the user (userId === userId)
  const myProfiles = allProfiles.filter((p: any) => {
    return p.createdBy === userId || p.userId === userId;
  });
  
  // TODO: In future, we could also include profiles from connected family trees
  // by traversing relationships to find all profiles in the same family network
  
  return myProfiles;
}