import { useState, useEffect } from 'react';
import { ArrowLeft, Shield, ShieldCheck, User, Crown, Check, X } from 'lucide-react';
import { Link } from 'react-router';
import { BottomNav } from './bottom-nav';
import { useLanguage } from './language-context';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { supabase } from '../../../utils/supabase/client';
import { toast } from 'sonner';

interface UserData {
  userId: string;
  profileId: string;
  name: string;
  email?: string;
  photoUrl?: string;
  role: 'super_admin' | 'admin' | 'member';
  accountCreatedAt: string;
}

export function ManageUsers() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [needsSuperAdmin, setNeedsSuperAdmin] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      setNeedsSuperAdmin(false);

      // Get access token from Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-467d3bfa/users`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        
        // Check if error is related to super admin access
        if (errorData.error?.includes('super admin')) {
          setNeedsSuperAdmin(true);
          setError('Vous devez être super admin pour accéder à cette page');
        } else {
          setError(errorData.error || 'Failed to load users');
        }
        return;
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const becomeSuperAdmin = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expirée');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-467d3bfa/auth/set-super-admin`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set super admin');
      }

      toast.success('Super Admin activé!');
      // Reload users
      await loadUsers();
    } catch (err: any) {
      console.error('Error setting super admin:', err);
      toast.error(err.message);
      setLoading(false);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    try {
      setProcessingUserId(userId);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expirée');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-467d3bfa/users/${userId}/promote`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to promote user');
      }

      toast.success('Utilisateur promu admin avec succès!');
      // Reload users
      await loadUsers();
    } catch (err: any) {
      console.error('Error promoting user:', err);
      toast.error(err.message);
    } finally {
      setProcessingUserId(null);
    }
  };

  const revokeAdmin = async (userId: string) => {
    try {
      setProcessingUserId(userId);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expirée');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-467d3bfa/users/${userId}/revoke`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to revoke admin');
      }

      toast.success('Privilèges admin révoqués avec succès!');
      // Reload users
      await loadUsers();
    } catch (err: any) {
      console.error('Error revoking admin:', err);
      toast.error(err.message);
    } finally {
      setProcessingUserId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
            <Crown className="w-3.5 h-3.5" />
            {t('roles.superAdmin')}
          </div>
        );
      case 'admin':
        return (
          <div className="flex items-center gap-1.5 bg-[#8B4513] text-white px-3 py-1 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            {t('common.admin')}
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 bg-[#8D6E63]/20 text-[#8D6E63] px-3 py-1 rounded-full text-xs font-medium">
            <User className="w-3.5 h-3.5" />
            {t('roles.member')}
          </div>
        );
    }
  };

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#8B4513] to-[#5D4037] px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/settings">
            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{t('users.manageTitle')}</h1>
            <p className="text-sm text-white/80">{t('users.manageDescription')}</p>
          </div>
          <Shield className="w-6 h-6 text-[#FFD700]" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-[#8B4513]/20 border-t-[#8B4513] rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 text-center">
            <p className="text-red-600 font-semibold">{error}</p>
            <button
              onClick={loadUsers}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full font-semibold"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-md">
            <User className="w-16 h-16 mx-auto text-[#8D6E63]/30 mb-4" />
            <p className="text-[#8D6E63]">{t('users.noUsers')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="px-2 mb-2">
              <p className="text-sm text-[#8D6E63]">
                {t('users.totalUsers')}: <span className="font-bold text-[#5D4037]">{users.length}</span>
              </p>
            </div>

            {users.map((user) => (
              <div
                key={user.userId}
                className="bg-white rounded-3xl p-4 shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex items-center justify-center text-2xl flex-shrink-0">
                    {user.photoUrl ? (
                      <img
                        src={user.photoUrl}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[#5D4037] truncate">{user.name}</div>
                    {user.email && (
                      <div className="text-sm text-[#8D6E63] truncate">{user.email}</div>
                    )}
                    <div className="mt-2">{getRoleBadge(user.role)}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                {user.role !== 'super_admin' && (
                  <div className="mt-4 flex gap-2">
                    {user.role === 'member' ? (
                      <button
                        onClick={() => promoteToAdmin(user.userId)}
                        disabled={processingUserId === user.userId}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#8B4513] to-[#5D4037] text-white px-4 py-2.5 rounded-2xl font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50"
                      >
                        {processingUserId === user.userId ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            {t('users.promoteToAdmin')}
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => revokeAdmin(user.userId)}
                        disabled={processingUserId === user.userId}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#8D6E63]/20 text-[#5D4037] px-4 py-2.5 rounded-2xl font-semibold hover:bg-[#8D6E63]/30 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {processingUserId === user.userId ? (
                          <div className="w-5 h-5 border-2 border-[#5D4037]/30 border-t-[#5D4037] rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <X className="w-4 h-4" />
                            {t('users.revokeAdmin')}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {user.role === 'super_admin' && (
                  <div className="mt-4 text-center text-xs text-[#8D6E63] italic">
                    {t('users.superAdminCannotModify')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-gradient-to-br from-[#FFD700]/10 to-[#D4AF37]/10 border-2 border-[#D4AF37]/30 rounded-3xl p-4">
          <div className="flex gap-3">
            <Crown className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#5D4037]">
              <p className="font-semibold mb-1">{t('users.superAdminInfo')}</p>
              <p className="text-xs leading-relaxed">{t('users.superAdminInfoDetail')}</p>
            </div>
          </div>
        </div>

        {/* Super Admin Prompt */}
        {needsSuperAdmin && (
          <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-3xl p-6 text-center">
            <p className="text-red-600 font-semibold">{error}</p>
            <button
              onClick={becomeSuperAdmin}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full font-semibold"
            >
              {t('users.becomeSuperAdmin')}
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}