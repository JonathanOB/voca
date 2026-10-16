# Developing Voca

The product brief is [`readme.md`](../readme.md). This page covers how the code is organised and how to work on it.

## Stack

Expo SDK 57 · React Native 0.86 · React 19 (React Compiler on) · TypeScript · Expo Router (drawer + tabs) · expo-sqlite · Reanimated 4 · zustand · i18next. Everything runs offline; the only network code is the optional telemetry ping, which is off unless an endpoint is configured (see [RELEASE.md](RELEASE.md)).

## Commands

```bash
npm install
npx expo start          # Metro; press a / i, or scan with Expo Go
npx tsc --noEmit        # type-check
npx jest                # unit tests
npx expo lint           # lint
npx expo-doctor         # dependency and config checks
npm run build:symbols   # rebuild bundled symbols + docs/artwork-manifest.json
npm run build:icons     # rebuild app icon, adaptive icon, splash and favicon
```

Expo Go runs the app because only bundled Expo modules are used. Add `expo-dev-client` and use a development build if you add a library with its own native code.

## Layout

| Path | What lives there |
|---|---|
| `src/app/` | Routes only (Expo Router). `(drawer)/<section>/_layout.tsx` defines each section's tabs. |
| `src/screens/` | Screen implementations used by the routes. |
| `src/components/` | Shared UI: `tile` (3D button + fixed grid), `sentence-strip`, `mascot`, `sheet`, `dialog`, `form` … |
| `src/data/standard-content.ts` | Every standard board, button, routine and step, with **stable IDs**. |
| `src/data/research.ts`, `guide.ts` | Board research notes and the families' guide. Citations are real and checked (see below). |
| `src/db/` | SQLite schema + migrations, row mappers, seeding, repository. |
| `src/store/` | zustand stores: library (`app-store`), sentence, settings, UI. |
| `src/services/` | Speech, media, backup, print, telemetry, haptics. |
| `src/i18n/` | i18next setup, language list, accents for voices, `join.ts` (CJK-aware sentence joining), `locales/`. |
| `src/theme/` | Palettes, Fitzgerald key colours, typography, spacing. |
| `scripts/` | Symbol and icon build scripts. |

## Data model

SQLite tables `buttons`, `boards`, `board_items`, `routines`, `routine_steps` and a `kv` table for settings and the current sentence. Media (photos, recordings) are files in the app's document directory, referenced by name.

- Standard content has IDs like `std:button:want` and `std:board:core`. **Never rename an ID**: backups, favourites, quick words and user edits refer to them.
- Labels for standard content come from the locale (`vocab.<key>`, `boards.<key>`), so editing a standard button stores an override rather than changing the shared text.
- Removing a standard board hides it. *Restore missing* re-adds anything hidden or deleted; *Reset to original* also discards edits. Neither touches user-created content.

### Adding standard content

1. Add the button/board/routine to `standard-content.ts` and its words to **every** locale (`npx jest src/i18n` fails if a key is missing).
2. Bump `STD_CONTENT_VERSION`. On next launch existing installs get the new items through the `upgrade` seed, which only inserts what is missing.
3. If you change something users may already have (for example a button's word type), add a numbered migration in `src/db/schema.ts` that only touches unedited standard rows (`is_standard = 1 AND type = <old>`), like migration 2.
4. If the new item uses an emoji not used before, run `npm run build:symbols`.

## Languages

`src/i18n/locales/en.ts` is the source and defines the `Locale` type; every other locale must match it exactly (checked by TypeScript and `locales.test.ts`, including `{{placeholders}}`). To add a language: add it to `LANGUAGES` in `languages.ts`, create the locale file, register it in `locales/index.ts` and add accent names in `accents.ts`.

Rules for vocabulary strings: no brackets (they are read aloud), keep words short enough for a tile, and prefer the words children in that language actually use. All translations were written without native-speaker review and need one before release.

## Research and citations

Every reference in `research.ts` and `guide.ts` was checked against Crossref or PubMed. Do not add a citation that has not been looked up; if evidence is uncertain, say so in `limitations`. [`RESEARCH.md`](RESEARCH.md) explains how the boards follow the evidence.

## Carer lock, touch help, word forms, reminders

- **Carer lock** (`src/store/lock-store.ts`, `components/pin-host.tsx`, `components/carer-gate.tsx`): wrap anything that changes content in `guarded(() => …)` or `await requireCarer()`; editor routes and Settings are wrapped in `<CarerGate>`. An unlock lasts 5 minutes from the last touch and survives a short trip out of the app (under a minute). The PIN is a helper, not security: "Forgot PIN?" asks a sum and lets the carer set a new one.
- **Touch help** (`hooks/use-touch-select.ts`, pure rules in `services/touch-rules.ts`): every `Tile` and the always-there words use it. Hold-to-select is skipped while a screen reader is on. `services/touch-calibration.ts` turns the tapping game into suggestions.
- **Word forms** (`src/i18n/forms/`): custom forms typed on a button win; then the curated table for standard words in that language (`tables.ts`); then English rules (`english.ts`). Add a language's forms to `tables.ts`; `tables.test.ts` checks every key is a real standard button.
- **Reminders** (`services/reminders.ts`, `hooks/use-reminder-sync.ts`): schedule steps carry `time` (HH:MM) and `remindBefore` (minutes or null). All Voca notifications are cancelled and re-created when the schedule changes. In Expo Go on Android, `expo-notifications` fails to load its push module, so Voca loads only the local-notification files; development and release builds use the package normally. Android's own reminder channel cannot be created in Expo Go, so the default channel is used there.
- **Typing suggestions** (`services/predict.ts`): a small word-pair model per language stored in the `kv` table (`lm:<lang>`), plus the bundled vocabulary and saved phrases. Chinese and Japanese are left to the device keyboard.

## Testing on a device

- Android emulator: `npx expo start`, then press `a`, or open `exp://10.0.2.2:8081` in Expo Go.
- Things only a real device can confirm: available voices, silent-mode speech on iPhone, haptics, camera and microphone, printing, and screen readers.
