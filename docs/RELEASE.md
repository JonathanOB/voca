# Releasing Voca

Use this alongside the acceptance criteria in brief §19. Items marked **blocker** must be done before a public release.

## 1. Content and legal

- [ ] **Blocker:** replace interim artwork with approved originals ([ARTWORK.md](ARTWORK.md)).
- [ ] **Blocker:** have native speakers, ideally speech and language therapists, review the nine translations (`src/i18n/locales/`). Pay special attention to core words, gendered forms (es, fr, it, pt, pl default to masculine), and the Safety board.
- [ ] Have a speech and language therapist review the board tips, the guide and the *More core words* board ([RESEARCH.md](RESEARCH.md)).
- [ ] **Blocker:** set `SUPPORT_CONTACT` in `src/data/legal.ts` (currently a placeholder), have the privacy policy, terms and disclaimer reviewed, and update `LAST_UPDATED`.
- [ ] Publish the privacy policy at a public URL for the store listings, with the same wording as in the app.

## 2. Telemetry and privacy disclosures

Telemetry is **off** in this build: `expo.extra.telemetryEndpoint` in `app.json` is empty, so the consent toggle is hidden and nothing is sent. With no endpoint, the app makes no network requests apart from links the user opens.

- *App Store privacy:* "Data Not Collected".
- *Google Play Data safety:* no data collected or shared.

To turn telemetry on:

1. Stand up an HTTPS endpoint that accepts `POST {"platform":"ios"|"android","event":"daily_active"}`.
2. Check and document the host's request logging, especially IP addresses and how long they are kept (brief §14 and §19).
3. Set `telemetryEndpoint` in `app.json`.
4. Update the privacy policy in `src/data/legal.ts` and both store disclosures ("Product interaction", not linked to the user, not used for tracking).

## 3. Versioning and builds

Builds use EAS (`eas.json`). `appVersionSource` is `remote`, so EAS keeps the build number and version code and `production` increments them. The user-facing version is `expo.version` in `app.json`.

```bash
npx eas-cli@latest login
npx eas-cli@latest init                          # once: links the project and adds extra.eas.projectId
npx eas-cli@latest build -p android --profile preview      # installable APK for testing
npx eas-cli@latest build -p all --profile production       # store builds (AAB / IPA)
npx eas-cli@latest submit -p ios --profile production
npx eas-cli@latest submit -p android --profile production
```

EAS creates and stores the signing credentials on the first build. Keep the Android upload key backed up; Google Play App Signing holds the app signing key.

Before every release candidate:

```bash
npx tsc --noEmit && npx jest && npx expo lint && npx expo-doctor
npx expo export --platform android --platform ios   # bundles must build cleanly
```

## 4. Store assets

- Icon: `assets/images/icon.png` (1024², opaque). Regenerate everything with `npm run build:icons`.
- Screenshots: phone and tablet, light and dark, showing Home, a board with a sentence, My Day, Choices and Feelings. Use English plus at least one other language.
- Age rating: a communication tool with no user-to-user interaction, no ads and no purchases. Answer the family/children questionnaires honestly: the app is suitable for children, but it is not a "kids category" app unless that is decided deliberately.
- Permissions: camera, photos, microphone and notifications are asked for only when used, with purpose strings set in `app.json`. Location and overlay permissions are blocked on Android.
- Exact alarms (Android): `SCHEDULE_EXACT_ALARM` is declared so reminders fire on time. Google Play only allows it for alarm/calendar-style features; schedule reminders qualify, but say so in the Play Console declaration. Without the permission (Android 14+ denies it by default) reminders still fire, a few minutes late. If Play rejects it, remove the permission from `app.json`.
- Sharing to WhatsApp uses the app's public `whatsapp://send?text=` link and the system share sheet; no WhatsApp API or account is involved, so no extra disclosure is needed beyond "messages are handed to the app you choose".

## 5. Real-device test pass (brief §19)

- [ ] Airplane mode: onboarding, every board, speech, editing, search, routines, backup and print.
- [ ] Voices: discovery, preview, rate and pitch on at least one iPhone, iPad, Android phone and Android tablet. On iPhone, check speech in silent mode.
- [ ] VoiceOver and TalkBack: onboarding, a board, the sentence strip, the Safety board, dialogs.
- [ ] Largest system text size and Extra-clear font: nothing important is cut off.
- [ ] Backup → erase everything → restore, including photos and recordings. Also try a corrupted file and a file from a newer version.
- [ ] Force-quit during onboarding and while building a sentence; both resume.
- [ ] Upgrade from the previous store build: content migrates and nothing user-made is lost.
- [ ] Rotation and split view on tablets, with *Same layout on every screen* on and off.
- [ ] Carer PIN: set in onboarding, enter wrong and right PINs, "Forgot PIN?", lock after more than a minute in the background.
- [ ] Touch help with a real tremor or a person who double-taps: run "Find my settings" and check hold-to-select with VoiceOver/TalkBack on (it should switch itself off).
- [ ] Reminders: set one for a few minutes ahead, lock the phone, and check it arrives (also after a restart, and on iOS).
- [ ] Send to WhatsApp on a phone with WhatsApp installed; "Paste and read" with a copied WhatsApp message.
