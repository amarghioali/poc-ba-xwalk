var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-corporate.js
  function parse(element, { document: document2 }) {
    let imageEl = element.querySelector(".cmp-heroimage img, .cmp-heroimage picture");
    if (!imageEl) {
      const bgDiv = element.querySelector(".cmp-heroimage-image.pc-only, .cmp-heroimage-image");
      if (bgDiv) {
        const style = bgDiv.getAttribute("style") || "";
        const bgMatch = style.match(/background-image:\s*url\(["']?([^"')]+)["']?\)/i);
        if (bgMatch) {
          imageEl = document2.createElement("img");
          imageEl.src = bgMatch[1];
          imageEl.alt = "";
        }
      }
    }
    const contentWrap = element.querySelector(".cmp-heroimage-content-wrap");
    const textContent = [];
    if (contentWrap) {
      const headings = contentWrap.querySelectorAll("h1, h2, h3, h4, h5, h6");
      headings.forEach((h) => textContent.push(h));
      const paragraphs = contentWrap.querySelectorAll("p");
      paragraphs.forEach((p) => textContent.push(p));
      const links = contentWrap.querySelectorAll('a.cmp-button, a[class*="cta"]');
      links.forEach((a) => textContent.push(a));
      if (textContent.length === 0) {
        const allChildren = contentWrap.querySelectorAll("*");
        allChildren.forEach((child) => {
          if (child.textContent.trim()) textContent.push(child);
        });
      }
    }
    const cells = [];
    const imageCell = document2.createDocumentFragment();
    imageCell.append(document2.createComment(" field:image "));
    if (imageEl) {
      imageCell.append(imageEl);
    }
    cells.push([imageCell]);
    const textCell = document2.createDocumentFragment();
    textCell.append(document2.createComment(" field:text "));
    textContent.forEach((el) => textCell.append(el));
    cells.push([textCell]);
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "hero-corporate",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-info.js
  function parse2(element, { document: document2 }) {
    const columnItems = element.querySelectorAll(":scope > .cmp-columncontainer-item");
    if (!columnItems.length) {
      const items = element.querySelectorAll(".cmp-columncontainer-item");
      if (!items.length) return element.replaceWith(document2.createDocumentFragment());
      return buildBlock(items, element, document2);
    }
    buildBlock(columnItems, element, document2);
  }
  function buildBlock(columnItems, element, document2) {
    const row = [];
    columnItems.forEach((item) => {
      const cellContent = document2.createDocumentFragment();
      const buttons = item.querySelectorAll(".cmp-button");
      buttons.forEach((btn) => {
        var _a, _b, _c;
        const href = btn.getAttribute("href") || ((_a = btn.closest("a")) == null ? void 0 : _a.getAttribute("href"));
        const text = (_c = (_b = btn.querySelector(".cmp-button-main__text")) == null ? void 0 : _b.textContent) == null ? void 0 : _c.trim();
        if (href && text) {
          const p = document2.createElement("p");
          const a = document2.createElement("a");
          a.href = href;
          a.textContent = text;
          p.append(a);
          cellContent.append(p);
        }
      });
      const texts = item.querySelectorAll(".cmp-text");
      texts.forEach((t) => {
        const cloned = t.cloneNode(true);
        cellContent.append(cloned);
      });
      const titles = item.querySelectorAll(".cmp-title__text");
      titles.forEach((t) => {
        const heading = document2.createElement(t.tagName || "h3");
        heading.textContent = t.textContent.trim();
        cellContent.append(heading);
      });
      const images = item.querySelectorAll(".cmp-image__image, img");
      images.forEach((img) => {
        const cloned = img.cloneNode(true);
        cellContent.append(cloned);
      });
      const teasers = item.querySelectorAll(".cmp-teaser");
      teasers.forEach((teaser) => {
        const link = teaser.closest("a") || teaser.querySelector("a.cmp-teaser__link");
        const teaserImg = teaser.querySelector(".cmp-image__image, img");
        const teaserTitle = teaser.querySelector(".cmp-teaser__title");
        if (teaserImg) cellContent.append(teaserImg.cloneNode(true));
        if (teaserTitle && link) {
          const p = document2.createElement("p");
          const a = document2.createElement("a");
          a.href = link.getAttribute("href") || "";
          a.textContent = teaserTitle.textContent.trim();
          p.append(a);
          cellContent.append(p);
        } else if (teaserTitle) {
          const p = document2.createElement("p");
          p.textContent = teaserTitle.textContent.trim();
          cellContent.append(p);
        }
      });
      if (!cellContent.childNodes.length) {
        const allContent = item.querySelectorAll("p, h1, h2, h3, h4, h5, h6, a, img, ul, ol");
        allContent.forEach((el) => cellContent.append(el.cloneNode(true)));
      }
      row.push(cellContent);
    });
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "columns-info",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-teaser.js
  function parse3(element, { document: document2 }) {
    const cells = [];
    const newsItems = element.querySelectorAll(".cmp-newslist__item");
    if (newsItems.length > 0) {
      newsItems.forEach((item) => {
        const link = item.querySelector(".cmp-newslist__link");
        const date = item.querySelector(".cmp-newslist-item__date");
        const tag = item.querySelector(".cmp-newslist-item__tag span");
        const title = item.querySelector(".cmp-newslist-item__title");
        const imageCell = document2.createDocumentFragment();
        imageCell.append(document2.createComment(" field:image "));
        const textCell = document2.createDocumentFragment();
        textCell.append(document2.createComment(" field:text "));
        if (date) {
          const p = document2.createElement("p");
          p.textContent = date.textContent.trim();
          textCell.append(p);
        }
        if (tag) {
          const p = document2.createElement("p");
          const strong = document2.createElement("strong");
          strong.textContent = tag.textContent.trim();
          p.append(strong);
          textCell.append(p);
        }
        if (title) {
          const p = document2.createElement("p");
          if (link) {
            const a = document2.createElement("a");
            a.href = link.getAttribute("href") || "";
            a.textContent = title.textContent.trim();
            p.append(a);
          } else {
            p.textContent = title.textContent.trim();
          }
          textCell.append(p);
        }
        cells.push(["card", imageCell, textCell]);
      });
      const block = WebImporter.Blocks.createBlock(document2, {
        name: "cards-teaser",
        cells
      });
      element.replaceWith(block);
      return;
    }
    const teasers = element.querySelectorAll(".ace-teaser, .cmp-teaser");
    if (teasers.length > 0) {
      const processed = /* @__PURE__ */ new Set();
      teasers.forEach((teaser) => {
        if (processed.has(teaser)) return;
        const innerTeaser = teaser.querySelector(".cmp-teaser");
        const target = innerTeaser || teaser;
        if (innerTeaser) processed.add(innerTeaser);
        const link = target.closest("a") || target.querySelector("a.cmp-teaser__link");
        const img = target.querySelector(".cmp-image__image, .cmp-teaser__image img, img");
        const titleEl = target.querySelector(".cmp-teaser__title, h3, h4");
        const imageCell = document2.createDocumentFragment();
        imageCell.append(document2.createComment(" field:image "));
        if (img) {
          const imgClone = img.cloneNode(true);
          imageCell.append(imgClone);
        }
        const textCell = document2.createDocumentFragment();
        textCell.append(document2.createComment(" field:text "));
        if (titleEl) {
          const p = document2.createElement("p");
          if (link) {
            const a = document2.createElement("a");
            a.href = link.getAttribute("href") || "";
            a.textContent = titleEl.textContent.trim();
            p.append(a);
          } else {
            p.textContent = titleEl.textContent.trim();
          }
          textCell.append(p);
        }
        const desc = target.querySelector(".cmp-teaser__description, p:not(:has(a))");
        if (desc) {
          const p = document2.createElement("p");
          p.textContent = desc.textContent.trim();
          textCell.append(p);
        }
        cells.push(["card", imageCell, textCell]);
      });
      const block = WebImporter.Blocks.createBlock(document2, {
        name: "cards-teaser",
        cells
      });
      element.replaceWith(block);
      return;
    }
    const colItems = element.querySelectorAll(".cmp-columncontainer-item");
    if (colItems.length > 0) {
      colItems.forEach((item) => {
        const img = item.querySelector(".cmp-image__image, img");
        const titleEl = item.querySelector(".cmp-teaser__title, h3, h4, .cmp-title__text");
        const link = item.querySelector("a.cmp-teaser__link, a.cmp-button, a");
        const textBlock = item.querySelector(".cmp-text, .cmp-teaser__content");
        const imageCell = document2.createDocumentFragment();
        imageCell.append(document2.createComment(" field:image "));
        if (img) imageCell.append(img.cloneNode(true));
        const textCell = document2.createDocumentFragment();
        textCell.append(document2.createComment(" field:text "));
        if (titleEl) {
          const p = document2.createElement("p");
          const strong = document2.createElement("strong");
          if (link) {
            const a = document2.createElement("a");
            a.href = link.getAttribute("href") || "";
            a.textContent = titleEl.textContent.trim();
            strong.append(a);
          } else {
            strong.textContent = titleEl.textContent.trim();
          }
          p.append(strong);
          textCell.append(p);
        }
        if (textBlock) {
          const paras = textBlock.querySelectorAll("p");
          paras.forEach((para) => {
            const pClone = para.cloneNode(true);
            textCell.append(pClone);
          });
        }
        cells.push(["card", imageCell, textCell]);
      });
      const block = WebImporter.Blocks.createBlock(document2, {
        name: "cards-teaser",
        cells
      });
      element.replaceWith(block);
      return;
    }
    element.replaceWith(document2.createDocumentFragment());
  }

  // tools/importer/parsers/tabs-product.js
  function parse4(element, { document: document2 }) {
    const cells = [];
    const tablist = element.querySelector(".cmp-aigtabs__tablist:not(.cmp-aigtabs__tablist--bottom)");
    const tabLabels = tablist ? Array.from(tablist.querySelectorAll(".cmp-aigtabs__tab")) : [];
    const tabPanels = Array.from(element.querySelectorAll(".cmp-aigtabs__tabpanel"));
    const tabCount = Math.max(tabLabels.length, tabPanels.length);
    for (let i = 0; i < tabCount; i++) {
      const titleCell = document2.createDocumentFragment();
      titleCell.append(document2.createComment(" field:title "));
      const labelText = tabLabels[i] ? tabLabels[i].textContent.trim().replace(/^\s*/, "") : `Tab ${i + 1}`;
      const titleP = document2.createElement("p");
      titleP.textContent = labelText;
      titleCell.append(titleP);
      const contentCell = document2.createDocumentFragment();
      const panel = tabPanels[i];
      if (panel) {
        const heading = panel.querySelector(
          ".cmp-title__text, h2, h3, h4"
        );
        if (heading) {
          contentCell.append(document2.createComment(" field:content_heading "));
          const headingTag = heading.tagName || "h3";
          const h = document2.createElement(headingTag.toLowerCase());
          h.textContent = heading.textContent.trim();
          contentCell.append(h);
        }
        const images = panel.querySelectorAll('.cmp-image__image, img:not([src*="icon"])');
        if (images.length > 0) {
          contentCell.append(document2.createComment(" field:content_image "));
          images.forEach((img) => contentCell.append(img.cloneNode(true)));
        }
        contentCell.append(document2.createComment(" field:content_richtext "));
        const buttons = panel.querySelectorAll(".cmp-button");
        buttons.forEach((btn) => {
          var _a, _b;
          const anchor = btn.closest("a") || ((_a = btn.parentElement) == null ? void 0 : _a.closest("a"));
          const href = (anchor == null ? void 0 : anchor.getAttribute("href")) || btn.getAttribute("href");
          const iconSpan = btn.querySelector(".cmp-button-main__icon");
          const textSpan = btn.querySelector(".cmp-button-main__text");
          const text = (_b = textSpan == null ? void 0 : textSpan.textContent) == null ? void 0 : _b.trim();
          if (href && text) {
            const p = document2.createElement("p");
            const a = document2.createElement("a");
            a.href = href;
            a.textContent = text;
            p.append(a);
            contentCell.append(p);
          }
        });
        const textBlocks = panel.querySelectorAll(".cmp-text p");
        textBlocks.forEach((p) => {
          const cloned = p.cloneNode(true);
          contentCell.append(cloned);
        });
        const subHeadings = panel.querySelectorAll(".ace-title .cmp-title__text");
        subHeadings.forEach((sh) => {
          var _a;
          if (heading && sh === heading) return;
          const h = document2.createElement(((_a = sh.tagName) == null ? void 0 : _a.toLowerCase()) || "h4");
          h.textContent = sh.textContent.trim();
          contentCell.append(h);
        });
      }
      cells.push([titleCell, contentCell]);
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "tabs-product",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/transformers/aig-cleanup.js
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [
        ".cmp-float-cta",
        "#onetrust-consent-sdk",
        '[class*="cookie"]',
        ".cmp-skip-to-main"
      ]);
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        ".cmp-header",
        ".cmp-footer",
        ".ace-header",
        ".ace-footer",
        "nav",
        "iframe",
        "link",
        "noscript",
        ".conversion"
      ]);
    }
  }

  // tools/importer/transformers/aig-sections.js
  function transform2(hookName, element, payload) {
    if (hookName === "afterTransform") {
      const sections = payload && payload.template && payload.template.sections;
      if (!sections || sections.length < 2) return;
      const reversedSections = [...sections].reverse();
      for (const section of reversedSections) {
        const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
        let sectionEl = null;
        for (const sel of selectors) {
          try {
            sectionEl = element.querySelector(sel);
          } catch (e) {
          }
          if (sectionEl) break;
        }
        if (!sectionEl) continue;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadata);
        }
        const isFirst = sections.indexOf(section) === 0;
        if (!isFirst && sectionEl.previousElementSibling) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-corporate": parse,
    "columns-info": parse2,
    "cards-teaser": parse3,
    "tabs-product": parse4
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "AIG Japan corporate homepage with hero, product navigation, and promotional content",
    urls: [
      "https://www.aig.co.jp/"
    ],
    blocks: [
      {
        name: "hero-corporate",
        instances: [
          ".ace-heroimage.cmp-heroimage--width-full"
        ]
      },
      {
        name: "columns-info",
        instances: [
          ".ace-section.cmp-section--blue .cmp-columncontainer--2col-1_1",
          ".cmp-section--white.cmp-section--secondary-bordered",
          ".ace-section.cmp-section--light-gray .cmp-columncontainer--",
          ".cmp-columncontainer--3:has(.cmp-section--core-blue)",
          ".cmp-columncontainer--2col-1_2",
          ".cmp-columncontainer--2col-2_1",
          ".ace-section.cmp-section--background-full .cmp-columncontainer--"
        ]
      },
      {
        name: "cards-teaser",
        instances: [
          ".cmp-newslist",
          ".columnContainer.responsivegrid.margin-bottom-m > .cmp-columncontainer--3",
          ".ace-section:has(h2.cmp-title__text) .cmp-columncontainer--3 .ace-teaser"
        ]
      },
      {
        name: "tabs-product",
        instances: [
          ".cmp-aigtabs"
        ]
      }
    ],
    sections: [
      {
        id: "section-hero",
        name: "Hero Banner",
        selector: ".ace-heroimage.cmp-heroimage--width-full",
        style: null,
        blocks: ["hero-corporate"],
        defaultContent: []
      },
      {
        id: "section-contact-cta",
        name: "Contact CTA Bar",
        selector: ".ace-section.cmp-section--primary.cmp-section--blue.cmp-section--background-full",
        style: "blue",
        blocks: ["columns-info"],
        defaultContent: []
      },
      {
        id: "section-announcements",
        name: "Announcements / News",
        selector: [
          ".ace-title.cmp-title--plain.h4",
          ".ace-list",
          ".ace-list.cmp-list--horizontal"
        ],
        style: null,
        blocks: ["cards-teaser"],
        defaultContent: [".ace-title h2.cmp-title__text", ".cmp-list--horizontal"]
      },
      {
        id: "section-notice",
        name: "Notice / Warning",
        selector: ".ace-section.cmp-section--white.cmp-section--secondary-bordered",
        style: null,
        blocks: ["columns-info"],
        defaultContent: []
      },
      {
        id: "section-company-cards",
        name: "Company Info Cards",
        selector: ".columnContainer.responsivegrid.margin-bottom-m",
        style: null,
        blocks: ["cards-teaser"],
        defaultContent: []
      },
      {
        id: "section-hot-topics",
        name: "Hot Topics",
        selector: ".ace-section:has(h2.cmp-title__text)",
        style: null,
        blocks: ["cards-teaser"],
        defaultContent: ["h2.cmp-title__text"]
      },
      {
        id: "section-online-contract",
        name: "Online Contract",
        selector: ".ace-section.cmp-section--primary.cmp-section--light-gray.cmp-section--background-full",
        style: "light-grey",
        blocks: ["columns-info"],
        defaultContent: ["h2.cmp-section-header__title"]
      },
      {
        id: "section-insurance-products",
        name: "Insurance Products (Tabs)",
        selector: ".ace-section.cmp-section--primary:has(.cmp-aigtabs)",
        style: null,
        blocks: ["tabs-product"],
        defaultContent: ["h2.cmp-section-header__title"]
      },
      {
        id: "section-about-aig",
        name: "About AIG Insurance",
        selector: ".ace-section.cmp-section--primary:has(h2.cmp-section-header__title)",
        style: null,
        blocks: ["columns-info"],
        defaultContent: [
          "h2.cmp-section-header__title",
          ".ace-title.cmp-title--plain h2",
          ".ace-text.std-padding-bottom .cmp-text",
          ".ace-text.cmp-text--right .cmp-text"
        ]
      },
      {
        id: "section-about-aig-group",
        name: "About AIG Group",
        selector: ".ace-section.cmp-section--primary.cmp-section--light-gray:has(h2.cmp-section-header__title)",
        style: "light-grey",
        blocks: ["columns-info"],
        defaultContent: ["h2.cmp-section-header__title"]
      },
      {
        id: "section-80th-anniversary",
        name: "80th Anniversary Banner",
        selector: ".ace-section:has(img.cmp-image__image[src*='aig-80th'])",
        style: null,
        blocks: [],
        defaultContent: [".ace-image", ".ace-text.cmp-text--right"]
      },
      {
        id: "section-recruitment",
        name: "Recruitment",
        selector: ".ace-section.cmp-section--primary.cmp-section--light-gray:has(h2.cmp-section-header__title)",
        style: "light-grey",
        blocks: ["columns-info"],
        defaultContent: ["h2.cmp-section-header__title"]
      },
      {
        id: "section-digital-services",
        name: "Digital Services & Certificates",
        selector: ".ace-section.cmp-section--primary.cmp-section--background-full:has(h2.cmp-section-header__title)",
        style: null,
        blocks: ["columns-info"],
        defaultContent: ["h2.cmp-section-header__title"]
      }
    ]
  };
  var transformers = [
    transform,
    transform2
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        try {
          const elements = document2.querySelectorAll(selector);
          elements.forEach((element) => {
            pageBlocks.push({
              name: blockDef.name,
              selector,
              element
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
  var import_homepage_default = {
    /**
     * Main transformation function using Helix Importer transform() pattern
     */
    transform: (payload) => {
      const { document: document2, url, html, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
