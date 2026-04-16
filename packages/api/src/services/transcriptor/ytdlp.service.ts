import youtubedl from 'yt-dlp-exec';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export async function extractNativeTranscription(url: string): Promise<string | null> {
  const tempDir = path.join(__dirname, '../../temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
  
  const jobId = uuidv4();
  const outputTemplate = path.join(tempDir, `${jobId}.%(ext)s`);

  try {
    // Download auto-subs as VTT without downloading video
    await youtubedl(url, {
      skipDownload: true,
      writeAutoSub: true,
      subLang: 'pt,en',
      subFormat: 'vtt',
      output: outputTemplate
    });
    
    // Find the generated VTT file
    const files = fs.readdirSync(tempDir);
    const vttFile = files.find(f => f.startsWith(jobId) && f.endsWith('.vtt'));
    
    if (!vttFile) return null;
    
    const vttPath = path.join(tempDir, vttFile);
    const content = fs.readFileSync(vttPath, 'utf8');
    
    // Cleanup
    fs.unlinkSync(vttPath);
    
    return parseVTT(content);
  } catch (error) {
    console.error('Error extracting native transcription:', error);
    return null;
  }
}

export async function extractAudio(url: string): Promise<string | null> {
  const tempDir = path.join(__dirname, '../../temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
  
  const jobId = uuidv4();
  // Não forçamos MP3 pra evitar falha caso o ffmpeg não esteja instalado localmente.
  // Baixamos o formato de áudio nativo (m4a, webm).
  const outputTemplate = path.join(tempDir, `${jobId}.%(ext)s`);

  try {
    await youtubedl(url, {
      maxFilesize: '200m',
      output: outputTemplate,
      noWarnings: true,
      noPart: true // Previne falhas de [WinError 32] no rename final no Windows
    });
    
    // Apenas procuramos o arquivo recém-criado que corresponda ao jobId
    const files = fs.readdirSync(tempDir);
    const downloadedFile = files.find(f => f.startsWith(jobId) && !f.endsWith('.part') && !f.endsWith('.ytdl'));
    
    if (!downloadedFile) return null;
    return path.join(tempDir, downloadedFile);
  } catch (error: any) {
    console.error('Error downloading media:', error?.message || error);
    throw new Error(`Falha no yt-dlp: ${error?.message || error}`);
  }
}

function parseVTT(vttContent: string): string {
  const lines = vttContent.split('\n');
  const textLines: string[] = [];

  for (const line of lines) {
    if (
      line.startsWith('WEBVTT') ||
      line.includes('-->') ||
      line.trim() === '' ||
      /^\\d+$/.test(line.trim())
    ) continue;

    const clean = line.replace(/<[^>]+>/g, '').trim();
    if (clean && !textLines.includes(clean)) {
      textLines.push(clean);
    }
  }

  return textLines.join(' ');
}
