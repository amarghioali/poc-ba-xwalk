/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: AIG Japan section breaks and section-metadata.
 * Runs in afterTransform only.
 * Uses payload.template.sections from page-templates.json to insert
 * <hr> section breaks and Section Metadata blocks for styled sections.
 */
export default function transform(hookName, element, payload) {
  if (hookName === 'afterTransform') {
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    // Process sections in reverse order to preserve DOM positions
    const reversedSections = [...sections].reverse();

    for (const section of reversedSections) {
      // Resolve selector: can be a string or array of strings
      const selectors = Array.isArray(section.selector)
        ? section.selector
        : [section.selector];

      let sectionEl = null;
      for (const sel of selectors) {
        try {
          sectionEl = element.querySelector(sel);
        } catch (e) {
          // invalid selector, try next
        }
        if (sectionEl) break;
      }

      if (!sectionEl) continue;

      // Add Section Metadata block if section has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(sectionMetadata);
      }

      // Add <hr> before section if it's not the first section
      // and there is content before it
      const isFirst = sections.indexOf(section) === 0;
      if (!isFirst && sectionEl.previousElementSibling) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
