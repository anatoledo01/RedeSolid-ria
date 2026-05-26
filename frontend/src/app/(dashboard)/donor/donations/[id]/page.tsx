'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Package, MapPin, Calendar, User, Star, Truck,
  CheckCircle, Edit3, XCircle, Loader2, Clock,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { getStatusColor, getStatusLabel, formatDate, formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';

export default function DonationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [donation, setDonation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '', quantity: 1, locationText: '' });

  const loadDonation = async () => {
    try {
      const res = await api.get(`/donations/${params.id}`);
      setDonation(res.data.data);
      setEditData({
        title: res.data.data.title,
        description: res.data.data.description,
        quantity: res.data.data.quantity,
        locationText: res.data.data.locationText || '',
      });
    } catch {
      toast.error('Doação não encontrada');
      router.push('/donor/donations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadDonation(); }, [params.id]);

  const handleUpdate = async () => {
    try {
      await api.patch(`/donations/${params.id}`, editData);
      toast.success('Doação atualizada!');
      setIsEditing(false);
      loadDonation();
    } catch {
      toast.error('Erro ao atualizar');
    }
  };

  const handleCancel = async () => {
    try {
      await api.patch(`/donations/${params.id}/status`, { status: 'CANCELLED' });
      toast.success('Doação cancelada');
      loadDonation();
    } catch {
      toast.error('Erro ao cancelar');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!donation) return null;

  const statusTimeline = [
    { status: 'AVAILABLE', label: 'Publicada', icon: Package, done: true },
    { status: 'RESERVED', label: 'Reservada', icon: Clock, done: ['RESERVED', 'IN_TRANSIT', 'DELIVERED'].includes(donation.status) },
    { status: 'IN_TRANSIT', label: 'Em Transporte', icon: Truck, done: ['IN_TRANSIT', 'DELIVERED'].includes(donation.status) },
    { status: 'DELIVERED', label: 'Entregue', icon: CheckCircle, done: donation.status === 'DELIVERED' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[hsl(var(--muted))] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-heading font-bold">Detalhes da Doação</h1>
        </div>
        {donation.status === 'AVAILABLE' && !isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-sm font-medium flex items-center gap-2 hover:bg-[hsl(var(--muted))] transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" /> Editar
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl border border-red-500/30 text-red-500 text-sm font-medium flex items-center gap-2 hover:bg-red-500/10 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" /> Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Status timeline */}
      {donation.status !== 'CANCELLED' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            {statusTimeline.map((step, i) => (
              <div key={step.status} className="flex items-center flex-1">
                <div className="flex flex-col items-center text-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    step.done
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs mt-2 font-medium ${step.done ? 'text-emerald-500' : 'text-[hsl(var(--muted-foreground))]'}`}>
                    {step.label}
                  </span>
                </div>
                {i < statusTimeline.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded ${step.done ? 'bg-emerald-500' : 'bg-[hsl(var(--muted))]'}`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {donation.status === 'CANCELLED' && (
        <div className="glass-card rounded-2xl p-6 border-red-500/20">
          <div className="flex items-center gap-3 text-red-500">
            <XCircle className="w-6 h-6" />
            <span className="font-heading font-semibold">Esta doação foi cancelada</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-card rounded-2xl p-6"
        >
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Título</label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:border-emerald-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Descrição</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:border-emerald-500 outline-none text-sm min-h-[120px] resize-y"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    value={editData.quantity}
                    onChange={(e) => setEditData({ ...editData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:border-emerald-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Localização</label>
                  <input
                    type="text"
                    value={editData.locationText}
                    onChange={(e) => setEditData({ ...editData, locationText: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:border-emerald-500 outline-none text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--muted))]">
                  Cancelar
                </button>
                <button onClick={handleUpdate} className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:opacity-90">
                  Salvar Alterações
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(donation.status)}`}>
                  {getStatusLabel(donation.status)}
                </span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  {donation.category?.icon} {donation.category?.name}
                </span>
              </div>
              <h2 className="text-xl font-heading font-bold mb-3">{donation.title}</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] whitespace-pre-wrap leading-relaxed mb-6">
                {donation.description}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-emerald-500" />
                  <span>Quantidade: <strong>{donation.quantity}</strong></span>
                </div>
                {donation.locationText && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span className="truncate">{donation.locationText}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span>Criada em {formatDate(donation.createdAt)}</span>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Side info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Receiver info */}
          {donation.receiver && (
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-medium mb-3">Recebedor</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                  {donation.receiver.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{donation.receiver.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{donation.receiver.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Delivery info */}
          {donation.deliveries?.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-medium mb-3">Entrega</h3>
              {donation.deliveries.map((del: any) => (
                <div key={del.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    {del.volunteer?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{del.volunteer?.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-md ${getStatusColor(del.status)}`}>
                      {getStatusLabel(del.status)}
                    </span>
                    {del.deliveredAt && (
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                        Entregue em {formatDateTime(del.deliveredAt)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reviews */}
          {donation.reviews?.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-medium mb-3">Avaliações</h3>
              <div className="space-y-3">
                {donation.reviews.map((rev: any) => (
                  <div key={rev.id} className="border-b border-[hsl(var(--border))] last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{rev.author?.name}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {rev.comment && (
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{rev.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
