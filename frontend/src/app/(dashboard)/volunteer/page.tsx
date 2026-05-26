'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Package, CheckCircle, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { getStatusColor, getStatusLabel, formatDate } from '@/lib/utils';

export default function VolunteerDashboardPage() {
  const { user } = useAuthStore();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/deliveries', { params: { volunteerId: user?.id, limit: 10 } });
        setDeliveries(res.data.data.data || []);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    }
    if (user) load();
  }, [user]);

  const completed = deliveries.filter((d) => d.status === 'DELIVERED').length;
  const active = deliveries.filter((d) => ['ACCEPTED', 'IN_TRANSIT'].includes(d.status)).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold">
          Olá, {user?.name?.split(' ')[0]}! 🚗
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          {user?.isApproved
            ? 'Gerencie suas entregas e ajude a conectar doações.'
            : '⏳ Sua conta aguarda aprovação do administrador.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total de Entregas', value: deliveries.length, icon: Truck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Em Andamento', value: active, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Concluídas', value: completed, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
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
        <h3 className="font-heading font-semibold mb-4">Minhas Entregas</h3>
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-[hsl(var(--muted))] rounded-xl animate-pulse-soft" />)}</div>
        ) : deliveries.length === 0 ? (
          <div className="text-center py-10">
            <Truck className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
            <p className="text-[hsl(var(--muted-foreground))]">Nenhuma entrega ainda.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {deliveries.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[hsl(var(--muted))] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{d.donation?.title}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{formatDate(d.createdAt)}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(d.status)}`}>
                  {getStatusLabel(d.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
