/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-corporate. Base: hero.
 * Source: https://www.aig.co.jp/
 * Selector: .ace-heroimage.cmp-heroimage--width-full
 *
 * Block library: 1 column, 3 rows (name, image, text).
 * Model fields: image (reference), imageAlt (collapsed), text (richtext).
 *
 * Source DOM uses CSS background-image on .cmp-heroimage-image divs
 * and optional text in .cmp-heroimage-content-wrap.
 */
export default function parse(element, { document }) {
  // Extract image: try <img> first, then background-image style
  let imageEl = element.querySelector('.cmp-heroimage img, .cmp-heroimage picture');

  if (!imageEl) {
    // Try extracting background-image from .cmp-heroimage-image (pc-only variant)
    const bgDiv = element.querySelector('.cmp-heroimage-image.pc-only, .cmp-heroimage-image');
    if (bgDiv) {
      const style = bgDiv.getAttribute('style') || '';
      const bgMatch = style.match(/background-image:\s*url\(["']?([^"')]+)["']?\)/i);
      if (bgMatch) {
        imageEl = document.createElement('img');
        imageEl.src = bgMatch[1];
        imageEl.alt = '';
      }
    }
  }

  // Extract text content from the hero overlay area
  const contentWrap = element.querySelector('.cmp-heroimage-content-wrap');
  const textContent = [];

  if (contentWrap) {
    const headings = contentWrap.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((h) => textContent.push(h));

    const paragraphs = contentWrap.querySelectorAll('p');
    paragraphs.forEach((p) => textContent.push(p));

    const links = contentWrap.querySelectorAll('a.cmp-button, a[class*="cta"]');
    links.forEach((a) => textContent.push(a));

    // If no specific elements found, take all child content
    if (textContent.length === 0) {
      const allChildren = contentWrap.querySelectorAll('*');
      allChildren.forEach((child) => {
        if (child.textContent.trim()) textContent.push(child);
      });
    }
  }

  const cells = [];

  // Row 1: Image with field hint
  const imageCell = document.createDocumentFragment();
  imageCell.append(document.createComment(' field:image '));
  if (imageEl) {
    imageCell.append(imageEl);
  }
  cells.push([imageCell]);

  // Row 2: Text content with field hint
  const textCell = document.createDocumentFragment();
  textCell.append(document.createComment(' field:text '));
  textContent.forEach((el) => textCell.append(el));
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'hero-corporate',
    cells,
  });
  element.replaceWith(block);
}
