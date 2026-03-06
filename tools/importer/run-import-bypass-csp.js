#!/usr/bin/env node
/**
 * Import runner with CSP bypass for sites with strict Content Security Policy.
 * Wraps the same logic as run-bulk-import.js but adds bypassCSP: true.
 */
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCRIPTS_DIR = '/home/node/.claude/plugins/cache/excat-marketplace/excat/2.1.1/skills/excat-content-import/scripts';

const url = process.argv[2];
const bundlePath = process.argv[3] || 'tools/importer/import-homepage.bundle.js';
const outputDir = 'content';

if (!url) {
  console.error('Usage: node run-import-bypass-csp.js <url> [bundle-path]');
  process.exit(1);
}

const helixScript = readFileSync(join(SCRIPTS_DIR, 'static', 'inject', 'helix-importer.js'), 'utf-8');
const importBundle = readFileSync(resolve(bundlePath), 'utf-8');

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  bypassCSP: true,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ignoreHTTPSErrors: true,
});

const page = await context.newPage();
page.on('console', msg => {
  if (msg.type() === 'error') console.error(`[Browser] ${msg.text()}`);
});

try {
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  // Inject helix-importer
  await page.evaluate(script => {
    const s = document.createElement('script');
    s.textContent = script;
    document.head.appendChild(s);
  }, helixScript);

  // Inject import bundle
  await page.evaluate(script => {
    const s = document.createElement('script');
    s.textContent = script;
    document.head.appendChild(s);
  }, importBundle);

  // Wait for CustomImportScript
  await page.waitForFunction(
    () => typeof window.CustomImportScript !== 'undefined' && window.CustomImportScript?.default,
    { timeout: 10000 }
  );

  console.log('Running import transform...');
  const result = await page.evaluate(async (pageUrl) => {
    const config = window.CustomImportScript.default;
    if (!config || typeof config.transform !== 'function') {
      throw new Error('No transform function found');
    }

    const results = config.transform({
      document,
      url: pageUrl,
      html: document.documentElement.outerHTML,
      params: { originalURL: pageUrl },
    });

    if (!results || results.length === 0) {
      throw new Error('Transform returned no results');
    }

    return results.map(r => ({
      path: r.path,
      html: window.WebImporter.html2md(r.path, r.element.outerHTML, document, { toMd: false }),
      report: r.report,
    }));
  }, url);

  for (const item of result) {
    const docPath = item.path.replace(/^\//, '') || 'index';
    const filePath = join(outputDir, `${docPath}.plain.html`);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, item.html);
    console.log(`✅ Saved: ${filePath} (${item.report?.blocks?.length || 0} blocks)`);
  }

  console.log(`\nImport completed successfully!`);
} catch (error) {
  console.error(`❌ Failed: ${error.message}`);
  process.exit(1);
} finally {
  await browser.close();
}
