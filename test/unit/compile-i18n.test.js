import { describe, it, expect } from 'vitest';
import { compileI18n } from '../../src/lib/compile/i18n.js';
import { join } from 'node:path';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const i18nDir = join(__dirname, '../../i18n');

describe('compileI18n', () => {
  it('loads English pack by default', async () => {
    const { i18n } = await compileI18n({ lang: 'en', i18nDir });
    expect(i18n.locale).toBe('en');
    expect(i18n.dir).toBe('ltr');
    expect(i18n.labels.experience).toBe('Experience');
  });

  it('loads specified language pack (e.g. fr)', async () => {
    const { i18n } = await compileI18n({ lang: 'fr', i18nDir });
    expect(i18n.locale).toBe('fr');
    expect(i18n.labels.experience).not.toBe('Experience');
  });

  it('deep-merges user overrides', async () => {
    const { i18n } = await compileI18n({
      lang: 'en',
      i18nDir,
      overrides: { labels: { experience: 'Work History' } },
    });
    expect(i18n.labels.experience).toBe('Work History');
    // Other keys should remain
    expect(i18n.labels.education).toBe('Education');
  });

  it('falls back to English for unknown language', async () => {
    const { i18n, warnings } = await compileI18n({
      lang: 'xx',
      i18nDir,
    });
    expect(i18n.locale).toBe('en');
    expect(warnings.some((w) => w.includes('falling back'))).toBe(true);
  });

  it('warns on missing keys after merge', async () => {
    // Create a partial language pack
    const dir = await mkdtemp(join(tmpdir(), 'i18n-'));
    await writeFile(
      join(dir, 'partial.yml'),
      'locale: partial\ndir: ltr\nlabels:\n  experience: "Test"',
    );
    // Also need en.yml there for reference
    const { readFile: rf } = await import('node:fs/promises');
    const enContent = await rf(join(i18nDir, 'en.yml'), 'utf-8');
    await writeFile(join(dir, 'en.yml'), enContent);

    const { warnings } = await compileI18n({
      lang: 'custom',
      i18nDir: dir,
      i18nFile: join(dir, 'partial.yml'),
    });
    expect(warnings.some((w) => w.includes('missing'))).toBe(true);
  });

  it('supports custom locale file via i18n_file', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'i18n-custom-'));
    await writeFile(
      join(dir, 'custom.yml'),
      'locale: custom\ndir: ltr\nlabels:\n  experience: "Custom Experience"\n  education: "Custom Education"',
    );

    const { i18n } = await compileI18n({
      lang: 'custom',
      i18nDir,
      i18nFile: join(dir, 'custom.yml'),
    });
    expect(i18n.labels.experience).toBe('Custom Experience');
  });

  it('ar pack has dir: rtl', async () => {
    const { i18n } = await compileI18n({ lang: 'ar', i18nDir });
    expect(i18n.dir).toBe('rtl');
  });
});
