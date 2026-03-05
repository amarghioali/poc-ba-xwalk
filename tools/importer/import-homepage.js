/* eslint-disable */
/* global WebImporter */

// WebImporter polyfill for standalone/validation environments
if (typeof WebImporter === 'undefined') {
  globalThis.WebImporter = {
    Blocks: {
      createBlock: (doc, config) => {
        const table = doc.createElement('table');
        const headerRow = doc.createElement('tr');
        const headerCell = doc.createElement('td');
        headerCell.colSpan = 100;
        headerCell.textContent = config.name;
        headerRow.append(headerCell);
        table.append(headerRow);
        (config.cells || []).forEach((row) => {
          const tr = doc.createElement('tr');
          (Array.isArray(row) ? row : [row]).forEach((cell) => {
            const td = doc.createElement('td');
            if (cell instanceof Node) td.append(cell);
            else td.textContent = String(cell);
            tr.append(td);
          });
          table.append(tr);
        });
        return table;
      },
    },
    DOMUtils: {
      remove: (element, selectors) => {
        selectors.forEach((sel) => {
          try {
            element.querySelectorAll(sel).forEach((el) => el.remove());
          } catch (e) { /* ignore invalid selectors */ }
        });
      },
    },
    rules: {
      createMetadata: () => {},
      transformBackgroundImages: () => {},
      adjustImageUrls: () => {},
    },
    FileUtils: {
      sanitizePath: (path) => path,
    },
  };
}

// PARSER IMPORTS - Import all parsers needed for the homepage template
import heroCorporateParser from './parsers/hero-corporate.js';
import columnsInfoParser from './parsers/columns-info.js';
import cardsTeaserParser from './parsers/cards-teaser.js';
import tabsProductParser from './parsers/tabs-product.js';

// TRANSFORMER IMPORTS - Import all transformers for AIG Japan site
import aigCleanupTransformer from './transformers/aig-cleanup.js';
import aigSectionsTransformer from './transformers/aig-sections.js';

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'hero-corporate': heroCorporateParser,
  'columns-info': columnsInfoParser,
  'cards-teaser': cardsTeaserParser,
  'tabs-product': tabsProductParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'AIG Japan corporate homepage with hero, product navigation, and promotional content',
  urls: [
    'https://www.aig.co.jp/',
  ],
  blocks: [
    {
      name: 'hero-corporate',
      instances: [
        '.ace-heroimage.cmp-heroimage--width-full',
      ],
    },
    {
      name: 'columns-info',
      instances: [
        '.ace-section.cmp-section--blue .cmp-columncontainer--2col-1_1',
        '.cmp-section--white.cmp-section--secondary-bordered',
        '.ace-section.cmp-section--light-gray .cmp-columncontainer--',
        '.cmp-columncontainer--3:has(.cmp-section--core-blue)',
        '.cmp-columncontainer--2col-1_2',
        '.cmp-columncontainer--2col-2_1',
        '.ace-section.cmp-section--background-full .cmp-columncontainer--',
      ],
    },
    {
      name: 'cards-teaser',
      instances: [
        '.cmp-newslist',
        '.columnContainer.responsivegrid.margin-bottom-m > .cmp-columncontainer--3',
        '.ace-section:has(h2.cmp-title__text) .cmp-columncontainer--3 .ace-teaser',
      ],
    },
    {
      name: 'tabs-product',
      instances: [
        '.cmp-aigtabs',
      ],
    },
  ],
  sections: [
    {
      id: 'section-hero',
      name: 'Hero Banner',
      selector: '.ace-heroimage.cmp-heroimage--width-full',
      style: null,
      blocks: ['hero-corporate'],
      defaultContent: [],
    },
    {
      id: 'section-contact-cta',
      name: 'Contact CTA Bar',
      selector: '.ace-section.cmp-section--primary.cmp-section--blue.cmp-section--background-full',
      style: 'blue',
      blocks: ['columns-info'],
      defaultContent: [],
    },
    {
      id: 'section-announcements',
      name: 'Announcements / News',
      selector: [
        '.ace-title.cmp-title--plain.h4',
        '.ace-list',
        '.ace-list.cmp-list--horizontal',
      ],
      style: null,
      blocks: ['cards-teaser'],
      defaultContent: ['.ace-title h2.cmp-title__text', '.cmp-list--horizontal'],
    },
    {
      id: 'section-notice',
      name: 'Notice / Warning',
      selector: '.ace-section.cmp-section--white.cmp-section--secondary-bordered',
      style: null,
      blocks: ['columns-info'],
      defaultContent: [],
    },
    {
      id: 'section-company-cards',
      name: 'Company Info Cards',
      selector: '.columnContainer.responsivegrid.margin-bottom-m',
      style: null,
      blocks: ['cards-teaser'],
      defaultContent: [],
    },
    {
      id: 'section-hot-topics',
      name: 'Hot Topics',
      selector: '.ace-section:has(h2.cmp-title__text)',
      style: null,
      blocks: ['cards-teaser'],
      defaultContent: ['h2.cmp-title__text'],
    },
    {
      id: 'section-online-contract',
      name: 'Online Contract',
      selector: '.ace-section.cmp-section--primary.cmp-section--light-gray.cmp-section--background-full',
      style: 'light-grey',
      blocks: ['columns-info'],
      defaultContent: ['h2.cmp-section-header__title'],
    },
    {
      id: 'section-insurance-products',
      name: 'Insurance Products (Tabs)',
      selector: '.ace-section.cmp-section--primary:has(.cmp-aigtabs)',
      style: null,
      blocks: ['tabs-product'],
      defaultContent: ['h2.cmp-section-header__title'],
    },
    {
      id: 'section-about-aig',
      name: 'About AIG Insurance',
      selector: '.ace-section.cmp-section--primary:has(h2.cmp-section-header__title)',
      style: null,
      blocks: ['columns-info'],
      defaultContent: [
        'h2.cmp-section-header__title',
        '.ace-title.cmp-title--plain h2',
        '.ace-text.std-padding-bottom .cmp-text',
        '.ace-text.cmp-text--right .cmp-text',
      ],
    },
    {
      id: 'section-about-aig-group',
      name: 'About AIG Group',
      selector: '.ace-section.cmp-section--primary.cmp-section--light-gray:has(h2.cmp-section-header__title)',
      style: 'light-grey',
      blocks: ['columns-info'],
      defaultContent: ['h2.cmp-section-header__title'],
    },
    {
      id: 'section-80th-anniversary',
      name: '80th Anniversary Banner',
      selector: ".ace-section:has(img.cmp-image__image[src*='aig-80th'])",
      style: null,
      blocks: [],
      defaultContent: ['.ace-image', '.ace-text.cmp-text--right'],
    },
    {
      id: 'section-recruitment',
      name: 'Recruitment',
      selector: '.ace-section.cmp-section--primary.cmp-section--light-gray:has(h2.cmp-section-header__title)',
      style: 'light-grey',
      blocks: ['columns-info'],
      defaultContent: ['h2.cmp-section-header__title'],
    },
    {
      id: 'section-digital-services',
      name: 'Digital Services & Certificates',
      selector: '.ace-section.cmp-section--primary.cmp-section--background-full:has(h2.cmp-section-header__title)',
      style: null,
      blocks: ['columns-info'],
      defaultContent: ['h2.cmp-section-header__title'],
    },
  ],
};

// TRANSFORMER REGISTRY - Array of transformer functions
// Section transformer is included since template has 13 sections (> 1)
const transformers = [
  aigCleanupTransformer,
  aigSectionsTransformer,
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
          });
        });
      } catch (e) {
        console.warn(`Invalid selector for block "${blockDef.name}": ${selector}`, e);
      }
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  /**
   * Main transformation function using Helix Importer transform() pattern
   */
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules (when available)
    const hr = document.createElement('hr');
    main.appendChild(hr);
    if (typeof WebImporter !== 'undefined' && WebImporter.rules) {
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    }

    // 6. Generate sanitized path
    const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index';
    const path = (typeof WebImporter !== 'undefined' && WebImporter.FileUtils)
      ? WebImporter.FileUtils.sanitizePath(rawPath)
      : rawPath;

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
