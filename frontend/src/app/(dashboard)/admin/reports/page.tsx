'use client';
import { FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function AdminReportsPage() {
  const [downloading, setDownloading] = useState(false);

  async function handleExport() {
    setDownloading(true);
    try {
      // Usa axios (api) para que o interceptor inclua o Bearer token.
      const response = await api.get('/admin/reports/export', {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'relatorio-doacoes.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Relatório exportado com sucesso');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Falha ao exportar relatório';
      toast.error(message);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Relatórios</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Exporte relatórios do sistema
        </p>
      </div>
      <div className="glass-card rounded-2xl p-8 text-center">
        <FileText className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
        <h3 className="font-heading font-semibold mb-2">
          Exportar Relatório de Doações
        </h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
          Baixe um relatório completo em formato CSV
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={downloading}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium inline-flex items-center gap-2 hover:opacity-90 disabled:opacity-60"
        >
          {downloading && <Loader2 className="w-4 h-4 animate-spin" />}
          {downloading ? 'Exportando...' : 'Exportar CSV'}
        </button>
      </div>
    </div>
  );
}
