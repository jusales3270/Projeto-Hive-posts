'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { ArrowLeft, Save, Megaphone, Loader2, Upload, FileText, X, Link as LinkIcon, ExternalLink, User } from 'lucide-react';

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
  { value: 'PENDING', label: 'Pendente', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { value: 'IN_PROGRESS', label: 'Em Andamento', color: 'bg-blue-50 text-status-scheduled border-blue-200' },
  { value: 'COMPLETED', label: 'Concluido', color: 'bg-emerald-50 text-status-published border-emerald-200' },
  { value: 'CANCELLED', label: 'Cancelado', color: 'bg-red-50 text-status-failed border-red-200' },
];

function toLocalDatetime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function FileUploadField({ label, files, uploading, onUpload, onRemove }: {
  label: string;
  files: { url: string; name: string }[];
  uploading: boolean;
  onUpload: (files: File[]) => void;
  onRemove: (index: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
  return (
    <div className="mt-3">
      <input ref={inputRef} type="file" multiple className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg,.gif,.webp" onChange={(e) => { 
        if (e.target.files?.length) onUpload(Array.from(e.target.files)); 
        e.target.value = ''; 
      }} />
      
      {files.length > 0 && (
        <div className="space-y-2 mb-3">
          {files.map((file, idx) => {
            const isImg = isImage(file.name || file.url);
            return (
            <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-bg-main border border-border shadow-sm">
              {isImg ? (
                <div className="w-10 h-10 rounded-md overflow-hidden bg-bg-card flex-shrink-0 border border-border">
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                  <FileText className="w-5 h-5" strokeWidth={1.5} />
                </div>
              )}
              <div className="flex-1 min-w-0 flex flex-col">
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-text-primary hover:text-primary hover:underline truncate">
                  {file.name || 'Arquivo'}
                </a>
                <span className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">{isImg ? 'Imagem' : 'Documento'}</span>
              </div>
              <button type="button" onClick={() => onRemove(idx)} className="p-1.5 rounded-md hover:bg-status-failed/10 hover:text-status-failed transition-colors flex-shrink-0 text-text-muted">
                <X className="w-4 h-4" />
              </button>
            </div>
          )})}
        </div>
      )}
      
      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-xs font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors">
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" strokeWidth={2} />}
        {uploading ? 'Enviando...' : label}
      </button>
    </div>
  );
}

function getFileName(url: string): string {
  if (!url) return '';
  const parts = url.split('/');
  return parts[parts.length - 1] || 'Arquivo';
}

export default function EditTask() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [scriptUploading, setScriptUploading] = useState(false);
  const [briefingUploading, setBriefingUploading] = useState(false);
  const [scriptFiles, setScriptFiles] = useState<{ url: string; name: string }[]>([]);
  const [briefingFiles, setBriefingFiles] = useState<{ url: string; name: string }[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', platform: 'INSTAGRAM', priority: 'MEDIUM', status: 'PENDING',
    recordDate: '', publishDate: '', script: '', driveLink: '',
    isSponsored: false, sponsorName: '', sponsorBriefing: '', sponsorContact: '', sponsorDeadline: '', projectId: '', assignedToId: '',
  });

  useEffect(() => {
    Promise.all([
      api.getTask(id),
      api.listProjects({ limit: '100' }).catch(() => ({ items: [] })),
      api.listMembers().catch(() => []),
    ]).then(([task, proj, mems]) => {
      setForm({
        title: task.title || '', description: task.description || '', platform: task.platform, priority: task.priority, status: task.status,
        recordDate: toLocalDatetime(task.recordDate), publishDate: toLocalDatetime(task.publishDate),
        script: task.script || '', driveLink: task.driveLink || '',
        isSponsored: task.isSponsored || false, sponsorName: task.sponsorName || '', sponsorBriefing: task.sponsorBriefing || '',
        sponsorContact: task.sponsorContact || '', sponsorDeadline: toLocalDatetime(task.sponsorDeadline), projectId: task.projectId || '',
        assignedToId: task.assignedToId || '',
      });
      if (task.scriptFileUrl) {
        try {
          if (task.scriptFileUrl.startsWith('[')) setScriptFiles(JSON.parse(task.scriptFileUrl));
          else setScriptFiles([{ url: task.scriptFileUrl, name: getFileName(task.scriptFileUrl) }]);
        } catch { setScriptFiles([{ url: task.scriptFileUrl, name: getFileName(task.scriptFileUrl) }]); }
      }
      if (task.briefingFileUrl) {
        try {
          if (task.briefingFileUrl.startsWith('[')) setBriefingFiles(JSON.parse(task.briefingFileUrl));
          else setBriefingFiles([{ url: task.briefingFileUrl, name: getFileName(task.briefingFileUrl) }]);
        } catch { setBriefingFiles([{ url: task.briefingFileUrl, name: getFileName(task.briefingFileUrl) }]); }
      }
      setProjects(proj.items);
      setMembers(mems);
      setLoading(false);
    }).catch(() => { router.push('/tasks'); });
  }, [id]);

  function set(key: string, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleFileUpload(files: File[], target: 'script' | 'briefing') {
    const setUploading = target === 'script' ? setScriptUploading : setBriefingUploading;
    const setFiles = target === 'script' ? setScriptFiles : setBriefingFiles;
    setUploading(true);
    for (const file of files) {
      try {
        const result = await api.uploadFile(file);
        setFiles((prev) => [...prev, { url: result.fileUrl, name: result.fileName }]);
      } catch (err: any) {
        alert(err.message || 'Erro ao enviar arquivo');
      }
    }
    setUploading(false);
  }

  async function handleSave() {
    if (!form.title.trim()) { alert('Titulo e obrigatorio'); return; }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title: form.title, platform: form.platform, priority: form.priority, status: form.status,
        description: form.description || null, script: form.script || null, driveLink: form.driveLink || null,
        isSponsored: form.isSponsored,
        scriptFileUrl: scriptFiles.length > 0 ? JSON.stringify(scriptFiles) : null,
        assignedToId: form.assignedToId || null,
      };
      if (form.recordDate) body.recordDate = new Date(form.recordDate).toISOString();
      if (form.publishDate) body.publishDate = new Date(form.publishDate).toISOString();
      if (form.isSponsored) {
        body.sponsorName = form.sponsorName || null;
        body.sponsorBriefing = form.sponsorBriefing || null;
        body.briefingFileUrl = briefingFiles.length > 0 ? JSON.stringify(briefingFiles) : null;
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

  const hasScript = form.script.trim().length > 0 || scriptFiles.length > 0;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/tasks" className="w-9 h-9 rounded-lg bg-white border border-border flex items-center justify-center hover:border-primary transition-colors">
          <ArrowLeft className="w-4 h-4 text-text-secondary" />
        </Link>
        <div className="flex-1">
          <h1 className="text-page-title text-text-primary">Editar Tarefa</h1>
        </div>
        {hasScript && (
          <Link href={`/tasks/${id}/script`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-primary border border-primary/20 hover:bg-primary/5 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
            Ver Roteiro
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column - Main content */}
        <div className="lg:col-span-7 space-y-4">
          {/* Title & Description */}
          <div className="card p-6">
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Titulo *</label>
            <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} className="input-field mb-4" maxLength={200} />
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Descricao</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Detalhes sobre a tarefa..." className="input-field min-h-[80px] resize-y" maxLength={5000} />
          </div>

          {/* Script */}
          <div className="card p-6">
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Roteiro / Script</label>
            <textarea value={form.script} onChange={(e) => set('script', e.target.value)} placeholder="Escreva o roteiro do video aqui..." className="input-field min-h-[300px] resize-y font-mono text-sm" />
            <FileUploadField
              label="Enviar arquivo do roteiro"
              files={scriptFiles}
              uploading={scriptUploading}
              onUpload={(f) => handleFileUpload(f, 'script')}
              onRemove={(idx) => setScriptFiles((prev) => prev.filter((_, i) => i !== idx))}
            />
          </div>


        </div>

        {/* Right Column - Config sidebar */}
        <div className="lg:col-span-5 space-y-4">
          {/* Status */}
          <div className="card p-6">
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => set('status', s.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all border text-center ${
                    form.status === s.value
                      ? s.color + ' border-current'
                      : 'bg-white text-text-secondary border-border hover:border-primary'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Assignee & Priority */}
          <div className="card p-6">
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" strokeWidth={2} />
              Atribuir a
            </label>
            <select
              value={form.assignedToId}
              onChange={(e) => set('assignedToId', e.target.value)}
              className="input-field mb-5"
            >
              <option value="">Não atribuído</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name || m.email}
                </option>
              ))}
            </select>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Prioridade</label>
            <div className="flex gap-2 flex-wrap">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => set('priority', p.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    form.priority === p.value ? p.color + ' border-current' : 'bg-white text-text-secondary border-border hover:border-primary'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>



          {/* Dates */}
          <div className="card p-6">
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Data de Gravacao</label>
            <input type="datetime-local" value={form.recordDate} onChange={(e) => set('recordDate', e.target.value)} className="input-field mb-4" />
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Data de Publicacao</label>
            <input type="datetime-local" value={form.publishDate} onChange={(e) => set('publishDate', e.target.value)} className="input-field" />
          </div>

          {/* Drive Link */}
          <div className="card p-6">
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5" strokeWidth={2} />
              Link do Drive
            </label>
            {form.driveLink ? (
              <div className="flex gap-2 items-center">
                <a href={form.driveLink} target="_blank" rel="noopener noreferrer" className="flex-1 input-field flex items-center gap-2 text-primary hover:underline bg-bg-main overflow-hidden text-ellipsis whitespace-nowrap">
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{form.driveLink}</span>
                </a>
                <button type="button" onClick={() => set('driveLink', '')} className="p-2.5 rounded-lg border border-border text-text-muted hover:text-red-500 hover:border-red-200 transition-colors" title="Remover link">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <input type="url" value={form.driveLink} onChange={(e) => set('driveLink', e.target.value)} placeholder="https://drive.google.com/..." className="input-field" />
            )}
          </div>

          {/* Save */}
          <div className="flex gap-3">
            <Link href="/tasks" className="btn-ghost text-sm flex-1 text-center">Cancelar</Link>
            <button onClick={handleSave} disabled={saving || !form.title.trim()} className="btn-cta flex-1">
              <Save className="w-4 h-4" strokeWidth={2} />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
