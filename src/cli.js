import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { build } from './lib/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const actionPath = resolve(__dirname, '..');

const { values } = parseArgs({
  options: {
    'data-dir': { type: 'string', default: '.' },
    'pages-dir': { type: 'string', default: '' },
    'blog-dir': { type: 'string', default: '' },
    'media-dir': { type: 'string', default: '' },
    'output-dir': { type: 'string', default: '_site' },
    'base-path': { type: 'string', default: '/' },
    'site-url': { type: 'string', default: '' },
    'build-date': { type: 'string', default: '' },
    'no-pdf': { type: 'boolean', default: false },
    'no-docx': { type: 'boolean', default: false },
  },
});

try {
  await build({
    dataDir: resolve(values['data-dir']),
    pagesDir: values['pages-dir'] ? resolve(values['pages-dir']) : null,
    blogDir: values['blog-dir'] ? resolve(values['blog-dir']) : null,
    mediaDir: values['media-dir'] ? resolve(values['media-dir']) : null,
    outputDir: resolve(values['output-dir']),
    actionPath,
    basePath: values['base-path'],
    siteUrl: values['site-url'],
    buildDate: values['build-date'] || undefined,
    noPdf: values['no-pdf'],
    noDocx: values['no-docx'],
  });
} catch (err) {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
}
