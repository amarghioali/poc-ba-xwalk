/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: AIG Japan cleanup.
 * Selectors from captured DOM of https://www.aig.co.jp/
 */
export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
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
