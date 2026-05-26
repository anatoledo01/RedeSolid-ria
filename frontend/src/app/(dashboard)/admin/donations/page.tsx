'use client';
import { useEffect, useState } from 'react';
import { Package, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { getStatusColor, getStatusLabel, formatDate } from '@/lib/utils';

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/donations', {
        params: { page, limit: 10, search: search || undefined, status: statusFilter || undefined },
      });
      setDonations(res.data.data.data);
      setTotal(res.data.data.total);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, [page, statusFilter]);
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Gestão de Doações</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">{total} doações no sistema</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar doações..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:border-emerald-500 outline-none text-sm" />
        </form>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm outline-none">
          <option value="">Todos os status</option>
          <option value="AVAILABLE">Disponível</option>
          <option value="RESERVED">Reservada</option>
          <option value="IN_TRANSIT">Em Transporte</option>
          <option value="DELIVERED">Entregue</option>
          <option value="CANCELLED">Cancelada</option>
        </select>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="px-6 py-4 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">Doação</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">Doador</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">Categoria</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="h-10 bg-[hsl(var(--muted))] rounded animate-pulse-soft" /></td></tr>
              )) : donations.map((d) => (
                <tr key={d.id} className="hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Package className="w-4 h-4 text-emerald-500" /></div>
                      <div><p className="text-sm font-medium">{d.title}</p><p className="text-xs text-[hsl(var(--muted-foreground))]">Qtd: {d.quantity}</p></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{d.donor?.name}</td>
                  <td className="px-6 py-4 text-sm">{d.category?.name}</td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(d.status)}`}>{getStatusLabel(d.status)}</span></td>
                  <td className="px-6 py-4 text-sm text-[hsl(var(--muted-foreground))]">{formatDate(d.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[hsl(var(--border))]">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
