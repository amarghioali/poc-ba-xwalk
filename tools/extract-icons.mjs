import opentype from 'opentype.js';
import { writeFileSync } from 'fs';

const font = opentype.loadSync('/workspace/fonts/aig-icons.ttf');

const icons = {
  'nav-contractor': 0xe912,
  'nav-personal': 0xe923,
  'nav-business': 0xe90f,
  'nav-news': 0xe912,
  'nav-company': 0xe906,
  'nav-recruit': 0xe93d,
};

const SIZE = 24;
const UNITS = font.unitsPerEm;

for (const [name, codepoint] of Object.entries(icons)) {
  const glyph = font.charToGlyph(String.fromCodePoint(codepoint));
  if (!glyph || glyph.index === 0) {
    console.error(`Glyph not found for ${name} (U+${codepoint.toString(16)})`);
    continue;
  }

  const scale = SIZE / UNITS;
  const path = glyph.getPath(0, SIZE * 0.85, SIZE);
  const svgPath = path.toSVG();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
  ${svgPath}
</svg>
`;

  const filePath = `/workspace/icons/${name}.svg`;
  writeFileSync(filePath, svg);
  console.log(`Created ${filePath}`);
}
