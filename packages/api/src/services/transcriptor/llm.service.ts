import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';

export async function generateExecutiveReport(transcription: string, metadata: { url: string; platform: string }): Promise<string> {
  const apiKey = env.GEMINI_API_KEY || env.NANO_BANANA_API_KEY;
  
  if (!apiKey) {
    return `[CHAVE DA API DO GEMINI NÃO CONFIGURADA]\n\nPor favor, defina GEMINI_API_KEY no arquivo .env.\n\nTrecho capturado:\n\n${transcription.substring(0, 500)}...`;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // gemini-3.1-flash-lite-preview for complex formatting and reasoning
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' }); 

  const prompt = `
    Você é um analista de conteúdo sênior. Com base na transcrição abaixo,
    produza um Relatório Executivo estruturado no seguinte formato EXATO:

    ---
    RELATÓRIO EXECUTIVO

    FONTE: ${metadata.url}
    PLATAFORMA: ${metadata.platform}
    DATA DE PROCESSAMENTO: ${new Date().toLocaleDateString('pt-BR')}

    1. TEMA CENTRAL
    [1-2 parágrafos descrevendo do que se trata o conteúdo]

    2. CONTEXTO
    [Quem fala, para quem, em que situação]

    3. PONTOS PRINCIPAIS
    • [Ponto 1]
    • [Ponto 2]
    • [Ponto 3]
    • [Ponto N...]

    4. CONCLUSÕES E RECOMENDAÇÕES
    [O que o conteúdo conclui ou propõe]

    5. CITAÇÕES RELEVANTES
    [2-3 trechos literais mais impactantes do vídeo]
    ---

    TRANSCRIÇÃO:
    ${transcription}
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
