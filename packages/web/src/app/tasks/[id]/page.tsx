'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { ArrowLeft, Save, Megaphone, Loader2 } from 'lucide-react';

const PLATFORMS = [
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'META_ADS', label: 'Meta Ads' },
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'OTHER', label: 'Outro' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Baixa', color: 'bg-emerald-50 text-status-published border-emerald-200' },
  { value: 'MEDIUM', label: 'Media', color: 'bg-blue-50 text-status-scheduled border-blue-200' },
  { value: 'HIGH', label: 'Alta', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { value: 'URGENT', label: 'Urgente', color: 'bg-red-50 text-status-failed border-red-200' },
];

const STATUSES = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'IN_PROGRESS', label: 'Em Andamento' },
  { value: 'COMPLETED', label: 'Concluido' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

function toLocalDatetime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function EditTask() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', platform: 'INSTAGRAM', priority: 'MEDIUM', status: 'PENDING',
    recordDate: '', publishDate: '', script: '', driveLink: '',
    isSponsored: false, sponsorName: '', sponsorBriefing: '', sponsorContact: '', sponsorDeadline: '', projectId: '',
  });

  useEffect(() => {
    Promise.all([
      api.getTask(id),
      api.listProjects({ limit: '100' }).catch(() => ({ items: [] })),
    ]).then(([task, proj]) => {
      setForm({
        title: task.title || '', description: task.description || '', platform: task.platform, priority: task.priority, status: task.status,
        recordDate: toLocalDatetime(task.recordDate), publishDate: toLocalDatetime(task.publishDate),
        script: task.script || '', driveLink: task.driveLink || '',
        isSponsored: task.isSponsored || false, sponsorName: task.sponsorName || '', sponsorBriefing: task.sponsorBriefing || '',
        sponsorContact: task.sponsorContact || '', sponsorDeadline: toLocalDatetime(task.sponsorDeadline), projectId: task.projectId || '',
      });
      setProjects(proj.items);
      setLoading(false);
    }).catch(() => { router.push('/tasks'); });
  }, [id]);

  function set(key: string, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    if (!form.title.trim()) { alert('Titulo e obrigatorio'); return; }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title: form.title, platform: form.platform, priority: form.priority, status: form.status,
        description: form.description || null, script: form.script || null, driveLink: form.driveLink || null,
        isSponsored: form.isSponsored, projectId: form.projectId || null,
      };
      if (form.recordDate) body.recordDate = new Date(form.recordDate).toISOString();
      if (form.publishDate) body.publishDate = new Date(form.publishDate).toISOString();
      if (form.isSponsored) {
        body.sponsorName = form.sponsorName || null;
        body.sponsorBriefing = form.sponsorBriefing || null;
        body.sponsorContact = form.sponsorContact || null;
        if (form.sponsorDeadline) body.sponsorDeadline = new Date(form.sponsorDeadline).toISOString();
      }
      await api.updateTask(id, body);
      router.push('/tasks');
    } catch (err: any) { alert(err.message || 'Erro ao salvar'); }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/tasks" className="w-9 h-9 rounded-lg bg-white border border-border flex items-center justify-center hover:border-primary transition-colors">
          <ArrowLeft className="w-4 h-4 text-text-secondary" />
        </Link>
        <div className="flex-1">
          <h1 className="text-page-title text-text-primary">Editar Tarefa</h1>
        </div>
      </div>

      {/* Status */}
      <div className="card p-6 mb-4">
        <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Status</label>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => set('status', s.value)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${
                form.status === s.value
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-text-secondary border-border hover:border-primary'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title & Description */}
      <div className="card p-6 mb-4">
        <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Titulo *</label>
        <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} className="input-field mb-4" maxLength={200} />
        <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Descricao</label>
        <textarea value={form.description} onChange={(e) => set('description', e.target.value)} className="input-field min-h-[80px] resize-y" maxLength={5000} />
      </div>

      {/* Platform & Priority */}
      <div className="card p-6 mb-4">
        <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Plataforma</label>
        <div className="flex gap-2 flex-wrap mb-5">
          {PLATFORMS.map((p) => (
            <button key={p.value} onClick={() => set('platform', p.value)} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${form.platform === p.value ? 'bg-primary text-white border-primary' : 'bg-white text-text-secondary border-border hover:border-primary'}`}>{p.label}</button>
          ))}
        </div>
        <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Prioridade</label>
        <div className="flex gap-2 flex-wrap">
          {PRIORITIES.map((p) => (
            <button key={p.value} onClick={() => set('priority', p.value)} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${form.priority === p.value ? p.color + ' border-current' : 'bg-white text-text-secondary border-border hover:border-primary'}`}>{p.label}</button>
          ))}
        </div>
      </div>

      {/* Dates */}
      <div className="card p-6 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Data de Gravacao</label>
            <input type="datetime-local" value={form.recordDate} onChange={(e) => set('recordDate', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Data de Publicacao</label>
            <input type="datetime-local" value={form.publishDate} onChange={(e) => set('publishDate', e.target.value)} className="input-field" />
          </div>
        </div>
      </div>

      {/* Script */}
      <div className="card p-6 mb-4">
        <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Roteiro / Script</label>
        <textarea value={form.script} onChange={(e) => set('script', e.target.value)} className="input-field min-h-[200px] resize-y font-mono text-sm" />
      </div>

      {/* Drive Link */}
      <div className="card p-6 mb-4">
        <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Link do Drive</label>
        <input type="url" value={form.driveLink} onChange={(e) => set('driveLink', e.target.value)} placeholder="https://drive.google.com/..." className="input-field" />
      </div>

      {/* Project */}
      {projects.length > 0 && (
        <div className="card p-6 mb-4">
          <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Projeto</label>
          <select value={form.projectId} onChange={(e) => set('projectId', e.target.value)} className="input-field">
            <option value="">Nenhum projeto</option>
            {projects.map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}
          </select>
        </div>
      )}

      {/* Sponsored */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => set('isSponsored', !form.isSponsored)} className={`w-10 h-6 rounded-full transition-colors relative ${form.isSponsored ? 'bg-primary' : 'bg-gray-200'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isSponsored ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-accent-orange" strokeWidth={2} />
            <span className="text-sm font-semibold text-text-primary">Conteudo Patrocinado</span>
          </div>
        </div>
        {form.isSponsored && (
          <div className="space-y-4 pt-2 border-t border-border">
            <div className="mt-4">
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Empresa / Marca</label>
              <input type="text" value={form.sponsorName} onChange={(e) => set('sponsorName', e.target.value)} className="input-field" maxLength={200} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Briefing</label>
              <textarea value={form.sponsorBriefing} onChange={(e) => set('sponsorBriefing', e.target.value)} className="input-field min-h-[120px] resize-y" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Contato</label>
                <input type="text" value={form.sponsorContact} onChange={(e) => set('sponsorContact', e.target.value)} className="input-field" maxLength={200} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Deadline da Entrega</label>
                <input type="datetime-local" value={form.sponsorDeadline} onChange={(e) => set('sponsorDeadline', e.target.value)} className="input-field" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end gap-3">
        <Link href="/tasks" className="btn-ghost text-sm">Cancelar</Link>
        <button onClick={handleSave} disabled={saving || !form.title.trim()} className="btn-cta">
          <Save className="w-4 h-4" strokeWidth={2} />
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  );
}
