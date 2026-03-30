export type DocFormat = 'txt' | 'md' | 'pdf' | 'docx';

const SUPPORTED_EXTENSIONS: Record<string, DocFormat> = {
  '.txt': 'txt',
  '.md': 'md',
  '.pdf': 'pdf',
  '.docx': 'docx',
};

export function getDocFormat(fileName: string): DocFormat | null {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) return null;
  const ext = fileName.slice(lastDot).toLowerCase();
  return SUPPORTED_EXTENSIONS[ext] ?? null;
}

export async function extractTextOrMarkdown(file: File): Promise<string> {
  return file.text();
}

export async function extractPdf(file: File): Promise<string> {
  const [pdfjsLib, workerUrl] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.mjs?url').then((m) => (m as { default: string }).default),
  ]);

  if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
  }

  const typedArray = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: typedArray }).promise;
  const parts: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map((item) => ('str' in item ? item.str : '')).join(' ');
    parts.push(text);
  }

  return parts.join('\n\n').trim();
}

export async function extractDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

export async function extractDocText(file: File): Promise<string> {
  const format = getDocFormat(file.name);
  if (!format) {
    throw new Error(`Unsupported document type: ${file.name}. Use .txt, .md, .pdf, or .docx.`);
  }

  switch (format) {
    case 'txt':
    case 'md':
      return extractTextOrMarkdown(file);
    case 'pdf':
      return extractPdf(file);
    case 'docx':
      return extractDocx(file);
    default:
      throw new Error(`Unhandled format: ${format}`);
  }
}
