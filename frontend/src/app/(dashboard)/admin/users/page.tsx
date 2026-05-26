'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, UserCheck, Ban, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { getRoleColor, getRoleLabel, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users', {
        params: { page, limit: 10, search: search || undefined, role: roleFilter || undefined },
      });
      setUsers(res.data.data.data);
      setTotal(res.data.data.total);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadUsers(); }, [page, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/users/${id}/approve`);
      toast.success('Usuário aprovado!');
      loadUsers();
    } catch { toast.error('Erro ao aprovar'); }
  };

  const handleBlock = async (id: string) => {
    try {
      await api.patch(`/users/${id}/block`);
      toast.success('Status atualizado!');
      loadUsers();
    } catch { toast.error('Erro ao atualizar'); }
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Gestão de Usuários</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">{total} usuários cadastrados</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:border-emerald-500 outline-none text-sm"
          />
        </form>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm outline-none"
        >
          <option value="">Todos os tipos</option>
          <option value="ADMIN">Administrador</option>
          <option value="DONOR">Doador</option>
          <option value="VOLUNTEER">Voluntário</option>
          <option value="RECEIVER">Recebedor</option>
        </select>
      </div>

      {/* Users table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="px-6 py-4 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">Usuário</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">Tipo</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">Cadastro</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="h-10 bg-[hsl(var(--muted))] rounded animate-pulse-soft" /></td></tr>
                ))
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getRoleColor(u.role)}`}>
                      {getRoleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span className="text-sm">{u.isActive ? 'Ativo' : 'Bloqueado'}</span>
                      {!u.isApproved && (
                        <span className="text-xs text-amber-500 font-medium">• Pendente</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[hsl(var(--muted-foreground))]">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!u.isApproved && (
                        <button
                          onClick={() => handleApprove(u.id)}
                          className="p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-500 transition-colors"
                          title="Aprovar"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleBlock(u.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                        title={u.isActive ? 'Bloquear' : 'Desbloquear'}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[hsl(var(--border))]">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Página {page} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
