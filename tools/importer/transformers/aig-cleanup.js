/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: AIG Japan cleanup.
 * Selectors from captured DOM of https://www.aig.co.jp/
 */
export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Resolve AEM Core Component lazy-loaded images:
    // Parent divs have data-asset (DAM path) and data-cmp-src (rendition URL);
    // child <img> has blank.gif. Prefer data-asset because .coreimg rendition
    // URLs return 405/404 when accessed externally.
    element.querySelectorAll('[data-cmp-src]').forEach((div) => {
      const img = div.querySelector('img');
      if (!img || !img.src.includes('blank.gif')) return;

      // Prefer data-asset (real DAM path) — always publicly accessible
      const damPath = div.getAttribute('data-asset');
      if (damPath) {
        img.src = new URL(damPath, payload.url).href;
      } else {
        // Fallback to data-cmp-src rendition URL (may not load externally)
        const template = div.getAttribute('data-cmp-src');
        if (template) {
          img.src = new URL(template.replace(/\{\.width\}/g, '.800'), payload.url).href;
        }
      }
      img.classList.remove('cmp-image__image--is-loading');
    });

    // Remove cookie consent, chat widgets, floating CTAs from captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.cmp-float-cta',
      '#onetrust-consent-sdk',
      '[class*="cookie"]',
      '.cmp-skip-to-main',
    ]);
  }
  if (hookName === 'afterTransform') {
    // Remove non-authorable content: header, footer, navigation from captured DOM
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      '.cmp-header',
      '.cmp-footer',
      '.ace-header',
      '.ace-footer',
      'nav',
      'iframe',
      'link',
      'noscript',
      '.conversion',
    ]);
  }
}
