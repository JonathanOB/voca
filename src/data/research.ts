/**
 * Research notes for the standard boards (brief §8, §16). Bundled so they are
 * available offline. Summaries distinguish evidence for a broad approach from
 * evidence for Voca itself, which has not been evaluated.
 *
 * Every citation below was checked against Crossref or PubMed metadata
 * (October 2026). Kept in English: the papers are English-language.
 * Review wording with a qualified professional before public release.
 */
export interface Reference {
  citation: string;
  url: string;
}

export interface ResearchNote {
  evidence: string;
  limitations: string;
  /** Practical, evidence-informed ways a communication partner can support use. */
  tips: string[];
  references: Reference[];
}

// --- shared references ---------------------------------------------------------

export const REF = {
  carnett2023: {
    citation:
      'Carnett, A., Devine, B., Ingvarsson, E., & Esch, B. (2023). A systematic and quality review of augmentative and alternative communication interventions that use core vocabulary. Review Journal of Autism and Developmental Disorders, 12(2), 363–379.',
    url: 'https://doi.org/10.1007/s40489-023-00399-x',
  },
  banajee2003: {
    citation: 'Banajee, M., Dicarlo, C., & Buras Stricklin, S. (2003). Core vocabulary determination for toddlers. Augmentative and Alternative Communication, 19(2), 67–73.',
    url: 'https://doi.org/10.1080/0743461031000112034',
  },
  boenisch2015: {
    citation:
      'Boenisch, J., & Soto, G. (2015). The oral core vocabulary of typically developing English-speaking school-aged children: implications for AAC practice. Augmentative and Alternative Communication, 31(1), 77–84.',
    url: 'https://doi.org/10.3109/07434618.2014.1001521',
  },
  universalCore: {
    citation:
      'Project Core, Center for Literacy and Disability Studies, University of North Carolina at Chapel Hill. Universal Core vocabulary (36 words). Creative Commons Attribution 4.0.',
    url: 'https://www.med.unc.edu/ahs/clds/universal-core-vocabulary/',
  },
  sennott2016: {
    citation: 'Sennott, S. C., Light, J. C., & McNaughton, D. (2016). AAC modeling intervention research review. Research and Practice for Persons with Severe Disabilities, 41(2), 101–115.',
    url: 'https://doi.org/10.1177/1540796916638822',
  },
  biggs2018: {
    citation:
      'Biggs, E. E., Carter, E. W., & Gilson, C. B. (2018). Systematic review of interventions involving aided AAC modeling for children with complex communication needs. American Journal on Intellectual and Developmental Disabilities, 123(5), 443–473.',
    url: 'https://doi.org/10.1352/1944-7558-123.5.443',
  },
  millar2006: {
    citation:
      'Millar, D. C., Light, J. C., & Schlosser, R. W. (2006). The impact of augmentative and alternative communication intervention on the speech production of individuals with developmental disabilities: a research review. Journal of Speech, Language, and Hearing Research, 49(2), 248–264.',
    url: 'https://doi.org/10.1044/1092-4388(2006/021)',
  },
  schlosser2008: {
    citation:
      'Schlosser, R. W., & Wendt, O. (2008). Effects of augmentative and alternative communication intervention on speech production in children with autism: a systematic review. American Journal of Speech-Language Pathology, 17(3), 212–230.',
    url: 'https://doi.org/10.1044/1058-0360(2008/021)',
  },
  brady2016: {
    citation:
      'Brady, N. C., Bruce, S., Goldman, A., Erickson, K., Mineo, B., Ogletree, B. T., et al. (2016). Communication services and supports for individuals with severe disabilities: guidance for assessment and intervention (including the Communication Bill of Rights). American Journal on Intellectual and Developmental Disabilities, 121(2), 121–138.',
    url: 'https://doi.org/10.1352/1944-7558-121.2.121',
  },
  light2014: {
    citation:
      'Light, J., & McNaughton, D. (2014). Communicative competence for individuals who require augmentative and alternative communication: a new definition for a new era of communication? Augmentative and Alternative Communication, 30(1), 1–18.',
    url: 'https://doi.org/10.3109/07434618.2014.885080',
  },
  light2019: {
    citation:
      'Light, J., Wilkinson, K. M., Thiessen, A., Beukelman, D. R., & Fager, S. K. (2019). Designing effective AAC displays for individuals with developmental or acquired disabilities: state of the science and future research directions. Augmentative and Alternative Communication, 35(1), 42–55.',
    url: 'https://doi.org/10.1080/07434618.2018.1558283',
  },
  thistle2015: {
    citation:
      'Thistle, J. J., & Wilkinson, K. M. (2015). Building evidence-based practice in AAC display design for young children: current practices and future directions. Augmentative and Alternative Communication, 31(2), 124–136.',
    url: 'https://doi.org/10.3109/07434618.2015.1035798',
  },
  thistle2009: {
    citation:
      'Thistle, J. J., & Wilkinson, K. (2009). The effects of color cues on typically developing preschoolers’ speed of locating a target line drawing: implications for AAC display design. American Journal of Speech-Language Pathology, 18(3), 231–240.',
    url: 'https://doi.org/10.1044/1058-0360(2009/08-0029)',
  },
  ganz2012: {
    citation:
      'Ganz, J. B., Earles-Vollrath, T. L., Heath, A. K., Parker, R. I., Rispoli, M. J., & Duran, J. B. (2012). A meta-analysis of single case research studies on aided augmentative and alternative communication systems with individuals with autism spectrum disorders. Journal of Autism and Developmental Disorders, 42(1), 60–74.',
    url: 'https://doi.org/10.1007/s10803-011-1212-2',
  },
  romski2005: {
    citation: 'Romski, M., & Sevcik, R. A. (2005). Augmentative communication and early intervention: myths and realities. Infants & Young Children, 18(3), 174–185.',
    url: 'https://doi.org/10.1097/00001163-200507000-00002',
  },
  bondy1994: {
    citation: 'Bondy, A. S., & Frost, L. A. (1994). The Picture Exchange Communication System. Focus on Autistic Behavior, 9(3), 1–19.',
    url: 'https://doi.org/10.1177/108835769400900301',
  },
  thiemann2001: {
    citation:
      'Thiemann, K. S., & Goldstein, H. (2001). Social stories, written text cues, and video feedback: effects on social communication of children with autism. Journal of Applied Behavior Analysis, 34(4), 425–446.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/11800183/',
  },
  knight2015: {
    citation:
      'Knight, V., Sartini, E., & Spriggs, A. D. (2015). Evaluating visual activity schedules as evidence-based practice for individuals with autism spectrum disorders. Journal of Autism and Developmental Disorders, 45(1), 157–178.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/25081593/',
  },
  lequia2012: {
    citation:
      'Lequia, J., Machalicek, W., & Rispoli, M. J. (2012). Effects of activity schedules on challenging behavior exhibited in children with autism spectrum disorders: a systematic review. Research in Autism Spectrum Disorders, 6(1), 480–492.',
    url: 'https://doi.org/10.1016/j.rasd.2011.07.008',
  },
  dettmer2000: {
    citation: 'Dettmer, S., Simpson, R. L., Myles, B. S., & Ganz, J. B. (2000). The use of visual supports to facilitate transitions of students with autism. Focus on Autism and Other Developmental Disabilities, 15(3), 163–169.',
    url: 'https://doi.org/10.1177/108835760001500307',
  },
  hammond2025: {
    citation:
      'Hammond, A. W., Morris, J. R., Gabrielsen, T., Smith, T. B., & Medsker, N. (2025). A systematic review of digital activity schedule use in individuals with autism spectrum disorder and intellectual disability. Journal of Intellectual & Developmental Disability, 50(4), 502–516.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40392102/',
  },
  avery2023: {
    citation:
      'Avery, S. K., Akers, J. S., Gerow, S., & Exline, E. (2023). The use of caregiver-implemented visual supports for individuals with developmental disabilities: a systematic literature review. Review Journal of Autism and Developmental Disorders, 12(2), 323–341.',
    url: 'https://doi.org/10.1007/s40489-023-00390-6',
  },
  cannella2005: {
    citation:
      'Cannella, H. I., O’Reilly, M. F., & Lancioni, G. E. (2005). Choice and preference assessment research with people with severe to profound developmental disabilities: a review of the literature. Research in Developmental Disabilities, 26(1), 1–15.',
    url: 'https://doi.org/10.1016/j.ridd.2004.01.006',
  },
  como2024: {
    citation:
      'Como, D. H., Goodfellow, M., Hudak, D., & Cermak, S. A. (2024). A scoping review: social stories supporting behavior change for individuals with autism. Journal of Occupational Therapy, Schools, & Early Intervention, 17(1), 154–175.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11263915/',
  },
  forbes2023: {
    citation: 'Forbes, A. S., & Yun, J. (2023). Visual supports for children with autism in physical activity. Adapted Physical Activity Quarterly, 40(4), 781–806.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/36898384/',
  },
  hynan2014: {
    citation:
      'Hynan, A., Murray, J., & Goldbart, J. (2014). ‘Happy and excited’: Perceptions of using digital technology and social media by young people who use augmentative and alternative communication. Child Language Teaching and Therapy, 30(2), 175–186.',
    url: 'https://doi.org/10.1177/0265659013519258',
  },
  caron2015: {
    citation:
      'Caron, J., & Light, J. (2015). “My world has expanded even though I’m stuck at home”: Experiences of individuals with amyotrophic lateral sclerosis who use augmentative and alternative communication and social media. American Journal of Speech-Language Pathology, 24(4), 680–695.',
    url: 'https://doi.org/10.1044/2015_AJSLP-15-0010',
  },
  koester1996: {
    citation: 'Koester, H. H., & Levine, S. (1996). Effect of a word prediction feature on user performance. Augmentative and Alternative Communication, 12(3), 155–168.',
    url: 'https://doi.org/10.1080/07434619612331277608',
  },
} satisfies Record<string, Reference>;

const MODEL_TIP =
  'Model: as you talk, point to the words on the board yourself. Do not ask the person to copy you; just show how the words are used (aided language modelling).';

// --- per board -------------------------------------------------------------------

export const RESEARCH: Record<string, ResearchNote> = {
  core: {
    evidence:
      'Core vocabulary is a small set of frequent words that work in many situations and combine into sentences; they make up much of what young children say (Banajee et al., 2003; Boenisch & Soto, 2015). A 2023 systematic and quality review of AAC interventions using core vocabulary (Carnett et al.) found a limited evidence base: 10 studies were identified, of which only five were peer-reviewed. Reviews of AAC modelling report positive effects when partners use the board themselves during everyday interaction (Sennott et al., 2016; Biggs et al., 2018).',
    limitations:
      'No particular core word list has been shown to suit everyone. This selection is a starting point, not a validated set, and should be adapted to the person.',
    tips: [
      MODEL_TIP,
      'Keep words in the same place, so finding them becomes automatic. Hide words you are not using yet instead of deleting them; the others will not move.',
      'Build on what the person says: if they say “more”, you might model “more juice” or “want more”.',
      'Every attempt counts. Repeating a word, or using it in an unexpected way, is still communication.',
    ],
    references: [REF.banajee2003, REF.boenisch2015, REF.carnett2023, REF.sennott2016, REF.biggs2018],
  },
  core2: {
    evidence:
      'Together with Core words, this board includes all 36 words of Project Core’s Universal Core vocabulary, which was built from existing core word lists, AAC systems, word frequency and the language of classroom instruction. It adds other frequent words from early and school-age core vocabulary research (Banajee et al., 2003; Boenisch & Soto, 2015). Words are grouped by colour so similar kinds of words sit together.',
    limitations:
      'Word lists describe what people commonly say, not what any one person needs. Voca itself has not been studied.',
    tips: [
      MODEL_TIP,
      'Start with a few target words. Hide the rest while you begin (they keep their places), and use “Show hidden words” to explore together.',
      'Use the same word across many activities, for example “put” when tidying, cooking and getting dressed.',
    ],
    references: [REF.universalCore, REF.banajee2003, REF.boenisch2015, REF.sennott2016],
  },
  requests: {
    evidence:
      'Requesting is one of the most studied early communication skills. Bondy and Frost (1994) described the Picture Exchange Communication System (PECS), a structured protocol that teaches requesting with pictures, and a meta-analysis of aided AAC with autistic people reported positive effects on communication outcomes (Ganz et al., 2012).',
    limitations:
      'Voca’s tap-to-speak buttons and sentence building are not PECS, and Voca does not implement the PECS protocol. The research does not show that this board produces the same results.',
    tips: [
      'Respond to requests as quickly as you can, so the person learns that their words work.',
      'If you cannot give what was asked for, acknowledge it first: “You want juice. Juice is finished. Water?”',
      MODEL_TIP,
    ],
    references: [REF.bondy1994, REF.ganz2012],
  },
  social: {
    evidence:
      'Thiemann and Goldstein (2001) studied written and pictorial cues combined with video feedback to support social communication with five autistic students. Communication is more than words: social, strategic and operational skills matter too (Light & McNaughton, 2014).',
    limitations:
      'That study used a specific teaching package with a small group. It does not show that a greetings board on its own leads to the same outcomes.',
    tips: [
      'Model greetings and turn-taking in real moments, such as hello at the door or “your turn” in a game.',
      'Do not make a greeting a condition for getting something; social words should feel useful, not like a test.',
    ],
    references: [REF.thiemann2001, REF.light2014],
  },
  schedule: {
    evidence:
      'Knight, Sartini and Spriggs (2015) reviewed 31 studies of visual activity schedules; 16 met their quality criteria. Visual activity schedules were considered evidence-based in relevant contexts, particularly when taught with systematic instructional procedures.',
    limitations:
      'The evidence relates to schedules taught and used in particular ways. It does not validate every schedule in Voca, and a schedule should never be enforced as the only correct order of the day.',
    tips: [
      'Look at the plan together at the start of the day, and tick activities off as they happen.',
      'Warn early when something changes, and change the plan on screen so it stays true.',
      'Let the person tap activities to talk about their day, not only to follow it.',
    ],
    references: [REF.knight2015, REF.lequia2012],
  },
  firstthen: {
    evidence:
      'Research on activity schedules and visual supports for transitions supports showing what comes first and what comes next, in appropriate contexts (Lequia et al., 2012; Dettmer et al., 2000).',
    limitations: 'This related literature is not direct proof that every First–Then board works for every person.',
    tips: [
      'Keep “first” short to begin with, and make “then” something the person genuinely wants.',
      'Always deliver the “then” once “first” is done, so the board can be trusted.',
    ],
    references: [REF.lequia2012, REF.dettmer2000, REF.knight2015],
  },
  choices: {
    evidence:
      'Offering choices is a well-studied way to support self-determination for people with significant disabilities (Cannella et al., 2005). Reviews of caregiver-implemented visual supports give useful context for offering choices visually (Avery et al., 2023).',
    limitations:
      'There is no single standardised choice-board programme, and none is implied here. Choosing a listed option is never required: “none of these”, “something else” and changing your mind are always allowed.',
    tips: [
      'Only offer choices you can honour, and accept “none of these” as a real answer.',
      'Start with two clear options, and include something the person likes.',
    ],
    references: [REF.cannella2005, REF.avery2023],
  },
  feelings: {
    evidence:
      'Social communication research and a scoping review of social stories may inform how feelings are presented visually (Thiemann & Goldstein, 2001; Como et al., 2024).',
    limitations:
      'This board is for communication, not emotional assessment or diagnosis. Nobody has to identify a feeling before asking for help or saying what they need.',
    tips: [
      'Model your own feelings in the moment: “I feel tired.” “I feel excited!”',
      'Never quiz. Accept the feeling chosen, even if it is not the one you expected.',
    ],
    references: [REF.thiemann2001, REF.como2024],
  },
  sensory: {
    evidence:
      'Research on visual supports, including their use in physical-activity settings and when implemented by caregivers, can inform why it helps to have quick, visual ways to say something is too much and to ask for a change (Forbes & Yun, 2023; Avery et al., 2023).',
    limitations:
      'This exact phrase set is not a validated intervention. Distress is communication, not non-compliance; the board lets people ask for an adjustment or to leave without answering questions first.',
    tips: [
      'Act on these requests quickly; that is how the person learns they are heard.',
      'A request to leave or for a break is communication, not misbehaviour.',
    ],
    references: [REF.forbes2023, REF.avery2023],
  },
  body: {
    evidence:
      'This board supports saying symptoms and body needs so that others can respond. People who use AAC have the right to express needs and be responded to (Communication Bill of Rights; Brady et al., 2016).',
    limitations:
      'Voca does not infer a diagnosis, severity or clinical meaning from any button. A caregiver or professional must interpret what is said in context. In an emergency, contact local emergency services.',
    tips: ['Take every report seriously and check it out.', 'Practise body words when the person is well, so they are familiar when needed.'],
    references: [REF.brady2016],
  },
  routines: {
    evidence:
      'Lequia, Machalicek and Rispoli (2012) reviewed 18 studies of activity schedules and reported positive effects in the included studies, with variation across the evidence base.',
    limitations:
      'Results varied between studies. Routines in Voca can be skipped, repeated or changed at any time, and doing so is never treated as an error.',
    tips: ['Do each step alongside the person at first, then step back gradually.', 'Edit the steps to match how your family really does the task.'],
    references: [REF.lequia2012, REF.knight2015],
  },
  waiting: {
    evidence:
      'Visual supports, including digital activity schedules and timers, may help some people with waiting and transitions in some contexts (Dettmer et al., 2000; Knight et al., 2015; Hammond et al., 2025).',
    limitations:
      'They do not remove every difficulty with transitions or unexpected change. A timer or schedule is not a guarantee that a transition will be easy.',
    tips: [
      'Show the timer at the start of the wait, not only at the end.',
      'Acknowledge that waiting is hard, and model waiting words yourself.',
    ],
    references: [REF.dettmer2000, REF.knight2015, REF.hammond2025],
  },
  safety: {
    evidence:
      'A practical, safety-oriented communication board, always one tap away. Everyone has the right to refuse, to ask for help and to be heard (Communication Bill of Rights; Brady et al., 2016).',
    limitations:
      'Not a clinical intervention validated as a complete set. Voca speaks out loud on this device only: it does not call, message or alert anyone, and it is not an emergency monitoring service.',
    tips: ['Practise these words at calm times, so they are familiar in a stressful moment.', 'Respect “stop” and “no” every time they are used.'],
    references: [REF.brady2016],
  },
};

/** For topic boards (food, people, places…) and custom boards without their own note. */
export const TOPIC_NOTE: ResearchNote = {
  evidence:
    'Topic boards hold fringe vocabulary: specific words for people, places and things. They work best alongside core words, so the person can say more than names, for example “want more apple” (Banajee et al., 2003; Boenisch & Soto, 2015).',
  limitations: 'These word sets are starting points chosen for everyday life, not validated lists.',
  tips: [MODEL_TIP, 'Add the people, places and favourite things that matter to this person, with real photos if that helps.'],
  references: [REF.banajee2003, REF.boenisch2015],
};
