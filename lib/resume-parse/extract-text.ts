'use client';

/**
 * Both parsers run entirely in the browser — the file never leaves the
 * device. pdfjs-dist needs its worker script pointed at a real URL; Next's
 * webpack build resolves this `new URL(...)` the same way it resolves a
 * static asset import, so the worker ships as its own chunk.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  // Served as a static file (public/pdf.worker.min.mjs, copied from
  // node_modules at the same pdfjs-dist version) instead of letting webpack
  // bundle it — bundling breaks on `import.meta` inside the worker's own
  // minified source during production builds.
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const buffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;

  const pageTexts: string[] = [];
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum += 1) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const lines: string[] = [];
    let currentLine = '';
    let lastY: number | null = null;

    for (const item of content.items) {
      if (!('str' in item)) continue;
      const y = item.transform[5];
      if (lastY !== null && Math.abs(y - lastY) > 2) {
        lines.push(currentLine);
        currentLine = item.str;
      } else {
        currentLine += item.str;
      }
      lastY = y;
    }
    if (currentLine) lines.push(currentLine);
    pageTexts.push(lines.join('\n'));
  }

  return pageTexts.join('\n\n');
}

export async function extractTextFromDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

export async function extractResumeText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    return extractTextFromPdf(file);
  }
  if (
    name.endsWith('.docx') ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return extractTextFromDocx(file);
  }
  if (name.endsWith('.txt') || file.type === 'text/plain') {
    return file.text();
  }
  throw new Error('Unsupported file type. Upload a PDF, DOCX, or TXT résumé.');
}
