'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package, Plus, Search, Filter, ChevronLeft, ChevronRight,
  MapPin, Calendar, MoreHorizontal, Eye, Pencil, Trash2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { getStatusColor, getStatusLabel, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function DonorDonationsPage() {
  const { user } = useAuthStore();
  const [donations, setDonations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const limit = 8;
  const totalPages = Math.ceil(total / limit);

  const loadDonations = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/donations', {
        params: {
          donorId: user?.id,
          page,
          limit,
          search: search || undefined,
          status: statusFilter || undefined,
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

  useEffect(() => {
    if (user) loadDonations();
  }, [user, page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadDonations();
  };

  const handleCancel = async (id: string) => {
    try {
      await api.patch(`/donations/${id}/status`, { status: 'CANCELLED' });
      toast.success('Doação cancelada');
      loadDonations();
    } catch {
      toast.error('Erro ao cancelar doação');
    }
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Minhas Doações</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {total} {total === 1 ? 'doação cadastrada' : 'doações cadastradas'}
          </p>
        </div>
        <Link
          href="/donor/donations/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nova Doação
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar doações..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:border-emerald-500 outline-none text-sm"
          />
        </form>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm outline-none"
        >
          <option value="">Todos os status</option>
          <option value="AVAILABLE">Disponível</option>
          <option value="RESERVED">Reservada</option>
          <option value="IN_TRANSIT">Em Transporte</option>
          <option value="DELIVERED">Entregue</option>
          <option value="CANCELLED">Cancelada</option>
        </select>
      </div>

      {/* Donations Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 h-48 animate-pulse-soft" />
          ))}
        </div>
      ) : donations.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Package className="w-14 h-14 text-[hsl(var(--muted-foreground))] mx-auto mb-4 opacity-50" />
          <h3 className="font-heading font-semibold text-lg mb-2">Nenhuma doação encontrada</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
            {search || statusFilter
              ? 'Tente ajustar seus filtros de busca.'
              : 'Comece cadastrando sua primeira doação.'}
          </p>
          {!search && !statusFilter && (
            <Link
              href="/donor/donations/new"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Criar Doação
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {donations.map((d, index) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
            >
              {/* Card header with category */}
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(d.status)}`}>
                    {getStatusLabel(d.status)}
                  </span>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === d.id ? null : d.id)}
                      className="p-1 rounded-lg hover:bg-[hsl(var(--muted))] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenuId === d.id && (
                      <div className="absolute right-0 top-8 z-10 w-40 glass-card rounded-xl shadow-xl border border-[hsl(var(--border))] py-1">
                        <Link
                          href={`/donor/donations/${d.id}`}
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[hsl(var(--muted))] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver detalhes
                        </Link>
                        {d.status === 'AVAILABLE' && (
                          <button
                            onClick={() => handleCancel(d.id)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 w-full transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Cancelar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <Link href={`/donor/donations/${d.id}`}>
                  <h3 className="font-heading font-semibold text-sm mb-2 line-clamp-2 hover:text-emerald-500 transition-colors">
                    {d.title}
                  </h3>
                </Link>

                <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 mb-3">
                  {d.description}
                </p>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                    <Package className="w-3 h-3" />
                    <span>{d.category?.name} • Qtd: {d.quantity}</span>
                  </div>
                  {d.locationText && (
                    <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{d.locationText}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(d.createdAt)}</span>
                  </div>
                </div>

                {d.receiver && (
                  <div className="mt-3 pt-3 border-t border-[hsl(var(--border))]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-[10px] font-bold">
                        {d.receiver.name?.charAt(0)}
                      </div>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        Reservado por {d.receiver.name}
                      </span>
                    </div>
                  </div>
                )}
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
            className="p-2 rounded-xl hover:bg-[hsl(var(--muted))] disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
            Math.max(0, page - 3),
            Math.min(totalPages, page + 2)
          ).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-emerald-500 text-white'
                  : 'hover:bg-[hsl(var(--muted))]'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl hover:bg-[hsl(var(--muted))] disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mobile FAB */}
      <Link
        href="/donor/donations/new"
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center z-20"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}
