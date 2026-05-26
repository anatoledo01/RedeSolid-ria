'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserCircle, Mail, Phone, Shield, Calendar, Pencil, Save,
  Loader2, Camera, MapPin,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { api } from '@/lib/api';
import { getRoleLabel, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await api.patch(`/users/${user?.id}`, editData);
      setUser({ ...user, ...res.data.data });
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-heading font-bold">Meu Perfil</h1>

      {/* Profile header card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-[hsl(var(--card))] shadow-lg">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="pt-14 pb-6 px-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-heading font-bold">{user.name}</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{user.email}</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-sm font-medium flex items-center gap-2 hover:bg-[hsl(var(--muted))] transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> Editar
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Profile info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="font-heading font-semibold mb-4">Informações Pessoais</h3>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Nome completo</label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:border-emerald-500 outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:border-emerald-500 outline-none text-sm"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditData({ name: user.name, phone: user.phone || '' });
                }}
                className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--muted))]"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--muted)/0.5)]">
              <UserCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Nome</p>
                <p className="text-sm font-medium">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--muted)/0.5)]">
              <Mail className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Email</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--muted)/0.5)]">
              <Phone className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Telefone</p>
                <p className="text-sm font-medium">{user.phone || 'Não informado'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--muted)/0.5)]">
              <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Tipo de Conta</p>
                <p className="text-sm font-medium">{getRoleLabel(user.role)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--muted)/0.5)]">
              <Calendar className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Membro desde</p>
                <p className="text-sm font-medium">{user.createdAt ? formatDate(user.createdAt) : '—'}</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Account status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="font-heading font-semibold mb-4">Status da Conta</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${user.isActive !== false ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className="text-sm">{user.isActive !== false ? 'Ativa' : 'Bloqueada'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${user.isApproved !== false ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-sm">{user.isApproved !== false ? 'Aprovada' : 'Pendente de Aprovação'}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
