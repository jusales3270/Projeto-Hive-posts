'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from 'lucide-react';

interface ModuleInput {
  title: string;
  content: string;
}

export default function NewProject() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [modules, setModules] = useState<ModuleInput[]>([]);

  function addModule() {
    setModules((prev) => [...prev, { title: '', content: '' }]);
  }

  function updateModule(index: number, field: keyof ModuleInput, value: string) {
    setModules((prev) => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  }

  function removeModule(index: number) {
    setModules((prev) => prev.filter((_, i) => i !== index));
  }

  function moveModule(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= modules.length) return;
    const updated = [...modules];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setModules(updated);
  }

  async function handleSave() {
    if (!title.trim()) { alert('Titulo e obrigatorio'); return; }
    setSaving(true);
    try {
      const body: Record<string, unknown> = { title, description: description || undefined };
      if (modules.length > 0) {
        body.modules = modules.filter((m) => m.title.trim()).map((m, i) => ({
          title: m.title,
          content: m.content || undefined,
          order: i,
        }));
      }
      await api.createProject(body);
      router.push('/projects');
    } catch (err: any) { alert(err.message || 'Erro ao salvar'); }
    setSaving(false);
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/projects" className="w-9 h-9 rounded-lg bg-white border border-border flex items-center justify-center hover:border-primary transition-colors">
          <ArrowLeft className="w-4 h-4 text-text-secondary" />
        </Link>
        <div>
          <h1 className="text-page-title text-text-primary">Novo Projeto</h1>
          <p className="text-sm text-text-secondary mt-0.5">Organize um novo curso ou serie de conteudo</p>
        </div>
      </div>

      {/* Title & Description */}
      <div className="card p-6 mb-4">
        <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Titulo do Projeto *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Curso de Marketing Digital 2026"
          className="input-field mb-4"
          maxLength={200}
        />
        <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Descricao</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Sobre o que e este projeto..."
          className="input-field min-h-[80px] resize-y"
          maxLength={5000}
        />
      </div>

      {/* Modules */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Modulos ({modules.length})</label>
          <button onClick={addModule} className="btn-ghost text-xs">
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            Adicionar Modulo
          </button>
        </div>

        {modules.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border rounded-xl">
            <p className="text-sm text-text-muted mb-2">Nenhum modulo adicionado</p>
            <button onClick={addModule} className="text-xs text-primary hover:underline font-medium">
              Adicionar primeiro modulo
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {modules.map((mod, index) => (
              <div key={index} className="border border-border rounded-xl p-4 bg-bg-main/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-text-muted w-6">{index + 1}.</span>
                  <input
                    type="text"
                    value={mod.title}
                    onChange={(e) => updateModule(index, 'title', e.target.value)}
                    placeholder="Titulo do modulo"
                    className="input-field flex-1"
                    maxLength={200}
                  />
                  <div className="flex gap-1">
                    <button onClick={() => moveModule(index, -1)} disabled={index === 0} className="p-1.5 rounded text-text-muted hover:text-primary disabled:opacity-30 transition-colors text-xs">▲</button>
                    <button onClick={() => moveModule(index, 1)} disabled={index === modules.length - 1} className="p-1.5 rounded text-text-muted hover:text-primary disabled:opacity-30 transition-colors text-xs">▼</button>
                    <button onClick={() => removeModule(index)} className="p-1.5 rounded text-text-muted hover:text-status-failed transition-colors">
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
                <textarea
                  value={mod.content}
                  onChange={(e) => updateModule(index, 'content', e.target.value)}
                  placeholder="Conteudo / descricao do modulo..."
                  className="input-field text-xs min-h-[60px] resize-y"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end gap-3">
        <Link href="/projects" className="btn-ghost text-sm">Cancelar</Link>
        <button onClick={handleSave} disabled={saving || !title.trim()} className="btn-cta">
          <Save className="w-4 h-4" strokeWidth={2} />
          {saving ? 'Salvando...' : 'Salvar Projeto'}
        </button>
      </div>
    </div>
  );
}
