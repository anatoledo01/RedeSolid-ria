'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, Eye, EyeOff, User, Phone, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

const roleOptions = [
  { value: 'DONOR', label: 'Doador', description: 'Quero doar itens', icon: '🎁' },
  { value: 'RECEIVER', label: 'Recebedor', description: 'Preciso de doações', icon: '🤲' },
  { value: 'VOLUNTEER', label: 'Voluntário', description: 'Quero ajudar nas entregas', icon: '🚗' },
];

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: searchParams.get('role') || 'DONOR',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
      toast.success('Cadastro realizado com sucesso!');

      if (formData.role === 'VOLUNTEER') {
        toast.info('Sua conta de voluntário aguarda aprovação do administrador.');
      }

      const routes: Record<string, string> = {
        ADMIN: '/admin',
        DONOR: '/donor',
        VOLUNTEER: '/volunteer',
        RECEIVER: '/receiver',
      };
      router.push(routes[formData.role] || '/');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao cadastrar';
      toast.error(Array.isArray(message) ? message[0] : message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-600 items-center justify-center relative overflow-hidden">
        <div className="absolute top-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-white/10 rounded-full blur-3xl" />

        <div className="text-center text-white p-12 relative z-10">
          <Heart className="w-20 h-20 mx-auto mb-8 opacity-90" />
          <h2 className="text-4xl font-heading font-bold mb-4">
            Faça parte dessa rede
          </h2>
          <p className="text-lg text-white/80 max-w-md">
            Cadastre-se agora e comece a transformar vidas através da
            solidariedade. Cada gesto conta.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading text-2xl font-bold gradient-text">
              Rede Solidária
            </span>
          </Link>

          <h1 className="text-3xl font-heading font-bold mb-2">Crie sua conta</h1>
          <p className="text-[hsl(var(--muted-foreground))] mb-6">
            Junte-se à rede e comece a fazer a diferença hoje.
          </p>

          {/* Role Selection */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {roleOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, role: option.value })}
                className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                  formData.role === option.value
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-[hsl(var(--border))] hover:border-emerald-500/50'
                }`}
              >
                <span className="text-2xl block mb-1">{option.icon}</span>
                <p className="text-xs font-medium">{option.label}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors text-sm"
                  placeholder="Seu nome"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
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
              <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                Telefone (opcional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors text-sm"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">
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
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-6">
            Já tem uma conta?{' '}
            <Link
              href="/login"
              className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
            >
              Fazer login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
