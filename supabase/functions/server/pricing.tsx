import * as kv from './kv_store.tsx';

export interface PricingPlan {
  plan_id: string;
  lifetime_price: number;
  storage_included_years: number;
  storage_annual_price: number;
  member_limit: number;
  updated_at: string;
}

// Initialize default pricing config
export async function initializePricingConfig(): Promise<void> {
  const existingConfig = await kv.get('pricing_config');
  
  if (!existingConfig) {
    const defaultPlans: PricingPlan[] = [
      {
        plan_id: 'roots',
        lifetime_price: 29,
        storage_included_years: 1,
        storage_annual_price: 5,
        member_limit: 30,
        updated_at: new Date().toISOString(),
      },
      {
        plan_id: 'family',
        lifetime_price: 59,
        storage_included_years: 1,
        storage_annual_price: 10,
        member_limit: 80,
        updated_at: new Date().toISOString(),
      },
      {
        plan_id: 'heritage',
        lifetime_price: 99,
        storage_included_years: 2,
        storage_annual_price: 19,
        member_limit: 500,
        updated_at: new Date().toISOString(),
      },
    ];
    
    await kv.set('pricing_config', defaultPlans);
    console.log('✅ Initialized default pricing config');
  }
}

// Get all pricing plans
export async function getPricingConfig(): Promise<PricingPlan[]> {
  const config = await kv.get('pricing_config');
  return config || [];
}

// Get specific plan pricing
export async function getPlanPricing(planId: string): Promise<PricingPlan | null> {
  const config = await kv.get('pricing_config');
  if (!config) return null;
  
  return config.find((plan: PricingPlan) => plan.plan_id === planId) || null;
}

// Update pricing (super admin only)
export async function updatePricingConfig(plans: PricingPlan[]): Promise<void> {
  const updatedPlans = plans.map(plan => ({
    ...plan,
    updated_at: new Date().toISOString(),
  }));
  
  await kv.set('pricing_config', updatedPlans);
  console.log('✅ Updated pricing config');
}

// Validate payment amount against plan pricing
export async function validatePaymentAmount(planId: string, amount: number): Promise<boolean> {
  const plan = await getPlanPricing(planId);
  if (!plan) return false;
  
  // Allow payment >= plan lifetime price
  return amount >= plan.lifetime_price;
}
