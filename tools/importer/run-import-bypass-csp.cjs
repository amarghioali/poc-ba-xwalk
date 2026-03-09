const { readFileSync, mkdirSync, writeFileSync } = require('fs');
const { dirname, join } = require('path');

const SCRIPTS_DIR = '/home/node/.claude/plugins/cache/excat-marketplace/excat/2.1.1/skills/excat-content-import/scripts';

async function main() {
  const { chromium } = require(join(SCRIPTS_DIR, 'node_modules', 'playwright'));

  const url = 'https://www.aig.co.jp/sonpo';
  const bundlePath = '/workspace/tools/importer/import-homepage.bundle.js';
  const outputDir = '/workspace/content';

  const helixScript = readFileSync(join(SCRIPTS_DIR, 'static', 'inject', 'helix-importer.js'), 'utf-8');
  const importBundle = readFileSync(bundlePath, 'utf-8');

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
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('Content Security Policy') && !text.includes('postMessage')) {
        console.error('[Browser] ' + text.substring(0, 200));
      }
    }
  });

  console.log('Navigating to ' + url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  console.log('Injecting helix-importer...');
  await page.evaluate((script) => {
    const s = document.createElement('script');
    s.textContent = script;
    document.head.appendChild(s);
  }, helixScript);

  console.log('Injecting import bundle...');
  await page.evaluate((script) => {
    const s = document.createElement('script');
    s.textContent = script;
    document.head.appendChild(s);
  }, importBundle);

  console.log('Waiting for CustomImportScript...');
  await page.waitForFunction(
    () => {
      return typeof window.CustomImportScript !== 'undefined' && window.CustomImportScript.default;
    },
    { timeout: 10000 },
  );

  console.log('Running import via WebImporter.html2md (official pipeline)...');
  const result = await page.evaluate(async (pageUrl) => {
    if (!window.WebImporter || typeof window.WebImporter.html2md !== 'function') {
      throw new Error('WebImporter not available. helix-importer script failed to load.');
    }

    const customImportConfig = window.CustomImportScript?.default;
    if (!customImportConfig) {
      throw new Error('CustomImportScript not available - bundle may not have loaded correctly');
    }

    // Use the official pipeline: html2md handles transform + conversion
    const importResult = await window.WebImporter.html2md(pageUrl, document, customImportConfig, {
      toDocx: false,
      toMd: true,
      originalURL: pageUrl,
    });

    // Convert markdown to clean DA-compliant HTML
    importResult.html = window.WebImporter.md2da(importResult.md);
    return {
      path: importResult.path,
      html: importResult.html,
      report: importResult.report || {},
    };
  }, url);

  let docPath = (result.path || 'sonpo/index').replace(/^\//, '');
  // Map /sonpo to index (homepage)
  if (docPath === 'sonpo' || docPath === 'sonpo/') {
    docPath = 'index';
  }
  const filePath = join(outputDir, docPath + '.plain.html');
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, result.html);
  console.log('Saved: ' + filePath + ' (' + (result.report?.blocks?.length || 0) + ' blocks)');

  console.log('Import completed successfully!');
  await browser.close();
}

main().catch((e) => {
  console.error('Failed: ' + e.message);
  process.exit(1);
});
