'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { useTheme } from 'next-themes';
import { 
  Send, 
  Upload, 
  Link as LinkIcon, 
  FileText, 
  Calendar, 
  User, 
  Building2, 
  CheckCircle2,
  Loader2,
  PlusCircle,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function PublicDemandForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [files, setFiles] = useState<Array<{ url: string; name: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    secretariaName: '',
    requesterName: '',
    title: '',
    description: '',
    publishDate: '',
    driveLink: '',
  });

  // Determine logo based on theme
  const currentTheme = resolvedTheme || theme;
  const logoSrc = currentTheme === 'dark' ? '/logos/logo-white.png' : '/logos/logo-black.png';

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await api.publicUploadFile(file);
      setFiles(prev => [...prev, { url: res.fileUrl, name: res.fileName }]);
    } catch (err) {
      alert('Erro ao fazer upload do arquivo');
    } finally {
      setUploading(false);
    }
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.publicCreateDemand({
        ...formData,
        publishDate: formData.publishDate ? new Date(formData.publishDate).toISOString() : null,
        briefingFileUrl: files.length > 0 ? JSON.stringify(files) : null,
      });
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar demanda');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-md w-full bg-bg-card rounded-3xl p-8 shadow-2xl border border-border flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Demanda Enviada!</h1>
          <p className="text-text-secondary mb-8">
            Sua solicitação foi recebida com sucesso pela equipe da SECOM. 
            Você receberá atualizações em breve.
          </p>
          <button 
            onClick={() => {
              setSubmitted(false);
              setFormData({
                secretariaName: '',
                requesterName: '',
                title: '',
                description: '',
                publishDate: '',
                driveLink: '',
              });
              setFiles([]);
            }}
            className="btn-primary w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Enviar Nova Demanda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main p-4 md:p-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="h-16 mb-4 flex items-center justify-center">
            {mounted ? (
              <img 
                src={logoSrc} 
                alt="SECOM Logo" 
                className="h-full object-contain transition-opacity duration-300"
              />
            ) : (
              <div className="h-16 w-48 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg" />
            )}
          </div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Portal de Demandas</h1>
          <p className="text-text-secondary mt-2 font-medium">Secretaria de Comunicação - SECOM</p>
          <div className="h-1.5 w-24 bg-gradient-to-r from-primary via-accent-pink to-accent-orange rounded-full mt-6" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Secretaria */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary flex items-center gap-2 ml-1">
                <Building2 className="w-4 h-4 text-primary" />
                Secretaria / Órgão
              </label>
              <input
                required
                type="text"
                placeholder="Ex: Saúde, Educação..."
                className="input-field w-full py-3 px-4 rounded-xl bg-bg-card border border-border focus:border-primary transition-all outline-none"
                value={formData.secretariaName}
                onChange={e => setFormData({ ...formData, secretariaName: e.target.value })}
              />
            </div>

            {/* Responsável */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary flex items-center gap-2 ml-1">
                <User className="w-4 h-4 text-primary" />
                Responsável pelo Pedido
              </label>
              <input
                required
                type="text"
                placeholder="Nome completo"
                className="input-field w-full py-3 px-4 rounded-xl bg-bg-card border border-border focus:border-primary transition-all outline-none"
                value={formData.requesterName}
                onChange={e => setFormData({ ...formData, requesterName: e.target.value })}
              />
            </div>
          </div>

          {/* Tema / Título */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-secondary flex items-center gap-2 ml-1">
              <FileText className="w-4 h-4 text-primary" />
              Tema da Demanda
            </label>
            <input
              required
              type="text"
              placeholder="Ex: Campanha de Vacinação, Evento Municipal..."
              className="input-field w-full py-3 px-4 rounded-xl bg-bg-card border border-border focus:border-primary transition-all outline-none"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-secondary flex items-center gap-2 ml-1">
              <FileText className="w-4 h-4 text-primary" />
              Descrição Detalhada
            </label>
            <textarea
              required
              rows={4}
              placeholder="Descreva aqui o que precisa ser feito..."
              className="input-field w-full py-3 px-4 rounded-xl bg-bg-card border border-border focus:border-primary transition-all outline-none resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prazo */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary flex items-center gap-2 ml-1">
                <Calendar className="w-4 h-4 text-primary" />
                Prazo Desejado
              </label>
              <input
                type="date"
                className="input-field w-full py-3 px-4 rounded-xl bg-bg-card border border-border focus:border-primary transition-all outline-none"
                value={formData.publishDate}
                onChange={e => setFormData({ ...formData, publishDate: e.target.value })}
              />
            </div>

            {/* Links */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary flex items-center gap-2 ml-1">
                <LinkIcon className="w-4 h-4 text-primary" />
                Links Adicionais
              </label>
              <input
                type="url"
                placeholder="Google Drive, Site, etc..."
                className="input-field w-full py-3 px-4 rounded-xl bg-bg-card border border-border focus:border-primary transition-all outline-none"
                value={formData.driveLink}
                onChange={e => setFormData({ ...formData, driveLink: e.target.value })}
              />
            </div>
          </div>

          {/* Upload de Arquivos */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-text-secondary flex items-center gap-2 ml-1">
              <Upload className="w-4 h-4 text-primary" />
              Anexar Arquivos / Briefing
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-bg-card rounded-xl border border-border animate-slide-in">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-text-primary truncate">{file.name}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeFile(idx)}
                    className="p-1 hover:bg-red-500/10 text-text-muted hover:text-status-failed rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <label className={`
                flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer
                ${uploading ? 'bg-bg-card border-border opacity-50 cursor-not-allowed' : 'bg-bg-card hover:bg-bg-card-hover border-border hover:border-primary'}
              `}>
                {uploading ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5 text-primary mb-1" />
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Adicionar Arquivo</span>
                  </>
                )}
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              disabled={loading}
              type="submit"
              className="btn-cta w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Enviar Demanda
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-text-muted mt-4 uppercase font-bold tracking-widest">
              Ao enviar, sua demanda entrará na fila de produção da SECOM
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
