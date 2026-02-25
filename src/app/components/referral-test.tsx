import { useState } from 'react';
import { ArrowLeft, Gift, Users, Link as LinkIcon, Copy, Check, FlaskConical } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { projectId, publicAnonKey, serverBaseUrl } from '../../../utils/supabase/info';
import { supabase } from '../../../utils/supabase/client';
import { toast } from 'sonner';

export function ReferralTest() {
  const [step, setStep] = useState<'intro' | 'user1' | 'user2' | 'results'>('intro');
  const [user1Email, setUser1Email] = useState(`test-${Date.now()}-1@test.com`);
  const [user1Password, setUser1Password] = useState('password123');
  const [user1Name, setUser1Name] = useState('Jean Diallo');
  const [user1FamilyName, setUser1FamilyName] = useState('Famille Diallo');
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  
  const [user2Email, setUser2Email] = useState(`test-${Date.now()}-2@test.com`);
  const [user2Password, setUser2Password] = useState('password123');
  const [user2Name, setUser2Name] = useState('Sophie Martin');
  const [user2FamilyName, setUser2FamilyName] = useState('Famille Martin');
  const [user2Id, setUser2Id] = useState('');
  
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');

  // STEP 1: Create User 1 and Generate Referral Link
  const createUser1AndReferral = async () => {
    setLoading(true);
    setErrorDetails('');
    try {
      // 1. Create User 1
      console.log('🔵 Creating User 1...');
      const signupResponse = await fetch(
        `${serverBaseUrl}/auth/signup`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: user1Email,
            password: user1Password,
            name: user1Name,
          }),
        }
      );

      if (!signupResponse.ok) {
        const errorData = await signupResponse.json();
        console.error('Signup error response:', errorData);
        throw new Error(errorData.error || 'Failed to create User 1');
      }

      const signupData = await signupResponse.json();
      console.log('✅ User 1 created:', signupData);

      // 2. Sign in User 1
      console.log('🔵 Signing in User 1...');
      const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user1Email,
        password: user1Password,
      });

      if (signInError || !sessionData.session) {
        throw new Error('Failed to sign in User 1');
      }

      const accessToken = sessionData.session.access_token;

      // 3. Create Referral Code
      console.log('🔵 Creating referral code...');
      const createReferralResponse = await fetch(
        `${serverBaseUrl}/referrals/create`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ familyName: user1FamilyName }),
        }
      );

      if (!createReferralResponse.ok) {
        const errorData = await createReferralResponse.json();
        console.error('Create referral error response:', errorData);
        throw new Error(errorData.error || 'Failed to create referral');
      }

      const { referral } = await createReferralResponse.json();
      console.log('✅ Referral created:', referral);
      setReferralCode(referral.referralCode);
      const link = `${window.location.origin}/join/${referral.referralCode}`;
      setReferralLink(link);

      toast.success('✅ User 1 created and referral link generated!');
      setStep('user1');

    } catch (error: any) {
      console.error('Error creating User 1:', error);
      toast.error(error.message);
      setErrorDetails(error.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Create User 2 via Referral Link
  const createUser2ViaReferral = async () => {
    setLoading(true);
    setErrorDetails('');
    try {
      // 1. Simulate clicking referral link (store code in sessionStorage)
      console.log('🟢 Simulating referral link click...');
      sessionStorage.setItem('referral_code', referralCode);

      // 2. Create User 2
      console.log('🟢 Creating User 2...');
      const signupResponse = await fetch(
        `${serverBaseUrl}/auth/signup`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: user2Email,
            password: user2Password,
            name: user2Name,
          }),
        }
      );

      if (!signupResponse.ok) {
        throw new Error('Failed to create User 2');
      }

      // 3. Sign in User 2
      console.log('🟢 Signing in User 2...');
      const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user2Email,
        password: user2Password,
      });

      if (signInError || !sessionData.session) {
        throw new Error('Failed to sign in User 2');
      }

      setUser2Id(sessionData.user.id);

      // 4. Register referral signup
      console.log('🟢 Registering referral signup...');
      const registerResponse = await fetch(
        `${serverBaseUrl}/referrals/register-signup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referralCode,
            newFamilyId: sessionData.user.id,
            newFamilyName: user2FamilyName,
          }),
        }
      );

      if (!registerResponse.ok) {
        throw new Error('Failed to register referral');
      }

      // Clear referral code
      sessionStorage.removeItem('referral_code');

      toast.success('✅ User 2 created via referral link!');
      setStep('user2');

    } catch (error: any) {
      console.error('Error creating User 2:', error);
      toast.error(error.message);
      setErrorDetails(error.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Process Payment and Check Results
  const processPaymentAndCheckResults = async () => {
    setLoading(true);
    setErrorDetails('');
    try {
      // 1. Sign in User 2 again to get fresh token
      console.log('💰 Processing payment for User 2...');
      const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user2Email,
        password: user2Password,
      });

      if (signInError || !sessionData.session) {
        throw new Error('Failed to sign in User 2');
      }

      const accessToken = sessionData.session.access_token;

      // 2. Process payment
      const paymentResponse = await fetch(
        `${serverBaseUrl}/referrals/process-payment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paymentAmount: 59 }),
        }
      );

      if (!paymentResponse.ok) {
        throw new Error('Failed to process payment');
      }

      const paymentResult = await paymentResponse.json();

      // 3. Check User 1 referral stats (sign in as User 1)
      console.log('💰 Checking User 1 stats...');
      const { data: user1Session } = await supabase.auth.signInWithPassword({
        email: user1Email,
        password: user1Password,
      });

      const user1StatsResponse = await fetch(
        `${serverBaseUrl}/referrals/stats`,
        {
          headers: {
            'Authorization': `Bearer ${user1Session?.session?.access_token}`,
          },
        }
      );

      const user1Stats = await user1StatsResponse.json();

      // 4. Check User 2 storage
      console.log('💰 Checking User 2 stats...');
      const { data: user2Session } = await supabase.auth.signInWithPassword({
        email: user2Email,
        password: user2Password,
      });

      const user2StatsResponse = await fetch(
        `${serverBaseUrl}/referrals/stats`,
        {
          headers: {
            'Authorization': `Bearer ${user2Session?.session?.access_token}`,
          },
        }
      );

      const user2Stats = await user2StatsResponse.json();

      setResults({
        paymentResult,
        user1Stats,
        user2Stats,
      });

      toast.success('✅ Payment processed and rewards distributed!');
      setStep('results');

    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error(error.message);
      setErrorDetails(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Lien copié!');
  };

  return (
    <div className="min-h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#D2691E] to-[#E8A05D] px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-2">
          <Link to="/settings">
            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white active:scale-95 transition-transform">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Test de Parrainage</h1>
            <p className="text-sm text-white/90">Tester le flux complet</p>
          </div>
          <FlaskConical className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-4">
        {/* Intro */}
        {step === 'intro' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-3xl p-5 shadow-md">
              <h2 className="text-lg font-bold text-[#5D4037] mb-3">Test Automatique</h2>
              <p className="text-sm text-[#8D6E63] mb-4">
                Ce test va créer deux utilisateurs et simuler le flux complet de parrainage:
              </p>
              
              <div className="space-y-3 mb-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#5D4037] text-sm">User 1 (Parrain)</div>
                    <div className="text-xs text-[#8D6E63]">Créer compte + générer lien</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-green-600">2</span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#5D4037] text-sm">User 2 (Filleul)</div>
                    <div className="text-xs text-[#8D6E63]">S'inscrire via lien de parrainage</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-purple-600">3</span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#5D4037] text-sm">Paiement</div>
                    <div className="text-xs text-[#8D6E63]">User 2 paie $59 → récompenses</div>
                  </div>
                </div>
              </div>

              {/* User 1 Config */}
              <div className="bg-[#FFF8E7] rounded-2xl p-4 mb-4">
                <div className="text-sm font-bold text-blue-600 mb-2">👤 User 1 (Parrain)</div>
                <input
                  type="email"
                  value={user1Email}
                  onChange={(e) => setUser1Email(e.target.value)}
                  placeholder="Email"
                  className="w-full mb-2 p-2 bg-white rounded-xl text-sm border border-[#8D6E63]/20"
                />
                <input
                  type="text"
                  value={user1Name}
                  onChange={(e) => setUser1Name(e.target.value)}
                  placeholder="Nom"
                  className="w-full mb-2 p-2 bg-white rounded-xl text-sm border border-[#8D6E63]/20"
                />
                <input
                  type="text"
                  value={user1FamilyName}
                  onChange={(e) => setUser1FamilyName(e.target.value)}
                  placeholder="Nom de famille"
                  className="w-full p-2 bg-white rounded-xl text-sm border border-[#8D6E63]/20"
                />
              </div>

              {/* User 2 Config */}
              <div className="bg-[#FFF8E7] rounded-2xl p-4 mb-4">
                <div className="text-sm font-bold text-green-600 mb-2">👤 User 2 (Filleul)</div>
                <input
                  type="email"
                  value={user2Email}
                  onChange={(e) => setUser2Email(e.target.value)}
                  placeholder="Email"
                  className="w-full mb-2 p-2 bg-white rounded-xl text-sm border border-[#8D6E63]/20"
                />
                <input
                  type="text"
                  value={user2Name}
                  onChange={(e) => setUser2Name(e.target.value)}
                  placeholder="Nom"
                  className="w-full mb-2 p-2 bg-white rounded-xl text-sm border border-[#8D6E63]/20"
                />
                <input
                  type="text"
                  value={user2FamilyName}
                  onChange={(e) => setUser2FamilyName(e.target.value)}
                  placeholder="Nom de famille"
                  className="w-full p-2 bg-white rounded-xl text-sm border border-[#8D6E63]/20"
                />
              </div>

              <button
                onClick={createUser1AndReferral}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold active:scale-98 transition-transform disabled:opacity-50"
              >
                {loading ? 'Création...' : '🚀 Démarrer le Test'}
              </button>

              {errorDetails && (
                <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                  <div className="text-xs font-bold text-red-700 mb-2">❌ ERREUR</div>
                  <div className="text-sm text-red-600 mb-3 break-words">{errorDetails}</div>
                  <button
                    onClick={() => {
                      const timestamp = Date.now();
                      setUser1Email(`test-${timestamp}-1@test.com`);
                      setUser2Email(`test-${timestamp}-2@test.com`);
                      setErrorDetails('');
                      toast.success('Nouveaux emails générés!');
                    }}
                    className="w-full h-10 bg-red-500 text-white rounded-xl font-semibold active:scale-98 transition-transform"
                  >
                    🔄 Générer Nouveaux Emails
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* User 1 Created */}
        {step === 'user1' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-5 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold">Étape 1 Complétée</div>
                  <div className="text-sm text-white/80">User 1 créé avec succès</div>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-xs text-white/80 mb-1">EMAIL</div>
                <div className="font-mono text-sm mb-3">{user1Email}</div>
                <div className="text-xs text-white/80 mb-1">FAMILLE</div>
                <div className="font-semibold">{user1FamilyName}</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <LinkIcon className="w-5 h-5 text-[#D2691E]" />
                <h3 className="font-bold text-[#5D4037]">Lien de Parrainage Généré</h3>
              </div>

              <div className="bg-[#FFF8E7] rounded-2xl p-3 mb-3 break-all text-xs font-mono text-[#5D4037]">
                {referralLink}
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={copyLink}
                  className="flex-1 h-10 bg-[#8D6E63] text-white rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-98 transition-transform"
                >
                  <Copy className="w-4 h-4" />
                  Copier
                </button>
              </div>

              <div className="text-xs text-[#8D6E63] mb-4">
                Code: <span className="font-mono font-bold">{referralCode}</span>
              </div>

              <button
                onClick={createUser2ViaReferral}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-semibold active:scale-98 transition-transform disabled:opacity-50"
              >
                {loading ? 'Création...' : '➡️ Créer User 2 via Lien'}
              </button>
            </div>
          </motion.div>
        )}

        {/* User 2 Created */}
        {step === 'user2' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-5 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold">Étape 2 Complétée</div>
                  <div className="text-sm text-white/80">User 2 créé via parrainage</div>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-xs text-white/80 mb-1">EMAIL</div>
                <div className="font-mono text-sm mb-3">{user2Email}</div>
                <div className="text-xs text-white/80 mb-1">FAMILLE</div>
                <div className="font-semibold mb-3">{user2FamilyName}</div>
                <div className="text-xs text-white/80 mb-1">STATUS</div>
                <div className="inline-block px-2 py-1 bg-yellow-500/30 rounded-lg text-xs font-bold">
                  ⏳ EN ATTENTE DE PAIEMENT
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-[#5D4037]">Tester le Paiement</h3>
              </div>

              <p className="text-sm text-[#8D6E63] mb-4">
                User 2 va effectuer un paiement de $59. Cela va déclencher:
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-[#5D4037]">User 1 reçoit <strong>12 mois gratuits</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-[#5D4037]">User 2 reçoit <strong>12 mois gratuits</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-[#5D4037]">Status passe à <strong>"Payé"</strong></span>
                </div>
              </div>

              <button
                onClick={processPaymentAndCheckResults}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-semibold active:scale-98 transition-transform disabled:opacity-50"
              >
                {loading ? 'Traitement...' : '💰 Effectuer Paiement $59'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {step === 'results' && results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-5 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  🎉
                </div>
                <div>
                  <div className="font-bold text-xl">Test Réussi!</div>
                  <div className="text-sm text-white/80">Toutes les étapes complétées</div>
                </div>
              </div>
            </div>

            {/* User 1 Stats */}
            <div className="bg-blue-50 rounded-3xl p-5 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-blue-900">User 1 (Parrain)</h3>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Familles référées:</span>
                  <span className="font-bold text-blue-900">
                    {results.user1Stats.referral?.totalReferred || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Stockage gagné:</span>
                  <span className="font-bold text-blue-900">
                    {results.user1Stats.referral?.totalStorageEarned || 0} mois
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Stockage total:</span>
                  <span className="font-bold text-blue-900">
                    {results.user1Stats.storageReward?.storageMonths || 0} mois
                  </span>
                </div>
              </div>

              {results.user1Stats.referral?.referredFamilies?.length > 0 && (
                <div className="mt-3 bg-white rounded-xl p-3">
                  <div className="text-xs font-bold text-blue-700 mb-2">FAMILLES INVITÉES:</div>
                  {results.user1Stats.referral.referredFamilies.map((f: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="text-blue-900">{f.familyName}</span>
                      <span className={`px-2 py-1 rounded-full ${
                        f.status === 'paid' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {f.status === 'paid' ? '✓ Payé' : '⏳ En attente'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User 2 Stats */}
            <div className="bg-green-50 rounded-3xl p-5 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-green-900">User 2 (Filleul)</h3>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Stockage total:</span>
                  <span className="font-bold text-green-900">
                    {results.user2Stats.storageReward?.storageMonths || 0} mois
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Bonus reçu:</span>
                  <span className="font-bold text-green-900">
                    {results.paymentResult.refereeBonus ? '✅ 12 mois' : '❌ Aucun'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Link to="/referral">
                <button className="w-full h-12 bg-[#D2691E] text-white rounded-2xl font-semibold active:scale-98 transition-transform">
                  Voir Dashboard de Parrainage
                </button>
              </Link>
              
              <button
                onClick={() => {
                  setStep('intro');
                  setReferralCode('');
                  setReferralLink('');
                  setResults(null);
                }}
                className="w-full h-12 bg-white text-[#5D4037] border-2 border-[#8D6E63]/20 rounded-2xl font-semibold active:scale-98 transition-transform"
              >
                Recommencer le Test
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}