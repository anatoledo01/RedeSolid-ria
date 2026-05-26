'use client';
import { useEffect, useState } from 'react';
import { ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/admin/logs', { params: { page, limit: 20 } });
        setLogs(res.data.data.data);
        setTotalPages(res.data.data.totalPages);
      } catch {}
    }
    load();
  }, [page]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold">Logs de Auditoria</h1></div>
      <div className="glass-card rounded-2xl divide-y divide-[hsl(var(--border))]">
        {logs.length === 0 ? (
          <div className="p-8 text-center"><ClipboardList className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-3" /><p className="text-[hsl(var(--muted-foreground))]">Nenhum log encontrado</p></div>
        ) : logs.map((log) => (
          <div key={log.id} className="px-6 py-4 flex items-start gap-4 hover:bg-[hsl(var(--muted)/0.5)]">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5"><ClipboardList className="w-4 h-4 text-blue-500" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{log.action}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{log.entity} {log.entityId ? `• ${log.entityId.slice(0, 8)}...` : ''}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">por {log.user?.name || 'Sistema'} • {formatDateTime(log.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm">{page} / {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}
