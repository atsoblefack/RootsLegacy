import { useState, useEffect } from 'react';
import { ArrowLeft, Edit2, Save, X, Plus, Trash2, Calendar, Users, TrendingUp, Zap } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { projectId, serverBaseUrl } from '../../../utils/supabase/info';
import { useAuth } from './auth-context';
import { toast } from 'sonner';

interface DashboardMetrics {
  activeFamilies: number;
  trialsInProgress: number;
  trialsExpiringIn7Days: number;
  activeReferrals: number;
  totalProfiles: number;
}

interface PricingPlan {
  plan_id: string;
  lifetime_price: number;
  storage_included_years: number;
  storage_annual_price: number;
  member_limit: number;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { role, userId } = useAuth();
  const [activeTab, setActiveTab] = useState<'metrics' | 'pricing' | 'families' | 'referrals'>('metrics');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== 'super_admin') {
      navigate('/');
      return;
    }
    loadDashboardData();
  }, [role, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await (await import('/utils/supabase/client')).supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }

      // Load metrics from API
      const metricsResponse = await fetch(
        `${serverBaseUrl}/admin/metrics`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (metricsResponse.ok) {
        const data = await metricsResponse.json();
        setMetrics(data.metrics);
      } else {
        setMetrics({
          activeFamilies: 0,
          trialsInProgress: 0,
          trialsExpiringIn7Days: 0,
          activeReferrals: 0,
          totalProfiles: 0,
        });
      }

      // Load pricing plans
      const pricingResponse = await fetch(
        `${serverBaseUrl}/pricing`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (pricingResponse.ok) {
        const data = await pricingResponse.json();
        setPricingPlans(data.plans || []);
      }
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      toast.error('Erreur lors du chargement du dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePricing = async (plan: PricingPlan) => {
    try {
      const { data: { session } } = await (await import('/utils/supabase/client')).supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${serverBaseUrl}/pricing`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ plans: pricingPlans }),
        }
      );

      if (response.ok) {
        toast.success('Tarification mise à jour');
        setEditingPlan(null);
      } else {
        toast.error('Erreur lors de la sauvegarde');
      }
    } catch (error: any) {
      console.error('Error saving pricing:', error);
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#D2691E]/20 border-t-[#D2691E] animate-spin mx-auto mb-3" />
          <p className="text-[#8D6E63]">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#D2691E] to-[#E8A05D] px-6 py-4 text-white shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/home')}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Super Admin</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {['metrics', 'pricing', 'families', 'referrals'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-white text-[#D2691E]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {/* Metrics Tab */}
        {activeTab === 'metrics' && metrics && (
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="bg-white rounded-3xl p-4 shadow-md border-2 border-[#D2691E]/10">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-[#D2691E]" />
                  <span className="text-xs font-semibold text-[#8D6E63]">Familles actives</span>
                </div>
                <div className="text-3xl font-bold text-[#5D4037]">{metrics.activeFamilies}</div>
              </div>

              <div className="bg-white rounded-3xl p-4 shadow-md border-2 border-[#2E7D32]/10">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-[#2E7D32]" />
                  <span className="text-xs font-semibold text-[#8D6E63]">Essais en cours</span>
                </div>
                <div className="text-3xl font-bold text-[#5D4037]">{metrics.trialsInProgress}</div>
              </div>

              <div className="bg-white rounded-3xl p-4 shadow-md border-2 border-[#E8A05D]/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-[#E8A05D]" />
                  <span className="text-xs font-semibold text-[#8D6E63]">Expiration 7j</span>
                </div>
                <div className="text-3xl font-bold text-[#5D4037]">{metrics.trialsExpiringIn7Days}</div>
              </div>

              <div className="bg-white rounded-3xl p-4 shadow-md border-2 border-[#D2691E]/10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-[#D2691E]" />
                  <span className="text-xs font-semibold text-[#8D6E63]">Parrainage actifs</span>
                </div>
                <div className="text-3xl font-bold text-[#5D4037]">{metrics.activeReferrals}</div>
              </div>
            </motion.div>

            <div className="bg-white rounded-3xl p-4 shadow-md border-2 border-[#5D4037]/10">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-[#5D4037]" />
                <span className="text-sm font-semibold text-[#8D6E63]">Total profils</span>
              </div>
              <div className="text-4xl font-bold text-[#D2691E]">{metrics.totalProfiles}</div>
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-4">
            {pricingPlans.map((plan) => (
              <motion.div
                key={plan.plan_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-4 shadow-md border-2 border-[#D2691E]/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#5D4037] capitalize">{plan.plan_id}</h3>
                  {editingPlan === plan.plan_id ? (
                    <button
                      onClick={() => handleSavePricing(plan)}
                      className="p-2 rounded-lg bg-[#2E7D32] text-white active:scale-95 transition-transform"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingPlan(plan.plan_id)}
                      className="p-2 rounded-lg bg-[#D2691E]/10 text-[#D2691E] active:scale-95 transition-transform"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[#8D6E63]">Prix lifetime ($)</label>
                    <input
                      type="number"
                      value={plan.lifetime_price}
                      onChange={(e) => {
                        const updated = pricingPlans.map((p) =>
                          p.plan_id === plan.plan_id
                            ? { ...p, lifetime_price: parseFloat(e.target.value) }
                            : p
                        );
                        setPricingPlans(updated);
                      }}
                      disabled={editingPlan !== plan.plan_id}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-[#D2691E]/20 bg-white disabled:bg-[#FFF8E7]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#8D6E63]">Stockage inclus (ans)</label>
                    <input
                      type="number"
                      value={plan.storage_included_years}
                      onChange={(e) => {
                        const updated = pricingPlans.map((p) =>
                          p.plan_id === plan.plan_id
                            ? { ...p, storage_included_years: parseInt(e.target.value) }
                            : p
                        );
                        setPricingPlans(updated);
                      }}
                      disabled={editingPlan !== plan.plan_id}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-[#D2691E]/20 bg-white disabled:bg-[#FFF8E7]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#8D6E63]">Prix renouvellement annuel ($)</label>
                    <input
                      type="number"
                      value={plan.storage_annual_price}
                      onChange={(e) => {
                        const updated = pricingPlans.map((p) =>
                          p.plan_id === plan.plan_id
                            ? { ...p, storage_annual_price: parseFloat(e.target.value) }
                            : p
                        );
                        setPricingPlans(updated);
                      }}
                      disabled={editingPlan !== plan.plan_id}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-[#D2691E]/20 bg-white disabled:bg-[#FFF8E7]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#8D6E63]">Limite membres</label>
                    <input
                      type="number"
                      value={plan.member_limit}
                      onChange={(e) => {
                        const updated = pricingPlans.map((p) =>
                          p.plan_id === plan.plan_id
                            ? { ...p, member_limit: parseInt(e.target.value) }
                            : p
                        );
                        setPricingPlans(updated);
                      }}
                      disabled={editingPlan !== plan.plan_id}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-[#D2691E]/20 bg-white disabled:bg-[#FFF8E7]"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Families Tab */}
        {activeTab === 'families' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-4 shadow-md border-2 border-[#D2691E]/10">
              <p className="text-[#8D6E63] text-center py-8">
                Gestion des familles — À implémenter avec pagination
              </p>
            </div>
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-4 shadow-md border-2 border-[#D2691E]/10">
              <p className="text-[#8D6E63] text-center py-8">
                Gestion des parrainages — À implémenter avec pagination
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
