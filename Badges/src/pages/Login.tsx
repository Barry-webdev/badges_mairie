import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Identifiants incorrects';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      {/* Fond décoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-2xl shadow-lg mb-4">
            <Shield className="w-8 h-8 text-blue-950" />
          </div>
          <div className="flex justify-center mb-3">
            <div className="flex h-6 w-8 rounded overflow-hidden shadow">
              <div className="flex-1 bg-red-600" />
              <div className="flex-1 bg-yellow-400" />
              <div className="flex-1 bg-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">COMMUNE DE PITA</h1>
          <p className="text-blue-200 text-sm mt-1">Système de gestion des badges</p>
          <p className="text-blue-300 text-xs mt-1">Garde Communale — République de Guinée</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">Connexion</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  placeholder:text-gray-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    placeholder:text-gray-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-900 hover:bg-blue-800 disabled:opacity-60
                text-white font-semibold rounded-xl transition-colors duration-150
                flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center text-blue-300/60 text-xs mt-6">
          © {new Date().getFullYear()} Mairie de Pita — Tous droits réservés
        </p>
      </div>
    </div>
  );
};
