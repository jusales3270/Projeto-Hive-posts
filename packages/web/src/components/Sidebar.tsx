'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusSquare, FileText, Calendar, CheckSquare, FolderKanban, Settings, LogOut, Hexagon, Users, Mic, Palette } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const links = [
  { href: '/', label: 'Dashboard', icon: Home, page: 'dashboard' },
  { href: '/posts/new', label: 'Novo Post', icon: PlusSquare, page: 'posts' },
  { href: '/posts', label: 'Posts', icon: FileText, page: 'posts' },
  { href: '/calendar', label: 'Calendario', icon: Calendar, page: 'calendar' },
  { href: '/tasks', label: 'Tarefas', icon: CheckSquare, page: 'tasks' },
  { href: '/projects', label: 'Projetos', icon: FolderKanban, page: 'projects' },
  { href: '/transcriptor', label: 'Transcritor', icon: Mic, page: 'transcriptor' },
  { href: '/brands', label: 'Brands', icon: Palette, page: 'brands' },
  { href: '/team', label: 'Equipe', icon: Users, page: 'team' },
  { href: '/settings', label: 'Configuracoes', icon: Settings, page: 'settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isOwner = user?.role === 'OWNER' || !user?.role;
  const allowedPages: string[] = user?.allowedPages || [];

  const visibleLinks = links.filter((link) => {
    if (isOwner) return true;
    if (link.page === 'settings') return true;
    if (link.page === 'team') return user?.role === 'ADMIN';
    if (allowedPages.length === 0) return true;
    return allowedPages.includes(link.page);
  });

  const navLinks = visibleLinks.filter((l) => l.page !== 'settings');
  const settingsLink = visibleLinks.find((l) => l.page === 'settings');

  // Determine logo based on theme
  const currentTheme = resolvedTheme || theme;
  const logoSrc = currentTheme === 'dark' ? '/logos/logo-white.png' : '/logos/logo-black.png';

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-bg-card border-r border-border flex flex-col z-20">
      {/* Logo Area */}
      <div className="p-6 flex flex-col items-start gap-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {mounted ? (
              <div className="relative h-12 w-32">
                <img 
                  src={logoSrc} 
                  alt="OpenHive Logo" 
                  className="h-full w-full object-contain object-left transition-opacity duration-300"
                />
              </div>
            ) : (
              <div className="h-12 w-32 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg" />
            )}
          </div>
          <ThemeToggle />
        </div>
        <span className="text-[9px] font-bold tracking-[2px] text-text-muted uppercase">Secretaria de Comunicação</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 flex flex-col gap-1 overflow-y-auto">
        <span className="text-[11px] font-bold text-text-muted px-4 mb-2 mt-2 tracking-wider uppercase">Menu</span>

        {navLinks.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200 relative ${
                active
                  ? 'text-primary bg-primary/[0.08]'
                  : 'text-text-secondary hover:bg-bg-card-hover hover:text-text-primary'
              }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/4 rounded-r-full bg-gradient-to-b from-primary to-accent-pink" />
              )}
              <Icon className="w-5 h-5" strokeWidth={active ? 2 : 1.5} />
              {link.label}
            </Link>
          );
        })}

        {/* Settings pushed to bottom */}
        {settingsLink && (
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200 relative mt-auto mb-4 ${
              pathname === '/settings'
                ? 'text-primary bg-primary/[0.08]'
                : 'text-text-secondary hover:bg-bg-card-hover hover:text-text-primary'
            }`}
          >
            {pathname === '/settings' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/4 rounded-r-full bg-gradient-to-b from-primary to-accent-pink" />
            )}
            <Settings className="w-5 h-5" strokeWidth={pathname === '/settings' ? 2 : 1.5} />
            Configuracoes
          </Link>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 border-t border-border pt-3">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-[14px] font-medium text-text-muted hover:text-status-failed hover:bg-status-failed/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
          Sair
        </button>
      </div>
    </aside>
  );
}
