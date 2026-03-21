'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { Plus, FolderKanban, Trash2 } from 'lucide-react';

const STATUS_BADGE: Record<string, string> = {
  PLANNING: 'badge-planning',
  IN_PROGRESS: 'badge-in-progress',
  COMPLETED: 'badge-completed',
  ARCHIVED: 'badge-archived',
};

const STATUS_LABEL: Record<string, string> = {
  PLANNING: 'Planejamento',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluido',
  ARCHIVED: 'Arquivado',
};

export default function ProjectsList() {
  const [projects, setProjects] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('');

  async function loadProjects() {
    try {
      const params: Record<string, string> = { limit: '50' };
      if (filter) params.status = filter;
      const result = await api.listProjects(params);
      setProjects(result.items);
      setTotal(result.total);
    } catch { /* ignore */ }
  }

  useEffect(() => { loadProjects(); }, [filter]);

  async function handleDelete(id: string) {
    if (!confirm('Deletar este projeto e todos os modulos?')) return;
    try {
      await api.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setTotal((t) => t - 1);
    } catch { alert('Erro ao deletar'); }
  }

  const filters = [
    { value: '', label: 'Todos' },
    { value: 'PLANNING', label: 'Planejamento' },
    { value: 'IN_PROGRESS', label: 'Em Andamento' },
    { value: 'COMPLETED', label: 'Concluidos' },
    { value: 'ARCHIVED', label: 'Arquivados' },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-page-title text-text-primary">Projetos</h1>
          <p className="text-sm text-text-secondary mt-1">{total} projetos no total</p>
        </div>
        <Link href="/projects/new" className="btn-cta">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Novo Projeto
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
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

      {/* Grid */}
      {projects.length === 0 ? (
        <div className="card p-16 text-center">
          <FolderKanban className="w-12 h-12 text-text-muted mx-auto mb-3" strokeWidth={1} />
          <p className="text-text-muted text-sm">Nenhum projeto encontrado</p>
          <Link href="/projects/new" className="text-xs text-primary hover:underline mt-2 inline-block font-medium">
            Criar primeiro projeto
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const totalModules = project.modules?.length || 0;
            const recorded = project.modules?.filter((m: any) => m.isRecorded).length || 0;
            const progress = totalModules > 0 ? Math.round((recorded / totalModules) * 100) : 0;
            return (
              <div key={project.id} className="card p-5 hover:-translate-y-0.5 relative group">
                <div className="flex items-start justify-between mb-3">
                  <Link href={`/projects/${project.id}`} className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-bold text-text-primary truncate hover:text-primary transition-colors">{project.title}</h3>
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${STATUS_BADGE[project.status] || 'badge-planning'}`}>
                      {STATUS_LABEL[project.status] || project.status}
                    </span>
                    <button onClick={() => handleDelete(project.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-text-muted hover:text-status-failed transition-all">
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
                {project.description && (
                  <p className="text-xs text-text-secondary line-clamp-2 mb-3">{project.description}</p>
                )}
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-text-secondary">{recorded}/{totalModules} modulos gravados</span>
                  <span className="text-xs font-semibold text-primary">{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-bg-main rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent-pink rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {project._count?.tasks > 0 && (
                  <p className="text-[11px] text-text-muted mt-2">{project._count.tasks} tarefa(s) vinculada(s)</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
