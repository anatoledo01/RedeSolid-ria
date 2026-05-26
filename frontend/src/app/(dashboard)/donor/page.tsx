'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, Plus, Clock, CheckCircle, Gift } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { getStatusColor, getStatusLabel, formatDate } from '@/lib/utils';

export default function DonorDashboardPage() {
  const { user } = useAuthStore();
  const [donations, setDonations] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, delivered: 0, available: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/donations', { params: { donorId: user?.id, limit: 5 } });
        const data = res.data.data;
        setDonations(data.data);
        setStats({
          total: data.total,
          delivered: data.data.filter((d: any) => d.status === 'DELIVERED').length,
          available: data.data.filter((d: any) => d.status === 'AVAILABLE').length,
        });
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    }
    if (user) load();
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold">
            Olá, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            Gerencie suas doações e acompanhe o impacto da sua solidariedade.
          </p>
        </div>
        <Link
          href="/donor/donations/new"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nova Doação
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total de Doações', value: stats.total, icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Entregues', value: stats.delivered, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Disponíveis', value: stats.available, icon: Gift, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-6">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-heading font-bold">{s.value}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold">Doações Recentes</h3>
          <Link href="/donor/donations" className="text-sm text-emerald-500 hover:underline">Ver todas</Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[hsl(var(--muted))] rounded-xl animate-pulse-soft" />
            ))}
          </div>
        ) : donations.length === 0 ? (
          <div className="text-center py-10">
            <Gift className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
            <p className="text-[hsl(var(--muted-foreground))]">Nenhuma doação ainda.</p>
            <Link href="/donor/donations/new" className="text-sm text-emerald-500 hover:underline mt-2 inline-block">
              Criar primeira doação
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {donations.map((d) => (
              <Link key={d.id} href={`/donor/donations/${d.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-[hsl(var(--muted))] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{d.title}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{formatDate(d.createdAt)}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(d.status)}`}>
                  {getStatusLabel(d.status)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      <Link href="/donor/donations/new"
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center">
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}
