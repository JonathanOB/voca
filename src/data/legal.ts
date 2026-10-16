/**
 * Legal text (English). Describes the behaviour of THIS build accurately.
 * The final wording must be reviewed before public release (brief §18) —
 * see docs/RELEASE.md. Update LAST_UPDATED when it changes.
 */
export const LAST_UPDATED = '15 October 2026';
export const SUPPORT_CONTACT = 'Support contact to be added before public release.';

export interface LegalSection {
  heading: string;
  body: string;
}

export const PRIVACY: LegalSection[] = [
  {
    heading: 'Summary',
    body: 'Voca keeps everything on your device. There is no account, no advertising, no subscription and no third-party analytics, advertising or crash-reporting software. This version of Voca does not send any data over the internet.',
  },
  {
    heading: 'What is stored, and where',
    body: 'Your boards, buttons, wording, routines, schedules, settings and the sentence you are building are stored in a database inside the app on this device. Photos you add and voice recordings you make are copied into the app’s private storage on this device. Nothing is uploaded.',
  },
  {
    heading: 'Speech',
    body: 'Voca uses the text-to-speech voices built into your device’s operating system. Voca does not send what you say to any server. The speech service itself is provided by your operating system or device maker and is covered by their terms and privacy policies.',
  },
  {
    heading: 'Permissions',
    body: 'Voca only asks for permissions when you choose a feature that needs them: the camera when you take a photo for a button, your photos when you choose a picture, and the microphone when you record a voice for a button. You can refuse, and the rest of Voca keeps working.',
  },
  {
    heading: 'Usage data',
    body: 'This version of Voca collects no usage data. If a future version offers an optional anonymous daily count, it will be off unless you switch it on, can be switched off at any time, will send at most one request per day containing only the platform (“ios” or “android”) and an approved event name, will never include your words, pictures, recordings, names or identifiers, and will not be stored and sent later if your device is offline. This policy will be updated before any such change.',
  },
  {
    heading: 'Backups and exports',
    body: 'Backups, database exports and printable PDFs are only created when you ask. They are handed to your device’s share sheet so you decide where they go. A backup contains your full library, including photos and recordings, so keep it somewhere safe. Before a restore, Voca keeps a safety copy of your current library inside the app.',
  },
  {
    heading: 'Links',
    body: 'Research references open in your web browser only when you tap them. Websites you visit have their own privacy policies.',
  },
  {
    heading: 'Children',
    body: 'Voca is designed to be used by children and adults with support from families and professionals. Because Voca does not collect personal information, it does not knowingly collect information from children.',
  },
  {
    heading: 'Deleting your data',
    body: 'You can delete everything at any time in Settings → Data → Erase everything. Uninstalling Voca also removes all of its data from the device.',
  },
];

export const TERMS: LegalSection[] = [
  {
    heading: 'Free to use',
    body: 'Voca is free to download and use, with no advertisements, subscriptions, paid unlocks or in-app purchases.',
  },
  {
    heading: 'Your content',
    body: 'Everything you create in Voca belongs to you and stays on your device. You are responsible for the words, photos and recordings you add, and for having permission to use photos of other people.',
  },
  {
    heading: 'Provided as is',
    body: 'Voca is provided in good faith and “as is”, without warranties of any kind. We work hard to make it reliable, but we cannot guarantee that it will always be available, error-free or suitable for a particular purpose. Keep backups of content that matters to you.',
  },
  {
    heading: 'Limitation of liability',
    body: 'To the extent permitted by law, AppZano is not liable for any loss arising from the use of, or inability to use, Voca. Nothing in these terms limits rights you have under consumer law that cannot be excluded.',
  },
  {
    heading: 'Third-party components',
    body: 'Voca includes open-source software and artwork used under their licences. See Credits for details.',
  },
];

export const DISCLAIMER =
  'Voca is provided in good faith as a communication and visual-support tool. It was created as a personal project and made publicly available to help others. It is not a medical device, diagnostic system or substitute for an individual assessment or professional advice. It does not guarantee communication outcomes. It is not an emergency service: the Safety board speaks out loud on this device only and does not contact anyone. Research information in the app describes evidence for broad approaches; Voca itself has not been clinically evaluated, and no endorsement by researchers, therapists, schools or clinical organisations is implied.';

export const LICENCES: { name: string; licence: string; note: string }[] = [
  {
    name: 'Fluent Emoji 3D artwork',
    licence: 'MIT · Copyright (c) Microsoft Corporation',
    note: 'Interim symbol artwork, packaged by LobeHub (@lobehub/fluent-emoji-3d, MIT). To be replaced by original Voca artwork before public release.',
  },
  {
    name: 'Universal Core vocabulary',
    licence: 'CC BY 4.0 · Project Core, Center for Literacy and Disability Studies, UNC-Chapel Hill',
    note: 'The 36-word Universal Core word list is included in the Core and More core boards. Voca uses the word list only; the pictures are Voca’s own.',
  },
  { name: 'Nunito, Fredoka, Atkinson Hyperlegible', licence: 'SIL Open Font License 1.1', note: 'Typefaces, bundled via @expo-google-fonts.' },
  { name: 'Ionicons', licence: 'MIT', note: 'Interface icons via @expo/vector-icons.' },
  { name: 'React Native, Expo and Expo modules', licence: 'MIT', note: 'App framework, speech, storage, media and printing.' },
  { name: 'React Native Reanimated, Gesture Handler, Screens, SVG', licence: 'MIT', note: 'Animation, gestures, navigation and vector graphics.' },
  { name: 'i18next and react-i18next', licence: 'MIT', note: 'Translations.' },
  { name: 'Zustand', licence: 'MIT', note: 'State management.' },
];
