'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Heart,
  Users,
  PackageCheck,
  TrendingUp,
  ArrowRight,
  HandHeart,
  Truck,
  Gift,
  Shield,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/auth-store';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

const stats = [
  { label: 'Doações Realizadas', value: '2.500+', icon: Gift, color: 'text-emerald-500' },
  { label: 'Famílias Atendidas', value: '1.200+', icon: Users, color: 'text-blue-500' },
  { label: 'Voluntários Ativos', value: '350+', icon: HandHeart, color: 'text-teal-500' },
  { label: 'Entregas Concluídas', value: '1.800+', icon: PackageCheck, color: 'text-amber-500' },
];

const steps = [
  {
    step: '01',
    title: 'Cadastre-se',
    description: 'Crie sua conta como doador, recebedor ou voluntário em poucos segundos.',
    icon: Users,
  },
  {
    step: '02',
    title: 'Publique ou Busque',
    description: 'Doadores publicam itens e recebedores buscam o que precisam.',
    icon: Gift,
  },
  {
    step: '03',
    title: 'Entrega Solidária',
    description: 'Voluntários transportam as doações até quem mais precisa.',
    icon: Truck,
  },
];

const categories = [
  { name: 'Roupas', icon: '👕', count: 450 },
  { name: 'Alimentos', icon: '🍎', count: 380 },
  { name: 'Móveis', icon: '🪑', count: 120 },
  { name: 'Eletrônicos', icon: '💻', count: 95 },
  { name: 'Livros', icon: '📚', count: 280 },
  { name: 'Brinquedos', icon: '🧸', count: 200 },
  { name: 'Higiene', icon: '🧴', count: 310 },
  { name: 'Outros', icon: '📦', count: 165 },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user } = useAuthStore();

  const getDashboardLink = () => {
    if (!user) return '/login';
    const routes: Record<string, string> = {
      ADMIN: '/admin',
      DONOR: '/donor',
      VOLUNTEER: '/volunteer',
      RECEIVER: '/receiver',
    };
    return routes[user.role] || '/login';
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading text-xl font-bold gradient-text">
                Rede Solidária
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#como-funciona" className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                Como Funciona
              </a>
              <a href="#categorias" className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                Categorias
              </a>
              <a href="#sobre" className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                Sobre
              </a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
                aria-label="Alternar tema"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {isAuthenticated ? (
                <Link
                  href={getDashboardLink()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-xl text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Cadastrar
                  </Link>
                </>
              )}
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-[hsl(var(--muted))]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden glass border-t border-[hsl(var(--border))]"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#como-funciona" className="block text-sm py-2">Como Funciona</a>
              <a href="#categorias" className="block text-sm py-2">Categorias</a>
              <a href="#sobre" className="block text-sm py-2">Sobre</a>
              <hr className="border-[hsl(var(--border))]" />
              <Link href="/login" className="block text-sm py-2 font-medium">Entrar</Link>
              <Link
                href="/register"
                className="block text-center px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium"
              >
                Cadastrar
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-8 border border-emerald-500/20">
              <Heart className="w-4 h-4" />
              Plataforma de Doações Solidárias
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold tracking-tight mb-6">
              Conectando{' '}
              <span className="gradient-text">solidariedade</span>
              <br />
              com quem mais precisa
            </h1>

            <p className="text-lg sm:text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto mb-10">
              Uma rede que une doadores, voluntários e instituições para
              transformar vidas através da generosidade e do cuidado coletivo.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register?role=DONOR"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-lg hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Gift className="w-5 h-5" />
                Quero Doar
              </Link>
              <Link
                href="/register?role=RECEIVER"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl border-2 border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-semibold text-lg hover:bg-[hsl(var(--muted))] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <HandHeart className="w-5 h-5" />
                Preciso de Doação
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                className="glass-card rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300"
              >
                <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                <p className="text-3xl font-heading font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
              Como Funciona?
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] text-lg max-w-xl mx-auto">
              Em três passos simples, sua doação chega a quem mais precisa.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="glass-card rounded-2xl p-8 text-center relative group hover:scale-105 transition-transform duration-300"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                  {step.step}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center mx-auto mt-4 mb-5">
                  <step.icon className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-heading font-semibold mb-3">{step.title}</h3>
                <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categorias" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
              Categorias de Doação
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] text-lg max-w-xl mx-auto">
              Doe o que puder, cada item faz a diferença na vida de alguém.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {categories.map((cat) => (
              <motion.div
                key={cat.name}
                variants={fadeInUp}
                className="glass-card rounded-2xl p-6 text-center cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-300 group"
              >
                <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">
                  {cat.icon}
                </span>
                <h3 className="font-heading font-semibold mb-1">{cat.name}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {cat.count} doações
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About / CTA Section */}
      <section id="sobre" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

            <div className="relative">
              <Shield className="w-12 h-12 text-emerald-500 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-6">
                Faça parte da{' '}
                <span className="gradient-text">Rede Solidária</span>
              </h2>
              <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto mb-10">
                Junte-se a milhares de pessoas que estão transformando a
                realidade de comunidades inteiras. Seja doador, voluntário ou
                parceiro — sua contribuição faz toda a diferença.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 flex items-center gap-2"
                >
                  Começar Agora
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/register?role=VOLUNTEER"
                  className="px-8 py-3.5 rounded-2xl border-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-500/10 transition-all duration-300"
                >
                  Seja Voluntário
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-lg">Rede Solidária</span>
            </div>

            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              © {new Date().getFullYear()} Rede Solidária. Feito com 💚 para
              conectar solidariedade.
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
                aria-label="Alternar tema"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
