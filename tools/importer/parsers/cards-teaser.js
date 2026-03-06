/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-teaser. Base: cards.
 * Source: https://www.aig.co.jp/
 * Selectors: .cmp-newslist, .columnContainer.responsivegrid.margin-bottom-m > .cmp-columncontainer--3,
 *   .ace-section:has(h2.cmp-title__text) .cmp-columncontainer--3 .ace-teaser
 *
 * Block library: 3 columns per row (item-label, image, text).
 * Container block - model (card): image (reference), text (richtext).
 * Each row = one card item with field hints for image and text.
 *
 * Source DOM patterns:
 * 1. .cmp-newslist: News list items with date, tag, title, link
 * 2. .cmp-teaser: Teaser cards with image, title, link
 * 3. .cmp-columncontainer--3 with nested teasers
 */
export default function parse(element, { document }) {
  const cells = [];

  // Pattern 1: News list (.cmp-newslist)
  const newsItems = element.querySelectorAll('.cmp-newslist__item');
  if (newsItems.length > 0) {
    newsItems.forEach((item) => {
      const link = item.querySelector('.cmp-newslist__link');
      const date = item.querySelector('.cmp-newslist-item__date');
      const tag = item.querySelector('.cmp-newslist-item__tag span');
      const title = item.querySelector('.cmp-newslist-item__title');

      // Image cell (empty for news items)
      const imageCell = document.createDocumentFragment();
      imageCell.append(document.createComment(' field:image '));

      // Text cell
      const textCell = document.createDocumentFragment();
      textCell.append(document.createComment(' field:text '));
      if (date) {
        const p = document.createElement('p');
        p.textContent = date.textContent.trim();
        textCell.append(p);
      }
      if (tag) {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = tag.textContent.trim();
        p.append(strong);
        textCell.append(p);
      }
      if (title) {
        const p = document.createElement('p');
        if (link) {
          const a = document.createElement('a');
          a.href = link.getAttribute('href') || '';
          a.textContent = title.textContent.trim();
          p.append(a);
        } else {
          p.textContent = title.textContent.trim();
        }
        textCell.append(p);
      }

      cells.push(['card', imageCell, textCell]);
    });

    const block = WebImporter.Blocks.createBlock(document, {
      name: 'cards-teaser',
      cells,
    });
    element.replaceWith(block);
    return;
  }

  // Pattern 2: Teaser cards (.cmp-teaser or .ace-teaser)
  const teasers = element.querySelectorAll('.ace-teaser, .cmp-teaser');
  if (teasers.length > 0) {
    // Deduplicate: if ace-teaser contains cmp-teaser, only process ace-teaser
    const processed = new Set();
    teasers.forEach((teaser) => {
      if (processed.has(teaser)) return;

      const innerTeaser = teaser.querySelector('.cmp-teaser');
      const target = innerTeaser || teaser;
      if (innerTeaser) processed.add(innerTeaser);

      const link = target.closest('a') || target.querySelector('a.cmp-teaser__link');
      const img = target.querySelector('.cmp-image__image, .cmp-teaser__image img, img');
      const titleEl = target.querySelector('.cmp-teaser__title, h3, h4');

      // Image cell
      const imageCell = document.createDocumentFragment();
      imageCell.append(document.createComment(' field:image '));
      if (img) {
        const imgClone = img.cloneNode(true);
        imageCell.append(imgClone);
      }

      // Text cell
      const textCell = document.createDocumentFragment();
      textCell.append(document.createComment(' field:text '));
      if (titleEl) {
        const p = document.createElement('p');
        if (link) {
          const a = document.createElement('a');
          a.href = link.getAttribute('href') || '';
          a.textContent = titleEl.textContent.trim();
          p.append(a);
        } else {
          p.textContent = titleEl.textContent.trim();
        }
        textCell.append(p);
      }

      // Extract description if present
      const desc = target.querySelector('.cmp-teaser__description, p:not(:has(a))');
      if (desc) {
        const p = document.createElement('p');
        p.textContent = desc.textContent.trim();
        textCell.append(p);
      }

      cells.push(['card', imageCell, textCell]);
    });

    const block = WebImporter.Blocks.createBlock(document, {
      name: 'cards-teaser',
      cells,
    });
    element.replaceWith(block);
    return;
  }

  // Pattern 3: Column container items as cards
  const colItems = element.querySelectorAll('.cmp-columncontainer-item');
  if (colItems.length > 0) {
    colItems.forEach((item) => {
      const img = item.querySelector('.cmp-image__image, img');
      const titleEl = item.querySelector('.cmp-teaser__title, h3, h4, .cmp-title__text');
      const link = item.querySelector('a.cmp-teaser__link, a.cmp-button, a');
      const textBlock = item.querySelector('.cmp-text, .cmp-teaser__content');

      // Image cell
      const imageCell = document.createDocumentFragment();
      imageCell.append(document.createComment(' field:image '));
      if (img) imageCell.append(img.cloneNode(true));

      // Text cell
      const textCell = document.createDocumentFragment();
      textCell.append(document.createComment(' field:text '));
      if (titleEl) {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        if (link) {
          const a = document.createElement('a');
          a.href = link.getAttribute('href') || '';
          a.textContent = titleEl.textContent.trim();
          strong.append(a);
        } else {
          strong.textContent = titleEl.textContent.trim();
        }
        p.append(strong);
        textCell.append(p);
      }
      if (textBlock) {
        const paras = textBlock.querySelectorAll('p');
        paras.forEach((para) => {
          const pClone = para.cloneNode(true);
          textCell.append(pClone);
        });
      }

      cells.push(['card', imageCell, textCell]);
    });

    const block = WebImporter.Blocks.createBlock(document, {
      name: 'cards-teaser',
      cells,
    });
    element.replaceWith(block);
    return;
  }

  // Fallback: replace with empty fragment if no content found
  element.replaceWith(document.createDocumentFragment());
}
