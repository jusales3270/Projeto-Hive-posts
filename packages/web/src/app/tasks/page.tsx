'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { Plus, Trash2, Clock, Edit3, User, GripVertical, CalendarDays } from 'lucide-react';

const PRIORITY_BADGE: Record<string, string> = {
  LOW: 'badge-low',
  MEDIUM: 'badge-medium',
  HIGH: 'badge-high',
  URGENT: 'badge-urgent',
};

const PRIORITY_LABEL: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

const COLUMNS = [
  { id: 'PENDING', label: 'Pendentes', color: 'bg-bg-main border-border' },
  { id: 'IN_PROGRESS', label: 'Em Andamento', color: 'bg-blue-50/50 dark:bg-blue-500/10 border-blue-200/50 dark:border-blue-500/20' },
  { id: 'COMPLETED', label: 'Concluídas', color: 'bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-500/20' },
  { id: 'CANCELLED', label: 'Canceladas', color: 'bg-red-50/50 dark:bg-red-500/10 border-red-200/50 dark:border-red-500/20' },
];

export default function TasksKanban() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [tasksRes, membersRes] = await Promise.all([
        api.listTasks({ limit: '500' }), // Load more tasks for Kanban
        api.listMembers().catch(() => []),
      ]);
      setTasks(tasksRes.items);
      setMembers(membersRes);
    } catch { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function handleDelete(id: string) {
    if (!confirm('Deletar esta tarefa?')) return;
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch { alert('Erro ao deletar'); }
  }

  async function handleStatusChange(taskId: string, newStatus: string) {
    // Optimistic update
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await api.updateTask(taskId, { status: newStatus });
    } catch {
      alert('Erro ao mover tarefa');
      loadData(); // Revert on error
    }
  }

  function onDragStart(e: React.DragEvent, taskId: string) {
    e.dataTransfer.setData('taskId', taskId);
  }

  function onDrop(e: React.DragEvent, newStatus: string) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== newStatus) {
        handleStatusChange(taskId, newStatus);
      }
    }
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  const filteredTasks = tasks.filter(t => selectedMember === '' || t.assignedToId === selectedMember);

  const getFiles = (task: any) => {
    let files: any[] = [];
    try {
      if (task.scriptFileUrl) {
        const parsed = task.scriptFileUrl.startsWith('[') ? JSON.parse(task.scriptFileUrl) : [{ url: task.scriptFileUrl }];
        files = [...files, ...parsed];
      }
      if (task.briefingFileUrl) {
        const parsed = task.briefingFileUrl.startsWith('[') ? JSON.parse(task.briefingFileUrl) : [{ url: task.briefingFileUrl }];
        files = [...files, ...parsed];
      }
    } catch (e) { /* ignore */ }
    return files;
  };
  
  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url || '');

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-in h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-page-title text-text-primary flex items-center gap-2">Kanban de Tarefas</h1>
          <p className="text-sm text-text-secondary mt-1">Gerencie o fluxo de produção de conteúdo</p>
        </div>
        <Link href="/tasks/new" className="btn-cta">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nova Tarefa
        </Link>
      </div>

      {/* Tabs / Users */}
      <div className="flex gap-2 mb-6 flex-wrap flex-shrink-0 border-b border-border pb-2">
        <button
          onClick={() => setSelectedMember('')}
          className={`px-4 py-2 rounded-t-lg text-sm font-semibold transition-all border-b-2 ${
            selectedMember === ''
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-card-hover'
          }`}
        >
          Quadro Geral
        </button>
        {members.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMember(m.id)}
            className={`px-4 py-2 rounded-t-lg text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
              selectedMember === m.id
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-card-hover'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            {m.name || m.email.split('@')[0]}
          </button>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 items-start">
        {COLUMNS.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          return (
            <div 
              key={col.id} 
              className={`flex-shrink-0 w-[320px] rounded-xl border ${col.color} flex flex-col max-h-full overflow-hidden`}
              onDrop={(e) => onDrop(e, col.id)}
              onDragOver={onDragOver}
            >
              <div className="p-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-black/20">
                <h3 className="font-semibold text-sm text-text-primary uppercase tracking-wider">{col.label}</h3>
                <span className="text-xs font-bold text-text-secondary bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>
              
              <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-3 min-h-[150px]">
                {colTasks.map(task => {
                  const taskFiles = getFiles(task);
                  return (
                  <div 
                    key={task.id}
                    draggable={selectedMember !== ''}
                    onDragStart={(e) => selectedMember !== '' && onDragStart(e, task.id)}
                    className={`bg-bg-card rounded-lg p-4 shadow-sm border border-border transition-all group ${
                      selectedMember === '' ? 'cursor-default' : 'cursor-grab active:cursor-grabbing hover:shadow-md'
                    }`}
                  >
                    {selectedMember === '' && (
                      <div className="flex items-center gap-1.5 mb-2.5 text-[10px] font-bold text-text-secondary bg-bg-main border border-border w-fit px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <User className="w-3 h-3" />
                        {task.assignedTo ? (task.assignedTo.name || task.assignedTo.email.split('@')[0]) : 'Não atribuído'}
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <span className={`badge ${PRIORITY_BADGE[task.priority] || 'badge-medium'} text-[10px]`}>
                        {PRIORITY_LABEL[task.priority] || task.priority}
                      </span>
                      <GripVertical className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <Link href={`/tasks/${task.id}`} className="block font-semibold text-sm text-text-primary mb-2 hover:text-primary leading-snug">
                      {task.title}
                    </Link>

                    {task.description && (
                      <p className="text-xs text-text-secondary mb-3 line-clamp-3 leading-relaxed">
                        <i className="opacity-80">Descrição:</i> {task.description}
                      </p>
                    )}

                    {taskFiles.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mt-2">
                        {taskFiles.map((f, i) => (
                          <div key={i} className="w-8 h-8 rounded border border-border overflow-hidden bg-bg-main flex items-center justify-center" title={f.name || 'Anexo'}>
                            {isImage(f.url || f.name) ? (
                              <img src={f.url} alt="anexo" className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-[9px] font-bold text-text-secondary">FILE</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {task.recordDate && (
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-3 bg-bg-main w-fit px-2 py-1 rounded-md border border-border">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {new Date(task.recordDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </div>
                    )}

                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/tasks/${task.id}`} className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-md transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(task.id)} className="p-1.5 text-text-secondary hover:text-status-failed hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )})}
                
                {!loading && colTasks.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-border/60 rounded-lg flex items-center justify-center text-text-muted text-xs">
                    Arraste tarefas para cá
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
