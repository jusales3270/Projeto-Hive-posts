'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { Plus, Trash2, CheckSquare, Clock, Megaphone, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'badge-pending',
  IN_PROGRESS: 'badge-in-progress',
  COMPLETED: 'badge-completed',
  CANCELLED: 'badge-cancelled',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluido',
  CANCELLED: 'Cancelado',
};

const PRIORITY_BADGE: Record<string, string> = {
  LOW: 'badge-low',
  MEDIUM: 'badge-medium',
  HIGH: 'badge-high',
  URGENT: 'badge-urgent',
};

const PRIORITY_LABEL: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

const PLATFORM_LABEL: Record<string, string> = {
  YOUTUBE: 'YouTube',
  INSTAGRAM: 'Instagram',
  META_ADS: 'Meta Ads',
  TIKTOK: 'TikTok',
  OTHER: 'Outro',
};

export default function TasksList() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);

  async function loadTasks() {
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (filter) params.status = filter;
      const result = await api.listTasks(params);
      setTasks(result.items);
      setTotal(result.total);
    } catch { /* ignore */ }
  }

  useEffect(() => { loadTasks(); }, [filter, page]);

  async function handleDelete(id: string) {
    if (!confirm('Deletar esta tarefa?')) return;
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setTotal((t) => t - 1);
    } catch { alert('Erro ao deletar'); }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      await api.updateTask(id, { status });
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
    } catch { alert('Erro ao atualizar status'); }
  }

  const filters = [
    { value: '', label: 'Todas' },
    { value: 'PENDING', label: 'Pendentes' },
    { value: 'IN_PROGRESS', label: 'Em Andamento' },
    { value: 'COMPLETED', label: 'Concluidas' },
    { value: 'CANCELLED', label: 'Canceladas' },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-page-title text-text-primary">Tarefas</h1>
          <p className="text-sm text-text-secondary mt-1">{total} tarefas no total</p>
        </div>
        <Link href="/tasks/new" className="btn-cta">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nova Tarefa
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => { setFilter(f.value); setPage(1); }}
            className={`px-4 py-2 rounded-btn text-xs font-semibold transition-all duration-200 ${
              filter === f.value
                ? 'bg-primary text-white shadow-cta'
                : 'bg-white text-text-secondary border border-border hover:border-primary hover:text-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Tarefa</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Status</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Prioridade</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Gravacao</th>
              <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-text-muted uppercase tracking-wider">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0EFEC]">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-bg-card-hover transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckSquare className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link href={`/tasks/${task.id}`} className="text-sm text-text-primary font-medium hover:text-primary truncate max-w-xs">
                          {task.title}
                        </Link>
                        {task.isSponsored && (
                          <Megaphone className="w-3.5 h-3.5 text-accent-orange flex-shrink-0" strokeWidth={2} />
                        )}
                      </div>
                      <span className="text-xs text-text-secondary bg-bg-main px-2 py-0.5 rounded-badge font-medium">
                        {PLATFORM_LABEL[task.platform] || task.platform}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className={`badge ${STATUS_BADGE[task.status] || 'badge-pending'} cursor-pointer border-none appearance-none pr-5 bg-no-repeat bg-right`}
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23636E72' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e\")", backgroundSize: '12px', backgroundPosition: 'right 4px center' }}
                  >
                    <option value="PENDING">Pendente</option>
                    <option value="IN_PROGRESS">Em Andamento</option>
                    <option value="COMPLETED">Concluido</option>
                    <option value="CANCELLED">Cancelado</option>
                  </select>
                </td>
                <td className="px-5 py-4">
                  <span className={`badge ${PRIORITY_BADGE[task.priority] || 'badge-medium'}`}>
                    {PRIORITY_LABEL[task.priority] || task.priority}
                  </span>
                </td>
                <td className="px-5 py-4 text-text-secondary text-xs">
                  {task.recordDate
                    ? new Date(task.recordDate).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                    : <span className="text-text-muted">Sem data</span>}
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-1.5 justify-end">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="px-3 py-1.5 rounded-badge text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 inline mr-1" strokeWidth={1.5} />
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="px-2.5 py-1.5 rounded-badge text-xs bg-red-50 text-status-failed hover:bg-red-100 transition-colors"
                      title="Deletar"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <CheckSquare className="w-12 h-12 text-text-muted mx-auto mb-3" strokeWidth={1} />
                  <p className="text-text-muted text-sm">Nenhuma tarefa encontrada</p>
                  <Link href="/tasks/new" className="text-xs text-primary hover:underline mt-2 inline-block font-medium">
                    Criar primeira tarefa
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-text-secondary">
            Mostrando {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} de {total}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-xs disabled:opacity-30">Anterior</button>
            <span className="px-3 py-1.5 text-xs text-text-secondary">Pagina {page}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={tasks.length < 20} className="btn-ghost text-xs disabled:opacity-30">Proxima</button>
          </div>
        </div>
      )}
    </div>
  );
}
