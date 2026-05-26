'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/auth-store';
import {
  Heart, LayoutDashboard, Users, Package, FolderOpen, FileText,
  ClipboardList, Truck, UserCircle, Star, LogOut, Sun, Moon,
  Menu, X, ChevronDown, Gift, HandHeart,
} from 'lucide-react';

const roleMenus: Record<string, { label: string; icon: any; href: string }[]> = {
  ADMIN: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { label: 'Usuários', icon: Users, href: '/admin/users' },
    { label: 'Doações', icon: Package, href: '/admin/donations' },
    { label: 'Categorias', icon: FolderOpen, href: '/admin/categories' },
    { label: 'Relatórios', icon: FileText, href: '/admin/reports' },
    { label: 'Logs', icon: ClipboardList, href: '/admin/logs' },
  ],
  DONOR: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/donor' },
    { label: 'Minhas Doações', icon: Package, href: '/donor/donations' },
    { label: 'Nova Doação', icon: Gift, href: '/donor/donations/new' },
    { label: 'Perfil', icon: UserCircle, href: '/donor/profile' },
  ],
  VOLUNTEER: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/volunteer' },
    { label: 'Entregas', icon: Truck, href: '/volunteer/deliveries' },
    { label: 'Perfil', icon: UserCircle, href: '/volunteer/profile' },
  ],
  RECEIVER: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/receiver' },
    { label: 'Doações Disponíveis', icon: Package, href: '/receiver/donations' },
    { label: 'Solicitações', icon: HandHeart, href: '/receiver/requests' },
    { label: 'Perfil', icon: UserCircle, href: '/receiver/profile' },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const menuItems = roleMenus[user.role] || [];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-[hsl(var(--sidebar))] border-r border-[hsl(var(--sidebar-border))] transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-[hsl(var(--sidebar-border))]">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading text-lg font-bold gradient-text">
                Rede Solidária
              </span>
            </Link>
            <button
              className="lg:hidden p-1 rounded-lg hover:bg-[hsl(var(--muted))]"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-500' : ''}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="px-3 py-4 border-t border-[hsl(var(--sidebar-border))]">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-[hsl(var(--border))]">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-[hsl(var(--muted))]"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {user.role === 'ADMIN' ? 'Administrador' :
                   user.role === 'DONOR' ? 'Doador' :
                   user.role === 'VOLUNTEER' ? 'Voluntário' : 'Recebedor'}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
