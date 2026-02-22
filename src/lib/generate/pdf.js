/**
 * Generate a PDF buffer from an HTML string using Puppeteer.
 * @param {string} htmlString - Complete HTML document string
 * @param {object} [options]
 * @param {string} [options.pageSize='A4'] - Page size format ('A4' or 'Letter')
 * @returns {Promise<Buffer>} PDF file as a Buffer
 */
export async function generatePdf(htmlString, { pageSize = 'A4' } = {}) {
  let puppeteer;
  try {
    puppeteer = await import('puppeteer');
  } catch {
    throw new Error(
      'Puppeteer is required for PDF generation. Install it with: npm install puppeteer',
    );
  }

  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlString, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: pageSize,
      margin: { top: '1cm', bottom: '1cm', left: '1.2cm', right: '1.2cm' },
      printBackground: true,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
