'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Search, MapPin, Calendar, User, ChevronLeft, ChevronRight,
  Filter, HandHeart, Loader2, CheckCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { getStatusColor, getStatusLabel, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function ReceiverDonationsPage() {
  const { user } = useAuthStore();
  const [donations, setDonations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [reservingId, setReservingId] = useState<string | null>(null);

  const limit = 9;
  const totalPages = Math.ceil(total / limit);

  const loadDonations = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/donations', {
        params: {
          status: 'AVAILABLE',
          page,
          limit,
          search: search || undefined,
          categoryId: categoryFilter || undefined,
        },
      });
      setDonations(res.data.data.data);
      setTotal(res.data.data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch {}
  };

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { loadDonations(); }, [page, categoryFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadDonations();
  };

  const handleReserve = async (donationId: string) => {
    setReservingId(donationId);
    try {
      await api.patch(`/donations/${donationId}/reserve`);
      toast.success('🎉 Doação reservada para você!');
      loadDonations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao reservar');
    } finally {
      setReservingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Doações Disponíveis</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Encontre doações que atendem às suas necessidades.
          {total > 0 && ` ${total} ${total === 1 ? 'doação disponível' : 'doações disponíveis'}`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, descrição ou localização..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:border-emerald-500 outline-none text-sm"
          />
        </form>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm outline-none"
        >
          <option value="">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
          ))}
        </select>
      </div>

      {/* Category quick filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => { setCategoryFilter(''); setPage(1); }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            !categoryFilter
              ? 'bg-emerald-500 text-white'
              : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--border))]'
          }`}
        >
          Todas
        </button>
        {categories.slice(0, 7).map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setCategoryFilter(cat.id); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              categoryFilter === cat.id
                ? 'bg-emerald-500 text-white'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--border))]'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 h-56 animate-pulse-soft" />
          ))}
        </div>
      ) : donations.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Package className="w-14 h-14 text-[hsl(var(--muted-foreground))] mx-auto mb-4 opacity-50" />
          <h3 className="font-heading font-semibold text-lg mb-2">Nenhuma doação encontrada</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {search || categoryFilter
              ? 'Tente ajustar seus filtros de busca.'
              : 'Não há doações disponíveis no momento. Volte em breve!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {donations.map((d, index) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-2xl overflow-hidden group hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300"
            >
              {/* Category header */}
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />

              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{d.category?.icon || '📦'}</span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{d.category?.name}</span>
                  </div>
                  <span className="text-xs font-medium text-emerald-500">
                    Qtd: {d.quantity}
                  </span>
                </div>

                <h3 className="font-heading font-semibold mb-2 line-clamp-2">{d.title}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-3 mb-4 leading-relaxed">
                  {d.description}
                </p>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                    <User className="w-3 h-3 flex-shrink-0" />
                    <span>Doado por {d.donor?.name}</span>
                  </div>
                  {d.locationText && (
                    <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{d.locationText}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span>{formatDate(d.createdAt)}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleReserve(d.id)}
                  disabled={reservingId === d.id}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity"
                >
                  {reservingId === d.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <HandHeart className="w-4 h-4" />
                      Solicitar Doação
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl hover:bg-[hsl(var(--muted))] disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
            .map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                  p === page ? 'bg-emerald-500 text-white' : 'hover:bg-[hsl(var(--muted))]'
                }`}
              >
                {p}
              </button>
            ))}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl hover:bg-[hsl(var(--muted))] disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
