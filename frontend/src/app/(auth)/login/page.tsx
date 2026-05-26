'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      toast.success('Login realizado com sucesso!');

      const stored = localStorage.getItem('rede-solidaria-auth');
      if (stored) {
        const { state } = JSON.parse(stored);
        const routes: Record<string, string> = {
          ADMIN: '/admin',
          DONOR: '/donor',
          VOLUNTEER: '/volunteer',
          RECEIVER: '/receiver',
        };
        router.push(routes[state.user?.role] || '/');
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao fazer login';
      toast.error(Array.isArray(message) ? message[0] : message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link href="/" className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading text-2xl font-bold gradient-text">
              Rede Solidária
            </span>
          </Link>

          <h1 className="text-3xl font-heading font-bold mb-2">Bem-vindo de volta</h1>
          <p className="text-[hsl(var(--muted-foreground))] mb-8">
            Entre na sua conta para continuar fazendo a diferença.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors text-sm"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded border-[hsl(var(--border))] accent-emerald-500" />
                Lembrar-me
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-8">
            Não tem uma conta?{' '}
            <Link
              href="/register"
              className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
            >
              Cadastre-se gratuitamente
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
            <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2">🔑 Credenciais de demonstração:</p>
            <div className="space-y-1 text-xs text-[hsl(var(--muted-foreground))]">
              <p><span className="font-medium">Admin:</span> admin@redesolidaria.com</p>
              <p><span className="font-medium">Doador:</span> maria@email.com</p>
              <p><span className="font-medium">Voluntário:</span> ana@email.com</p>
              <p><span className="font-medium">Recebedor:</span> esperanca@email.com</p>
              <p><span className="font-medium">Senha:</span> 123456</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-600 items-center justify-center relative overflow-hidden">
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />

        <div className="text-center text-white p-12 relative z-10">
          <Heart className="w-20 h-20 mx-auto mb-8 opacity-90" />
          <h2 className="text-4xl font-heading font-bold mb-4">
            Juntos somos mais fortes
          </h2>
          <p className="text-lg text-white/80 max-w-md">
            Cada doação é um ato de esperança que transforma vidas e fortalece
            nossa comunidade.
          </p>
        </div>
      </div>
    </div>
  );
}
