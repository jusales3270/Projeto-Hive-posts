import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Baixa o áudio de um vídeo público do YouTube, Instagram, TikTok, etc, usando a API RapidAPI "Social Download All in One".
 */
export async function downloadAudioViaRapidAPI(url: string, platform: string): Promise<string | null> {
  try {
    const rapidApiKey = process.env.RAPIDAPI_KEY || process.env['X-RapidAPI-Key'];
    if (!rapidApiKey) {
      throw new Error('Chave do RapidAPI não configurada no .env');
    }

    console.log(`📡 Consultando RapidAPI para extrair áudio de: ${url}`);
    
    // Constrói URL e Options
    const targetUrl = new URL('https://social-download-all-in-one.p.rapidapi.com/v1/social/autolink');
    targetUrl.searchParams.append('url', url);

    const response = await fetch(targetUrl.href, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'social-download-all-in-one.p.rapidapi.com',
      }
    });
    
    if (response.status === 403) {
      throw new Error('403 Forbidden: Você precisa se inscrever no plano gratuito da API "Social Download All in One" no portal do RapidAPI.');
    }

    if (!response.ok) {
       throw new Error(`A API falhou com status ${response.status}`);
    }

    const responseData: any = await response.json();
    
    // A resposta varia de acordo com a plataforma, mas geralmente retorna medias[]
    const medias = responseData?.medias || [];
    
    // Procura pela mídia que seja apenas áudio (mp3/m4a) ou pega a versão de vídeo/áudio de menor tamanho para processar
    let bestUrl = '';
    
    const audioMedia = medias.find((m: any) => m.extension === 'mp3' || m.extension === 'm4a');
    if (audioMedia && audioMedia.url) {
      bestUrl = audioMedia.url;
    } else {
      // Fallback: pega o primeiro vídeo/áudio disponível
      bestUrl = medias[0]?.url;
    }

    if (!bestUrl) {
      throw new Error('Não foi possível localizar uma mídia de download na resposta da API.');
    }

    // Faz o download do buffer final do arquivo selecionado
    console.log(`⬇ Baixando arquivo da media host...`);
    
    const fileResponse = await fetch(bestUrl);
    if (!fileResponse.ok) {
        throw new Error(`Falha ao baixar o arquivo final. Status: ${fileResponse.status}`);
    }
    const arrayBuffer = await fileResponse.arrayBuffer();

    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    
    const jobId = uuidv4();
    const filePath = path.join(tempDir, `${jobId}.mp3`); // Salvamos como arquivo de áudio
    
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
    console.log(`✅ Áudio salvo com sucesso em: ${filePath}`);

    return filePath;

  } catch (error: any) {
    if (error.message && error.message.includes('403 Forbidden')) {
      throw error;
    }
    console.error('❌ Erro no RapidAPI:', error.message || error);
    throw new Error(`Falha ao conectar no provedor de download: ${error.message}`);
  }
}
