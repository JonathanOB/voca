# Voca

**Your voice, your way.** Voca is a free AAC (augmentative and alternative communication) app for Android and iOS phones and tablets, made by AppZano for children and adults who are non-speaking or partly speaking, including autistic people. Tap pictures to speak words and sentences, plan the day, make choices and say how you feel.

Voca is free, with no accounts, adverts or subscriptions. It works fully offline, and everything stays on the device.

## Features

**Talking**
- Core vocabulary boards (all 36 Universal Core words) in a fixed motor-planning layout with Modified Fitzgerald Key colours, plus requests, social, phrases and a typing tab.
- Sentence bar: speak, show full screen, turn into a question, save as a phrase, or **send** to WhatsApp or another app.
- Always-there words (yes, no, stop, help, more, finished) on every board.
- **Word forms on long press**: wants, wanted, wanting; apples; bigger; me, my, mine; plus feminine forms in Spanish, French, Italian, Portuguese and Polish.
- **Phrase builder**: tap words and drag them into order, or type, then save as a single button.
- **Typing suggestions**, learned only on the device, and **Paste and read** to hear a copied message.
- Native text-to-speech using the free voices on the device, grouped by accent ("British English", "American English" …), with word highlighting.

**My Day, choices and feelings**
- Today's plan with **times and daily reminders**, First–Then, step-by-step routines and a wait timer.
- Choices that always include "None of these".
- Feelings, sensory, body and safety boards, with a Help button on every screen.

**Personalising and access**
- Custom boards and buttons with photos and recorded voices; favourites; search with "Show where" for modelling.
- **Touch help** for tremor and repeated taps: ignore repeats, hold to select, allow slips, and a tapping game that suggests settings.
- **Carer PIN** (optional) so children can't change boards or settings by accident, with an offline reset.
- Ten languages (English, Spanish, French, German, Italian, Portuguese, Dutch, Polish, Chinese, Japanese) and a quick language switch.
- Light, dark and high-contrast themes; larger text; reduced motion; screen-reader labels.
- Backup and restore, printable cards, and restoring standard content without touching your own.

**Research**
Every built-in board has "How to support" tips and checked references, and the app includes a guide for families. See [docs/RESEARCH.md](docs/RESEARCH.md).

## Status

Version 1.0.0, pre-release. Tested on the Android emulator; not yet on iOS or real devices. Translations and legal text still need a final review before public release; the Google Play steps and store media are ready. See [docs/RELEASE.md](docs/RELEASE.md).

## Getting started

Requires Node 20+, and the Expo Go app (SDK 57) or an Android/iOS emulator.

```bash
npm install
npx expo start        # then press a (Android) or i (iOS), or scan the QR code with Expo Go
```

| Command | What it does |
|---|---|
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests (Jest) |
| `npm run lint` | ESLint |
| `npm run build:symbols` | Rebuild bundled symbols and `docs/artwork-manifest.json` |
| `npm run build:icons` | Rebuild all icons from `assets/brand/voca-icon.jpg` (Python + Pillow) |
| `npx eas-cli@latest build -p android --profile preview` | Installable test APK |
| `npx eas-cli@latest build -p android --profile production` | Play Store bundle (AAB) |

## Tech

Expo SDK 57, React Native 0.86, TypeScript, Expo Router (drawer + tabs), expo-sqlite, Reanimated 4, zustand, i18next, expo-speech, expo-audio and expo-notifications (local only). There is no backend: the only network code is an optional anonymous daily count, and it is switched off in this build.

## Documentation

| Document | Contents |
|---|---|
| [docs/BRIEF.md](docs/BRIEF.md) | The original product specification ("the brief") |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Code layout, data model, adding content and languages, how the newer features work |
| [docs/RESEARCH.md](docs/RESEARCH.md) | Competitor review, evidence base and the design decisions it led to |
| [docs/ARTWORK.md](docs/ARTWORK.md) | Symbol artwork, the app icon, and how to swap in original images |
| [docs/RELEASE.md](docs/RELEASE.md) | Release checklist, store requirements and the real-device test pass |

## Store media

[`Screenshots/`](Screenshots) holds the Google Play icon, feature graphic, phone and tablet screenshots and a promo video.

## Privacy

Voca keeps everything on the device. There are no accounts, analytics or adverts. Photos, recordings, typed words and the carer PIN never leave the phone unless you export a backup or choose Send. The full policy is in the app under About & Legal → Privacy. Contact: hello@appzano.com.

## Credits

3D symbols are from [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (MIT). Core vocabulary draws on [Project Core Universal Core](https://www.med.unc.edu/ahs/clds/universal-core-vocabulary/) (CC BY 4.0). Fonts are Nunito, Fredoka and Atkinson Hyperlegible (SIL OFL). The full list is in the app under About & Legal → Credits.

Voca is not a medical device and not an emergency service.
