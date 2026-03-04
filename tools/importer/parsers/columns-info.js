/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-info. Base: columns.
 * Source: https://www.aig.co.jp/
 * Selectors: .cmp-columncontainer--2col-1_1, .cmp-columncontainer--3,
 *   .cmp-columncontainer--2col-1_2, .cmp-columncontainer--2col-2_1
 *
 * Block library: Multiple columns per row, each cell = default content.
 * Columns blocks do NOT use field hint comments (hinting.md Rule 4 exception).
 *
 * Source DOM: .cmp-columncontainer with .cmp-columncontainer-item children.
 * Each item contains buttons, text, images, teasers in nested AEM grid.
 */
export default function parse(element, { document }) {
  // Find column items
  const columnItems = element.querySelectorAll(':scope > .cmp-columncontainer-item');

  if (!columnItems.length) {
    // Fallback: try without :scope
    const items = element.querySelectorAll('.cmp-columncontainer-item');
    if (!items.length) return element.replaceWith(document.createDocumentFragment());
    return buildBlock(items, element, document);
  }

  buildBlock(columnItems, element, document);
}

function buildBlock(columnItems, element, document) {
  const row = [];

  columnItems.forEach((item) => {
    const cellContent = document.createDocumentFragment();

    // Extract buttons/links
    const buttons = item.querySelectorAll('.cmp-button');
    buttons.forEach((btn) => {
      const href = btn.getAttribute('href') || btn.closest('a')?.getAttribute('href');
      const text = btn.querySelector('.cmp-button-main__text')?.textContent?.trim();
      if (href && text) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = href;
        a.textContent = text;
        p.append(a);
        cellContent.append(p);
      }
    });

    // Extract text blocks
    const texts = item.querySelectorAll('.cmp-text');
    texts.forEach((t) => {
      const cloned = t.cloneNode(true);
      cellContent.append(cloned);
    });

    // Extract titles/headings
    const titles = item.querySelectorAll('.cmp-title__text');
    titles.forEach((t) => {
      const heading = document.createElement(t.tagName || 'h3');
      heading.textContent = t.textContent.trim();
      cellContent.append(heading);
    });

    // Extract images
    const images = item.querySelectorAll('.cmp-image__image, img');
    images.forEach((img) => {
      const cloned = img.cloneNode(true);
      cellContent.append(cloned);
    });

    // Extract teasers (image + title link)
    const teasers = item.querySelectorAll('.cmp-teaser');
    teasers.forEach((teaser) => {
      const link = teaser.closest('a') || teaser.querySelector('a.cmp-teaser__link');
      const teaserImg = teaser.querySelector('.cmp-image__image, img');
      const teaserTitle = teaser.querySelector('.cmp-teaser__title');

      if (teaserImg) cellContent.append(teaserImg.cloneNode(true));
      if (teaserTitle && link) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = link.getAttribute('href') || '';
        a.textContent = teaserTitle.textContent.trim();
        p.append(a);
        cellContent.append(p);
      } else if (teaserTitle) {
        const p = document.createElement('p');
        p.textContent = teaserTitle.textContent.trim();
        cellContent.append(p);
      }
    });

    // If nothing extracted, take raw inner content
    if (!cellContent.childNodes.length) {
      const allContent = item.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, img, ul, ol');
      allContent.forEach((el) => cellContent.append(el.cloneNode(true)));
    }

    row.push(cellContent);
  });

  const cells = [row];

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'columns-info',
    cells,
  });
  element.replaceWith(block);
}
