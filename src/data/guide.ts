/**
 * "Using Voca well": a short, evidence-informed guide for families, teachers
 * and therapists. Each section says what the research suggests, what to try,
 * and which Voca feature supports it. Citations are verified (see research.ts).
 * English only for now; review with a speech and language therapist before release.
 */
import { REF, type Reference } from './research';

export interface GuideSection {
  emoji: string;
  title: string;
  research: string;
  tryThis: string[];
  inVoca: string;
  references: Reference[];
}

export const GUIDE: GuideSection[] = [
  {
    emoji: '👉',
    title: 'Show how, by using it yourself',
    research:
      'Reviews of AAC modelling found positive effects on language when communication partners use the person’s board themselves during everyday interaction, without demanding imitation.',
    tryThis: [
      'Point to one or two key words on the board as you talk: “Let’s GO… OUTSIDE.”',
      'Model just a little beyond what the person says now.',
      'Keep it relaxed. Modelling is showing, not testing.',
    ],
    inVoca: 'Use Search → “Show where” to find a word quickly and see exactly where it lives.',
    references: [REF.sennott2016, REF.biggs2018],
  },
  {
    emoji: '🗣️',
    title: 'Voca will not stop speech',
    research:
      'Research reviews found no evidence that AAC stops people from developing speech, and many participants’ speech improved. AAC is a support, not a last resort.',
    tryThis: ['Use Voca and speech together.', 'Start early: there are no skills a person must have before using AAC.'],
    inVoca: 'Every button speaks out loud, so words can be heard and seen at the same time.',
    references: [REF.millar2006, REF.schlosser2008, REF.romski2005],
  },
  {
    emoji: '📍',
    title: 'Keep words in the same place',
    research:
      'AAC display design research highlights how layout and organisation affect how quickly people find words. Many AAC systems keep each word in one fixed position so that reaching it becomes a learned movement.',
    tryThis: [
      'Avoid moving buttons around once someone has learned them.',
      'To make a board simpler, hide words rather than deleting them.',
    ],
    inVoca: '“Same layout on every screen” and “Keep button positions fixed” are on by default (Settings → Display).',
    references: [REF.light2019, REF.thistle2015],
  },
  {
    emoji: '💬',
    title: 'Core words first, then topic words',
    research:
      'A small set of core words makes up much of everyday speech for young and school-age children. Combined with topic words (people, places, things), core words let people say far more than names.',
    tryThis: ['Teach words like more, stop, go, help and not across many activities.', 'Add personal topic words such as family names and favourite places.'],
    inVoca: 'Core and More core (which together include all of Project Core’s Universal Core) sit under Communicate; topic boards are in My Library.',
    references: [REF.banajee2003, REF.boenisch2015, REF.universalCore],
  },
  {
    emoji: '✋',
    title: 'Everyone has the right to say no',
    research:
      'The Communication Bill of Rights states that every person has the right to refuse, to ask for things, to get attention and to be responded to, whatever their disability.',
    tryThis: ['Respond to “no” and “stop”, even when you cannot do what was asked.', 'Never remove access to communication as a consequence.'],
    inVoca: 'Always-there words (yes, no, stop, help, more, finished) appear on every board, and Help is one tap away on every screen.',
    references: [REF.brady2016],
  },
  {
    emoji: '🌱',
    title: 'Communication is more than words',
    research:
      'Communicative competence includes language, using the device, social skills and strategies for when things go wrong. People who use AAC build these skills over time with support.',
    tryThis: ['Wait: give plenty of time to respond.', 'Respond to every attempt, including gestures, sounds and unusual word choices.'],
    inVoca: 'Voca never corrects or rewrites what someone says, and the sentence is never cleared without a clear choice.',
    references: [REF.light2014],
  },
  {
    emoji: '🎨',
    title: 'Colour helps some people',
    research:
      'Studies of colour cues on AAC displays show they can speed up finding a word in some tasks but not others, so colour should support, not replace, pictures and words.',
    tryThis: ['Point out the colour groups when modelling: “Doing words are green.”'],
    inVoca: 'Buttons use the Modified Fitzgerald Key; see Settings → Display → Colour key, or turn colour coding off.',
    references: [REF.thistle2009, REF.thistle2015],
  },
  {
    emoji: '🗓️',
    title: 'Visual supports for the day',
    research:
      'Visual activity schedules are considered evidence-based in relevant contexts, especially when taught systematically. Visual supports can also help with transitions.',
    tryThis: ['Preview the day together and tick things off as you go.', 'Show changes on the schedule as soon as you know about them.'],
    inVoca: 'My Day has Today’s plan, First–Then, step-by-step routines and a calm wait timer.',
    references: [REF.knight2015, REF.dettmer2000, REF.lequia2012],
  },
  {
    emoji: '👆',
    title: 'Offer real choices',
    research: 'Choice-making is a well-researched way to support self-determination for people with significant disabilities.',
    tryThis: ['Offer choices you can honour, and accept “none of these”.'],
    inVoca: 'Choices → Choose shows 2–4 options full screen, always with “None of these” and “Something else”.',
    references: [REF.cannella2005],
  },
  {
    emoji: '📲',
    title: 'Messages connect people',
    research:
      'Young people who use AAC described messaging and social media as a way to keep in touch on their own terms, and adults who use AAC reported that it widened their social world. Studies are small and qualitative.',
    tryThis: [
      'Send a short message together to someone the person likes, such as a grandparent.',
      'Read replies aloud and build the answer together; there is no rush.',
    ],
    inVoca: 'Tap Send on a sentence to share it to WhatsApp or another app. On the Type tab, “Paste and read” reads a copied message aloud.',
    references: [REF.hynan2014, REF.caron2015],
  },
  {
    emoji: '⌨️',
    title: 'Suggestions help some typists',
    research:
      'Word prediction can save keystrokes, but choosing from a list also takes time and attention, so it does not speed everyone up.',
    tryThis: ['Try suggestions on and off and notice which feels easier.', 'Keep the list short; Voca shows a few words at a time.'],
    inVoca: 'Settings → General → Typing suggestions. Suggestions only appear on the Type tab, so symbol buttons never move.',
    references: [REF.koester1996],
  },
];
