import { getMetadata } from '../../scripts/aem.js';
import { fetchPlaceholders } from '../../scripts/placeholders.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

function getDirectTextContent(menuItem) {
  const menuLink = menuItem.querySelector(':scope > :where(a,p)');
  if (menuLink) {
    return menuLink.textContent.trim();
  }
  return Array.from(menuItem.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ');
}

async function buildBreadcrumbsFromNavTree(nav, currentUrl) {
  const crumbs = [];

  const homeUrl = document.querySelector('.nav-brand a[href]').href;

  let menuItem = Array.from(nav.querySelectorAll('a')).find((a) => a.href === currentUrl);
  if (menuItem) {
    do {
      const link = menuItem.querySelector(':scope > a');
      crumbs.unshift({ title: getDirectTextContent(menuItem), url: link ? link.href : null });
      menuItem = menuItem.closest('ul')?.closest('li');
    } while (menuItem);
  } else if (currentUrl !== homeUrl) {
    crumbs.unshift({ title: getMetadata('og:title'), url: currentUrl });
  }

  const placeholders = await fetchPlaceholders();
  const homePlaceholder = placeholders.breadcrumbsHomeLabel || 'Home';

  crumbs.unshift({ title: homePlaceholder, url: homeUrl });

  // last link is current page and should not be linked
  if (crumbs.length > 1) {
    crumbs[crumbs.length - 1].url = null;
  }
  crumbs[crumbs.length - 1]['aria-current'] = 'page';
  return crumbs;
}

async function buildBreadcrumbs() {
  const breadcrumbs = document.createElement('nav');
  breadcrumbs.className = 'breadcrumbs';

  const crumbs = await buildBreadcrumbsFromNavTree(document.querySelector('.nav-sections'), document.location.href);

  const ol = document.createElement('ol');
  ol.append(...crumbs.map((item) => {
    const li = document.createElement('li');
    if (item['aria-current']) li.setAttribute('aria-current', item['aria-current']);
    if (item.url) {
      const a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.title;
      li.append(a);
    } else {
      li.textContent = item.title;
    }
    return li;
  }));

  breadcrumbs.append(ol);
  return breadcrumbs;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Assign nav classes by content (EDS fragment decoration may reorder sections)
  const sections = [...nav.querySelectorAll(':scope > .section')];
  sections.forEach((section, i) => {
    if (i === 0) {
      section.classList.add('nav-brand');
    } else if (section.querySelector('.default-content-wrapper > ul')) {
      section.classList.add('nav-sections');
    } else {
      section.classList.add('nav-tools');
    }
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
    // Wrap "AIG" in logo box
    const brandText = brandLink.textContent;
    if (brandText.startsWith('AIG')) {
      const aigBox = document.createElement('span');
      aigBox.className = 'aig-logo-box';
      aigBox.textContent = 'AIG';
      brandLink.textContent = brandText.substring(3);
      brandLink.prepend(aigBox);
    }
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
    });
    navSections.querySelectorAll('.button-container').forEach((buttonContainer) => {
      buttonContainer.classList.remove('button-container');
      buttonContainer.querySelector('.button').classList.remove('button');
    });

    // Build mega menu panels from nested content
    const megaMenuPanels = [];
    navSections.querySelectorAll('.default-content-wrapper > ul > li').forEach((li, index) => {
      const link = li.querySelector(':scope > a');
      const iconSpan = li.querySelector(':scope > .icon');
      const subMenu = li.querySelector(':scope > ul');

      // Wrap link + icon in .nav-item-content for hover targeting
      if (link) {
        const wrapper = document.createElement('div');
        wrapper.className = 'nav-item-content';
        wrapper.append(link);
        if (iconSpan) wrapper.append(iconSpan);
        li.prepend(wrapper);
      }

      // Build mega menu panel from nested <ul>
      if (subMenu) {
        const panel = document.createElement('div');
        panel.className = 'mega-menu-panel';
        panel.setAttribute('data-nav-index', index);

        const inner = document.createElement('div');
        inner.className = 'mega-menu-inner';

        const items = [...subMenu.querySelectorAll(':scope > li')];

        // First item is the primary "top" link
        if (items.length > 0) {
          const primaryItem = items.shift();
          const primaryDiv = document.createElement('div');
          primaryDiv.className = 'mega-menu-primary';
          primaryDiv.innerHTML = primaryItem.innerHTML;
          inner.append(primaryDiv);
        }

        // Remaining items are columns
        if (items.length > 0) {
          const columnsDiv = document.createElement('div');
          columnsDiv.className = 'mega-menu-columns';

          items.forEach((item) => {
            const col = document.createElement('div');
            col.className = 'mega-menu-column';

            const heading = item.querySelector(':scope > strong');
            if (heading) {
              const headingDiv = document.createElement('div');
              headingDiv.className = 'mega-menu-heading';
              headingDiv.innerHTML = heading.innerHTML;
              col.append(headingDiv);
            }

            const colLinks = item.querySelector(':scope > ul');
            if (colLinks) {
              col.append(colLinks.cloneNode(true));
            }

            columnsDiv.append(col);
          });

          inner.append(columnsDiv);
        }

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'mega-menu-close';
        closeBtn.setAttribute('aria-label', 'Close menu');
        closeBtn.addEventListener('click', () => {
          panel.classList.remove('open');
          li.setAttribute('aria-expanded', 'false');
        });
        inner.append(closeBtn);

        panel.append(inner);
        megaMenuPanels.push({ li, panel, index });

        // Remove original sub-menu from DOM (content moved to panel)
        subMenu.remove();
      }

      // Click handler for top-level nav items
      if (link) {
        li.addEventListener('click', (e) => {
          if (!isDesktop.matches) return;
          const target = megaMenuPanels.find((p) => p.index === index);
          if (!target) return;

          e.preventDefault();
          e.stopPropagation();

          const isOpen = target.panel.classList.contains('open');

          // Close all panels first
          megaMenuPanels.forEach((p) => {
            p.panel.classList.remove('open');
            p.li.setAttribute('aria-expanded', 'false');
          });

          if (!isOpen) {
            target.panel.classList.add('open');
            li.setAttribute('aria-expanded', 'true');
          }
        });
      }
    });

    // Store panels for appending to navWrapper later
    nav.megaMenuPanels = megaMenuPanels;
  }

  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const search = navTools.querySelector('a[href*="search"]');
    if (search) {
      search.setAttribute('aria-label', 'Search');
      const searchP = search.closest('p');

      // Unwrap <strong> added by decorateButtons so <a> fills the full click area
      const searchStrong = searchP.querySelector('strong');
      if (searchStrong) searchStrong.replaceWith(...searchStrong.childNodes);
      search.classList.remove('button', 'primary');
      searchP.classList.remove('button-container');

      // Build search dropdown panel
      const searchDropdown = document.createElement('div');
      searchDropdown.className = 'search-dropdown';
      searchDropdown.innerHTML = `<input type="search" placeholder="商品名やキーワードを入力" aria-label="Search">
        <button type="button" class="search-dropdown-btn">検索</button>`;

      // Prevent link navigation
      search.addEventListener('click', (e) => {
        e.preventDefault();
      });

      // Toggle dropdown on the full search button area
      searchP.addEventListener('click', () => {
        const isOpen = searchDropdown.classList.contains('open');
        searchDropdown.classList.toggle('open');
        searchP.classList.toggle('search-open');
        if (!isOpen) {
          searchDropdown.querySelector('input').focus();
        }
      });

      // Close on Escape
      searchDropdown.addEventListener('keydown', (e) => {
        if (e.code === 'Escape') {
          searchDropdown.classList.remove('open');
          if (searchP) searchP.classList.remove('search-open');
          search.focus();
        }
      });

      // Search button action
      searchDropdown.querySelector('button').addEventListener('click', () => {
        const query = searchDropdown.querySelector('input').value.trim();
        if (query) {
          window.location.href = `/sonpo/search?q=${encodeURIComponent(query)}`;
        }
      });

      // Enter key in input triggers search
      searchDropdown.querySelector('input').addEventListener('keydown', (e) => {
        if (e.code === 'Enter') {
          e.preventDefault();
          searchDropdown.querySelector('button').click();
        }
      });

      // Store reference for later appending to navWrapper
      nav.searchDropdown = searchDropdown;
    }
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  if (nav.searchDropdown) navWrapper.append(nav.searchDropdown);

  // Append mega menu panels to navWrapper for full-width positioning
  if (nav.megaMenuPanels) {
    nav.megaMenuPanels.forEach((p) => navWrapper.append(p.panel));
  }
  block.append(navWrapper);

  // Close mega menus on click outside
  document.addEventListener('click', (e) => {
    if (!navWrapper.contains(e.target)) {
      if (nav.megaMenuPanels) {
        nav.megaMenuPanels.forEach((p) => {
          p.panel.classList.remove('open');
          p.li.setAttribute('aria-expanded', 'false');
        });
      }
    }
  });

  // Close mega menus on Escape
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && nav.megaMenuPanels) {
      nav.megaMenuPanels.forEach((p) => {
        if (p.panel.classList.contains('open')) {
          p.panel.classList.remove('open');
          p.li.setAttribute('aria-expanded', 'false');
        }
      });
    }
  });

  // Compact header on scroll (desktop only)
  if (isDesktop.matches) {
    const scrollThreshold = 90;
    window.addEventListener('scroll', () => {
      if (window.scrollY > scrollThreshold) {
        navWrapper.classList.add('header-scrolled');
      } else {
        navWrapper.classList.remove('header-scrolled');
      }
    }, { passive: true });
  }
  isDesktop.addEventListener('change', (e) => {
    if (!e.matches) {
      navWrapper.classList.remove('header-scrolled');
    }
  });

  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    navWrapper.append(await buildBreadcrumbs());
  }
}
