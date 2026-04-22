'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { api, setToken, getToken } from '../lib/api';
import { Zap, Loader2 } from 'lucide-react';

const PUBLIC_PATHS = ['/invite', '/login'];

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = getToken();
    if (t) {
      // Try to restore user info from localStorage
      const savedUser = localStorage.getItem('user');
      api.listPosts({ limit: '1' })
        .then(() => setUser(savedUser ? JSON.parse(savedUser) : { loggedIn: true }))
        .catch(() => {
          setToken(null);
          setUser(null);
          if (!isPublicPath) router.push('/login');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      if (!isPublicPath) router.push('/login');
    }
  }, [isPublicPath, router]);

  const login = async (email: string, password: string) => {
    const result = await api.login(email, password);
    setToken(result.token);
    setUser(result.user);
    localStorage.setItem('user', JSON.stringify(result.user));
  };

  const register = async (email: string, password: string, name: string) => {
    const result = await api.register(email, password, name);
    setToken(result.token);
    setUser(result.user);
    localStorage.setItem('user', JSON.stringify(result.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading && !isPublicPath) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main">
        <div className="flex flex-col items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-accent-pink animate-pulse">
            <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <p className="text-text-muted text-sm">Carregando...</p>
        </div>
      </div>
    );
  }


  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
