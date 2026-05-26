'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  HandHeart, Package, MapPin, Calendar, User, Truck, Star,
  CheckCircle, Clock, XCircle, Loader2, MessageSquare,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { getStatusColor, getStatusLabel, formatDate, formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';

export default function ReceiverRequestsPage() {
  const { user } = useAuthStore();
  const [donations, setDonations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/donations', { params: { receiverId: user?.id, limit: 50 } });
      setDonations(res.data.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (user) loadRequests(); }, [user]);

  const handleReview = async (donationId: string, donorId: string) => {
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        donationId,
        targetId: donorId,
        rating: reviewData.rating,
        comment: reviewData.comment || undefined,
      });
      toast.success('Avaliação enviada! Obrigado pelo feedback.');
      setReviewingId(null);
      setReviewData({ rating: 5, comment: '' });
      loadRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao avaliar');
    } finally {
      setSubmittingReview(false);
    }
  };

  const reserved = donations.filter((d) => ['RESERVED', 'IN_TRANSIT'].includes(d.status));
  const delivered = donations.filter((d) => d.status === 'DELIVERED');
  const cancelled = donations.filter((d) => d.status === 'CANCELLED');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESERVED': return Clock;
      case 'IN_TRANSIT': return Truck;
      case 'DELIVERED': return CheckCircle;
      case 'CANCELLED': return XCircle;
      default: return Package;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Minhas Solicitações</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Acompanhe o status das doações que você solicitou.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: donations.length, icon: HandHeart, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Em andamento', value: reserved.length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Recebidas', value: delivered.length, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Canceladas', value: cancelled.length, icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-2xl p-4"
          >
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-xl font-heading font-bold">{s.value}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : donations.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <HandHeart className="w-14 h-14 text-[hsl(var(--muted-foreground))] mx-auto mb-4 opacity-50" />
          <h3 className="font-heading font-semibold text-lg mb-2">Nenhuma solicitação</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Navegue pelas doações disponíveis e solicite as que você precisa.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active/In progress */}
          {reserved.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">
                Em Andamento ({reserved.length})
              </h2>
              <div className="space-y-3">
                {reserved.map((d, index) => {
                  const StatusIcon = getStatusIcon(d.status);
                  return (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card rounded-2xl p-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-xl ${
                            d.status === 'IN_TRANSIT' ? 'bg-blue-500/10' : 'bg-amber-500/10'
                          } flex items-center justify-center flex-shrink-0`}>
                            <StatusIcon className={`w-6 h-6 ${
                              d.status === 'IN_TRANSIT' ? 'text-blue-500' : 'text-amber-500'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-heading font-semibold text-sm">{d.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1">
                              <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                                <User className="w-3 h-3" />
                                Doador: {d.donor?.name}
                              </span>
                              <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                Qtd: {d.quantity}
                              </span>
                              {d.locationText && (
                                <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {d.locationText}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${getStatusColor(d.status)} flex-shrink-0`}>
                          {getStatusLabel(d.status)}
                        </span>
                      </div>

                      {/* Delivery progress */}
                      {d.deliveries?.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[hsl(var(--border))]">
                          <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                            <Truck className="w-3.5 h-3.5" />
                            <span>Voluntário: {d.deliveries[0].volunteer?.name}</span>
                            <span>•</span>
                            <span className={`font-medium ${getStatusColor(d.deliveries[0].status)}`}>
                              {getStatusLabel(d.deliveries[0].status)}
                            </span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Delivered */}
          {delivered.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">
                Recebidas ({delivered.length})
              </h2>
              <div className="space-y-3">
                {delivered.map((d) => (
                  <div key={d.id}>
                    <div className="glass-card rounded-2xl p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-heading font-semibold text-sm">{d.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1">
                              <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                                <User className="w-3 h-3" />
                                Doador: {d.donor?.name}
                              </span>
                              <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(d.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${getStatusColor('DELIVERED')}`}>
                            Recebida
                          </span>
                          {!d.reviews?.some((r: any) => r.authorId === user?.id) && (
                            <button
                              onClick={() => setReviewingId(reviewingId === d.id ? null : d.id)}
                              className="px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-500 text-xs font-medium hover:bg-amber-500/10 flex items-center gap-1"
                            >
                              <Star className="w-3 h-3" /> Avaliar
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Review form */}
                      {reviewingId === d.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 pt-4 border-t border-[hsl(var(--border))]"
                        >
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium mb-2">Nota</label>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                                    className="p-0.5"
                                  >
                                    <Star
                                      className={`w-6 h-6 transition-colors ${
                                        star <= reviewData.rating
                                          ? 'text-amber-400 fill-amber-400'
                                          : 'text-gray-300 hover:text-amber-300'
                                      }`}
                                    />
                                  </button>
                                ))}
                                <span className="text-sm text-[hsl(var(--muted-foreground))] ml-2">
                                  {reviewData.rating}/5
                                </span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1.5">Comentário (opcional)</label>
                              <textarea
                                value={reviewData.comment}
                                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                placeholder="Conte como foi sua experiência..."
                                className="w-full px-3 py-2 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:border-emerald-500 outline-none text-sm min-h-[80px] resize-y"
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setReviewingId(null)}
                                className="px-4 py-2 rounded-xl text-sm hover:bg-[hsl(var(--muted))]"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => handleReview(d.id, d.donorId)}
                                disabled={submittingReview}
                                className="px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                              >
                                {submittingReview ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Star className="w-3.5 h-3.5" />
                                )}
                                Enviar Avaliação
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Existing review */}
                      {d.reviews?.filter((r: any) => r.authorId === user?.id).map((rev: any) => (
                        <div key={rev.id} className="mt-4 pt-4 border-t border-[hsl(var(--border))]">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-[hsl(var(--muted-foreground))]">Sua avaliação</span>
                          </div>
                          {rev.comment && (
                            <p className="text-xs text-[hsl(var(--muted-foreground))] italic">"{rev.comment}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cancelled */}
          {cancelled.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">
                Canceladas ({cancelled.length})
              </h2>
              <div className="space-y-2">
                {cancelled.map((d) => (
                  <div key={d.id} className="glass-card rounded-2xl p-4 opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <XCircle className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{d.title}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{formatDate(d.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
