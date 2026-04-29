'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import {
  Image as ImageIcon, Edit3, Clock, Send, Save, Loader2, X,
  Heart, MessageCircle, Share, ChevronLeft, ChevronRight,
  Upload, FileText, Link as LinkIcon, Zap, Plus, Trash2,
} from 'lucide-react';

const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1', desc: 'Feed', w: 28, h: 28 },
  { value: '4:5', label: '4:5', desc: 'Retrato', w: 24, h: 30 },
  { value: '9:16', label: '9:16', desc: 'Stories/Reels', w: 17, h: 30 },
];

interface PostImage { url: string; prompt?: string; }

export default function NewPost() {
  const router = useRouter();
  const [tab, setTab] = useState<'upload' | 'ia'>('upload');
  const [images, setImages] = useState<PostImage[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [driveLink, setDriveLink] = useState('');
  const [postFile, setPostFile] = useState({ url: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const imgInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(files: FileList) {
    setImageUploading(true);
    setMessage('');
    try {
      const uploads = Array.from(files).slice(0, 10 - images.length);
      const results: PostImage[] = [];
      for (const file of uploads) {
        const result = await api.uploadFile(file);
        results.push({ url: result.fileUrl });
      }
      setImages(prev => {
        const next = [...prev, ...results];
        setActiveIdx(next.length - 1);
        return next;
      });
    } catch (err: any) {
      setMessage(err.message || 'Erro ao enviar imagem');
      setMessageType('error');
    }
    setImageUploading(false);
  }

  async function handleFileUpload(file: File) {
    setFileUploading(true);
    try {
      const result = await api.uploadFile(file);
      setPostFile({ url: result.fileUrl, name: result.fileName });
    } catch (err: any) {
      setMessage(err.message || 'Erro ao enviar arquivo');
      setMessageType('error');
    }
    setFileUploading(false);
  }

  async function handleGenerateImage() {
    if (!prompt) return;
    setGenLoading(true);
    setMessage('');
    try {
      const result = await api.generateImage(prompt, aspectRatio);
      setImages(prev => {
        const next = [...prev, { url: result.imageUrl, prompt }];
        setActiveIdx(next.length - 1);
        return next;
      });
    } catch (err: any) {
      setMessage(err.message || 'Erro ao gerar imagem');
      setMessageType('error');
    }
    setGenLoading(false);
  }

  async function handleGenerateCaption() {
    if (!prompt) return;
    setGenLoading(true);
    try {
      const result = await api.generateCaption(prompt);
      setCaption(result.caption);
      setHashtags(result.hashtags.join(', '));
    } catch (err: any) {
      setMessage(err.message || 'Erro ao gerar legenda');
      setMessageType('error');
    }
    setGenLoading(false);
  }

  function removeImage(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setActiveIdx(i => Math.max(0, i >= idx ? i - 1 : i));
  }

  async function handleSave(status: 'draft' | 'schedule' | 'publish') {
    setMessage('');
    if (status !== 'draft' && images.length === 0) {
      setMessage('⚠️ Adicione pelo menos uma imagem antes de publicar ou agendar.');
      setMessageType('error');
      return;
    }
    if (status === 'schedule' && !scheduledAt) {
      setMessage('⚠️ Selecione uma data e hora para agendar.');
      setMessageType('error');
      return;
    }
    setLoading(true);
    try {
      const isCarousel = images.length >= 2;
      const payload: Record<string, unknown> = {
        caption,
        hashtags: hashtags.split(',').map(h => h.trim()).filter(Boolean),
        aspectRatio,
      };
      if (driveLink) payload.driveLink = driveLink;
      if (postFile.url) payload.fileUrl = postFile.url;
      if (isCarousel) {
        payload.isCarousel = true;
        payload.images = images.map((img, idx) => ({ imageUrl: img.url, order: idx, prompt: img.prompt }));
      } else if (images.length === 1) {
        payload.imageUrl = images[0].url;
      }
      const post = (await api.createPost(payload)) as any;
      if (status === 'schedule') {
        await api.schedulePost(post.id, new Date(scheduledAt).toISOString());
        setMessage('✅ Post agendado com sucesso!');
      } else if (status === 'publish') {
        await api.publishPost(post.id);
        setMessage('✅ Post enviado para publicação!');
      } else {
        setMessage('✅ Rascunho salvo!');
      }
      setMessageType('success');
      setTimeout(() => router.push('/posts'), 1500);
    } catch (err: any) {
      setMessage(err.message || 'Erro ao salvar');
      setMessageType('error');
    }
    setLoading(false);
  }

  // Compute CSS aspect-ratio value
  const cssAspect =
    aspectRatio === '4:5' ? '4/5' : aspectRatio === '9:16' ? '9/16' : '1/1';
  const canPublish = images.length > 0;
  const canSchedule = images.length > 0 && !!scheduledAt;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-page-title text-text-primary">Criar Post</h1>
        <p className="text-sm text-text-secondary mt-1">Publique ou agende conteúdo para o Instagram</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-5">
          {/* Tab switcher */}
          <div className="flex gap-1 p-1 bg-bg-main rounded-xl border border-border">
            <button
              onClick={() => setTab('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'upload' ? 'bg-[var(--bg-card)] text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
            >
              <Upload className="w-4 h-4" strokeWidth={1.5} />
              Upload de Imagens
            </button>
            <button
              onClick={() => setTab('ia')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'ia' ? 'bg-[var(--bg-card)] text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
            >
              <Zap className="w-4 h-4" strokeWidth={1.5} />
              Gerar com IA
            </button>
          </div>

          {/* Upload tab */}
          {tab === 'upload' && (
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-text-primary">Imagens do Post</h2>
                {images.length > 0 && (
                  <span className="text-xs text-text-muted">{images.length}/10 imagens{images.length >= 2 && <span className="text-primary ml-1 font-medium">· carrossel</span>}</span>
                )}
              </div>

              {/* Drop zone */}
              <div
                onClick={() => imgInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); if (e.dataTransfer.files.length) handleImageUpload(e.dataTransfer.files); }}
                className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
              >
                <input
                  ref={imgInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={e => { if (e.target.files?.length) handleImageUpload(e.target.files); e.target.value = ''; }}
                />
                {imageUploading ? (
                  <><Loader2 className="w-8 h-8 text-primary animate-spin" /><span className="text-sm text-text-secondary">Enviando...</span></>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-text-primary">Clique ou arraste imagens aqui</p>
                      <p className="text-xs text-text-muted mt-1">PNG, JPG, WEBP · Até 10 imagens</p>
                    </div>
                    {images.length < 10 && (
                      <button className="btn-ghost text-xs py-1.5 px-4">
                        <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                        Selecionar arquivos
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveIdx(idx)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${idx === activeIdx ? 'border-primary' : 'border-transparent'}`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={e => { e.stopPropagation(); removeImage(idx); }}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {images.length < 10 && (
                    <button
                      onClick={() => imgInputRef.current?.click()}
                      className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center hover:border-primary hover:text-primary text-text-muted transition-all"
                    >
                      <Plus className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* IA tab */}
          {tab === 'ia' && (
            <div className="card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent-pink/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" strokeWidth={2} />
                </div>
                <h2 className="text-sm font-bold text-text-primary">Gerar com Inteligência Artificial</h2>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Descreva o tema do post... Ex: 'Post sobre produtividade com dicas de organização'"
                  rows={4}
                  className="input-field resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleGenerateImage}
                  disabled={genLoading || !prompt || images.length >= 10}
                  className="btn-cta flex-1 justify-center text-sm py-2.5"
                >
                  {genLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" strokeWidth={1.5} />}
                  {genLoading ? 'Gerando...' : images.length > 0 ? 'Adicionar Imagem' : 'Gerar Imagem'}
                </button>
                <button
                  onClick={handleGenerateCaption}
                  disabled={genLoading || !prompt}
                  className="btn-ghost flex-1 justify-center text-sm py-2.5"
                >
                  <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                  Gerar Legenda
                </button>
              </div>
              {images.length > 0 && (
                <p className="text-xs text-center text-text-muted">
                  {images.length} imagem(s) gerada(s)
                  {images.length >= 2 && <span className="text-primary font-medium ml-1">· carrossel</span>}
                </p>
              )}
            </div>
          )}

          {/* Aspect Ratio */}
          <div className="card p-5">
            <label className="block text-xs font-semibold text-text-secondary mb-3 uppercase tracking-wider">Formato</label>
            <div className="grid grid-cols-3 gap-2">
              {ASPECT_RATIOS.map(ar => (
                <button
                  key={ar.value}
                  onClick={() => setAspectRatio(ar.value)}
                  className={`py-3 px-3 rounded-btn text-sm border transition-all flex flex-col items-center gap-2 ${
                    aspectRatio === ar.value
                      ? 'bg-primary/[0.08] border-primary text-primary shadow-sm'
                      : 'bg-[var(--bg-card)] border-border text-text-secondary hover:border-primary/50'
                  }`}
                >
                  {/* Visual shape indicator */}
                  <div
                    style={{ width: ar.w, height: ar.h }}
                    className={`rounded-sm border-2 transition-colors ${
                      aspectRatio === ar.value ? 'border-primary bg-primary/10' : 'border-current opacity-40'
                    }`}
                  />
                  <span className="font-bold text-xs">{ar.label}</span>
                  <span className="text-[10px] opacity-60 -mt-1">{ar.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Caption */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Legenda</label>
              <span className="text-[11px] text-text-muted tabular-nums">{caption.length}/2200</span>
            </div>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              maxLength={2200}
              rows={5}
              placeholder="Escreva a legenda do post..."
              className="input-field resize-none"
            />
          </div>

          {/* Hashtags */}
          <div className="card p-5">
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Hashtags</label>
            <input
              value={hashtags}
              onChange={e => setHashtags(e.target.value)}
              placeholder="marketing, comunicacao, prefeitura (separadas por vírgula)"
              className="input-field"
            />
            {hashtags && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {hashtags.split(',').filter(h => h.trim()).map((h, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-badge bg-primary/10 text-primary font-medium">#{h.trim()}</span>
                ))}
              </div>
            )}
          </div>

          {/* Schedule */}
          <div className="card p-5">
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Agendar para</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
              className="input-field"
            />
          </div>

          {/* File Upload */}
          <div className="card p-5">
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Arquivo Anexo</label>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
              onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); e.target.value = ''; }}
            />
            {postFile.url ? (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-bg-main border border-border">
                <FileText className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.5} />
                <a href={postFile.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate flex-1">{postFile.name || 'Arquivo'}</a>
                <button onClick={() => setPostFile({ url: '', name: '' })} className="p-1 rounded hover:bg-bg-main transition-colors flex-shrink-0">
                  <X className="w-3.5 h-3.5 text-text-muted" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={fileUploading}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-xs font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors"
              >
                {fileUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" strokeWidth={2} />}
                {fileUploading ? 'Enviando...' : 'Anexar arquivo (PDF, DOC, XLS...)'}
              </button>
            )}
          </div>

          {/* Google Drive Link */}
          <div className="card p-5">
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Link do Google Drive</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" strokeWidth={1.5} />
              <input
                type="url"
                value={driveLink}
                onChange={e => setDriveLink(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="input-field pl-9"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => handleSave('draft')} disabled={loading} className="btn-ghost flex-1 justify-center">
              <Save className="w-4 h-4" strokeWidth={1.5} />
              Rascunho
            </button>
            <button
              onClick={() => handleSave('schedule')}
              disabled={loading || !canSchedule}
              style={!canSchedule ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
              title={images.length === 0 ? 'Adicione uma imagem primeiro' : !scheduledAt ? 'Selecione um horário' : ''}
              className="btn-ghost flex-1 justify-center text-status-scheduled border-status-scheduled/30 hover:bg-blue-50 hover:text-status-scheduled"
            >
              <Clock className="w-4 h-4" strokeWidth={1.5} />
              Agendar
            </button>
            <button
              onClick={() => handleSave('publish')}
              disabled={loading || !canPublish}
              style={!canPublish ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
              title={images.length === 0 ? 'Adicione uma imagem primeiro' : ''}
              className="btn-cta flex-1 justify-center"
            >
              <Send className="w-4 h-4" strokeWidth={1.5} />
              Publicar
            </button>
          </div>

          {message && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-btn border animate-slide-up ${messageType === 'success' ? 'bg-emerald-50 border-emerald-200 text-status-published' : 'bg-red-50 border-red-200 text-status-failed'}`}>
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <div className="card p-5">
            <p className="text-xs font-semibold text-text-secondary mb-4 uppercase tracking-wider">Preview do Post</p>
            <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-border">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-accent-pink">
                  <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-text-primary">secom_boituva</span>
                  <p className="text-[10px] text-text-muted">Agora</p>
                </div>
              </div>

              {images.length > 0 ? (
                <div className="relative">
                  {/* Aspect ratio container — native CSS aspect-ratio */}
                  <div
                    style={{ aspectRatio: cssAspect, maxHeight: '520px', transition: 'aspect-ratio 0.3s ease' }}
                    className="relative w-full overflow-hidden"
                  >
                    <img
                      src={images[activeIdx]?.url}
                      alt={`Imagem ${activeIdx + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(activeIdx)}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {images.length > 1 && (
                    <>
                      {activeIdx > 0 && (
                        <button onClick={() => setActiveIdx(i => i - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--bg-card)]/80 rounded-full flex items-center justify-center shadow-sm hover:bg-[var(--bg-card)]">
                          <ChevronLeft className="w-5 h-5 text-text-primary" />
                        </button>
                      )}
                      {activeIdx < images.length - 1 && (
                        <button onClick={() => setActiveIdx(i => i + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--bg-card)]/80 rounded-full flex items-center justify-center shadow-sm hover:bg-[var(--bg-card)]">
                          <ChevronRight className="w-5 h-5 text-text-primary" />
                        </button>
                      )}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, idx) => (
                          <button key={idx} onClick={() => setActiveIdx(idx)} className={`h-2 rounded-full transition-all ${idx === activeIdx ? 'bg-primary w-4' : 'bg-[var(--bg-card)]/60 w-2'}`} />
                        ))}
                      </div>
                      <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">{activeIdx + 1}/{images.length}</div>
                    </>
                  )}
                </div>
              ) : (
                <div
                  style={{ aspectRatio: cssAspect, maxHeight: '520px', transition: 'aspect-ratio 0.3s ease' }}
                  className="relative w-full overflow-hidden bg-bg-main flex flex-col items-center justify-center gap-3 text-text-muted"
                >
                  <ImageIcon className="w-12 h-12" strokeWidth={1} />
                  <span className="text-xs">A imagem aparecerá aqui</span>
                  <button
                    onClick={() => { setTab('upload'); setTimeout(() => imgInputRef.current?.click(), 100); }}
                    className="btn-ghost text-xs py-1.5 px-4"
                  >
                    <Upload className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Adicionar imagem
                  </button>
                </div>
              )}





              <div className="px-4 py-3 flex gap-4">
                <Heart className="w-6 h-6 text-text-primary" strokeWidth={1.5} />
                <MessageCircle className="w-6 h-6 text-text-primary" strokeWidth={1.5} />
                <Share className="w-6 h-6 text-text-primary" strokeWidth={1.5} />
              </div>

              <div className="px-4 pb-4">
                <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                  {caption || <span className="text-text-muted">Legenda aparecerá aqui...</span>}
                </p>
                {hashtags && (
                  <p className="text-sm text-primary mt-2">
                    {hashtags.split(',').filter(h => h.trim()).map(h => `#${h.trim()}`).join(' ')}
                  </p>
                )}
                {scheduledAt && (
                  <p className="text-xs text-status-scheduled mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Agendado para {new Date(scheduledAt).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
