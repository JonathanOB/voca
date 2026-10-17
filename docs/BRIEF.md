# Voca by AppZano
## Full Product Specification, Development Brief and Deployment Plan

**Product:** Voca by AppZano  
**Platforms:** iOS, iPadOS and Android phones and tablets  
**Framework:** Expo, React Native and TypeScript  
**Business model:** Free, permanently; no advertising, subscriptions or paid feature tiers  
**Primary principle:** Private, local-first communication and visual-support tools, without requiring an account or internet connection.

## 1. Product vision

Voca is a free, accessible communication and visual-support application for people who benefit from augmentative and alternative communication (AAC), including autistic people, people with speech or language difficulties, children developing communication skills, and people who benefit from visual structure in everyday life.

The application must bring together individual word communication, sentence construction, requests, choices, feelings and needs, visual schedules, routines, First–Then boards, transitions and urgent communication in one cohesive product. It should be usable immediately after installation, with useful standard content already available and no registration, subscription or online setup requirement.

Voca is being developed as a personal project in good faith, inspired in part by the developer's experience as a parent. The intention is to make a practical tool available to other families and users without putting essential communication features behind a paywall.

This is a full-release specification. All features designated as V1 requirements must be implemented, tested and ready for release before the first public version. Sentence construction, multilingual speech configuration, personalisation, data export and the complete standard board library are not deferred enhancements.

## 2. Product principles and constraints

The following are mandatory product requirements.

- Free to download and use, with no advertisements, subscriptions, paid unlocks or in-app purchases.
- No account creation, login, cloud profile or mandatory internet connection.
- All communication content, custom boards, images, recordings, routines and preferences stored locally on the device.
- No external API dependencies for core functionality.
- No AI inference, remote image generation, cloud speech processing or online translation inside the released app.
- Native device text-to-speech (TTS), using voices available on the user's device.
- Optional, explicitly consented, minimal usage telemetry, with no personal communication content.
- A complete library of original, consistently styled, AI-generated images created specifically for Voca.
- Full V1 sentence construction and individual-word communication.
- No copying of competitors' proprietary images, text, vocabulary layouts or branding.
- Clear privacy information, accessibility support, reliable backups and complete release validation.

The app must remain useful if telemetry is declined, the device is offline, the user has no internet access or a remote service is unavailable.

## 3. V1 functionality

V1 must include the following complete feature set.

1. First-launch onboarding and persistent configuration.
2. Home screen with configurable quick actions.
3. Drawer-based navigation and organised communication categories.
4. Individual word and phrase communication boards.
5. A sentence-construction workspace with speech output.
6. The 12 standard boards defined in this specification.
7. Visual schedules, routines, task sequences and First–Then activities.
8. Choice boards, feelings and needs, sensory communication and urgent communication.
9. Custom boards and buttons, including personal photographs and optional recorded audio.
10. Configurable language, TTS voice, speech rate and pitch where supported.
11. Search, favourites, board organisation and reusable communication buttons.
12. Local data backup, restoration and export.
13. Printable communication cards and suitable printable board layouts.
14. Accessibility support for screen readers, visual contrast, text sizing and touch interaction.
15. Privacy controls, consent-based telemetry and complete legal disclosures.
16. Automated testing, real-device testing, store assets and public deployment.

The product must not be released with sentence construction, export, customisation or the standard board library represented as future roadmap items.

## 4. Application architecture

Use Expo with React Native and TypeScript. Choose compatible, maintained libraries and document all native configuration required for iOS and Android. Use Expo development builds or a suitable native build workflow where the functionality cannot be fully validated in Expo Go.

Use SQLite for structured local data and the device's application-managed file system for images and audio recordings. Establish a clear separation between application logic, persistence, speech services, board rendering and platform-specific behaviour.

The app must not require a backend for communication, storage, search, TTS, customisation, export or restoration. The only permitted network functionality is the optional telemetry endpoint described later in this specification.

Use stable IDs for boards, buttons and routines. Do not identify content by its visible label, since users may rename labels, translate text or create multiple buttons with the same label but different spoken phrases.

The application should be modular enough to maintain without introducing unnecessary infrastructure. Avoid adding a dependency simply because it is fashionable; each dependency must have a clear functional purpose, an acceptable maintenance profile and a reviewed privacy footprint.

## 5. Onboarding and first launch

Onboarding appears only on the first launch, unless the user deliberately restarts it from Settings. It must explain the application's purpose, local storage model, communication features, voice configuration and optional telemetry.

The sequence should allow the user or caregiver to configure the interface language, preferred available speech voice, speech rate, pitch where supported, display preferences and initial quick actions. Telemetry consent must be a separate, optional decision, not bundled into general acceptance.

Provide an accessible way to preview speech voices and hear a sample before choosing one. If a voice is unavailable or speech is unsupported, explain the limitation and allow the user to continue without speech rather than blocking setup.

Persist onboarding progress so that if the app closes or the device restarts midway through setup, the user resumes at the appropriate point. Once setup is complete, subsequent launches should go directly to Home. Settings must offer a deliberate option to rerun onboarding without deleting user-created content.

## 6. Navigation and Home

Home should prioritise fast access to the user's most important communication needs. Include a configurable Quick Actions area, allowing users to add, remove and reorder shortcuts to boards, the sentence builder, routines, choices and urgent communication.

Use a drawer for the main application sections, with nested tabs or category navigation where they make the information easier to find. Do not create separate copies of the same underlying board simply to display it in more than one section.

The main sections are:

- **Home**
- **Communicate**
- **My Day**
- **Choices**
- **Feelings & Needs**
- **My Library**
- **My Boards**
- **Settings**
- **About & Legal**

The Safety & Urgent Communication board must be accessible quickly from Home and through a consistent shortcut throughout the application. A user should not have to navigate several levels of menus to communicate that they need help or want to stop.

## 7. Individual-word communication and sentence construction

Sentence construction is a core V1 feature and must be implemented as a complete communication workflow, not merely as a row of buttons that speak independently.

### Individual-word communication

Every communication button must support activation as an independent word or phrase. A button may speak immediately, add its content to the sentence workspace, or behave differently according to the board and user configuration.

Provide clear, predictable interaction modes. A user who relies on single-word communication must not be forced to construct a sentence, and a user who wants to combine words must not have to configure every board manually before doing so.

Support both text-only buttons and image-based buttons, including an image with a text label. The display mode should be configurable where appropriate. Each button must have a visible label or another accessible name, even when the visual presentation prioritises an image.

### Sentence builder

The sentence builder must be available directly from Home and the Communicate section. It should provide a persistent, visible sentence strip in which selected words and phrases can be combined into an utterance.

Required functionality:

- Add individual words and complete phrases to the sentence strip.
- Combine items from different boards without losing the current sentence.
- Speak the complete sentence in sequence, using the appropriate speech configuration for its content.
- Remove the last item, remove a selected item, clear the entire sentence and edit the order of items.
- Support common communication structures such as subject, action, object, descriptor, negation, request and social phrase, without enforcing rigid grammatical rules.
- Allow short phrases such as “I want”, “help me”, “not that” and “I need a break” to be added as a single item.
- Provide a clear way to speak an individual word or phrase without adding it to the sentence.
- Preserve the sentence while the user browses other boards, unless the user explicitly clears it or starts a new sentence.
- Offer configurable options for automatic speech after selection, manual speech using a dedicated button, and selection-only sentence building.
- Provide clear visual feedback for the current sentence, the selected item and successful speech activation.
- Handle unavailable speech voices or individual speech failures gracefully.
- Support punctuation and sentence completion where appropriate without requiring the user to use punctuation.
- Allow sentence items to be removed individually and, where practical, moved or reordered using accessible controls.

Do not require a grammatical subject, a minimum sentence length or a fixed word order. Communication can be unconventional, repetitive, incomplete or highly individual. Voca must not silently rewrite a user's intended message.

### Sentence builder accessibility and reliability

The sentence strip must remain legible and usable on small phones, tablets and devices using enlarged text. Avoid shrinking the entire sentence to fit a fixed horizontal row. Support scrolling, wrapping or another accessible layout that preserves the user's ability to review the whole utterance.

Provide an explicit Clear action with appropriate protection against accidental loss of a long sentence. Do not require a confirmation for every routine tap, but make destructive actions clear and predictable.

The sentence builder must be tested with rapid selections, repeated words, mixed phrases, long sentences, screen readers, offline use, interruptions and speech cancellation. Speech output must be controllable: a new utterance should not cause uncontrolled overlapping voices, and the user must be able to stop current speech promptly.

## 8. Standard board library

All standard boards and their standard buttons must be bundled with the app at installation. No network download should be required to access them. Each standard board should have an information button that explains its purpose, intended use, relevant evidence and limitations.

The exact initial content is defined below. Labels are starting vocabulary, not a restriction on user expression. Users must be able to customise the content without losing access to the original standard set.

### Board 1 — Communicate: Core Vocabulary

**Buttons:** I; want; need; like; don't like; more; not; no; yes; stop; go; help; different; finished; again; it; that; here; there; what; where; who; my; your; and; please.

**Evidence:** The 2023 review of core-vocabulary interventions reported a limited evidence base, with 10 studies identified and only five peer-reviewed. It is important not to present a particular core vocabulary selection as universally validated.

Reference: https://link.springer.com/article/10.1007/s40489-023-00399-x

### Board 2 — Communicate: Requests & Needs

**Buttons:** I want; I need; eat; drink; toilet; help me; open; close; get it; give me; more; again; stop; wait; finished; break; I don't want that.

**Evidence:** Bondy and Frost's 1994 paper describes the structured Picture Exchange Communication System (PECS). Voca's tap-to-speak and sentence-construction functions are not PECS, and the product must not claim to implement the PECS protocol.

Reference: https://journals.sagepub.com/doi/10.1177/108835769400900301

### Board 3 — Communicate: Greetings & Social Communication

**Buttons:** Hello; goodbye; good morning; good night; please; thank you; sorry; excuse me; my turn; your turn; play with me; come here; look; listen; I have something to say; I don't understand.

**Evidence:** Thiemann and Goldstein (2001) investigated written and pictorial cues with video feedback for social communication in five autistic students. This does not establish that a greetings board by itself produces the same outcomes.

Reference: https://pubmed.ncbi.nlm.nih.gov/11800183/

### Board 4 — My Day: Visual Schedule

**Buttons / activities:** Wake up; get dressed; breakfast; brush teeth; school; travel; play; lunch; snack; homework; bath; dinner; free time; bedtime; finished.

**Evidence:** Knight, Sartini and Spriggs (2015) reviewed 31 studies, of which 16 met their quality criteria. Visual activity schedules were considered evidence-based in relevant contexts, particularly when implemented with systematic instructional procedures.

Reference: https://pubmed.ncbi.nlm.nih.gov/25081593/

### Board 5 — My Day: First–Then

**Buttons:** First; then; now; next; later; wait; finished; break; choose; change of plan.

Include configurable first and then activity slots. Users should be able to select an existing button or activity, create a new activity and change the sequence without duplicating the underlying content unnecessarily.

**Evidence:** Related activity-schedule literature supports consideration of visual supports in appropriate contexts, but it should not be presented as direct proof that every First–Then implementation works for every user.

References: https://www.sciencedirect.com/science/article/pii/S1750946711001334 and https://pubmed.ncbi.nlm.nih.gov/25081593/

### Board 6 — Choices

**Buttons:** Yes; no; neither; something else; I don't know; show me; this one; that one; food; drink; activity; place; toy; music; book; inside; outside; change my mind.

Choice-making must preserve the user's ability to reject all presented options, change their mind or request an alternative. Do not make the selection of a listed option mandatory.

**Evidence:** Research reviews of visual supports and caregiver-delivered interventions provide relevant context, but there is no single standardised choice-board programme that should be implied by this feature.

Reference: https://doi.org/10.1007/s40489-023-00390-6

### Board 7 — Feelings & Emotions

**Buttons:** Happy; sad; angry; worried; scared; excited; calm; frustrated; confused; tired; lonely; bored; overwhelmed; I don't know how I feel.

This board is for communication, not emotional diagnosis. Users must be able to express a need or request help without first identifying or selecting a feeling.

**Evidence:** Social communication and social narrative literature may inform the design, but the board is not a validated emotion-assessment instrument.

References: https://pubmed.ncbi.nlm.nih.gov/11800183/ and https://pmc.ncbi.nlm.nih.gov/articles/PMC11263915/

### Board 8 — Sensory Needs & Regulation

**Buttons:** Too loud; too bright; too much; too crowded; too hot; too cold; uncomfortable; quiet please; headphones; dim the lights; give me space; stop touching me; I need a break; I want to leave.

The board should make it easy to communicate a sensory difficulty, ask for an adjustment or request to leave. Do not frame distress as non-compliance or make the user navigate an emotional questionnaire before communicating a need.

**Evidence:** Relevant sensory and visual-support literature can inform the board's rationale, but this exact phrase set is not a validated intervention.

References: https://pubmed.ncbi.nlm.nih.gov/36898384/ and https://doi.org/10.1007/s40489-023-00390-6

### Board 9 — Body, Pain & Health Needs

**Buttons:** It hurts; I feel sick; headache; tummy hurts; ear hurts; mouth hurts; tooth hurts; hot; cold; itchy; dizzy; thirsty; hungry; tired; toilet; medicine; I need help.

This board supports expression of symptoms and needs. It must not infer a diagnosis, severity or clinical meaning from a selected button. A caregiver or professional must interpret the communication in context.

### Board 10 — Tasks & Routines

Provide editable routine templates for handwashing, brushing teeth, getting dressed, packing a school bag, preparing for bed, tidying up and leaving the house.

Each routine should support ordered steps, optional illustrations, completion state, editing, reordering, duplication and reuse. A routine may include a step label, a visual, a spoken phrase and optional audio. Users must be able to skip, repeat or change a step without the application treating that action as an error.

**Evidence:** Lequia, Machalicek and Rispoli (2012) reviewed 18 studies of activity schedules and reported positive effects in the included studies, with variation across the evidence base.

Reference: https://www.sciencedirect.com/science/article/pii/S1750946711001334

### Board 11 — Waiting, Transitions & Changes

**Buttons:** Wait; nearly finished; not yet; soon; later; different plan; change; unexpected; what happens next; I need more time; I am not ready.

Visual schedules may help some users in some contexts, but they do not remove every difficulty associated with transitions or unexpected change. Do not present a timer or schedule as a guarantee that a transition will be easy.

References: https://pubmed.ncbi.nlm.nih.gov/25081593/ and https://pubmed.ncbi.nlm.nih.gov/40392102/

### Board 12 — Safety & Urgent Communication

**Buttons:** Help me; stop; no; danger; I am lost; I need my parent; I am hurt; I feel unsafe; call for help; I need to leave.

Make this board quickly accessible from Home and consistent navigation shortcuts. The application must not imply that a message has been sent to emergency services, a parent or a caregiver unless a separately implemented and explicitly configured feature actually performs that action. V1 must not create an expectation of emergency monitoring.

This is a practical safety-oriented communication board, not a clinical intervention validated as a complete set.

## 9. Board and button customisation

Users must be able to create, edit, duplicate, reorder, hide and delete custom boards and buttons. They should be able to attach personal photographs, choose a visual presentation, edit labels and spoken phrases independently, configure the language of each spoken phrase, add optional recorded audio and mark frequently used items as favourites.

A button may belong to multiple boards through stable IDs. Board-specific settings must be supported where needed, so reusing a button does not unexpectedly change its meaning or presentation everywhere else.

Standard content must be recoverable. Provide a restore-standard-content action that restores the original bundled set without deleting or overwriting user-created content. Define how modified standard boards are handled, and clearly distinguish a reset of standard content from a full local-data reset.

## 10. Original AI-generated artwork system

Every standard image-based button must have an original image created specifically for Voca. The artwork should form a coherent visual language across all boards, with consistent composition, visual weight, background treatment, subject framing and recognisability.

Competitor applications may be examined to identify the concept a button needs to communicate and to compare common visual conventions. Their graphics must not be copied, traced, or fed into image-generation workflows in ways that reproduce proprietary artwork. Generate new images from independently written descriptions of the communicative concept.

### Artwork production workflow

1. Create a master inventory of every standard button, routine activity, schedule activity and other visual item that requires artwork.
2. Define a visual specification for each item: intended meaning, key subject, relevant context, possible ambiguity and the distinction from visually similar items.
3. Establish Voca's original artwork style guide before bulk generation. The style guide should define illustration approach, line weight, composition, colour use, backgrounds, cropping, representation and rules for avoiding unnecessary visual clutter.
4. Write an independent prompt for each image, using the button's intended meaning and the Voca style guide. Do not rely on competitor artwork as the prompt's source image.
5. Generate original assets and review them for semantic accuracy, ambiguity, consistency, cultural assumptions and suitability for the intended audience.
6. Test similar images side by side. In particular, distinguish concepts such as hot/cold, yes/no, stop/go, happy/sad, open/close and first/then.
7. Maintain an asset manifest containing the button ID, asset filename, prompt, generation date, review status, licence or service terms relevant to the generated output and any required attribution.
8. Store final assets in the application's local bundled resources. No image should need to be generated or fetched at runtime.
9. Optimise file sizes and dimensions for crisp display on phones and tablets without making the application unnecessarily large.
10. Retain a text-only display option and meaningful accessible labels so that images are helpful but never the only means of understanding a button.

Review the terms of the chosen image-generation service and retain records of asset provenance. The fact that an image is AI-generated does not by itself establish that it is legally unrestricted or suitable for commercial distribution.

For third-party symbol libraries such as ARASAAC, review the applicable licence, attribution and share-alike requirements before bundling any material. Prefer the original Voca artwork library for the standard experience, and do not mix third-party assets into the pack without documented approval.

## 11. Speech, language and audio

Use `expo-speech` as the initial TTS implementation, subject to real-device validation: https://docs.expo.dev/versions/latest/sdk/speech/

Discover and display the voices actually available on the device rather than assuming every language or voice exists. Users should be able to preview voices, choose a preferred voice, configure rate and pitch where supported, stop speech and prevent overlapping utterances.

The spoken phrase must be independent of the visible label. For example, a button may display a short label while speaking a longer phrase. Allow an optional user-recorded audio clip for buttons where TTS is unavailable or inappropriate.

The interface should initially be in English but must be translation-ready. Each button's spoken text may have its own language, using an installed compatible operating-system voice. Support user-entered translations and custom text; do not claim automatic translation.

Provide graceful fallback behaviour when a requested language or voice is unavailable. Do not require an internet connection to translate or synthesise content through a remote service.

**Important platform validation:** Expo Speech documentation notes that physical iOS devices may produce no speech when the device is in silent mode. This must be investigated and tested as part of the AAC-specific release process. If speech is unreliable under common device settings, adjust the native audio-session implementation or choose an appropriate native solution before release. A communication app must not silently appear to speak when no audible output occurs.

## 12. Visual supports and routines

Visual schedules, First–Then boards and routines must be functional tools, not static illustrations. Users should be able to create schedules, assign activities, reorder steps, mark progress and reuse templates.

Where a timer or waiting aid is provided, it should communicate the state clearly and remain usable without network access. Avoid relying exclusively on colour or animation to convey time or completion. Support reduced-motion preferences and make all meaningful states available to screen readers.

Provide options to customise schedule content and images. Do not enforce a single correct routine or assume that every activity must be completed in a fixed sequence.

Printable output should allow users to create printable communication cards and board layouts. The export must preserve readable labels and image associations, and provide sensible page sizing and margins. PDF generation must work locally or use a library bundled with the app; it must not require an external PDF-generation service.

## 13. Data model and local persistence

Implement and document a versioned local database schema. At minimum, it must cover the following entities.

**Button:** stable ID, visible label, spoken text, optional image reference, optional recorded-audio reference, language, favourites state and other relevant configuration.

**Board:** stable ID, name, category, description, standard/custom metadata, research references where applicable, display settings and modification state.

**BoardItem:** board ID, button ID, order and any board-specific presentation or behaviour.

**Routine:** stable ID, name, description, category and metadata.

**RoutineStep:** routine ID, order, activity/button reference, completion-related configuration and optional media.

**UserSettings:** interface language, speech settings, onboarding state, quick actions, display/accessibility settings, telemetry consent and other preferences.

Store local media using stable references and manage deletion carefully so that deleting one board does not remove an image still used elsewhere. Database migrations must preserve user-created content across application updates.

Define the backup format, including database version, media manifest, media files and validation information. Restoration should validate the archive before applying changes and should fail safely if files are missing or corrupt. Clearly explain whether restoration merges content or replaces the current user library; do not leave that behaviour ambiguous.

Provide user-initiated export and restore, with no automatic upload. Support appropriate structured export formats such as JSON and SQLite, plus the necessary media files. The exported package must be understandable, versioned and recoverable.

## 14. Privacy and optional telemetry

Voca must be usable without telemetry. Consent must be explicit, optional, independently configurable and revocable from Settings. Declining consent must not disable any feature.

If telemetry is enabled, send at most one telemetry request per installation per calendar day. The payload must be limited to the permitted platform (`ios` or `android`) and an approved usage event. It must not contain communication text, board contents, photographs, recordings, location, names, email addresses, advertising IDs, account IDs or other personal information.

Do not create a unique-user metric. Do not queue telemetry while offline and transmit it later. If a request fails, discard it rather than building a backlog. Define an allowlist of permitted events, and reject any event that is not on that list.

The application must not deliberately persist IP addresses. However, an HTTP request necessarily exposes network-layer information to the receiving infrastructure. Before claiming that no IP address is stored anywhere, configure and verify the endpoint, hosting provider, reverse proxy, security tooling and application logs so that IP addresses are not retained. Do not make an absolute privacy claim until the complete processing chain has been checked.

Do not include third-party analytics, advertising SDKs or crash-reporting services that transmit data without being separately reviewed and disclosed. Any future change to telemetry must be reviewed against the privacy policy, platform disclosures and the user's consent.

## 15. Accessibility and inclusive interaction

Accessibility is a core product requirement. Implement and test VoiceOver on iOS and TalkBack on Android. Provide meaningful accessible names for controls, logical focus order, large configurable touch targets, legible text, sufficient contrast and layouts that adapt to device size and text scaling.

Avoid conveying meaning solely through colour, animation or images. Keep important controls in predictable locations where practical, particularly for frequently used communication buttons. Consider stable button placement as a configurable design option for users who rely on consistent motor patterns.

Support reduced motion, clear pressed/selected states, and interruption of speech. Ensure the sentence builder, board editing, onboarding, dialogs, export and restore workflows are accessible, not just the Home screen.

Do not assume all users communicate in the same way. Provide text-only buttons, images with labels, single-word speech, phrases, sentence construction and optional recorded audio. Do not require users to identify feelings, follow a routine or construct a grammatically complete sentence before expressing a need.

## 16. Research information and limitations

Every standard board must have an information control that presents the board name, purpose, a concise summary of the relevant research, a citation and an explanation of the evidence's limitations. References must be bundled in the app so that the information remains available offline.

Distinguish clearly between evidence for a broad approach and evidence for Voca itself. A paper on visual schedules does not validate every schedule in the app, and a paper on a structured communication intervention does not establish that Voca implements that intervention.

Custom boards should state that the content is user-created and has no specific research citation supplied by Voca. Do not invent citations or imply endorsement by researchers, therapists, schools or clinical organisations.

## 17. Competitive research and product positioning

Competitor research should guide usability, vocabulary planning and feature coverage, not copying. The following products are useful references for the design and positioning of Voca. Store availability, features and prices can vary by country and version, so confirm the current listings before making any public comparison.

### Established AAC products

- **[Proloquo2Go — Apple App Store, Ireland](https://apps.apple.com/ie/app/proloquo2go-aac/id308368164)** and [AssistiveWare's product page](https://www.assistiveware.com/products/proloquo2go). Study its vocabulary organisation, symbol presentation, speech configuration and customisation. It is an established, feature-rich AAC product; Voca should not claim equivalent clinical depth without evidence. Voca's differentiation is a free, offline-first, no-account application that combines communication with everyday visual supports.

- **[TD Snap — Apple App Store](https://apps.apple.com/us/app/td-snap/id1072799231)**. Study its professionally developed page sets, symbol and text options, language support and accessibility positioning. Do not claim eye-gaze, switch access or other specialised access methods for Voca unless they are implemented and tested.

- **[CoughDrop AAC — Apple App Store](https://apps.apple.com/us/app/coughdrop/id1021384570)** and [Google Play](https://play.google.com/store/apps/details?id=com.mycoughdrop.coughdrop). Study its configurable AAC boards, custom images and audio, and starter content. Its account and commercial model illustrate a different approach from Voca's local-only design.

### Visual schedules, routines and choices

- **[Choiceworks — Apple App Store, Ireland](https://apps.apple.com/ie/app/choiceworks/id486210964)** and [Google Play](https://play.google.com/store/apps/details?hl=en-US&id=com.beevisual.choiceworks.android). Study its schedules, waiting and feelings boards, timers, custom media and parent-oriented presentation. Voca's intended distinction is to offer these types of visual support alongside communication and sentence construction, without advertising or paid feature tiers.

- **[MyVisualRoutine — Google Play](https://play.google.com/store/apps/details?id=com.myvisualroutine.app)**, [official website](https://www.myvisualroutine.com/) and [FAQ](https://www.myvisualroutine.com/support/faq/). Study its activity templates, day plans, First–Then features and customisation. Voca should aim for immediately useful built-in content and locally stored routines without subscription gates.

- **[Pictalk Buddy: Routine & AAC — Google Play](https://play.google.com/store/apps/details?hl=en_GB&id=org.pictime.application.twa)**, [official resources](https://www.pictalk.org/en/buddy/resources/) and [getting-started guide](https://www.pictalk.org/en/article/pictalk-buddy-getting-started/). Study its combination of AAC, schedules, sequences and routines. Do not assume all its functions work offline simply because its documentation describes offline viewing in some contexts.

- **[Visual Schedule Daily Routine](https://visual-schedule.app/)**. Study its visual templates, icons, reminders, timers and language support. Treat its website as a product reference, not as proof that its implementation or licensing is available for reuse.

### Smaller and parent-focused products

- **[TalkToMe AAC — Apple App Store, Ireland](https://apps.apple.com/ie/app/talktome-aac/id6759237260)** and [Talk To Me – AAC — Google Play](https://play.google.com/store/apps/details?hl=en-US&id=com.me.TalkToMe). Study the direct presentation of communication cards, sentence strips, routines and privacy-oriented positioning. The platform listings may describe different feature sets, so compare each version separately.

- **[First Then Next](https://firstthennext.com/)**. Study its approach to visual planning and shared routines, while keeping Voca's initial architecture focused on local use and user-controlled data.

Across these products, useful patterns include ready-to-use content, clear feature explanations, custom photos and audio, predictable board organisation, voice output, routine templates and transparent privacy information. Voca should use these insights to create an original product rather than copying competitors' assets, layouts or proprietary vocabulary systems.

## 18. Legal, privacy and store compliance

Include an About & Legal section containing the product description, version, developer attribution, privacy policy, terms and appropriate disclaimer.

The disclaimer should explain that Voca is provided in good faith as a communication and visual-support tool, created as a personal project and made publicly available to help others. It is not a medical device, diagnostic system or substitute for an individual assessment or professional advice. It does not guarantee communication outcomes and is not an emergency service.

The final wording must be reviewed before release. The application should not imply clinical endorsement or claim proven outcomes for Voca itself.

Publish a privacy policy that accurately describes local storage, optional telemetry, data handling, export, restoration and any processing by third-party platform services. Complete Apple App Store privacy disclosures and Google Play Data safety disclosures according to actual application and infrastructure behaviour. Do not claim “no data collected” without checking all permitted network activity and the hosting/logging configuration.

Review platform requirements for children and family-oriented applications, age ratings, privacy disclosures, permissions and user-generated media. Request only the permissions required for selected functions, and explain why they are needed. For example, access to a photo library should be requested when a user chooses to import a personal photograph, rather than as an unexplained onboarding requirement.

Review all bundled artwork, fonts, audio assets and third-party code for licence compatibility. Include third-party licence notices where required.

## 19. Quality assurance and release acceptance criteria

The application is not ready for public release until all of the following are demonstrated.

**Core functionality**
- All 12 standard boards and their specified buttons are included in the installation.
- Individual-word communication works without requiring sentence construction.
- The sentence builder combines items from different boards, preserves the active sentence during navigation and speaks the complete sentence.
- Users can create, edit, duplicate, reorder and delete custom boards and buttons.
- Routines, First–Then activities, choices and schedules are editable and persist after a restart.
- Standard content can be restored without overwriting user-created content.
- Export and restoration include the necessary structured data and local media.

**Offline and privacy**
- Core functionality works in airplane mode after installation.
- No account or remote API is required for communication, speech, board editing, search, routines or export.
- Telemetry is absent unless explicitly enabled.
- Telemetry is limited to the approved event and platform fields, capped at one request per installation per day, and never queued for later transmission.
- The actual infrastructure logging configuration has been verified before making IP-retention claims.

**Speech and accessibility**
- Available voices are discovered and previewed on real iOS and Android devices.
- Speech rate, pitch and voice configuration behave correctly where supported.
- Speech interruption, repeated selections, unavailable voices and silent-mode behaviour have been tested.
- VoiceOver and TalkBack can navigate and operate the application.
- Enlarged text, contrast, touch targets and small-screen sentence construction have been tested.

**Reliability and data integrity**
- Database migrations preserve existing user content.
- Interrupted onboarding resumes correctly.
- Missing or corrupted backup files fail safely and provide understandable feedback.
- Deleting a board does not break other boards that reuse its buttons or media.
- Repeated taps, app backgrounding, device restart and low-storage conditions have been tested.
- The app does not lose or unexpectedly reset the sentence under normal navigation or interruption.

**Artwork**
- Every standard image-based button has an approved original image.
- Similar concepts have been checked for visual ambiguity.
- The asset manifest and relevant provenance/licensing records are complete.
- Images render correctly across device sizes and display modes.
- Text-only and screen-reader alternatives remain usable.

**Store readiness**
- App icon, screenshots, description, support contact and privacy-policy URL are ready.
- Apple and Google privacy disclosures reflect the actual build.
- The application builds successfully for each supported platform and has been tested on real devices.
- Store signing, release configuration, version numbering and production build instructions are documented.
- A final release candidate has passed regression testing.

## 20. Development and deployment sequence

The project should proceed through defined delivery gates, while treating the full feature set above as the release target.

**Phase 1 — Architecture and foundations:** Establish the Expo project, navigation, local database, media storage, design tokens, settings and onboarding. Define the schema and migrations before building large amounts of content.

**Phase 2 — Communication engine:** Implement the board renderer, button interaction modes, speech service, sentence strip, sentence editing, sentence playback and persistence. Validate the full word-to-sentence workflow on real iOS and Android devices.

**Phase 3 — Content and artwork:** Finalise the 12 standard boards, routine templates, button inventory, research references and original AI-generated artwork library. Bundle all approved content and assets with the application.

**Phase 4 — Visual supports and personalisation:** Implement schedules, First–Then, choices, routines, custom boards, custom buttons, personal photos, recorded audio, favourites, search and configurable Home shortcuts.

**Phase 5 — Export, restoration and privacy:** Complete local backups, restore-standard-content behaviour, printable output, telemetry consent and controls, data validation, legal information and infrastructure privacy verification.

**Phase 6 — Quality assurance and release:** Run automated tests and real-device tests, complete accessibility and offline validation, resolve release-blocking defects, prepare store metadata, produce signed release builds and submit to the relevant stores. Monitor store review feedback and fix issues without introducing unreviewed telemetry or cloud dependencies.

The first engineering milestone is a working prototype that completes onboarding, opens directly to Home on subsequent launches, loads a standard board, speaks an individual word, builds a multi-word sentence from different boards, speaks that sentence, and retains the user's configuration after a restart. This milestone validates the most important technical risk early, but it does not replace any of the full V1 release requirements above.

## 21. Final definition of V1

Voca V1 is complete when a user can install the app, configure it once, communicate with individual words or constructed sentences, use all standard communication and visual-support boards, personalise content, use speech and supported language voices, create routines, export and restore local data, and use the app offline without an account, advertisements or a subscription.

All standard image-based buttons must have original, reviewed artwork, and all research claims, privacy disclosures, platform behaviours and store requirements must be verified before publication. The public release should be the complete, dependable product described here—not a partial communication board with core functionality promised for later.