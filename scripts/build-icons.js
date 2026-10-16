#!/usr/bin/env node
/**
 * Builds the app icon, Android adaptive icon layers, splash image and favicon
 * from Voca's mascot ("Vo"), using the same shapes and colours as
 * src/components/mascot.tsx. Rendering uses a locally installed Chrome or Edge
 * in headless mode, so nothing is downloaded.
 *
 *   node scripts/build-icons.js            (or: npm run build:icons)
 *   CHROME_PATH=/path/to/chrome node scripts/build-icons.js
 *
 * When final artwork replaces the mascot, swap the SVG here and re-run.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'images');

// Lavender palette (src/theme/colors.ts).
const PRIMARY = '#6C5CE7';
const EDGE = '#4A3BC2';
const INK = '#1F1B4D';
const CANVAS = '#EEF0FB';

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (rgb) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
const mix = (a, b, t) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * t));
const lighten = (h, t) => mix(h, '#FFFFFF', t);

const LIGHT = lighten(PRIMARY, 0.55);
const MID = lighten(PRIMARY, 0.12);
const SHADE = mix(EDGE, '#000000', 0.25);

const BODY =
  'M100 29 C140 29 172 58 172 95 C172 133 140 161 100 161 C92 161 84 160 77 158 L52 178 C49 180 45 178 46 175 L57 150 C38 137 28 117 28 95 C28 58 60 29 100 29 Z';
const SMILE = 'M86 115 Q100 133 114 115 Q100 123 86 115 Z';
const STAR = 'M162 30 L166 41 L177 45 L166 49 L162 60 L158 49 L147 45 L158 41 Z';

/** The mascot in its 200×200 design space. */
function mascot({ sparkle = true } = {}) {
  return `
  <defs>
    <radialGradient id="body" cx="38%" cy="30%" r="78%">
      <stop offset="0" stop-color="${LIGHT}"/><stop offset="0.55" stop-color="${MID}"/><stop offset="1" stop-color="${EDGE}"/>
    </radialGradient>
    <radialGradient id="cheek" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#FF7FA8" stop-opacity="0.75"/><stop offset="1" stop-color="#FF7FA8" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="clip"><path d="${BODY}"/></clipPath>
    <radialGradient id="shade" cx="55%" cy="100%" r="60%">
      <stop offset="0" stop-color="${SHADE}" stop-opacity="0.55"/><stop offset="1" stop-color="${SHADE}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="eye" cx="45%" cy="40%" r="60%">
      <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E9E6FA"/>
    </radialGradient>
  </defs>
  <path d="${BODY}" fill="url(#body)"/>
  <g clip-path="url(#clip)"><ellipse cx="112" cy="170" rx="92" ry="46" fill="url(#shade)"/></g>
  <ellipse cx="70" cy="56" rx="22" ry="11" fill="#FFFFFF" opacity="0.5" transform="rotate(-28 70 56)"/>
  <circle cx="96" cy="42" r="4.5" fill="#FFFFFF" opacity="0.65"/>
  <ellipse cx="58" cy="117" rx="14" ry="9" fill="url(#cheek)"/>
  <ellipse cx="142" cy="117" rx="14" ry="9" fill="url(#cheek)"/>
  <ellipse cx="76" cy="92" rx="15" ry="17" fill="url(#eye)"/>
  <ellipse cx="124" cy="92" rx="15" ry="17" fill="url(#eye)"/>
  <ellipse cx="79" cy="95" rx="9" ry="9.5" fill="${INK}"/>
  <ellipse cx="127" cy="95" rx="9" ry="9.5" fill="${INK}"/>
  <circle cx="83" cy="90" r="3.6" fill="#FFFFFF"/><circle cx="131" cy="90" r="3.6" fill="#FFFFFF"/>
  <circle cx="75.5" cy="99" r="1.6" fill="#FFFFFF"/><circle cx="123.5" cy="99" r="1.6" fill="#FFFFFF"/>
  <path d="${SMILE}" fill="${INK}"/>
  ${sparkle ? `<path d="${STAR}" fill="#FFD25A"/>` : ''}`;
}

/** Places the mascot (visual centre ≈ 100,104 in design space) at cx,cy with the given scale. */
const place = (cx, cy, scale, inner) =>
  `<g transform="translate(${cx - 100 * scale} ${cy - 104 * scale}) scale(${scale})">${inner}</g>`;

const floorShadow = (cx, cy, rx, ry, opacity) =>
  `<defs><radialGradient id="floor" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${EDGE}" stop-opacity="${opacity}"/><stop offset="1" stop-color="${EDGE}" stop-opacity="0"/></radialGradient></defs>
   <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#floor)"/>`;

const backdrop = (size) => `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F6F4FF"/><stop offset="1" stop-color="#DCD5FF"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="38%" r="55%">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.9"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  <rect width="${size}" height="${size}" fill="url(#glow)"/>`;

const svg = (size, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${body}</svg>`;

const ASSETS = [
  {
    // iOS and the store listing: square, opaque, no transparency.
    file: 'icon.png',
    size: 1024,
    svg: svg(1024, backdrop(1024) + floorShadow(512, 868, 230, 34, 0.35) + place(512, 488, 4.6, mascot())),
  },
  {
    // Android adaptive icon, background layer.
    file: 'android-icon-background.png',
    size: 512,
    svg: svg(512, backdrop(512)),
  },
  {
    // Android adaptive icon, foreground layer: the mascot inside the 66/108 safe circle.
    file: 'android-icon-foreground.png',
    size: 512,
    svg: svg(512, floorShadow(256, 368, 70, 11, 0.35) + place(256, 250, 1.38, mascot())),
  },
  {
    // Android 13+ themed icon: alpha only, so the face is cut out of the bubble.
    file: 'android-icon-monochrome.png',
    size: 432,
    svg: svg(
      432,
      `<defs><mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">
         <path d="${BODY}" fill="#fff"/>
         <ellipse cx="76" cy="92" rx="13" ry="15" fill="#000"/><ellipse cx="124" cy="92" rx="13" ry="15" fill="#000"/>
         <path d="${SMILE}" fill="#000"/>
       </mask></defs>` + place(216, 216, 1.2, `<rect width="200" height="200" fill="#000" mask="url(#m)"/>`),
    ),
  },
  {
    // Android notification small icon: white silhouette on transparent (tinted by the system).
    file: 'notification-icon.png',
    size: 96,
    svg: svg(
      96,
      `<defs><mask id="n" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">
         <path d="${BODY}" fill="#fff"/>
         <ellipse cx="76" cy="92" rx="13" ry="15" fill="#000"/><ellipse cx="124" cy="92" rx="13" ry="15" fill="#000"/>
         <path d="${SMILE}" fill="#000"/>
       </mask></defs>` + place(48, 46, 0.56, `<rect width="200" height="200" fill="#fff" mask="url(#n)"/>`),
    ),
  },
  {
    // Splash: shown at 180dp wide on CANVAS (light) or #14112B (dark).
    file: 'splash-icon.png',
    size: 600,
    svg: svg(600, floorShadow(300, 548, 150, 20, 0.3) + place(300, 280, 3.5, mascot())),
  },
  {
    file: 'favicon.png',
    size: 48,
    svg: svg(48, place(24, 25, 0.29, mascot({ sparkle: false }))),
  },
];

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) throw new Error('No Chrome or Edge found. Set CHROME_PATH to a Chromium-based browser.');
  return found;
}

function pngSize(file) {
  const b = fs.readFileSync(file);
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

function render(chrome, asset, work) {
  // Chrome has a minimum window size, so small images are rendered larger and scaled down by the device scale factor.
  const scale = asset.size < 256 ? asset.size / 256 : 1;
  const view = Math.round(asset.size / scale);
  const html = path.join(work, asset.file.replace('.png', '.html'));
  fs.writeFileSync(
    html,
    `<!doctype html><html><head><style>html,body{margin:0;background:transparent;overflow:hidden}svg{display:block;width:${view}px;height:${view}px}</style></head><body>${asset.svg}</body></html>`,
  );
  const out = path.join(OUT, asset.file);
  execFileSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--default-background-color=00000000',
      `--force-device-scale-factor=${scale}`,
      `--window-size=${view},${view}`,
      `--user-data-dir=${path.join(work, 'profile')}`,
      `--screenshot=${out}`,
      'file:///' + html.replace(/\\/g, '/'),
    ],
    { stdio: 'pipe' },
  );
  const [w, h] = pngSize(out);
  if (w !== asset.size || h !== asset.size) throw new Error(`${asset.file}: expected ${asset.size}², got ${w}×${h}`);
  console.log(`  ${asset.file.padEnd(30)} ${w}×${h}`);
}

function main() {
  const chrome = findChrome();
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'voca-icons-'));
  console.log(`Rendering with ${path.basename(chrome)}`);
  try {
    for (const asset of ASSETS) render(chrome, asset, work);
    fs.writeFileSync(path.join(OUT, '..', 'icon-source.svg'), ASSETS[0].svg);
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
  console.log(`Background colour for splash and adaptive icon: ${CANVAS}`);
}

main();
