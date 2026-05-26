'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, HandHeart, CheckCircle, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { getStatusColor, getStatusLabel, formatDate } from '@/lib/utils';

export default function ReceiverDashboardPage() {
  const { user } = useAuthStore();
  const [available, setAvailable] = useState<any[]>([]);
  const [myDonations, setMyDonations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [avRes, myRes] = await Promise.all([
          api.get('/donations', { params: { status: 'AVAILABLE', limit: 6 } }),
          api.get('/donations', { params: { receiverId: user?.id, limit: 5 } }),
        ]);
        setAvailable(avRes.data.data.data || []);
        setMyDonations(myRes.data.data.data || []);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    }
    if (user) load();
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold">
          Olá, {user?.name?.split(' ')[0]}! 🤲
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Encontre doações disponíveis e acompanhe suas solicitações.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Disponíveis', value: available.length, icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Minhas Solicitações', value: myDonations.length, icon: HandHeart, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Recebidas', value: myDonations.filter((d) => d.status === 'DELIVERED').length, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
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

      {/* Available donations */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold">Doações Disponíveis</h3>
          <Link href="/receiver/donations" className="text-sm text-emerald-500 hover:underline flex items-center gap-1">
            <Search className="w-3.5 h-3.5" /> Ver todas
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-[hsl(var(--muted))] rounded-xl animate-pulse-soft" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {available.map((d) => (
              <div key={d.id} className="p-4 rounded-xl border border-[hsl(var(--border))] hover:border-emerald-500/50 transition-colors">
                <p className="text-sm font-medium mb-1">{d.title}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2 line-clamp-2">{d.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{d.category?.name}</span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">Qtd: {d.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
