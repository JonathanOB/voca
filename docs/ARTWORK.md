# Artwork

## Current status: interim artwork

The brief (§10) requires an original, reviewed Voca image for every standard button. That library does not exist yet. Until it does, buttons use **Microsoft Fluent Emoji 3D** images (MIT licence, via `@lobehub/fluent-emoji-3d`), which match the soft 3D look of the design and are bundled so the app works offline.

- Every image, its source, licence and the files that use it are listed in [`artwork-manifest.json`](artwork-manifest.json). Each interim entry has `reviewStatus: "interim — replace with original Voca artwork before public release"`.
- The Fluent licence notice is shown in the app under *About & Legal → Credits*.
- The app icon, splash and mascot ("Vo") are original Voca drawings in `src/components/mascot.tsx` and `scripts/build-icons.js`.

**Release blocker:** brief §19 requires every standard image to be original and approved before public release.

## How images are wired

A symbol's ID is its emoji's Unicode code points in lower-case hex, joined with `-`, without `fe0f` (for example `1f6bd` for 🚽). Standard content in `src/data/standard-content.ts` refers to symbols by emoji, and buttons store the symbol ID, so **replacing artwork never changes content or user data**.

`npm run build:symbols` (`scripts/build-symbols.js`):

1. scans `src/` for every emoji used, plus a curated picker library;
2. for each symbol, uses `assets/symbols-original/<id>.webp` (or `.png`) if it exists, otherwise the interim Fluent image;
3. copies the images to `assets/symbols/`, writes `src/data/symbols.generated.ts` and regenerates the manifest.

People symbols have skin-tone variants (`<id>-1f3fb` … `-1f3ff`), so originals for people should come in the same six tones.

## Replacing images with original artwork

1. Put the approved image at `assets/symbols-original/<id>.webp`: square, transparent background, subject filling about 85% of the frame. 512×512 WebP keeps the app small and sharp on tablets.
2. Add a sidecar `assets/symbols-original/<id>.json` with the provenance the brief asks for:

   ```json
   {
     "concept": "toilet — 'I need the toilet'",
     "prompt": "…the exact prompt used…",
     "service": "…image service and model…",
     "serviceTerms": "…link to the terms that applied on the generation date…",
     "generatedAt": "2026-11-02",
     "reviewedBy": "…",
     "reviewStatus": "approved",
     "licence": "Proprietary (AppZano)"
   }
   ```

   These fields are merged into the manifest entry.
3. Run `npm run build:symbols` and check the board on a phone and a tablet, in light, dark and high-contrast modes.

## Style guide (to finalise before bulk generation)

Match what is already on screen so originals and interim images can sit side by side during the changeover:

- Soft 3D "clay" rendering, gentle top-left light, a subtle contact shadow and no hard outlines.
- One clear subject, centred, with no background scene. Transparent background.
- Friendly, simple shapes and a limited palette that does not compete with the Fitzgerald tile colours.
- People are diverse, neutral in dress and age-appropriate, and come in the six skin tones.
- No text inside images. The words on the button do that, and they are translated.

## Ambiguity review

Review these pairs side by side, at small tile size, before approval (brief §10.6): hot / cold · yes / no · stop / go · happy / sad / angry · open / close · first / then · more / finished · in / out · on / off · up / down · want / need · like / don't like · I / you · this / that · here / there · help / help me · wait / not yet · sick / hurt.
