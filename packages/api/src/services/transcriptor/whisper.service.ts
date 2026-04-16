import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { env } from '../../config/env';
import fs from 'fs';
import path from 'path';

export async function transcribeAudio(filePath: string): Promise<string> {
  const apiKey = env.GEMINI_API_KEY || env.NANO_BANANA_API_KEY;
  if (!apiKey) {
    throw new Error('Chave da API do Gemini não configurada (passe em GEMINI_API_KEY no arquivo .env)');
  }

  const fileManager = new GoogleAIFileManager(apiKey);
  const genAI = new GoogleGenerativeAI(apiKey);

  console.log(`[Gemini] Fazendo upload do áudio para transcrição: ${filePath}`);
  
  // O yt-dlp pode ter gerado mp3, mp4, m4a, webm.
  let mimeType = 'audio/mpeg';
  if (filePath.endsWith('.mp4')) mimeType = 'video/mp4';
  if (filePath.endsWith('.m4a')) mimeType = 'audio/m4a';
  if (filePath.endsWith('.webm')) mimeType = 'video/webm';
  if (filePath.endsWith('.ogg')) mimeType = 'audio/ogg';
  if (filePath.endsWith('.wav')) mimeType = 'audio/wav';
  
  // Realiza upload do arquivo pro Google File API
  const uploadResult = await fileManager.uploadFile(filePath, {
    mimeType,
    displayName: path.basename(filePath),
  });

  const fileUri = uploadResult.file.uri;
  const fileName = uploadResult.file.name;
  console.log(`[Gemini] Arquivo enviado. URI: ${fileUri}. Aguardando processamento interno...`);

  // Arquivos grandes (vídeos) precisam ser processados no Google antes do uso (estado ACTIVE)
  let fileState = await fileManager.getFile(fileName);
  while (fileState.state === 'PROCESSING') {
    console.log(`[Gemini] O arquivo ainda está em processamento. Aguardando 5 segundos...`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    fileState = await fileManager.getFile(fileName);
  }

  if (fileState.state === 'FAILED') {
    throw new Error('Falha no processamento interno do Gemini API para este arquivo.');
  }

  console.log(`[Gemini] Arquivo pronto (ACTIVE). Iniciando transcrição...`);

  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });

  const result = await model.generateContent([
    "Transcreva o áudio deste arquivo de forma literal (na íntegra), exata e detalhada, corrigindo apenas pontuação para ficar legível. Não adicione nenhum comentário ou metadados extras além do texto transcrito.",
    {
      fileData: {
        fileUri: fileUri,
        mimeType: mimeType
      }
    }
  ]);

  const transcript = result.response.text();

  // Limpa o arquivo remotamente
  try {
    await fileManager.deleteFile(uploadResult.file.name);
  } catch (e) {
    console.error('[Gemini] Erro ao deletar o arquivo do FileManager após a transcrição:', e);
  }

  return transcript || '';
}
