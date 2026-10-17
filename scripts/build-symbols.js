#!/usr/bin/env node
/**
 * Builds Voca's bundled symbol library.
 *
 * 1. Scans src/ for every emoji used by standard content and the UI.
 * 2. Adds a curated picker library (food, animals, objects, ...) so people can
 *    pick a symbol for their own buttons without a network connection.
 * 3. Copies the matching 3D artwork (Microsoft Fluent Emoji 3D, MIT licence,
 *    packaged as @lobehub/fluent-emoji-3d) into assets/symbols/.
 * 4. Generates src/data/symbols.generated.ts (static require map for Metro)
 *    and docs/artwork-manifest.json (provenance record per asset).
 *
 * Run with: npm run build:symbols
 *
 * When Voca's own original artwork is ready, drop replacement files with the
 * same IDs into assets/symbols-original/ — they take precedence over Fluent.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const OUT_DIR = path.join(ROOT, 'assets', 'symbols');
const ORIGINAL_DIR = path.join(ROOT, 'assets', 'symbols-original');
const GEN_FILE = path.join(SRC, 'data', 'symbols.generated.ts');
const MANIFEST = path.join(ROOT, 'docs', 'artwork-manifest.json');

const fluentPkgDir = path.dirname(require.resolve('@lobehub/fluent-emoji-3d/package.json'));
const fluentPkg = require('@lobehub/fluent-emoji-3d/package.json');
const FLUENT_DIR = path.join(fluentPkgDir, 'assets');
const emojiGroups = require('unicode-emoji-json/data-by-group.json');
const emojiByChar = require('unicode-emoji-json/data-by-emoji.json');

const SKIN_TONES = ['1f3fb', '1f3fc', '1f3fd', '1f3fe', '1f3ff'];
// @lobehub/fluent-emoji-3d@1.1.0 stores medium-light (1f3fc) and medium (1f3fd) artwork under
// each other's code points (verified visually). Read from the swapped file so tones are correct.
const SOURCE_TONE = { '1f3fb': '1f3fb', '1f3fc': '1f3fd', '1f3fd': '1f3fc', '1f3fe': '1f3fe', '1f3ff': '1f3ff' };

/** Canonical symbol ID: lowercase hex code points without FE0F. Mirrors src/data/symbols.ts. */
function toId(emoji) {
  return [...emoji]
    .map((c) => c.codePointAt(0).toString(16))
    .filter((h) => h !== 'fe0f')
    .join('-');
}

// Index the Fluent package by canonical ID.
const fluentById = new Map();
for (const file of fs.readdirSync(FLUENT_DIR)) {
  if (!file.endsWith('.webp')) continue;
  const id = file
    .replace(/\.webp$/, '')
    .split('-')
    .filter((h) => h !== 'fe0f')
    .join('-');
  if (!fluentById.has(id)) fluentById.set(id, file);
}

// ---------------------------------------------------------------------------
// 1. Emoji used in source

const EMOJI_RE =
  /(?:[\u{1F1E6}-\u{1F1FF}]{2})|(?:[#*0-9]️?⃣)|(?:\p{Extended_Pictographic}(?:️|\p{Emoji_Modifier})?(?:‍\p{Extended_Pictographic}(?:️|\p{Emoji_Modifier})?)*)/gu;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.includes('generated') && !p.includes(`${path.sep}locales${path.sep}`))
      out.push(p);
  }
  return out;
}

const required = new Map(); // id -> { char, files:Set }
for (const file of walk(SRC)) {
  const text = fs.readFileSync(file, 'utf8');
  for (const m of text.matchAll(EMOJI_RE)) {
    const char = m[0];
    if (/^[©®™]$/.test(char)) continue;
    const id = toId(char);
    if (!required.has(id)) required.set(id, { char, files: new Set() });
    required.get(id).files.add(path.relative(ROOT, file).replace(/\\/g, '/'));
  }
}

// ---------------------------------------------------------------------------
// 2. Curated picker library

const SYMBOL_EXCLUDE =
  /japanese|zodiac|aries|taurus|gemini|cancer|leo$|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces|ophiuchus|blood type|ID button|NG button|VS button|CL button|COOL button|FREE button|NEW button|UP! button|OK button|squared|input |circled M|P button|vibration|mobile phone off|keycap: 10|currency|dollar sign|copyright|registered|trade mark|wavy dash|part alternation|om$|star of david|wheel of dharma|yin yang|orthodox cross|latin cross|star and crescent|peace symbol|menorah|dotted six|atom symbol|khanda|place of worship|identification card|radioactive|biohazard|female sign|male sign|transgender symbol|medical symbol|recycling symbol|fleur-de-lis|trident|name badge|ophiuchus/i;
const OBJECT_EXCLUDE = /pistol|bomb|dagger|crossed swords|coffin|funeral urn|syringe|drop of blood|cigarette|bow and arrow|axe|carpentry saw|hook|nazar|hamsa|moai|military|money|banknote|credit card|receipt|chart|coin|yen|dollar|euro|pound|abacus|ballot|wastebasket|card file|card index|file cabinet|clipboard|pushpin|paperclip|linked paperclips|ledger|notebook with decorative cover|bookmark$|label|bar chart|chart increasing|chart decreasing|spiral notepad|calendar$|tear-off|card index dividers|floppy|minidisc|optical disk|dvd|computer disk|joystick|fax|pager|trackball|computer mouse|printer|keyboard$|desktop computer|battery|low battery|electric plug|satellite antenna|candle|oil lamp|diya lamp|flashlight|red paper lantern|magnifying glass tilted right|locked with pen|locked with key|old key|hammer and pick|hammer and wrench|shield|boomerang|clamp|ladder|toolbox|magnet|alembic|test tube|petri dish|dna|microscope|telescope|stethoscope|x-ray|crutch|adhesive bandage|placard|identification|headstone/i;
const PEOPLE_INCLUDE_ZWJ = new Set(['🧑‍🤝‍🧑', '🧑‍🏫', '🧑‍⚕️', '🧑‍🍳', '🧑‍🚒', '🧑‍🌾', '🧑‍🎨', '🧑‍🚀', '🧑‍🔧', '🧑‍💻', '🧑‍🎓', '😵‍💫', '😮‍💨', '😶‍🌫️']);

const library = []; // { id, char, name, group }
const seenLib = new Set();
for (const group of emojiGroups) {
  if (group.slug === 'flags' || group.slug === 'component') continue;
  for (const e of group.emojis) {
    const char = e.emoji;
    const name = e.name;
    if (group.slug === 'people_body' && char.includes('‍') && !PEOPLE_INCLUDE_ZWJ.has(char)) continue;
    if (group.slug === 'people_body' && /^(man|woman|men|women) /.test(name)) continue;
    if (group.slug === 'symbols' && SYMBOL_EXCLUDE.test(name)) continue;
    if (group.slug === 'objects' && OBJECT_EXCLUDE.test(name)) continue;
    if (group.slug === 'travel_places' && /clock|o’clock|thirty|hotel|love hotel|wedding|kaaba|mosque|synagogue|church|shinto|hindu temple|tokyo|statue of liberty|map of japan|mount fuji|japanese|oil drum|fuel pump|police car light|construction|railway track|motorway|world map/i.test(name)) continue;
    if (group.slug === 'smileys_emotion' && /pile of poo|skull|ogre|goblin|clown|alien monster|robot|kiss mark|love letter|anger symbol|collision|bomb|hole|speech balloon|left speech|right anger|zzz|dizzy|sweat droplets|dashing away|hundred points|heart with arrow|heart on fire|mending heart|broken heart|face with symbols|cursing|vomiting|lying|money-mouth|nauseated|zipper-mouth|hand over mouth|peeking|shaking face|devil|smiling face with horns|angry face with horns|skull and crossbones|ghost|alien$|jack-o/i.test(name)) continue;
    const id = toId(char);
    if (seenLib.has(id) || !fluentById.has(id)) continue;
    seenLib.add(id);
    library.push({ id, char, name, group: group.slug });
  }
}

// Make sure every required symbol is also findable in the picker.
for (const [id, { char }] of required) {
  if (seenLib.has(id)) continue;
  const meta = emojiByChar[char] || emojiByChar[char.replace(/️/g, '')] || emojiByChar[char + '️'];
  library.push({ id, char, name: meta ? meta.name : id, group: meta ? meta.slug && groupSlugFor(meta.group) : 'symbols' });
  seenLib.add(id);
}

function groupSlugFor(groupName) {
  const g = emojiGroups.find((x) => x.name === groupName);
  return g ? g.slug : 'symbols';
}

// ---------------------------------------------------------------------------
// 3. Copy files

const missing = [...required.keys()].filter((id) => !fluentById.has(id) && !hasOriginal(id));
if (missing.length) {
  console.error('\nMissing artwork for symbols used in src/:');
  for (const id of missing) {
    const r = required.get(id);
    console.error(`  ${r.char}  (${id})  used in ${[...r.files].join(', ')}`);
  }
  process.exit(1);
}

function hasOriginal(id) {
  return fs.existsSync(path.join(ORIGINAL_DIR, `${id}.webp`)) || fs.existsSync(path.join(ORIGINAL_DIR, `${id}.png`));
}

// Only touch files that change (Metro's watcher can miss rapid delete + re-create).
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
const written = new Set();
function writeIfChanged(name, buf) {
  written.add(name);
  const p = path.join(OUT_DIR, name);
  if (fs.existsSync(p) && fs.readFileSync(p).equals(buf)) return;
  fs.writeFileSync(p, buf);
}

const manifest = [];
const sources = new Map(); // id -> relative filename

function copySymbol(id, opts) {
  const origWebp = path.join(ORIGINAL_DIR, `${id}.webp`);
  const origPng = path.join(ORIGINAL_DIR, `${id}.png`);
  let src;
  let ext;
  let provenance;
  if (fs.existsSync(origWebp) || fs.existsSync(origPng)) {
    src = fs.existsSync(origWebp) ? origWebp : origPng;
    ext = path.extname(src);
    provenance = { source: 'Voca original artwork', licence: 'Proprietary (AppZano)', reviewStatus: 'unreviewed' };
    // Optional sidecar with the brief's provenance fields (prompt, generation date, service, review status…).
    const meta = path.join(ORIGINAL_DIR, `${id}.json`);
    if (fs.existsSync(meta)) Object.assign(provenance, JSON.parse(fs.readFileSync(meta, 'utf8')));
  } else {
    const file = fluentById.get(id);
    if (!file) return false;
    src = path.join(FLUENT_DIR, file);
    ext = '.webp';
    provenance = {
      source: `Microsoft Fluent Emoji 3D via ${fluentPkg.name}@${fluentPkg.version}`,
      originalFile: file,
      licence: 'MIT',
      copyright: 'Copyright (c) Microsoft Corporation',
      reviewStatus: 'approved for release (decision 2026-10-17)',
    };
  }
  const outName = `${id}${ext}`;
  const buf = fs.readFileSync(src);
  writeIfChanged(outName, buf);
  sources.set(id, outName);
  manifest.push({
    id,
    char: opts.char,
    name: opts.name,
    file: `assets/symbols/${outName}`,
    bytes: buf.length,
    sha256: crypto.createHash('sha256').update(buf).digest('hex'),
    usedBy: opts.usedBy || [],
    ...provenance,
  });
  return true;
}

for (const [id, r] of required) {
  const meta = emojiByChar[r.char] || emojiByChar[r.char.replace(/️/g, '')];
  copySymbol(id, { char: r.char, name: meta ? meta.name : id, usedBy: [...r.files] });
}
for (const e of library) {
  if (!sources.has(e.id)) copySymbol(e.id, { char: e.char, name: e.name });
}

// Skin-tone variants for standard-content people & hands.
const skinVariants = new Map(); // baseId -> { tone: filename }
for (const [id, r] of required) {
  const cps = id.split('-');
  for (const tone of SKIN_TONES) {
    const variant = [cps[0], tone, ...cps.slice(1)].join('-');
    const sourceVariant = [cps[0], SOURCE_TONE[tone], ...cps.slice(1)].join('-');
    if (!fluentById.has(sourceVariant)) continue;
    const name = `${variant}.webp`;
    writeIfChanged(name, fs.readFileSync(path.join(FLUENT_DIR, fluentById.get(sourceVariant))));
    if (!skinVariants.has(id)) skinVariants.set(id, {});
    skinVariants.get(id)[tone] = name;
    manifest.push({
      id: variant,
      char: r.char,
      name: `skin tone variant ${tone}`,
      file: `assets/symbols/${name}`,
      source: `Microsoft Fluent Emoji 3D via ${fluentPkg.name}@${fluentPkg.version}`,
      originalFile: fluentById.get(sourceVariant),
      licence: 'MIT',
      copyright: 'Copyright (c) Microsoft Corporation',
      reviewStatus: 'interim — replace with original Voca artwork before public release',
    });
  }
}

// Remove artwork that is no longer used.
for (const f of fs.readdirSync(OUT_DIR)) if (!written.has(f)) fs.rmSync(path.join(OUT_DIR, f), { force: true });

// ---------------------------------------------------------------------------
// 4. Generate TS + manifest

const lines = [];
lines.push('// AUTO-GENERATED by scripts/build-symbols.js — do not edit by hand.');
lines.push('// Run `npm run build:symbols` after adding emoji to standard content or the UI.');
lines.push('');
lines.push('export const SYMBOL_SOURCES: Record<string, number> = {');
for (const [id, file] of [...sources].sort()) lines.push(`  '${id}': require('../../assets/symbols/${file}'),`);
lines.push('};');
lines.push('');
lines.push('export type SkinToneId = ' + SKIN_TONES.map((t) => `'${t}'`).join(' | ') + ';');
lines.push('');
lines.push('export const SKIN_TONE_SOURCES: Record<string, Partial<Record<SkinToneId, number>>> = {');
for (const [id, tones] of [...skinVariants].sort()) {
  const inner = Object.entries(tones)
    .map(([t, f]) => `'${t}': require('../../assets/symbols/${f}')`)
    .join(', ');
  lines.push(`  '${id}': { ${inner} },`);
}
lines.push('};');
lines.push('');
lines.push('/** Picker index: [id, emoji, English name, group]. */');
lines.push('export const SYMBOL_LIBRARY: [string, string, string, string][] = [');
for (const e of library) {
  if (!sources.has(e.id)) continue;
  lines.push(`  [${JSON.stringify(e.id)}, ${JSON.stringify(e.char)}, ${JSON.stringify(e.name)}, ${JSON.stringify(e.group)}],`);
}
lines.push('];');
lines.push('');
fs.writeFileSync(GEN_FILE, lines.join('\n'));

fs.writeFileSync(
  MANIFEST,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      generator: 'scripts/build-symbols.js',
      note: 'Interim artwork from Microsoft Fluent Emoji 3D (MIT). Brief §10 requires original Voca artwork before public release; drop replacements into assets/symbols-original/<id>.webp and re-run the script.',
      count: manifest.length,
      totalBytes: manifest.reduce((s, m) => s + (m.bytes || 0), 0),
      assets: manifest,
    },
    null,
    2,
  ),
);

const total = fs.readdirSync(OUT_DIR).reduce((s, f) => s + fs.statSync(path.join(OUT_DIR, f)).size, 0);
console.log(
  `Symbols: ${required.size} used in src, ${library.length} in picker, ${skinVariants.size} with skin tones; ` +
    `${fs.readdirSync(OUT_DIR).length} files, ${(total / 1024 / 1024).toFixed(2)} MB`,
);
