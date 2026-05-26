'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserCircle, Mail, Phone, Shield, Calendar, Pencil, Save,
  Loader2, CheckCircle, Clock,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { api } from '@/lib/api';
import { getRoleLabel, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function VolunteerProfilePage() {
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-[hsl(var(--card))] shadow-lg">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
        <div className="pt-14 pb-6 px-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-heading font-bold">{user.name}</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                {user.isApproved ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg font-medium">
                    <CheckCircle className="w-3 h-3" /> Voluntário Aprovado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg font-medium">
                    <Clock className="w-3 h-3" /> Aguardando Aprovação
                  </span>
                )}
              </div>
            </div>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-sm font-medium flex items-center gap-2 hover:bg-[hsl(var(--muted))] transition-colors">
                <Pencil className="w-3.5 h-3.5" /> Editar
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6">
        <h3 className="font-heading font-semibold mb-4">Informações Pessoais</h3>
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Nome completo</label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:border-emerald-500 outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <input type="tel" value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:border-emerald-500 outline-none text-sm" placeholder="(11) 99999-9999" />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => { setIsEditing(false); setEditData({ name: user.name, phone: user.phone || '' }); }}
                className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--muted))]">Cancelar</button>
              <button onClick={handleSave} disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {[
              { icon: UserCircle, label: 'Nome', value: user.name },
              { icon: Mail, label: 'Email', value: user.email },
              { icon: Phone, label: 'Telefone', value: user.phone || 'Não informado' },
              { icon: Shield, label: 'Tipo de Conta', value: getRoleLabel(user.role) },
              { icon: Calendar, label: 'Membro desde', value: user.createdAt ? formatDate(user.createdAt) : '—' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--muted)/0.5)]">
                <item.icon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
