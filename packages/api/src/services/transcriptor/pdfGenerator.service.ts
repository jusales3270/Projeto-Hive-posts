import puppeteer from 'puppeteer';

export async function generatePDF(content: string, type: 'transcription' | 'report', metadata: { url: string; platform: string }): Promise<Buffer> {
  const html = type === 'transcription'
    ? buildTranscriptionHTML(content, metadata)
    : buildReportHTML(content, metadata);

  const browser = await puppeteer.launch({ 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] 
  });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Retorna como Uint8Array (Node Buffer)
  const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' },
    printBackground: true,
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
}

function buildReportHTML(reportText: string, metadata: { url: string; platform: string }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Georgia', serif; font-size: 12pt; line-height: 1.6; color: #222; }
        .header { border-bottom: 3px solid #1a1a2e; padding-bottom: 16px; margin-bottom: 32px; }
        .header h1 { font-size: 20pt; color: #1a1a2e; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
        .meta { font-size: 9pt; color: #666; margin-top: 8px; }
        h4 { font-size: 13pt; color: #1a1a2e; border-left: 4px solid #1a1a2e; padding-left: 10px; margin-top: 28px; }
        p { margin: 8px 0; }
        ul { margin: 8px 0; padding-left: 20px; }
        li { margin: 4px 0; }
        .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 8pt; color: #999; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Relatório Executivo</h1>
        <div class="meta">
          Fonte: ${metadata.url}<br>
          Plataforma: ${metadata.platform} | Gerado em: ${new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>
      <div class="content">
        ${reportText.replace(/\\n/g, '<br>').replace(/•/g, '&bull;')}
      </div>
      <div class="footer">
        Documento gerado pro transcriptor IA
      </div>
    </body>
    </html>
  `;
}

function buildTranscriptionHTML(transcriptText: string, metadata: { url: string; platform: string }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 11pt; line-height: 1.5; color: #333; }
        .header { border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { font-size: 18pt; margin: 0; }
        .meta { font-size: 9pt; color: #666; margin-top: 5px; }
        .content { white-space: pre-wrap; text-align: justify; }
        .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 8pt; color: #999; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Transcrição Íntegra</h1>
        <div class="meta">
          Fonte: ${metadata.url}<br>
          Plataforma: ${metadata.platform} | Gerado em: ${new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>
      <div class="content">${transcriptText}</div>
      <div class="footer">Documento gerado por Transcriptor IA</div>
    </body>
    </html>
  `;
}
