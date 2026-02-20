import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Create a temporary directory for test output.
 * Returns { path, cleanup } where cleanup removes the dir.
 */
export async function createTempDir() {
  const path = await mkdtemp(join(tmpdir(), 'portfolio-test-'));
  return {
    path,
    async cleanup() {
      await rm(path, { recursive: true, force: true });
    },
  };
}

/**
 * Resolve path to a test fixture directory.
 */
export function fixturePath(name) {
  return join(__dirname, '..', 'fixtures', name);
}

/**
 * Read and parse a JSON file from the output directory.
 */
export async function readOutputJson(outputDir, relativePath) {
  const content = await readFile(join(outputDir, relativePath), 'utf-8');
  return JSON.parse(content);
}

/**
 * Read a file from the output directory as string.
 */
export async function readOutputFile(outputDir, relativePath) {
  return readFile(join(outputDir, relativePath), 'utf-8');
}
