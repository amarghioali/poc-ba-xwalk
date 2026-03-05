/**
 * Hero Corporate block — responsive desktop/mobile image switching.
 *
 * Content model (2 rows, 1 column each):
 *   Row 1: desktop image (field:image)
 *   Row 2: mobile image  (field:mobileImage)
 *
 * Decoration creates a <picture> element with a <source media="(max-width: 768px)">
 * so the browser loads the correct image per viewport.
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  const desktopImg = rows[0].querySelector('img');
  const mobileImg = rows[1].querySelector('img');

  if (!desktopImg) return;

  // Build <picture> with responsive sources
  const picture = document.createElement('picture');

  if (mobileImg) {
    const source = document.createElement('source');
    source.setAttribute('media', '(max-width: 768px)');
    source.setAttribute('srcset', mobileImg.src);
    picture.appendChild(source);
  }

  const img = document.createElement('img');
  img.src = desktopImg.src;
  img.alt = desktopImg.alt || '';
  img.setAttribute('loading', 'eager');
  picture.appendChild(img);

  // Replace block content with just the picture
  block.textContent = '';
  block.appendChild(picture);
}
