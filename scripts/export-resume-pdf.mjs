/**
 * Builds the production site, opens /resume/print in headless Chrome,
 * and writes identical PDFs to public/.
 *
 * Usage: pnpm resume:pdf
 */
import { spawn } from 'node:child_process';
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const primaryPdf = join(root, 'public/Jamey_McElveen_Resume.pdf');
const aliasPdf = join(root, 'public/Resume_Jamey_McElveen.pdf');
const port = process.env.RESUME_PDF_PORT || '3999';
const origin = `http://127.0.0.1:${port}`;

function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const mac = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (existsSync(mac)) return mac;
  throw new Error('Set CHROME_PATH to a Chromium/Chrome executable.');
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: root, stdio: 'inherit', ...opts });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve(undefined);
      else reject(new Error(`${cmd} ${args.join(' ')} exited ${code}`));
    });
  });
}

async function waitFor(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* server not up yet */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function main() {
  if (!process.env.RESUME_PDF_SKIP_BUILD) {
    await run('pnpm', ['run', 'build']);
  }

  const server = spawn('pnpm', ['exec', 'next', 'start', '-p', port], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, PORT: port },
  });

  const shutdown = () => {
    if (!server.killed) server.kill('SIGTERM');
  };
  process.on('exit', shutdown);
  process.on('SIGINT', () => {
    shutdown();
    process.exit(1);
  });

  try {
    await waitFor(`${origin}/resume/print`, 60_000);
    const browser = await puppeteer.launch({
      executablePath: chromePath(),
      headless: true,
      args: ['--disable-gpu', '--no-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(`${origin}/resume/print`, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: primaryPdf,
      printBackground: true,
      preferCSSPageSize: true,
    });
    await browser.close();
    copyFileSync(primaryPdf, aliasPdf);
    console.log('Wrote', primaryPdf);
    console.log('Wrote', aliasPdf, '(identical bytes)');
  } finally {
    shutdown();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
