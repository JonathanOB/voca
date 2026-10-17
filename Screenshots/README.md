# Google Play store media

Everything here is ready to upload in Play Console → **Grow → Store presence → Main store listing**. All images are 24-bit PNG (no transparency), as Play requires.

| Play Console field | File | Notes |
|---|---|---|
| App icon (512×512) | `play-icon-512.png` | Made from `assets/brand/voca-icon.jpg` by `npm run build:icons` |
| Feature graphic (1024×500) | `feature-graphic-1024x500.png` | |
| Phone screenshots (2–8) | `phone/` (1080×1920) | Play allows 8; the suggested 8 are listed below |
| 7-inch tablet screenshots | `tablet/` (1600×2560) | The same five files work for both tablet slots |
| 10-inch tablet screenshots | `tablet/` (1600×2560) | |
| Video | `promo-video.mp4` (38 s, 1080×1920, silent) | Play only takes a **YouTube link**: upload this as public or unlisted with ads off, then paste the URL |

## Phone screenshots

Suggested order for the eight slots:

1. `phone-01-home.png`: Home with today's plan and quick actions
2. `phone-02-talk.png`: building "I want more" on the core board
3. `phone-03-word-forms.png`: long press for word forms (wants, wanted, wanting)
4. `phone-04-my-day.png`: My Day with times
5. `phone-05-feelings.png`: Feelings board
6. `phone-06-choices.png`: a choice with "None of these"
7. `phone-07-phrase-builder.png`: phrase builder
8. `phone-08-touch.png`: Touch settings for tremor and repeated taps

Spares: `phone-09-languages.png` (ten languages), `phone-10-phrases.png` (Phrases board), `phone-11-carer-pin.png` (carer PIN).

## Draft listing text

Check these before pasting them in.

- **App name** (30 max): Voca - AAC Communication
- **Short description** (80 max): Free AAC: tap pictures to talk, plan the day and say how you feel. Offline.
- **Full description** (4000 max):

> Voca is a free AAC (augmentative and alternative communication) app for children and adults who are non-speaking or partly speaking, including autistic people.
>
> TALK
> • Core vocabulary in a fixed layout with Fitzgerald Key colours, so words stay where hands learn to find them
> • Build sentences and speak them with the free voices already on your device
> • Hold a word for other forms: wants, wanted, wanting; apples; bigger
> • Phrase builder: tap or type, drag words into order, and save as one button
> • Typing with suggestions that learn only on your device
> • Send a sentence to WhatsApp or another app, or paste a message to hear it read out
>
> MY DAY, CHOICES AND FEELINGS
> • Today's plan with times and daily reminders, First–Then, routines and a wait timer
> • Choices that always include "None of these"
> • Feelings, sensory, body and safety boards, with a Help button on every screen
>
> MADE TO FIT
> • Your own boards and buttons, with photos and recorded voices
> • Touch help for tremor and repeated taps, with a short tapping game that suggests settings
> • Optional carer PIN so boards and settings aren't changed by accident
> • Ten languages, with a quick switch: English, Spanish, French, German, Italian, Portuguese, Dutch, Polish, Chinese and Japanese
> • Light, dark and high-contrast themes, larger text and screen-reader labels
>
> PRIVATE BY DESIGN
> No accounts, no adverts, no subscriptions. Voca works fully offline and everything stays on your device.
>
> Built-in tips on each board are based on published AAC research, with the sources listed in the app.
>
> Voca is not a medical device and not an emergency service.

- **Category**: Communication (or Education)
- **Contact email**: hello@appzano.com

## How these were made

They were captured from the Android emulator with the status bar in demo mode (9:30, full battery) and sample data (user "Sam"). Phones were captured at 1080×1920 and tablets at 1600×2560 / 320 dpi. To refresh them after UI changes, retake the same screens. The video is short host-side emulator recordings joined with ffmpeg, with title and end cards in the app's fonts and colours.
