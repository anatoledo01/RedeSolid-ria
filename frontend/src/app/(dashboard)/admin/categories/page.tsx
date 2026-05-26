'use client';
import { useEffect, useState } from 'react';
import { FolderOpen, Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCat, setNewCat] = useState({ name: '', description: '', icon: '' });
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try { const res = await api.get('/categories'); setCategories(res.data.data); } catch {}
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/categories', newCat);
      toast.success('Categoria criada!');
      setNewCat({ name: '', description: '', icon: '' });
      setShowForm(false);
      load();
    } catch { toast.error('Erro ao criar categoria'); }
  };

  const handleDelete = async (id: string) => {
    try { await api.delete(`/categories/${id}`); toast.success('Categoria removida!'); load(); } catch { toast.error('Erro'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-heading font-bold">Categorias</h1><p className="text-[hsl(var(--muted-foreground))] mt-1">{categories.length} categorias</p></div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" />Nova</button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="glass-card rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input value={newCat.name} onChange={(e) => setNewCat({...newCat, name: e.target.value})} placeholder="Nome" className="px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm outline-none" required />
            <input value={newCat.description} onChange={(e) => setNewCat({...newCat, description: e.target.value})} placeholder="Descrição" className="px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm outline-none" />
            <input value={newCat.icon} onChange={(e) => setNewCat({...newCat, icon: e.target.value})} placeholder="Ícone (emoji)" className="px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm outline-none" />
          </div>
          <button type="submit" className="px-6 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium">Salvar</button>
        </form>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="glass-card rounded-2xl p-5 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{c.icon || '📦'}</span>
              <button onClick={() => handleDelete(c.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            <h3 className="font-semibold text-sm">{c.name}</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{c.description || 'Sem descrição'}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">{c._count?.donations || 0} doações</p>
          </div>
        ))}
      </div>
    </div>
  );
}
