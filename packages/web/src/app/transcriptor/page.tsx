'use client';

import { useState } from 'react';
import { api } from '../../lib/api';
import { Film, FileText, FileSearch, ExternalLink, Loader2, Download, AlertCircle, RefreshCw } from 'lucide-react';

export default function TranscriptorPage() {
  const [url, setUrl] = useState('');
  const [outputType, setOutputType] = useState<'transcription' | 'report'>('report');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [result, setResult] = useState<{
    jobId: string;
    platform: string;
    duration?: string;
    transcript?: string;
    reportText?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.processVideoTranscription(url, outputType);
      
      if (!data || !data.jobId) {
        throw new Error('Falha ao processar vídeo, identificador da tarefa não retornado.');
      }

      setResult({
        jobId: data.jobId,
        platform: data.platform || 'unknown',
        duration: data.duration,
        transcript: data.transcript,
        reportText: data.reportText,
      });
      
    } catch (err: any) {
      setError(err.message || 'Erro ao comunicar com a API de Transcrição');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (type: 'transcription' | 'report') => {
    if (!result?.jobId) return;
    
    // Redirect to the API endpoint that streams the PDF
    const downloadUrl = api.generateVideoPdfUrl(result.jobId, type);
    window.open(downloadUrl, '_blank');
  };

  const resetState = () => {
    setUrl('');
    setResult(null);
    setError(null);
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-page-title text-text-primary flex items-center gap-2">
            <Film className="w-6 h-6 text-primary" />
            Transcritor de Vídeos
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Gere transcrições e relatórios executivos de vídeos públicos em segundos.
          </p>
        </div>
        {result && (
          <button onClick={resetState} className="flex items-center gap-2 text-sm text-primary hover:underline font-medium">
            <RefreshCw className="w-4 h-4" /> Novo Vídeo
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lado Esquerdo: Formulario */}
        <div className="card p-6 border border-border flex flex-col gap-5 h-fit">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ExternalLink className="w-4 h-4 text-primary" strokeWidth={2} />
            </div>
            <h2 className="text-section-title text-text-primary">Novo Processamento</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">URL do Vídeo</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Ex 👉 https://youtube.com/watch?v=..."
                className="input-field py-3 text-sm font-medium w-full"
                required
                disabled={loading}
              />
              <p className="text-[11px] text-text-muted mt-2 pl-1">
                Suporta: YouTube, Instagram, TikTok, Facebook e LinkedIn
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2.5 uppercase tracking-wider">O que deseja gerar?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOutputType('report')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    outputType === 'report' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-gray-50 text-text-secondary hover:border-gray-300'
                  }`}
                >
                  <FileSearch className="w-6 h-6" strokeWidth={1.5} />
                  <span className="text-sm font-bold">Relatório Executivo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOutputType('transcription')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    outputType === 'transcription' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-gray-50 text-text-secondary hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-6 h-6" strokeWidth={1.5} />
                  <span className="text-sm font-bold">Transcrição Íntegra</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-input bg-red-50 border border-red-100 mt-2">
                <AlertCircle className="w-4 h-4 text-status-failed flex-shrink-0" />
                <p className="text-status-failed text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading || !url} 
                className="w-full btn-cta justify-center py-3.5 text-base shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processando vídeo... (isso pode levar 1-2 minutos)
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Film className="w-5 h-5" />
                    Processar Vídeo
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Lado Direito: Resultados */}
        <div className="card p-6 border border-border h-fit min-h-[400px] flex flex-col">
          {!result && !loading && (
             <div className="flex-1 flex flex-col items-center justify-center text-center py-10 opacity-60">
               <FileText className="w-16 h-16 text-text-muted mb-4" strokeWidth={1} />
               <p className="text-sm font-medium text-text-secondary mb-1">Nenhum vídeo processado ainda</p>
               <p className="text-xs text-text-muted max-w-[250px]">Cole uma URL do YouTube ou Instagram e clique em Processar Vídeo.</p>
             </div>
          )}

          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-accent-pink/20 flex items-center justify-center mb-4 animate-pulse">
                <Loader2 className="w-7 h-7 text-primary animate-spin" strokeWidth={2} />
              </div>
              <h3 className="text-sm font-bold text-text-primary mb-2">Processando com I.A.</h3>
              <ul className="text-xs text-text-secondary text-left space-y-2 mt-4 max-w-[250px]">
                <li className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-primary" /> Extraindo áudio do vídeo
                </li>
                <li className="flex items-center gap-2 opacity-60">
                  <span className="w-3 h-3 rounded-full border border-gray-300" /> Convertendo voz em texto (Whisper)
                </li>
                {outputType === 'report' && (
                  <li className="flex items-center gap-2 opacity-60">
                    <span className="w-3 h-3 rounded-full border border-gray-300" /> Analisando contexto (Claude)
                  </li>
                )}
              </ul>
            </div>
          )}

          {result && !loading && (
            <div className="flex flex-col h-full animate-slide-up">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                <div>
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
                    {outputType === 'report' ? 'Relatório Executivo' : 'Transcrição Íntegra'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-text-secondary font-medium">
                    <span className="bg-gray-100 px-2 py-0.5 rounded capitalize">{result.platform}</span>
                    {result.duration && <span>Duração: {result.duration}</span>}
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDownloadPDF(outputType)}
                  className="flex items-center gap-2 bg-text-primary hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" /> Baixar PDF
                </button>
              </div>

              <div className="flex-1 bg-gray-50 rounded-lg p-5 border border-border overflow-y-auto max-h-[500px]">
                {outputType === 'report' && result.reportText && (
                  <div className="prose prose-sm max-w-none">
                    {result.reportText.split('\n').map((line, i) => {
                      if (line.match(/^\d\./) || line.match(/^[A-Z\u00C0-\u00DC ]+$/) && line.length > 3) {
                         return <h4 key={i} className="text-[13px] font-bold text-text-primary uppercase mt-5 mb-2">{line}</h4>
                      }
                      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                        return <li key={i} className="text-sm text-text-secondary ml-4 mb-1">{line.replace(/^[•-]\s*/, '')}</li>
                      }
                      if (line.trim() === '') return <br key={i} />;
                      return <p key={i} className="text-sm text-text-secondary mb-2 leading-relaxed">{line}</p>
                    })}
                  </div>
                )}

                {outputType === 'transcription' && result.transcript && (
                  <div className="text-sm text-text-secondary leading-relaxed space-y-4">
                    {result.transcript.split('. ').map((sentence, i) => (
                      <span key={i}>{sentence}. </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
