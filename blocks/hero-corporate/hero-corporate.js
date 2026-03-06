/**
 * Hero Corporate block — responsive desktop/mobile image via CSS background-image.
 *
 * Content model (1 row, 2 columns):
 *   Column 1: desktop image (field:image)
 *   Column 2: mobile image  (field:mobile_image)
 *
 * CSS custom properties (--hero-bg-desktop, --hero-bg-mobile) are set early
 * by setupHeroEarly() in scripts.js for fast LCP rendering.
 * This decorate function handles cleanup and fallback.
 */
export default function decorate(block) {
  const row = block.children[0];
  if (!row) return;

  const cols = [...row.children];

  // Fallback: set custom properties if not already set by scripts.js
  if (!block.style.getPropertyValue('--hero-bg-desktop')) {
    const desktopImg = cols[0]?.querySelector('img');
    const mobileImg = cols[1]?.querySelector('img');
    if (desktopImg) {
      block.style.setProperty('--hero-bg-desktop', `url('${desktopImg.src}')`);
    }
    if (mobileImg) {
      block.style.setProperty('--hero-bg-mobile', `url('${mobileImg.src}')`);
    }
  }

  // Clear block content — images are rendered as CSS backgrounds
  block.textContent = '';
}
