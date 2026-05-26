'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function NewDonationPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', categoryId: '', quantity: 1, locationText: '',
  });

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/donations', formData);
      toast.success('Doação criada com sucesso!');
      router.push('/donor/donations');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao criar doação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/donor" className="p-2 rounded-xl hover:bg-[hsl(var(--muted))]"><ArrowLeft className="w-5 h-5" /></Link>
        <div><h1 className="text-2xl font-heading font-bold">Nova Doação</h1><p className="text-[hsl(var(--muted-foreground))] text-sm">Publique uma nova doação para quem precisa</p></div>
      </div>

      <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 sm:p-8 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Título *</label>
          <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:border-emerald-500 outline-none text-sm" placeholder="Ex: Roupas de inverno" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Descrição *</label>
          <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:border-emerald-500 outline-none text-sm min-h-[100px] resize-y" placeholder="Descreva os itens..." required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Categoria *</label>
            <select value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:border-emerald-500 outline-none text-sm" required>
              <option value="">Selecione...</option>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.icon} {c.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Quantidade</label>
            <input type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
              className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:border-emerald-500 outline-none text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Localização</label>
          <input type="text" value={formData.locationText} onChange={(e) => setFormData({...formData, locationText: e.target.value})}
            className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:border-emerald-500 outline-none text-sm" placeholder="Rua, Bairro, Cidade - Estado" />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/donor" className="px-6 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--muted))]">Cancelar</Link>
          <button type="submit" disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publicar Doação'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
