# Releasing Voca

Use this alongside the acceptance criteria in brief §19. Items marked **blocker** must be done before a public release.

## 1. Content and legal

- [x] Artwork: the Fluent Emoji 3D symbols (MIT) are kept for release (decision 17 Oct 2026); credits are in the app ([ARTWORK.md](ARTWORK.md)).
- [ ] **Blocker:** have native speakers, ideally speech and language therapists, review the nine translations (`src/i18n/locales/`). Pay special attention to core words, gendered forms (es, fr, it, pt, pl default to masculine), and the Safety board.
- [ ] Have a speech and language therapist review the board tips, the guide and the *More core words* board ([RESEARCH.md](RESEARCH.md)).
- [x] Support contact: hello@appzano.com (`SUPPORT_CONTACT` in `src/data/legal.ts`).
- [ ] Have the privacy policy, terms and disclaimer reviewed, and update `LAST_UPDATED`.
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

- Icon: from `assets/brand/voca-icon.jpg`; `npm run build:icons` (Python + Pillow) regenerates all app icons and `Screenshots/play-icon-512.png`.
- Store media ready to upload: [`Screenshots/`](../Screenshots) (see its README).
- Done (17 Oct 2026): 11 phone screenshots (1080×1920), 5 tablet screenshots (1600×2560), feature graphic, and a 38-second promo video, which must go on YouTube for Play. All are English and light theme; translated or dark-theme sets can be added later for other store listings.
- Age rating: a communication tool with no user-to-user interaction, no ads and no purchases. Answer the family/children questionnaires honestly: the app is suitable for children, but it is not a "kids category" app unless that is decided deliberately.
- Permissions: camera, photos, microphone and notifications are asked for only when used, with purpose strings set in `app.json`. Location and overlay permissions are blocked on Android.
- Exact alarms (Android): Voca declares the user-granted `SCHEDULE_EXACT_ALARM` (not the Play-restricted `USE_EXACT_ALARM`) so reminders can fire on time. Android 14+ leaves it off by default; without it reminders still arrive, possibly a few minutes late.
- Final Android permissions (check with `npx expo config --type introspect`): INTERNET, VIBRATE, CAMERA, RECORD_AUDIO, MODIFY_AUDIO_SETTINGS, POST_NOTIFICATIONS, RECEIVE_BOOT_COMPLETED, SCHEDULE_EXACT_ALARM. Location, overlay and legacy storage are blocked, and background audio playback is off (no foreground service to declare).
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

## 6. Google Play, step by step

1. **Developer account**: register at the Play Console (one-off fee) and complete identity verification. Choose *organisation* (AppZano) if possible: new *personal* accounts must run a closed test with at least 12 testers, opted in for 14 days in a row, before they can apply for production access.
2. **Create the app** (package `com.appzano.voca`, free, "App"), then **link EAS**: `npx eas-cli@latest init`, then `build -p android --profile production`. Upload the first AAB by hand in Play Console; after that, `eas submit` works with a Google service-account key.
3. **Test the release build first**: install a `preview` APK on a real phone and check camera photos, voice recording, reminders (including after a restart), Send to WhatsApp, and the carer PIN. Expo Go hides problems with permissions, notification channels and native modules.
4. **Testing tracks**: internal testing (up to 100 testers, quick), then closed testing (the 12-tester / 14-day rule if the account is personal), then production.
5. **App content forms**:
   - *Privacy policy*: public URL (required).
   - *Ads*: no.
   - *App access*: all features available without login; the carer PIN is off by default.
   - *Content rating*: IARC questionnaire (no violence or user-to-user sharing).
   - *Target audience*: Voca is used by children, so including under-13 age groups applies the **Families policy**: accurate privacy policy, no ads, no data collection from children (all true for this build).
   - *Data safety*: no data collected or shared (nothing leaves the device; on-device storage isn't "collection").
   - *Health apps*: answer honestly that it is a communication and accessibility aid, not a medical device.
   - *Exact alarm / sensitive permissions*: none restricted are used.
6. **Store listing**: name (≤30 chars), short description (≤80), full description (≤4000), 512×512 icon (scale down `assets/images/icon.png`), 1024×500 feature graphic, at least 2 phone screenshots plus 7" and 10" tablet screenshots, category *Communication* (or *Education*), contact email.
7. **Target API**: Expo SDK 57 targets API 36, which meets the requirement for new apps from 31 August 2026.
