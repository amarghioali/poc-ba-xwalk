/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-corporate. Base: hero.
 * Source: https://www.aig.co.jp/
 * Selector: .ace-heroimage.cmp-heroimage--width-full
 *
 * The AIG hero uses two CSS background-image divs:
 *   .cmp-heroimage-image.pc-only  → desktop image
 *   .cmp-heroimage-image.sp-only  → mobile image (switched at 768px)
 * Text is baked into the images (no HTML overlay).
 *
 * Content model: 2 rows — desktop image, mobile image.
 * The block JS combines them into a <picture> with media queries.
 */
export default function parse(element, { document }) {
  /**
   * Extract background-image URL from a div element.
   * Prefers getComputedStyle (resolved URL), falls back to inline style
   * with CSS unicode escape decoding (\2f → /).
   */
  function extractBgImage(div) {
    if (!div) return null;

    // Prefer computed style — returns fully resolved URL
    if (document.defaultView) {
      const computed = document.defaultView.getComputedStyle(div);
      const bgImage = computed.backgroundImage || '';
      const match = bgImage.match(/url\(["']?([^"')]+)["']?\)/i);
      if (match) return match[1];
    }

    // Fall back to inline style (may contain CSS escapes like \2f)
    const style = div.getAttribute('style') || '';
    const match = style.match(/background-image:\s*url\(["']?([^"')]+)["']?\)/i);
    if (match) {
      // Decode CSS unicode escapes
      return match[1].replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_, hex) =>
        String.fromCodePoint(parseInt(hex, 16)));
    }

    return null;
  }

  // Extract desktop (pc-only) and mobile (sp-only) background images
  const pcDiv = element.querySelector('.cmp-heroimage-image.pc-only');
  const spDiv = element.querySelector('.cmp-heroimage-image.sp-only');

  const desktopUrl = extractBgImage(pcDiv || element.querySelector('.cmp-heroimage-image'));
  const mobileUrl = extractBgImage(spDiv);

  const cells = [];

  // Row 1: Desktop image
  const desktopCell = document.createDocumentFragment();
  desktopCell.append(document.createComment(' field:image '));
  if (desktopUrl) {
    const img = document.createElement('img');
    img.src = desktopUrl;
    img.alt = '';
    const p = document.createElement('p');
    p.append(img);
    desktopCell.append(p);
  }
  cells.push([desktopCell]);

  // Row 2: Mobile image
  const mobileCell = document.createDocumentFragment();
  mobileCell.append(document.createComment(' field:mobileImage '));
  if (mobileUrl) {
    const img = document.createElement('img');
    img.src = mobileUrl;
    img.alt = '';
    const p = document.createElement('p');
    p.append(img);
    mobileCell.append(p);
  }
  cells.push([mobileCell]);

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'hero-corporate',
    cells,
  });
  element.replaceWith(block);
}
