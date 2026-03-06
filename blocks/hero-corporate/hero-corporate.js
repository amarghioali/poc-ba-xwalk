/**
 * Hero Corporate block — responsive desktop/mobile image via CSS background-image.
 *
 * Content model (simple block, 2 rows):
 *   Row 1: desktop image (field:image)
 *   Row 2: mobile image  (field:mobile_image)
 *
 * CSS custom properties (--hero-bg-desktop, --hero-bg-mobile) are set early
 * by setupHeroEarly() in scripts.js for fast LCP rendering.
 * This decorate function handles cleanup and fallback.
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  // Fallback: set custom properties if not already set by scripts.js
  if (!block.style.getPropertyValue('--hero-bg-desktop')) {
    const desktopImg = rows[0].querySelector('img');
    const mobileImg = rows[1].querySelector('img');
    if (desktopImg) {
      const url = new URL(desktopImg.src, window.location.origin);
      url.searchParams.delete('width');
      block.style.setProperty('--hero-bg-desktop', `url('${url.href}')`);
    }
    if (mobileImg) {
      const url = new URL(mobileImg.src, window.location.origin);
      url.searchParams.delete('width');
      block.style.setProperty('--hero-bg-mobile', `url('${url.href}')`);
    }
  }

  // Clear block content — images are rendered as CSS backgrounds
  block.textContent = '';
}
