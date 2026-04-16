import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { detectPlatform } from '../utils/detectPlatform';
import { extractNativeTranscription, extractAudio } from '../services/transcriptor/ytdlp.service';
import { transcribeAudio } from '../services/transcriptor/whisper.service';
import { generateExecutiveReport } from '../services/transcriptor/llm.service';
import { generatePDF } from '../services/transcriptor/pdfGenerator.service';
import fs from 'fs';

const router = Router();

// Simulating a simple cache/database for jobs since we don't have a DB schema for this yet
const jobsCache: Record<string, { transcript?: string; reportText?: string; platform: string; url: string }> = {};

router.post('/process', async (req: Request, res: Response) => {
  try {
    const { url, outputType } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const platform = detectPlatform(url);
    const jobId = uuidv4();
    
    let transcript = '';

    // Route A: Native YouTube API
    if (platform === 'youtube') {
      const nativeTranscript = await extractNativeTranscription(url);
      if (nativeTranscript) {
        transcript = nativeTranscript;
      } else {
        // Fallback to Whisper if auto-subs fail
        const audioPath = await extractAudio(url);
        if (!audioPath) throw new Error('Não foi possível extrair áudio do YouTube');
        transcript = await transcribeAudio(audioPath);
        fs.unlinkSync(audioPath); // Limpar áudio
      }
    } 
    // Route B: Other platforms (Extract audio + Whisper)
    else {
      const audioPath = await extractAudio(url);
      if (!audioPath) throw new Error(`Não foi possível extrair o vídeo da plataforma ${platform}`);
      transcript = await transcribeAudio(audioPath);
      fs.unlinkSync(audioPath);
    }

    let reportText = '';
    // Generate Report via Claude if requested
    if (outputType === 'report') {
      reportText = await generateExecutiveReport(transcript, { url, platform });
    }

    jobsCache[jobId] = { transcript, reportText, platform, url };

    res.json({
      success: true,
      data: {
        jobId,
        platform,
        transcript: outputType === 'transcription' ? transcript : undefined,
        reportText: outputType === 'report' ? reportText : undefined,
      }
    });
  } catch (error: any) {
    console.error('Error processing transcription:', error);
    res.status(500).json({ error: error.message || 'Processing failed' });
  }
});

router.get('/generate-pdf', async (req, res) => {
  try {
    const { jobId, type } = req.query as { jobId: string; type: 'transcription' | 'report' };
    if (!jobId || !type) return res.status(400).json({ error: 'Missing parameters' });

    const job = jobsCache[jobId];
    if (!job) return res.status(404).json({ error: 'Job not found or expired' });

    const content = type === 'transcription' ? job.transcript : job.reportText;
    if (!content) return res.status(400).json({ error: 'Content not available for requested type' });

    const pdfBuffer = await generatePDF(content, type, { url: job.url, platform: job.platform });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Transcriptor_${type}_${jobId.substring(0, 8)}.pdf"`);
    res.send(pdfBuffer);
    
  } catch (error: any) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

export default router;
