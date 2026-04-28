'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import { Loader2, Mail, Lock } from 'lucide-react';
import { useTheme } from 'next-themes';
import { InteractiveBackground } from '@/components/InteractiveBackground';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@instapost.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = resolvedTheme || theme;
  const logoSrc = currentTheme === 'dark' ? '/logos/logo-white.png' : '/logos/logo-black.png';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Falha ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <InteractiveBackground />

      <div className="w-full max-w-md p-8 relative z-10 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="h-20 w-56 mb-5 relative flex items-center justify-center">
            {mounted ? (
              <img 
                src={logoSrc} 
                alt="SeCom Logo" 
                className="max-h-full max-w-full object-contain transition-opacity duration-300"
              />
            ) : (
              <div className="w-full h-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Bem-vindo de volta</h1>
          <p className="text-text-secondary text-sm mt-2">Faça login para acessar o SeCom Platform</p>
        </div>

        <div className="card p-8 shadow-xl border border-border/50 bg-bg-card/80 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-status-failed/10 border border-status-failed/20 text-status-failed text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-text-muted" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10 h-11"
                  placeholder="admin@instapost.local"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-text-muted" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 h-11"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-cta w-full h-11 text-[15px] mt-2 shadow-lg shadow-primary/25"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar na Plataforma'}
            </button>
          </form>
        </div>

        <p className="text-center text-text-muted text-xs mt-8">
          SeCom Platform &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
