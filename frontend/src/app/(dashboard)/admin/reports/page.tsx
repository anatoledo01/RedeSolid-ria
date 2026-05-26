'use client';
import { FileText } from 'lucide-react';

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold">Relatórios</h1><p className="text-[hsl(var(--muted-foreground))] mt-1">Exporte relatórios do sistema</p></div>
      <div className="glass-card rounded-2xl p-8 text-center">
        <FileText className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
        <h3 className="font-heading font-semibold mb-2">Exportar Relatório de Doações</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">Baixe um relatório completo em formato CSV</p>
        <a href="/api/admin/reports/export" download className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium inline-block hover:opacity-90">
          Exportar CSV
        </a>
      </div>
    </div>
  );
}
