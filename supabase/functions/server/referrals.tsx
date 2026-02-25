import * as kv from './kv_store.tsx';

export interface Referral {
  id: string;
  familyId: string; // Family who owns the referral link
  referralCode: string; // Unique code (e.g., "famille-diallo-x7k2")
  createdAt: string;
  totalReferred: number; // Number of families referred
  totalStorageEarned: number; // In months (capped at 36 months)
  referredFamilies: Array<{
    familyId: string;
    familyName: string;
    joinedAt: string;
    paidAt?: string;
    status: 'pending' | 'paid';
  }>;
}

const REFERRAL_CAP_MONTHS = 36; // Maximum storage months from referrals

export interface ReferralReward {
  familyId: string;
  storageMonths: number; // Total storage months earned
  expiresAt?: string; // When the storage expires
}

// Generate a unique referral code
export function generateReferralCode(familyName: string): string {
  const slug = familyName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .substring(0, 20);
  
  // Add random suffix for uniqueness
  const suffix = Math.random().toString(36).substring(2, 6);
  return `famille-${slug}-${suffix}`;
}

// Create referral for a family
export async function createReferral(familyId: string, familyName: string): Promise<Referral> {
  try {
    console.log('🔵 createReferral called with:', { familyId, familyName });
    
    // Check if referral already exists
    console.log('🔵 Checking for existing referral...');
    const existingReferral = await kv.get(`referral:family:${familyId}`);
    console.log('🔵 Existing referral check result:', existingReferral ? 'FOUND' : 'NOT FOUND');
    
    if (existingReferral) {
      console.log('✅ Referral already exists for family:', familyId);
      return existingReferral;
    }

    console.log('🔵 Generating referral code...');
    const referralCode = generateReferralCode(familyName);
    console.log('✅ Referral code generated:', referralCode);
    
    const referral: Referral = {
      id: crypto.randomUUID(),
      familyId,
      referralCode,
      createdAt: new Date().toISOString(),
      totalReferred: 0,
      totalStorageEarned: 0,
      referredFamilies: [],
    };
    
    console.log('🔵 Referral object created:', referral);

    console.log('🔵 Saving to KV store: referral:family:${familyId}');
    await kv.set(`referral:family:${familyId}`, referral);
    console.log('✅ Saved referral:family:${familyId}');
    
    console.log('🔵 Saving to KV store: referral:code:${referralCode}');
    await kv.set(`referral:code:${referralCode}`, familyId);
    console.log('✅ Saved referral:code:${referralCode}');

    console.log('✅ Referral created successfully:', { familyId, referralCode });
    return referral;
  } catch (error: any) {
    console.error('❌ Error in createReferral:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    throw new Error(`Failed to create referral: ${error.message}`);
  }
}

// Get referral by family ID
export async function getReferralByFamily(familyId: string): Promise<Referral | null> {
  return await kv.get(`referral:family:${familyId}`);
}

// Get referral by code
export async function getReferralByCode(code: string): Promise<{ referral: Referral; familyName: string } | null> {
  const familyId = await kv.get(`referral:code:${code}`);
  if (!familyId) return null;

  const referral = await kv.get(`referral:family:${familyId}`);
  if (!referral) return null;

  // Get family name from profile
  const profiles = await kv.getByPrefix(`profile:`);
  const familyProfile = profiles.find((p: any) => p.userId === familyId);
  const familyName = familyProfile?.name || 'Une famille';

  return { referral, familyName };
}

// Register a new family signup via referral
export async function registerReferralSignup(
  referralCode: string,
  newFamilyId: string,
  newFamilyName: string
): Promise<void> {
  const familyId = await kv.get(`referral:code:${referralCode}`);
  if (!familyId) {
    throw new Error('Invalid referral code');
  }

  const referral = await kv.get(`referral:family:${familyId}`);
  if (!referral) {
    throw new Error('Referral not found');
  }

  // Add to pending referrals
  referral.referredFamilies.push({
    familyId: newFamilyId,
    familyName: newFamilyName,
    joinedAt: new Date().toISOString(),
    status: 'pending',
  });

  await kv.set(`referral:family:${familyId}`, referral);
  
  // Store the referral link for the new family
  await kv.set(`referral:referred:${newFamilyId}`, {
    referredBy: familyId,
    referralCode,
    joinedAt: new Date().toISOString(),
    bonusStorageMonths: 3, // 3 months bonus for joining via referral
  });
}

// Process payment and grant rewards
export async function processReferralPayment(newFamilyId: string, paymentAmount: number): Promise<{
  referrerReward: boolean;
  refereeBonus: boolean;
}> {
  // Minimum payment threshold: $29
  if (paymentAmount < 29) {
    return { referrerReward: false, refereeBonus: false };
  }

  const referredData = await kv.get(`referral:referred:${newFamilyId}`);
  if (!referredData) {
    // Not a referred family
    return { referrerReward: false, refereeBonus: false };
  }

  const { referredBy, referralCode } = referredData;
  
  // Update referral status to paid
  const referral = await kv.get(`referral:family:${referredBy}`);
  if (!referral) {
    return { referrerReward: false, refereeBonus: false };
  }

  // Find and update the referred family status
  const referredFamily = referral.referredFamilies.find(
    (f: any) => f.familyId === newFamilyId
  );
  
  if (referredFamily && referredFamily.status === 'pending') {
    referredFamily.status = 'paid';
    referredFamily.paidAt = new Date().toISOString();

    // Increment totals with 36-month cap
    referral.totalReferred = referral.referredFamilies.filter((f: any) => f.status === 'paid').length;
    referral.totalStorageEarned = Math.min(referral.totalStorageEarned + 12, REFERRAL_CAP_MONTHS);

    await kv.set(`referral:family:${referredBy}`, referral);

    // Grant storage to referrer
    await grantStorageReward(referredBy, 12); // 12 months

    // Grant storage to new family
    await grantStorageReward(newFamilyId, 3); // 3 months

    return { referrerReward: true, refereeBonus: true };
  }

  return { referrerReward: false, refereeBonus: false };
}

// Grant storage reward to a family
export async function grantStorageReward(familyId: string, months: number): Promise<void> {
  const now = new Date().toISOString();
  
  // Get current storage data
  const storageData = await kv.get(`storage:${familyId}`) || {
    familyId,
    freeMonthsGranted: 0,
    expiresAt: null,
    history: [],
  };

  // Add months to current free storage (unlimited - no cap)
  storageData.freeMonthsGranted += months;
  
  // Update expiration date
  const currentExpiry = storageData.expiresAt ? new Date(storageData.expiresAt) : new Date();
  const newExpiry = new Date(currentExpiry);
  newExpiry.setMonth(newExpiry.getMonth() + months);
  storageData.expiresAt = newExpiry.toISOString();

  // Add to history
  storageData.history.push({
    months,
    grantedAt: now,
    reason: 'referral_reward',
  });

  // Cap total storage earned at 36 months
  storageData.freeMonthsGranted = Math.min(storageData.freeMonthsGranted, REFERRAL_CAP_MONTHS);

  await kv.set(`storage:${familyId}`, storageData);
}

// Get storage info for a family
export async function getStorageInfo(familyId: string): Promise<any> {
  const storageData = await kv.get(`storage:${familyId}`);
  return storageData || {
    familyId,
    freeMonthsGranted: 0,
    expiresAt: null,
    history: [],
  };
}

// Get storage reward summary
export async function getStorageReward(familyId: string): Promise<ReferralReward | null> {
  const storageData = await kv.get(`storage:${familyId}`);
  if (!storageData || storageData.freeMonthsGranted === 0) {
    return null;
  }

  return {
    familyId,
    storageMonths: storageData.freeMonthsGranted,
    expiresAt: storageData.expiresAt,
  };
}

// Process first payment and grant referral rewards
export async function processFirstPayment(familyId: string, paymentAmount: number): Promise<{
  referrerReward: boolean;
  refereeBonus: boolean;
  totalMonthsGranted: number;
}> {
  // Minimum payment threshold: $29
  if (paymentAmount < 29) {
    return { referrerReward: false, refereeBonus: false, totalMonthsGranted: 0 };
  }

  let totalMonths = 0;
  let referrerRewardGranted = false;
  let refereeBonusGranted = false;

  // Check if this family was referred and grant referral bonuses
  const referredData = await kv.get(`referral:referred:${familyId}`);
  if (referredData) {
    const { referredBy } = referredData;
    
    // Update referral status to paid
    const referral = await kv.get(`referral:family:${referredBy}`);
    if (referral) {
      // Find and update the referred family status
      const referredFamily = referral.referredFamilies.find(
        (f: any) => f.familyId === familyId
      );
      
      if (referredFamily && referredFamily.status === 'pending') {
        referredFamily.status = 'paid';
        referredFamily.paidAt = new Date().toISOString();

        // Increment totals with 36-month cap
        referral.totalReferred = referral.referredFamilies.filter((f: any) => f.status === 'paid').length;
        referral.totalStorageEarned = Math.min(referral.totalStorageEarned + 12, REFERRAL_CAP_MONTHS);

        await kv.set(`referral:family:${referredBy}`, referral);

        // Grant storage to referrer (12 months)
        await grantStorageReward(referredBy, 12);
        referrerRewardGranted = true;
        console.log(`Referrer ${referredBy} granted 12 months for family ${familyId}`);

        // Grant storage to new family (12 months)
        await grantStorageReward(familyId, 12);
        totalMonths += 12;
        refereeBonusGranted = true;
        console.log(`Referee ${familyId} granted 12 months referral bonus`);
      }
    }
  }

  return {
    referrerReward: referrerRewardGranted,
    refereeBonus: refereeBonusGranted,
    totalMonthsGranted: totalMonths,
  };
}

// Get referral stats for dashboard
export async function getReferralStats(familyId: string): Promise<{
  referral: Referral | null;
  storageReward: ReferralReward | null;
  progressToMax: number; // Display value (not a real cap anymore)
}> {
  const referral = await getReferralByFamily(familyId);
  const storageReward = await getStorageReward(familyId);

  // Calculate progress for display purposes (capped at 36 months)
  const progressToMax = referral 
    ? Math.round((Math.min(referral.totalStorageEarned, REFERRAL_CAP_MONTHS) / REFERRAL_CAP_MONTHS) * 100)
    : 0;

  return {
    referral,
    storageReward,
    progressToMax,
  };
}