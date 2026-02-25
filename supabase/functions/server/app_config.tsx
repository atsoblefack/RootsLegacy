import * as db from './db.tsx';

// Default configuration values
const DEFAULT_CONFIG = {
  trial_duration_days: 30,
  grace_period_days: 90,
  referral_cap_months: 36,
  referral_reward_referrer_months: 12,
  referral_reward_referred_months: 3,
  max_admins_per_family: 3,
  
  // Plan member limits
  plan_roots_member_limit: 30,
  plan_family_member_limit: 80,
  plan_heritage_member_limit: 9999,
  
  // Plan lifetime prices (in USD)
  plan_roots_lifetime_price: 29,
  plan_family_lifetime_price: 59,
  plan_heritage_lifetime_price: 149,
  
  // Plan annual storage renewal prices (in USD)
  plan_roots_storage_annual_price: 5,
  plan_family_storage_annual_price: 10,
  plan_heritage_storage_annual_price: 19,
  
  // Storage included with lifetime purchase (in years)
  plan_roots_storage_included_years: 1,
  plan_family_storage_included_years: 1,
  plan_heritage_storage_included_years: 2,
};

// Initialize default config if not exists
export async function initializeAppConfig(): Promise<void> {
  try {
    for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
      const existing = await db.getAppConfig(key);
      if (!existing) {
        await db.setAppConfig(key, value);
        console.log(`✅ Initialized config: ${key} = ${value}`);
      }
    }
    console.log('✅ App config initialized');
  } catch (error: any) {
    console.error('❌ Error initializing app config:', error.message);
    throw error;
  }
}

// Get config value with type safety
export async function getConfig(key: keyof typeof DEFAULT_CONFIG): Promise<any> {
  try {
    const value = await db.getAppConfig(key);
    return value !== null ? value : DEFAULT_CONFIG[key];
  } catch (error: any) {
    console.warn(`⚠️ Error getting config ${key}, using default:`, error.message);
    return DEFAULT_CONFIG[key];
  }
}

// Get multiple config values
export async function getConfigs(keys: (keyof typeof DEFAULT_CONFIG)[]): Promise<Record<string, any>> {
  const result: Record<string, any> = {};
  for (const key of keys) {
    result[key] = await getConfig(key);
  }
  return result;
}

// Update config value
export async function updateConfig(key: string, value: any): Promise<void> {
  try {
    await db.setAppConfig(key, value);
    console.log(`✅ Updated config: ${key} = ${value}`);
  } catch (error: any) {
    console.error(`❌ Error updating config ${key}:`, error.message);
    throw error;
  }
}

// Get plan member limit
export async function getPlanMemberLimit(plan: string): Promise<number> {
  const configKey = `plan_${plan}_member_limit` as keyof typeof DEFAULT_CONFIG;
  return await getConfig(configKey);
}

// Get plan lifetime price
export async function getPlanLifetimePrice(plan: string): Promise<number> {
  const configKey = `plan_${plan}_lifetime_price` as keyof typeof DEFAULT_CONFIG;
  return await getConfig(configKey);
}

// Get plan storage annual price
export async function getPlanStorageAnnualPrice(plan: string): Promise<number> {
  const configKey = `plan_${plan}_storage_annual_price` as keyof typeof DEFAULT_CONFIG;
  return await getConfig(configKey);
}

// Get plan storage included years
export async function getPlanStorageIncludedYears(plan: string): Promise<number> {
  const configKey = `plan_${plan}_storage_included_years` as keyof typeof DEFAULT_CONFIG;
  return await getConfig(configKey);
}
