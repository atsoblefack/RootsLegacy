import { ArrowLeft, Mail, Lock, TreePine } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { useLanguage } from './language-context';
import { supabase } from '/utils/supabase/client';
import { toast } from 'sonner';

export function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        toast.success('Connexion réussie!');
        navigate('/home');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Échec de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-gradient-to-br from-[#E8A05D] via-[#D2691E] to-[#5D4037] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4">
        <Link to="/">
          <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        {/* Logo */}
        <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
          <TreePine className="w-14 h-14 text-white" strokeWidth={2} />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Bon retour!
        </h1>
        <p className="text-white/90 text-center mb-8">
          Connectez-vous à votre compte RootsLegacy
        </p>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs text-white/80 uppercase tracking-wide font-semibold block mb-2">
                Email
              </label>
              <div className="flex items-center gap-3 p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Mail className="w-5 h-5 text-white/80" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="votre@email.com"
                  className="flex-1 bg-transparent text-white placeholder:text-white/50 font-medium outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-white/80 uppercase tracking-wide font-semibold block mb-2">
                Mot de passe
              </label>
              <div className="flex items-center gap-3 p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Lock className="w-5 h-5 text-white/80" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-white placeholder:text-white/50 font-medium outline-none"
                />
              </div>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-white text-[#D2691E] rounded-3xl font-bold text-lg shadow-2xl hover:bg-white/95 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-[#D2691E]/30 border-t-[#D2691E] rounded-full animate-spin" />
                Connexion...
              </div>
            ) : (
              'Se connecter'
            )}
          </button>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-white/80 text-sm">
              Pas encore de compte?{' '}
              <Link to="/signup" className="font-bold text-white underline">
                S'inscrire
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}