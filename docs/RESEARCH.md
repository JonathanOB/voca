# Voca: board design research and decisions

_October 2026. Covers what established AAC apps do, what the research says, and what Voca changed as a result. All academic citations were checked against Crossref/PubMed metadata. Vendor feature descriptions come from the vendors' own pages and should be re-checked before any public comparison (brief §17)._

## 1. What the leading AAC apps do

| App | Vocabulary design | Motor planning / layout | Learning support | Notes for Voca |
|---|---|---|---|---|
| **Proloquo2Go** (AssistiveWare), Crescendo vocabulary | Core words plus fringe (10,000+), three vocabulary levels, 23 grid sizes | Core words stay in the same place across folders and pages | **Progressive Language** reveals words gradually so learners learn words *and* locations | Core + fringe structure; reveal-without-moving |
| **TD Snap Core First** (Tobii Dynavox) | Small set of flexible core words; Quick Fires (fast set phrases); Topics organised by communicative intent; word lists by category | Core words "carefully placed and ordered in a stable position" | Training on core, Quick Fires, topics | Fast fixed phrases; topic boards by situation |
| **LAMP Words for Life** (PRC-Saltillo) | 1-hit (84 words) → transition (~200) → full (thousands) | One consistent motor pattern per word; plans "can grow but not change" | **Vocabulary Builder** hides words without changing motor plans; **Word Finder** shows partners where a word is | Hide-without-moving; word finder |
| **Speak for Yourself** | ~14,000 words, ≤2 touches | 120-location grid, no duplicated words | **Babble** temporarily opens every word for exploration; open/close hides words | Explore mode |
| **CoughDrop** | Quick Core 24 / 60 / 112 with matching positions across sizes; inflections board | Same core positions across set sizes | **Modeling mode**, hide (vanish / blank / shadow), team reports | Hide modes; modelling support |
| **PODD** (Gayle Porter) | Pragmatic organisation: branch starters such as "I'm telling you something", "I'm asking a question", "something's wrong" | Book/page based | Partner-assisted modelling is central | Communicative intent; partner focus (PODD content is copyrighted, so Voca does not copy it) |
| **Cboard** (free, open source) | Mulberry symbols built in; ARASAAC/Global Symbols searchable | Simple grids | n/a | Proof that free AAC works; but symbol search needs internet. Voca bundles everything for full offline use |
| **Choiceworks** | Schedules, waiting and feelings boards with timers | n/a | Parent-oriented visual supports | Visual supports beside communication |

**Common threads:** core words in fixed positions; a way to start small without moving anything (masking); topic/fringe boards beside core; and explicit support for partners to *model*.

Sources: [AssistiveWare vocabularies](https://www.assistiveware.com/vocabularies) · [Ace Centre: Crescendo](https://acecentre.org.uk/language-library/crescendo) · [TD Snap Core First](https://us.tobiidynavox.com/pages/corefirst-page-set) · [LAMP WFL (PRC-Saltillo)](https://www.prentrom.com/lamp-words-for-life-language-system) · [Liberator: LAMP WFL](https://liberator.co.uk/resources/vocabulary/lamp-words-for-life) · [Speak for Yourself overview (AbleNet)](https://support.ablenetinc.com/speech-app/speak-for-yourself/) · [CoughDrop: robust vocabulary](https://blog.mycoughdrop.com/what-is-a-robust-vocabulary/) · [AssistiveWare: What is PODD?](https://www.assistiveware.com/blog/what-is-podd) · [Cboard (Ace Centre)](https://acecentre.org.uk/language-library/cboard-aac) · [Choiceworks (App Store)](https://apps.apple.com/ie/app/choiceworks/id486210964)

## 2. What the research says

| Finding | Evidence | What it means for Voca |
|---|---|---|
| **Partners modelling on the device works** | AAC modelling review: 9 single-case studies, 31 participants, positive and large effects on pragmatics, semantics, syntax and morphology ([Sennott et al., 2016](https://doi.org/10.1177/1540796916638822)); 48 studies, 267 participants, interventions "generally effective" ([Biggs et al., 2018](https://doi.org/10.1352/1944-7558-123.5.443)) | Make it easy for partners to find and model words |
| **AAC does not stop speech** | No evidence of speech decline; many showed gains ([Millar et al., 2006](https://doi.org/10.1044/1092-4388(2006/021)); [Schlosser & Wendt, 2008](https://doi.org/10.1044/1058-0360(2008/021))); no prerequisites for AAC ([Romski & Sevcik, 2005](https://doi.org/10.1097/00001163-200507000-00002)) | Say so clearly to families |
| **Core vocabulary matters, but no list is "validated"** | Small core sets dominate toddler and school-age speech ([Banajee et al., 2003](https://doi.org/10.1080/0743461031000112034); [Boenisch & Soto, 2015](https://doi.org/10.3109/07434618.2014.1001521)); core-vocabulary intervention evidence is limited ([Carnett et al., 2023](https://doi.org/10.1007/s40489-023-00399-x)); [Project Core Universal Core](https://www.med.unc.edu/ahs/clds/universal-core-vocabulary/) (36 words, CC BY 4.0) | Offer a robust, research-informed core set without over-claiming |
| **Display design affects finding words** | State of the science on AAC display design ([Light et al., 2019](https://doi.org/10.1080/07434618.2018.1558283); [Thistle & Wilkinson, 2015](https://doi.org/10.3109/07434618.2015.1035798)) | Consistent positions; avoid re-flowing grids |
| **Colour cues help in some tasks, not all** | Colour cues sped up locating targets for preschoolers ([Thistle & Wilkinson, 2009](https://doi.org/10.1044/1058-0360(2009/08-0029))); other studies show little effect | Use a standard key, always paired with picture + words, and switchable |
| **Rights: refusal, requests, attention** | Communication Bill of Rights ([Brady et al., 2016](https://doi.org/10.1352/1944-7558-121.2.121)) | "No", "stop" and "help" always reachable |
| **Competence is more than words** | Linguistic, operational, social, strategic competence ([Light & McNaughton, 2014](https://doi.org/10.3109/07434618.2014.885080)) | Never rewrite messages; respect unconventional use |
| **Aided AAC helps autistic people** | Meta-analysis of single-case studies ([Ganz et al., 2012](https://doi.org/10.1007/s10803-011-1212-2)) | Context for the Requests board |
| **Visual supports for transitions, choices** | [Dettmer et al., 2000](https://doi.org/10.1177/108835760001500307); [Knight et al., 2015](https://pubmed.ncbi.nlm.nih.gov/25081593/); [Cannella et al., 2005](https://doi.org/10.1016/j.ridd.2004.01.006) | My Day tools; choices that allow "none of these" |

## 3. What Voca changed

| Change | Based on | Where |
|---|---|---|
| **Same layout on every screen** (fixed 3/4/6-column grid by button size), on by default | Motor planning (LAMP, Speak for Yourself, Proloquo2Go); display-design research | Settings → Display; `gridColumns()` |
| **Masking on by default**: hidden words leave a gap, so nothing moves | Progressive Language, Vocabulary Builder, CoughDrop "hide" | Board edit → hide; Settings → Display |
| **"Show hidden words" (explore)**: temporarily reveals masked words in place | Speak for Yourself "Babble" | Board header eye button |
| **Always-there words** row (yes, no, stop, help, more, finished; editable, max 6) | Communication Bill of Rights; early core vocabulary | Every communication board; Settings → General |
| **Modified Fitzgerald Key colours**, with core words re-classified (pronouns yellow, verbs green, describing blue, nouns orange, social and position pink, questions purple, negation red, adverbs brown, joining words white) plus a colour key; DB migration v2 updates existing installs | Standard AAC colour coding; mixed evidence handled by pairing with picture + words | Settings → Display → Colour key |
| **More core words** board: with Core, covers all 36 Universal Core words, plus frequent early/school-age core words, grouped by colour | Universal Core; Banajee 2003; Boenisch & Soto 2015 | Communicate → More |
| **Word finder**: search → "Show where" opens the board, scrolls to the word and gently pulses it | LAMP Word Finder; modelling research | My Library → Search |
| **"How to support" tips** on every board, verified references, topic-board note | Modelling, rights, schedule and choice research | Board ⓘ |
| **Guide for families and helpers** (9 evidence-based sections) | All of the above | About & Legal → Guide; Settings → General |
| **Voice library by accent** ("American English", "Irish English" …) with per-voice preview; network-only Android voices hidden | Offline reliability; ease of choosing a voice | Onboarding and Settings → Voice |

## 4. Not done (and why)

- **Word forms / grammar (plural, past tense)**: helpful (Proloquo2Go, CoughDrop inflections), but language-specific across 10 languages. Recommended next step, starting with English.
- **Usage logging and modelling-mode analytics** (CoughDrop): conflicts with the privacy model (brief §14).
- **Copying any vendor layout or PODD content**: excluded by the brief (§17) and by copyright.
- **Clinical claims**: none are made. Voca has not been evaluated; every board says so.

## 5. Before release

- Have a speech and language therapist review the guide, the tips and the More core word choices.
- Replace the interim Fluent 3D artwork with original Voca artwork (brief §10), keeping the same IDs.
- Re-check vendor feature claims if they are ever used in marketing.
