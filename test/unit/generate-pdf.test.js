import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('generatePdf', () => {
  let mockPdf, mockSetContent, mockNewPage, mockClose, mockLaunch;

  beforeEach(() => {
    vi.resetModules();

    mockPdf = vi.fn().mockResolvedValue(Buffer.from('fake-pdf'));
    mockSetContent = vi.fn().mockResolvedValue(undefined);
    mockNewPage = vi.fn().mockResolvedValue({
      setContent: mockSetContent,
      pdf: mockPdf,
    });
    mockClose = vi.fn().mockResolvedValue(undefined);
    mockLaunch = vi.fn().mockResolvedValue({
      newPage: mockNewPage,
      close: mockClose,
    });
  });

  it('throws descriptive error when Puppeteer is not installed', async () => {
    vi.doMock('puppeteer', () => {
      throw new Error('Cannot find module');
    });

    const { generatePdf } = await import('../../src/lib/generate/pdf.js');

    await expect(generatePdf('<html></html>')).rejects.toThrow(
      'Puppeteer is required for PDF generation',
    );
  });

  it('calls puppeteer.launch() with --no-sandbox args', async () => {
    vi.doMock('puppeteer', () => ({ default: { launch: mockLaunch } }));
    const { generatePdf } = await import('../../src/lib/generate/pdf.js');

    await generatePdf('<html></html>');

    expect(mockLaunch).toHaveBeenCalledWith({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  });

  it('calls page.setContent() with HTML string and waitUntil networkidle0', async () => {
    vi.doMock('puppeteer', () => ({ default: { launch: mockLaunch } }));
    const { generatePdf } = await import('../../src/lib/generate/pdf.js');

    await generatePdf('<html>test</html>');

    expect(mockSetContent).toHaveBeenCalledWith('<html>test</html>', {
      waitUntil: 'networkidle0',
    });
  });

  it('calls page.pdf() with correct format and margins', async () => {
    vi.doMock('puppeteer', () => ({ default: { launch: mockLaunch } }));
    const { generatePdf } = await import('../../src/lib/generate/pdf.js');

    await generatePdf('<html></html>');

    expect(mockPdf).toHaveBeenCalledWith({
      format: 'A4',
      margin: { top: '1cm', bottom: '1cm', left: '1.2cm', right: '1.2cm' },
      printBackground: true,
    });
  });

  it('passes A4 page size format by default', async () => {
    vi.doMock('puppeteer', () => ({ default: { launch: mockLaunch } }));
    const { generatePdf } = await import('../../src/lib/generate/pdf.js');

    await generatePdf('<html></html>');

    expect(mockPdf).toHaveBeenCalledWith(
      expect.objectContaining({ format: 'A4' }),
    );
  });

  it('passes Letter page size format when configured', async () => {
    vi.doMock('puppeteer', () => ({ default: { launch: mockLaunch } }));
    const { generatePdf } = await import('../../src/lib/generate/pdf.js');

    await generatePdf('<html></html>', { pageSize: 'Letter' });

    expect(mockPdf).toHaveBeenCalledWith(
      expect.objectContaining({ format: 'Letter' }),
    );
  });

  it('returns buffer from page.pdf() result', async () => {
    vi.doMock('puppeteer', () => ({ default: { launch: mockLaunch } }));
    const { generatePdf } = await import('../../src/lib/generate/pdf.js');

    const result = await generatePdf('<html></html>');

    expect(result).toBeInstanceOf(Buffer);
  });

  it('closes browser even if page.pdf() throws', async () => {
    mockPdf.mockRejectedValue(new Error('PDF render failed'));
    vi.doMock('puppeteer', () => ({ default: { launch: mockLaunch } }));
    const { generatePdf } = await import('../../src/lib/generate/pdf.js');

    await expect(generatePdf('<html></html>')).rejects.toThrow(
      'PDF render failed',
    );
    expect(mockClose).toHaveBeenCalled();
  });
});
