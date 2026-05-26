'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Truck, Package, MapPin, Calendar, User, ChevronLeft, ChevronRight,
  CheckCircle, Clock, Search, ArrowRight, Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { getStatusColor, getStatusLabel, formatDate, formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';

export default function VolunteerDeliveriesPage() {
  const { user } = useAuthStore();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [availableDonations, setAvailableDonations] = useState<any[]>([]);
  const [tab, setTab] = useState<'mine' | 'available'>('mine');
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadDeliveries = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/deliveries', { params: { volunteerId: user?.id, limit: 50 } });
      setDeliveries(res.data.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailable = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/donations', { params: { status: 'RESERVED', limit: 20 } });
      setAvailableDonations(res.data.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (tab === 'mine') loadDeliveries();
      else loadAvailable();
    }
  }, [user, tab]);

  const handleAccept = async (donationId: string) => {
    setAcceptingId(donationId);
    try {
      await api.post('/deliveries', { donationId });
      toast.success('Entrega aceita! Você é o voluntário responsável.');
      setTab('mine');
      loadDeliveries();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao aceitar entrega');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleUpdateStatus = async (deliveryId: string, status: string) => {
    setUpdatingId(deliveryId);
    try {
      await api.patch(`/deliveries/${deliveryId}/status`, { status });
      toast.success(status === 'DELIVERED' ? '🎉 Entrega concluída!' : 'Status atualizado!');
      loadDeliveries();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar');
    } finally {
      setUpdatingId(null);
    }
  };

  const activeDeliveries = deliveries.filter((d) => ['ACCEPTED', 'IN_TRANSIT'].includes(d.status));
  const completedDeliveries = deliveries.filter((d) => d.status === 'DELIVERED');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Entregas</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Gerencie suas entregas e encontre novas doações para transportar.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[hsl(var(--muted))] w-fit">
        <button
          onClick={() => setTab('mine')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'mine'
              ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm'
              : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
          }`}
        >
          Minhas Entregas ({deliveries.length})
        </button>
        <button
          onClick={() => setTab('available')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'available'
              ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm'
              : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
          }`}
        >
          Disponíveis para Entrega
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : tab === 'mine' ? (
        <div className="space-y-6">
          {/* Active deliveries */}
          {activeDeliveries.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">
                Em Andamento ({activeDeliveries.length})
              </h2>
              <div className="space-y-3">
                {activeDeliveries.map((del, index) => (
                  <motion.div
                    key={del.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card rounded-2xl p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <Truck className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading font-semibold text-sm">{del.donation?.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1">
                            <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {del.donation?.donor?.name} → {del.donation?.receiver?.name || 'Pendente'}
                            </span>
                            {del.donation?.locationText && (
                              <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {del.donation.locationText}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:flex-shrink-0">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(del.status)}`}>
                          {getStatusLabel(del.status)}
                        </span>
                        {del.status === 'ACCEPTED' && (
                          <button
                            onClick={() => handleUpdateStatus(del.id, 'IN_TRANSIT')}
                            disabled={updatingId === del.id}
                            className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                          >
                            {updatingId === del.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Truck className="w-3 h-3" />}
                            Iniciar Transporte
                          </button>
                        )}
                        {del.status === 'IN_TRANSIT' && (
                          <button
                            onClick={() => handleUpdateStatus(del.id, 'DELIVERED')}
                            disabled={updatingId === del.id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                          >
                            {updatingId === del.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                            Confirmar Entrega
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Completed deliveries */}
          {completedDeliveries.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">
                Concluídas ({completedDeliveries.length})
              </h2>
              <div className="space-y-2">
                {completedDeliveries.map((del) => (
                  <div key={del.id} className="glass-card rounded-2xl p-4 opacity-75">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{del.donation?.title}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          Entregue em {del.deliveredAt ? formatDateTime(del.deliveredAt) : formatDate(del.createdAt)}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor('DELIVERED')}`}>
                        Entregue
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {deliveries.length === 0 && (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Truck className="w-14 h-14 text-[hsl(var(--muted-foreground))] mx-auto mb-4 opacity-50" />
              <h3 className="font-heading font-semibold text-lg mb-2">Nenhuma entrega ainda</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                Vá até a aba "Disponíveis para Entrega" para encontrar doações que precisam de transporte.
              </p>
              <button
                onClick={() => setTab('available')}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium"
              >
                Ver disponíveis <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Available donations for delivery */
        <div>
          {availableDonations.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Package className="w-14 h-14 text-[hsl(var(--muted-foreground))] mx-auto mb-4 opacity-50" />
              <h3 className="font-heading font-semibold text-lg mb-2">Nenhuma doação disponível</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Não há doações reservadas aguardando transporte no momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableDonations.map((don, index) => (
                <motion.div
                  key={don.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card rounded-2xl p-5 hover:scale-[1.02] transition-transform duration-300"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{don.category?.icon || '📦'}</span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{don.category?.name}</span>
                  </div>
                  <h3 className="font-heading font-semibold text-sm mb-2">{don.title}</h3>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 mb-3">{don.description}</p>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                      <User className="w-3 h-3" />
                      <span>{don.donor?.name} → {don.receiver?.name}</span>
                    </div>
                    {don.locationText && (
                      <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{don.locationText}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                      <Package className="w-3 h-3" />
                      <span>Qtd: {don.quantity}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAccept(don.id)}
                    disabled={acceptingId === don.id}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {acceptingId === don.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Truck className="w-4 h-4" /> Aceitar Entrega
                      </>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
