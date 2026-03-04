/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tabs-product. Base: tabs.
 * Source: https://www.aig.co.jp/
 * Selector: .cmp-aigtabs
 *
 * Block library: 2 columns per row (tab-label, tab-content).
 * Container block - model (tabs-product-item):
 *   title (text), content_heading (text), content_headingType (select, collapsed),
 *   content_image (reference), content_richtext (richtext).
 *
 * Source DOM: .cmp-aigtabs with .cmp-aigtabs__tablist (labels)
 * and .cmp-aigtabs__tabpanel (content panels).
 * Tab labels from ol.cmp-aigtabs__tablist > li.cmp-aigtabs__tab.
 * Tab content from div.cmp-aigtabs__tabpanel with nested sections/buttons.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Get tab labels from the first (top) tablist only
  const tablist = element.querySelector('.cmp-aigtabs__tablist:not(.cmp-aigtabs__tablist--bottom)');
  const tabLabels = tablist
    ? Array.from(tablist.querySelectorAll('.cmp-aigtabs__tab'))
    : [];

  // Get tab panels
  const tabPanels = Array.from(element.querySelectorAll('.cmp-aigtabs__tabpanel'));

  // Build rows: one per tab
  const tabCount = Math.max(tabLabels.length, tabPanels.length);

  for (let i = 0; i < tabCount; i++) {
    // Column 1: Tab title with field hint
    const titleCell = document.createDocumentFragment();
    titleCell.append(document.createComment(' field:title '));
    const labelText = tabLabels[i]
      ? tabLabels[i].textContent.trim().replace(/^\s*/, '')
      : `Tab ${i + 1}`;
    const titleP = document.createElement('p');
    titleP.textContent = labelText;
    titleCell.append(titleP);

    // Column 2: Tab content with grouped field hints
    const contentCell = document.createDocumentFragment();

    const panel = tabPanels[i];
    if (panel) {
      // Extract heading
      const heading = panel.querySelector(
        '.cmp-title__text, h2, h3, h4'
      );
      if (heading) {
        contentCell.append(document.createComment(' field:content_heading '));
        const headingTag = heading.tagName || 'h3';
        const h = document.createElement(headingTag.toLowerCase());
        h.textContent = heading.textContent.trim();
        contentCell.append(h);
      }

      // Extract images (if any product images exist)
      const images = panel.querySelectorAll('.cmp-image__image, img:not([src*="icon"])');
      if (images.length > 0) {
        contentCell.append(document.createComment(' field:content_image '));
        images.forEach((img) => contentCell.append(img.cloneNode(true)));
      }

      // Extract rich content: buttons/links, text, nested structures
      contentCell.append(document.createComment(' field:content_richtext '));

      // Extract product buttons as linked items
      const buttons = panel.querySelectorAll('.cmp-button');
      buttons.forEach((btn) => {
        const anchor = btn.closest('a') || btn.parentElement?.closest('a');
        const href = anchor?.getAttribute('href') || btn.getAttribute('href');
        const iconSpan = btn.querySelector('.cmp-button-main__icon');
        const textSpan = btn.querySelector('.cmp-button-main__text');
        const text = textSpan?.textContent?.trim();

        if (href && text) {
          const p = document.createElement('p');
          const a = document.createElement('a');
          a.href = href;
          a.textContent = text;
          p.append(a);
          contentCell.append(p);
        }
      });

      // Extract additional text paragraphs
      const textBlocks = panel.querySelectorAll('.cmp-text p');
      textBlocks.forEach((p) => {
        const cloned = p.cloneNode(true);
        contentCell.append(cloned);
      });

      // Extract additional headings (sub-sections within tab)
      const subHeadings = panel.querySelectorAll('.ace-title .cmp-title__text');
      subHeadings.forEach((sh) => {
        // Skip if already captured as main heading
        if (heading && sh === heading) return;
        const h = document.createElement(sh.tagName?.toLowerCase() || 'h4');
        h.textContent = sh.textContent.trim();
        contentCell.append(h);
      });
    }

    cells.push([titleCell, contentCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'tabs-product',
    cells,
  });
  element.replaceWith(block);
}
