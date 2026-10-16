/**
 * Bundled standard content.
 *
 * Every button, board and routine has a stable key. Database IDs are derived
 * from these keys (`std:button:<key>`), never from the visible label, so
 * labels can be translated or edited by the user without breaking references.
 *
 * Visible text lives in the locale files (`vocab.<key>`), so standard content
 * follows the interface language until a user edits it.
 *
 * `sym` is the emoji character whose 3D artwork is bundled from the symbol
 * library (see scripts/build-symbols.js and docs/ARTWORK.md).
 */
import type { CardColor, WordType } from '@/theme/colors';
import type { TapAction } from '@/store/settings';

export type SectionKey = 'home' | 'communicate' | 'myday' | 'choices' | 'feelings' | 'library' | 'safety';

export interface StdButtonDef {
  sym: string;
  type: WordType;
}

export interface StdBoardDef {
  key: string;
  section: SectionKey;
  sym: string;
  color: CardColor;
  buttons: string[];
  /** Board-specific tap behaviour; falls back to the user's setting. */
  tapAction?: TapAction;
  /** Visual tone override for every tile on the board. */
  tone?: 'urgent';
  /** True for the 12 boards defined in the product specification. */
  core12?: boolean;
}

export interface StdRoutineDef {
  key: string;
  sym: string;
  color: CardColor;
  kind: 'routine' | 'schedule';
  /** For routines: step keys (labels from vocab). For schedules: button keys. */
  steps: string[];
}

// ---------------------------------------------------------------------------
// Buttons

export const STD_BUTTONS: Record<string, StdButtonDef> = {
  // Core vocabulary
  i: { sym: '🙋', type: 'people' },
  want: { sym: '🤲', type: 'action' },
  need: { sym: '❗', type: 'action' },
  like: { sym: '👍', type: 'action' },
  dont_like: { sym: '👎', type: 'negation' },
  more: { sym: '➕', type: 'describe' },
  not: { sym: '🚫', type: 'negation' },
  no: { sym: '❌', type: 'negation' },
  yes: { sym: '✅', type: 'social' },
  stop: { sym: '🛑', type: 'negation' },
  go: { sym: '🟢', type: 'action' },
  help: { sym: '🤝', type: 'action' },
  different: { sym: '🔀', type: 'describe' },
  finished: { sym: '🏁', type: 'social' },
  again: { sym: '🔁', type: 'time' },
  it: { sym: '📦', type: 'people' },
  that: { sym: '👉', type: 'people' },
  here: { sym: '👇', type: 'time' },
  there: { sym: '↗️', type: 'time' },
  what: { sym: '❓', type: 'question' },
  where: { sym: '🧭', type: 'question' },
  who: { sym: '👤', type: 'question' },
  my: { sym: '🫶', type: 'people' },
  your: { sym: '🫵', type: 'people' },
  and: { sym: '🔗', type: 'misc' },
  please: { sym: '🙏', type: 'social' },

  // More core words (completes Project Core's Universal Core with Core above)
  he: { sym: '👦', type: 'people' },
  she: { sym: '👧', type: 'people' },
  we: { sym: '👨‍👩‍👧', type: 'people' },
  they: { sym: '👥', type: 'people' },
  this: { sym: '👇', type: 'people' },
  is: { sym: '🟰', type: 'action' },
  can: { sym: '💪', type: 'action' },
  do: { sym: '🛠️', type: 'action' },
  get: { sym: '🫳', type: 'action' },
  have: { sym: '👐', type: 'action' },
  make: { sym: '🔨', type: 'action' },
  put: { sym: '⤵️', type: 'action' },
  turn: { sym: '🔃', type: 'action' },
  see: { sym: '👁️', type: 'action' },
  come: { sym: '↩️', type: 'action' },
  give: { sym: '🎁', type: 'action' },
  feel: { sym: '💗', type: 'action' },
  know: { sym: '💡', type: 'action' },
  think: { sym: '🧠', type: 'action' },
  in: { sym: '📥', type: 'social' },
  on: { sym: '🔛', type: 'social' },
  off: { sym: '📴', type: 'social' },
  out: { sym: '📤', type: 'social' },
  up: { sym: '⬆️', type: 'social' },
  down: { sym: '⬇️', type: 'social' },
  with: { sym: '👫', type: 'social' },
  to: { sym: '➡️', type: 'social' },
  all: { sym: '💯', type: 'misc' },
  some: { sym: '🍪', type: 'misc' },
  bad: { sym: '👎', type: 'describe' },

  // Requests & needs
  i_want: { sym: '🤲', type: 'action' },
  i_need: { sym: '❗', type: 'action' },
  eat: { sym: '🍴', type: 'action' },
  drink: { sym: '🥤', type: 'action' },
  toilet: { sym: '🚽', type: 'thing' },
  help_me: { sym: '🤝', type: 'action' },
  open: { sym: '🔓', type: 'action' },
  close: { sym: '🔒', type: 'action' },
  get_it: { sym: '🫳', type: 'action' },
  give_me: { sym: '🫴', type: 'action' },
  wait: { sym: '⏳', type: 'action' },
  break: { sym: '🧘', type: 'thing' },
  i_dont_want: { sym: '🙅', type: 'negation' },

  // Greetings & social
  hello: { sym: '👋', type: 'social' },
  goodbye: { sym: '🚶', type: 'social' },
  good_morning: { sym: '🌅', type: 'social' },
  good_night: { sym: '🌙', type: 'social' },
  thank_you: { sym: '💝', type: 'social' },
  sorry: { sym: '😔', type: 'social' },
  excuse_me: { sym: '🤚', type: 'social' },
  my_turn: { sym: '☝️', type: 'social' },
  your_turn: { sym: '🫵', type: 'social' },
  play_with_me: { sym: '🤹', type: 'social' },
  come_here: { sym: '🤗', type: 'social' },
  look: { sym: '👀', type: 'action' },
  listen: { sym: '👂', type: 'action' },
  something_to_say: { sym: '💬', type: 'social' },
  dont_understand: { sym: '🤔', type: 'question' },

  // Phrases: ready-made messages for conversation partners (social / pragmatic)
  phrase_aac: { sym: '📱', type: 'social' },
  phrase_wait: { sym: '⏳', type: 'social' },
  phrase_again: { sym: '🔁', type: 'social' },
  phrase_slow: { sym: '🐢', type: 'social' },
  phrase_yesno: { sym: '👍', type: 'social' },
  phrase_show: { sym: '👀', type: 'social' },
  phrase_thanks: { sym: '🙏', type: 'social' },

  // Visual schedule activities
  wake_up: { sym: '⏰', type: 'action' },
  get_dressed: { sym: '👕', type: 'action' },
  breakfast: { sym: '🥣', type: 'thing' },
  brush_teeth: { sym: '🪥', type: 'action' },
  school: { sym: '🏫', type: 'place' },
  travel: { sym: '🚌', type: 'place' },
  play: { sym: '🤸', type: 'action' },
  lunch: { sym: '🥪', type: 'thing' },
  snack: { sym: '🍎', type: 'thing' },
  homework: { sym: '✏️', type: 'action' },
  bath: { sym: '🛁', type: 'action' },
  dinner: { sym: '🍝', type: 'thing' },
  free_time: { sym: '🎮', type: 'thing' },
  bedtime: { sym: '🛌', type: 'thing' },

  // First–Then
  first: { sym: '1️⃣', type: 'time' },
  then: { sym: '2️⃣', type: 'time' },
  now: { sym: '▶️', type: 'time' },
  next: { sym: '⏭️', type: 'time' },
  later: { sym: '🕒', type: 'time' },
  choose: { sym: '👆', type: 'action' },
  change_of_plan: { sym: '🗓️', type: 'thing' },

  // Choices
  neither: { sym: '⛔', type: 'negation' },
  something_else: { sym: '💭', type: 'question' },
  i_dont_know: { sym: '🤷', type: 'question' },
  show_me: { sym: '🔍', type: 'action' },
  this_one: { sym: '👇', type: 'people' },
  that_one: { sym: '👉', type: 'people' },
  food: { sym: '🍔', type: 'thing' },
  activity: { sym: '🎯', type: 'thing' },
  place: { sym: '📍', type: 'place' },
  toy: { sym: '🧸', type: 'thing' },
  music: { sym: '🎵', type: 'thing' },
  book: { sym: '📚', type: 'thing' },
  inside: { sym: '🏠', type: 'place' },
  outside: { sym: '🌳', type: 'place' },
  change_my_mind: { sym: '🔄', type: 'social' },

  // Feelings & emotions
  happy: { sym: '😊', type: 'feeling' },
  sad: { sym: '😢', type: 'feeling' },
  angry: { sym: '😠', type: 'feeling' },
  worried: { sym: '😟', type: 'feeling' },
  scared: { sym: '😨', type: 'feeling' },
  excited: { sym: '🤩', type: 'feeling' },
  calm: { sym: '😌', type: 'feeling' },
  frustrated: { sym: '😤', type: 'feeling' },
  confused: { sym: '😕', type: 'feeling' },
  tired: { sym: '🥱', type: 'feeling' },
  lonely: { sym: '🥺', type: 'feeling' },
  bored: { sym: '😑', type: 'feeling' },
  overwhelmed: { sym: '😵‍💫', type: 'feeling' },
  dont_know_feel: { sym: '🤷', type: 'feeling' },

  // Sensory needs & regulation
  too_loud: { sym: '🔊', type: 'describe' },
  too_bright: { sym: '🔆', type: 'describe' },
  too_much: { sym: '🤯', type: 'describe' },
  too_crowded: { sym: '👥', type: 'describe' },
  too_hot: { sym: '🥵', type: 'describe' },
  too_cold: { sym: '🥶', type: 'describe' },
  uncomfortable: { sym: '😣', type: 'feeling' },
  quiet_please: { sym: '🤫', type: 'social' },
  headphones: { sym: '🎧', type: 'thing' },
  dim_lights: { sym: '🔅', type: 'action' },
  give_me_space: { sym: '🫸', type: 'negation' },
  stop_touching: { sym: '✋', type: 'negation' },
  need_a_break: { sym: '🛋️', type: 'action' },
  want_to_leave: { sym: '🚪', type: 'action' },

  // Body, pain & health
  it_hurts: { sym: '🩹', type: 'body' },
  feel_sick: { sym: '🤢', type: 'body' },
  headache: { sym: '🤕', type: 'body' },
  tummy_hurts: { sym: '😖', type: 'body' },
  ear_hurts: { sym: '👂', type: 'body' },
  mouth_hurts: { sym: '👄', type: 'body' },
  tooth_hurts: { sym: '🦷', type: 'body' },
  hot: { sym: '🔥', type: 'describe' },
  cold: { sym: '❄️', type: 'describe' },
  itchy: { sym: '🦟', type: 'body' },
  dizzy: { sym: '💫', type: 'body' },
  thirsty: { sym: '🫗', type: 'body' },
  hungry: { sym: '🍽️', type: 'body' },
  medicine: { sym: '💊', type: 'thing' },
  need_help: { sym: '🆘', type: 'body' },

  // Waiting, transitions & changes
  nearly_finished: { sym: '⌛', type: 'time' },
  not_yet: { sym: '⏸️', type: 'time' },
  soon: { sym: '🔜', type: 'time' },
  different_plan: { sym: '🔀', type: 'thing' },
  change: { sym: '🔄', type: 'thing' },
  unexpected: { sym: '😮', type: 'describe' },
  what_next: { sym: '🔮', type: 'question' },
  more_time: { sym: '⏱️', type: 'action' },
  not_ready: { sym: '😰', type: 'feeling' },

  // Safety & urgent communication
  urgent_help: { sym: '🆘', type: 'urgent' },
  danger: { sym: '⚠️', type: 'urgent' },
  lost: { sym: '🗺️', type: 'urgent' },
  need_parent: { sym: '👪', type: 'urgent' },
  hurt: { sym: '🩹', type: 'urgent' },
  unsafe: { sym: '😱', type: 'urgent' },
  call_for_help: { sym: '📞', type: 'urgent' },
  need_to_leave: { sym: '🚪', type: 'urgent' },

  // Library: actions
  sleep: { sym: '😴', type: 'action' },
  read: { sym: '📖', type: 'action' },
  watch: { sym: '🍿', type: 'action' },
  walk: { sym: '👣', type: 'action' },
  run: { sym: '🏃', type: 'action' },
  jump: { sym: '🦘', type: 'action' },
  sit: { sym: '🪑', type: 'action' },
  stand: { sym: '🧍', type: 'action' },
  wash: { sym: '🧼', type: 'action' },
  cook: { sym: '🍳', type: 'action' },
  sing: { sym: '🎤', type: 'action' },
  dance: { sym: '💃', type: 'action' },
  hug: { sym: '🫂', type: 'action' },
  swim: { sym: '🏊', type: 'action' },
  tidy: { sym: '🧹', type: 'action' },

  // Library: food
  apple: { sym: '🍏', type: 'thing' },
  banana: { sym: '🍌', type: 'thing' },
  bread: { sym: '🍞', type: 'thing' },
  cheese: { sym: '🧀', type: 'thing' },
  chicken: { sym: '🍗', type: 'thing' },
  pasta: { sym: '🍝', type: 'thing' },
  pizza: { sym: '🍕', type: 'thing' },
  rice: { sym: '🍚', type: 'thing' },
  cereal: { sym: '🥣', type: 'thing' },
  sandwich: { sym: '🥪', type: 'thing' },
  chips: { sym: '🍟', type: 'thing' },
  biscuit: { sym: '🍪', type: 'thing' },
  ice_cream: { sym: '🍦', type: 'thing' },
  egg: { sym: '🥚', type: 'thing' },
  carrot: { sym: '🥕', type: 'thing' },
  grapes: { sym: '🍇', type: 'thing' },
  strawberry: { sym: '🍓', type: 'thing' },
  sweets: { sym: '🍬', type: 'thing' },

  // Library: drinks
  water: { sym: '💧', type: 'thing' },
  milk: { sym: '🥛', type: 'thing' },
  juice: { sym: '🧃', type: 'thing' },
  hot_chocolate: { sym: '☕', type: 'thing' },
  tea: { sym: '🍵', type: 'thing' },
  lemonade: { sym: '🍋', type: 'thing' },
  ice: { sym: '🧊', type: 'thing' },

  // Library: people
  me: { sym: '🙋', type: 'people' },
  you: { sym: '🫵', type: 'people' },
  mum: { sym: '👩', type: 'people' },
  dad: { sym: '👨', type: 'people' },
  brother: { sym: '👦', type: 'people' },
  sister: { sym: '👧', type: 'people' },
  baby: { sym: '👶', type: 'people' },
  grandma: { sym: '👵', type: 'people' },
  grandad: { sym: '👴', type: 'people' },
  friend: { sym: '🧑‍🤝‍🧑', type: 'people' },
  teacher: { sym: '🧑‍🏫', type: 'people' },
  doctor: { sym: '🧑‍⚕️', type: 'people' },
  family: { sym: '👪', type: 'people' },

  // Library: places
  home: { sym: '🏡', type: 'place' },
  park: { sym: '🏞️', type: 'place' },
  shop: { sym: '🛒', type: 'place' },
  playground: { sym: '🛝', type: 'place' },
  beach: { sym: '🏖️', type: 'place' },
  car: { sym: '🚗', type: 'place' },
  bus: { sym: '🚍', type: 'place' },
  hospital: { sym: '🏥', type: 'place' },
  garden: { sym: '🌻', type: 'place' },
  bedroom: { sym: '🛏️', type: 'place' },
  bathroom: { sym: '🚿', type: 'place' },
  kitchen: { sym: '🍳', type: 'place' },

  // Library: play
  ball: { sym: '⚽', type: 'thing' },
  blocks: { sym: '🧱', type: 'thing' },
  puzzle: { sym: '🧩', type: 'thing' },
  toy_car: { sym: '🏎️', type: 'thing' },
  doll: { sym: '🪆', type: 'thing' },
  teddy: { sym: '🧸', type: 'thing' },
  bubbles: { sym: '🫧', type: 'thing' },
  crayons: { sym: '🖍️', type: 'thing' },
  painting: { sym: '🎨', type: 'thing' },
  tablet: { sym: '📱', type: 'thing' },
  tv: { sym: '📺', type: 'thing' },
  bike: { sym: '🚲', type: 'thing' },
  games: { sym: '🎲', type: 'thing' },

  // Library: describing
  big: { sym: '🐘', type: 'describe' },
  little: { sym: '🐭', type: 'describe' },
  fast: { sym: '🚀', type: 'describe' },
  slow: { sym: '🐢', type: 'describe' },
  loud: { sym: '📢', type: 'describe' },
  quiet: { sym: '🔇', type: 'describe' },
  wet: { sym: '💦', type: 'describe' },
  dry: { sym: '☀️', type: 'describe' },
  soft: { sym: '☁️', type: 'describe' },
  hard: { sym: '🪨', type: 'describe' },
  yummy: { sym: '😋', type: 'describe' },
  yucky: { sym: '😝', type: 'describe' },
  good: { sym: '🌟', type: 'describe' },
  same: { sym: '🟰', type: 'describe' },

  // Library: colours
  red: { sym: '🟥', type: 'describe' },
  orange: { sym: '🟧', type: 'describe' },
  yellow: { sym: '🟨', type: 'describe' },
  green: { sym: '🟩', type: 'describe' },
  blue: { sym: '🟦', type: 'describe' },
  purple: { sym: '🟪', type: 'describe' },
  pink: { sym: '🌸', type: 'describe' },
  brown: { sym: '🟫', type: 'describe' },
  black: { sym: '⬛', type: 'describe' },
  white: { sym: '⬜', type: 'describe' },

  // Library: animals
  dog: { sym: '🐶', type: 'thing' },
  cat: { sym: '🐱', type: 'thing' },
  bird: { sym: '🐦', type: 'thing' },
  fish: { sym: '🐟', type: 'thing' },
  horse: { sym: '🐴', type: 'thing' },
  cow: { sym: '🐮', type: 'thing' },
  pig: { sym: '🐷', type: 'thing' },
  sheep: { sym: '🐑', type: 'thing' },
  duck: { sym: '🦆', type: 'thing' },
  rabbit: { sym: '🐰', type: 'thing' },
  lion: { sym: '🦁', type: 'thing' },
  elephant: { sym: '🐘', type: 'thing' },
  monkey: { sym: '🐵', type: 'thing' },
  frog: { sym: '🐸', type: 'thing' },
  bear: { sym: '🐻', type: 'thing' },
  dinosaur: { sym: '🦖', type: 'thing' },

  // Library: clothes
  t_shirt: { sym: '👕', type: 'thing' },
  trousers: { sym: '👖', type: 'thing' },
  dress: { sym: '👗', type: 'thing' },
  shorts: { sym: '🩳', type: 'thing' },
  socks: { sym: '🧦', type: 'thing' },
  shoes: { sym: '👟', type: 'thing' },
  coat: { sym: '🧥', type: 'thing' },
  hat: { sym: '🧢', type: 'thing' },
  gloves: { sym: '🧤', type: 'thing' },
  scarf: { sym: '🧣', type: 'thing' },
  swimsuit: { sym: '🩱', type: 'thing' },
  glasses: { sym: '👓', type: 'thing' },

  // Library: questions
  when: { sym: '📅', type: 'question' },
  why: { sym: '🧐', type: 'question' },
  how: { sym: '⚙️', type: 'question' },
  how_many: { sym: '🔢', type: 'question' },
  which_one: { sym: '👆', type: 'question' },
  can_i: { sym: '🙋', type: 'question' },
};

// ---------------------------------------------------------------------------
// Routine steps (labels in vocab, steps are not standalone buttons)

export const STD_STEPS: Record<string, string> = {
  wash_tap_on: '🚰',
  wash_wet: '💧',
  wash_soap: '🧼',
  wash_rub: '👐',
  wash_rinse: '🚿',
  wash_tap_off: '🚱',
  wash_dry: '🧻',

  teeth_get: '🪥',
  teeth_paste: '🧴',
  teeth_top: '😁',
  teeth_bottom: '😬',
  teeth_spit: '💦',
  teeth_rinse: '🚰',
  teeth_done: '✨',

  dress_underwear: '🩲',
  dress_socks: '🧦',
  dress_trousers: '👖',
  dress_top: '👕',
  dress_jumper: '🧶',
  dress_shoes: '👟',

  bag_lunch: '🍱',
  bag_bottle: '🥤',
  bag_books: '📚',
  bag_pencils: '✏️',
  bag_homework: '📝',
  bag_close: '🎒',

  bed_bath: '🛁',
  bed_pyjamas: '👚',
  bed_teeth: '🪥',
  bed_toilet: '🚽',
  bed_story: '📖',
  bed_lights: '💡',
  bed_sleep: '😴',

  tidy_toys: '🧸',
  tidy_books: '📚',
  tidy_clothes: '🧺',
  tidy_bin: '🗑️',
  tidy_done: '✨',

  leave_toilet: '🚽',
  leave_shoes: '👟',
  leave_coat: '🧥',
  leave_bag: '🎒',
  leave_door: '🚪',
  leave_car: '🚗',
};

// ---------------------------------------------------------------------------
// Boards

export const STD_BOARDS: StdBoardDef[] = [
  {
    key: 'favourites',
    section: 'home',
    sym: '⭐',
    color: 'yellow',
    buttons: ['i_want', 'yes', 'no', 'help_me', 'more', 'stop', 'drink', 'toilet'],
  },
  {
    key: 'core',
    section: 'communicate',
    sym: '💬',
    color: 'purple',
    core12: true,
    buttons: [
      'i', 'want', 'need', 'like', 'dont_like', 'more', 'not', 'no', 'yes', 'stop', 'go', 'help', 'different',
      'finished', 'again', 'it', 'that', 'here', 'there', 'what', 'where', 'who', 'my', 'your', 'and', 'please',
    ],
  },
  {
    // Universal Core (Project Core, CLDS UNC, CC BY 4.0) together with Core above,
    // plus frequent early and school-age core words (Banajee et al., 2003; Boenisch & Soto, 2015).
    // Grouped by Modified Fitzgerald Key colour so related words sit together.
    key: 'core2',
    section: 'communicate',
    sym: '🧩',
    color: 'sky',
    buttons: [
      'he', 'she', 'we', 'they', 'you', 'me', 'this',
      'is', 'can', 'do', 'get', 'have', 'make', 'put', 'turn', 'look', 'see', 'come', 'give', 'open', 'feel', 'know', 'think',
      'in', 'on', 'off', 'out', 'up', 'down', 'with', 'to',
      'all', 'some', 'same', 'good', 'bad', 'big', 'little',
      'when', 'why', 'how',
    ],
  },
  {
    key: 'requests',
    section: 'communicate',
    sym: '🤲',
    color: 'green',
    core12: true,
    buttons: [
      'i_want', 'i_need', 'eat', 'drink', 'toilet', 'help_me', 'open', 'close', 'get_it', 'give_me', 'more',
      'again', 'stop', 'wait', 'finished', 'break', 'i_dont_want',
    ],
  },
  {
    key: 'social',
    section: 'communicate',
    sym: '👋',
    color: 'pink',
    core12: true,
    buttons: [
      'hello', 'goodbye', 'good_morning', 'good_night', 'please', 'thank_you', 'sorry', 'excuse_me', 'my_turn',
      'your_turn', 'play_with_me', 'come_here', 'look', 'listen', 'something_to_say', 'dont_understand',
    ],
  },
  {
    // Saved whole messages. Users add their own with the phrase builder.
    key: 'phrases',
    section: 'communicate',
    sym: '🗨️',
    color: 'peach',
    buttons: ['phrase_aac', 'phrase_wait', 'phrase_again', 'phrase_slow', 'phrase_yesno', 'phrase_show', 'phrase_thanks'],
  },
  {
    key: 'schedule',
    section: 'myday',
    sym: '🗓️',
    color: 'green',
    core12: true,
    buttons: [
      'wake_up', 'get_dressed', 'breakfast', 'brush_teeth', 'school', 'travel', 'play', 'lunch', 'snack',
      'homework', 'bath', 'dinner', 'free_time', 'bedtime', 'finished',
    ],
  },
  {
    key: 'firstthen',
    section: 'myday',
    sym: '1️⃣',
    color: 'sky',
    core12: true,
    buttons: ['first', 'then', 'now', 'next', 'later', 'wait', 'finished', 'break', 'choose', 'change_of_plan'],
  },
  {
    key: 'routines',
    section: 'myday',
    sym: '🧼',
    color: 'mint',
    core12: true,
    buttons: [],
  },
  {
    key: 'waiting',
    section: 'myday',
    sym: '⏳',
    color: 'peach',
    core12: true,
    buttons: [
      'wait', 'nearly_finished', 'not_yet', 'soon', 'later', 'different_plan', 'change', 'unexpected',
      'what_next', 'more_time', 'not_ready',
    ],
  },
  {
    key: 'choices',
    section: 'choices',
    sym: '👆',
    color: 'coral',
    core12: true,
    buttons: [
      'yes', 'no', 'neither', 'something_else', 'i_dont_know', 'show_me', 'this_one', 'that_one', 'food', 'drink',
      'activity', 'place', 'toy', 'music', 'book', 'inside', 'outside', 'change_my_mind',
    ],
  },
  {
    key: 'feelings',
    section: 'feelings',
    sym: '😊',
    color: 'yellow',
    core12: true,
    buttons: [
      'happy', 'sad', 'angry', 'worried', 'scared', 'excited', 'calm', 'frustrated', 'confused', 'tired',
      'lonely', 'bored', 'overwhelmed', 'dont_know_feel',
    ],
  },
  {
    key: 'sensory',
    section: 'feelings',
    sym: '🎧',
    color: 'sky',
    core12: true,
    buttons: [
      'too_loud', 'too_bright', 'too_much', 'too_crowded', 'too_hot', 'too_cold', 'uncomfortable', 'quiet_please',
      'headphones', 'dim_lights', 'give_me_space', 'stop_touching', 'need_a_break', 'want_to_leave',
    ],
  },
  {
    key: 'body',
    section: 'feelings',
    sym: '🩹',
    color: 'coral',
    core12: true,
    buttons: [
      'it_hurts', 'feel_sick', 'headache', 'tummy_hurts', 'ear_hurts', 'mouth_hurts', 'tooth_hurts', 'hot',
      'cold', 'itchy', 'dizzy', 'thirsty', 'hungry', 'tired', 'toilet', 'medicine', 'need_help',
    ],
  },
  {
    key: 'safety',
    section: 'safety',
    sym: '🆘',
    color: 'coral',
    core12: true,
    tapAction: 'speak',
    tone: 'urgent',
    buttons: [
      'urgent_help', 'stop', 'no', 'danger', 'lost', 'need_parent', 'hurt', 'unsafe', 'call_for_help',
      'need_to_leave',
    ],
  },

  // My Library vocabulary boards
  {
    key: 'actions',
    section: 'library',
    sym: '🏃',
    color: 'green',
    buttons: [
      'go', 'eat', 'drink', 'play', 'sleep', 'read', 'watch', 'walk', 'run', 'jump', 'sit', 'stand', 'wash',
      'cook', 'sing', 'dance', 'hug', 'swim', 'tidy', 'look', 'listen', 'open', 'close',
    ],
  },
  {
    key: 'food',
    section: 'library',
    sym: '🍎',
    color: 'peach',
    buttons: [
      'apple', 'banana', 'bread', 'cheese', 'chicken', 'pasta', 'pizza', 'rice', 'cereal', 'sandwich', 'chips',
      'biscuit', 'ice_cream', 'egg', 'carrot', 'grapes', 'strawberry', 'sweets',
    ],
  },
  {
    key: 'drinks',
    section: 'library',
    sym: '🧃',
    color: 'sky',
    buttons: ['water', 'milk', 'juice', 'hot_chocolate', 'tea', 'lemonade', 'ice'],
  },
  {
    key: 'people',
    section: 'library',
    sym: '👪',
    color: 'yellow',
    buttons: [
      'me', 'you', 'mum', 'dad', 'brother', 'sister', 'baby', 'grandma', 'grandad', 'friend', 'teacher', 'doctor',
      'family',
    ],
  },
  {
    key: 'places',
    section: 'library',
    sym: '🏡',
    color: 'mint',
    buttons: [
      'home', 'school', 'park', 'shop', 'playground', 'beach', 'car', 'bus', 'hospital', 'garden', 'bedroom',
      'bathroom', 'kitchen', 'inside', 'outside',
    ],
  },
  {
    key: 'play',
    section: 'library',
    sym: '🧸',
    color: 'pink',
    buttons: [
      'ball', 'blocks', 'puzzle', 'toy_car', 'doll', 'teddy', 'bubbles', 'crayons', 'painting', 'tablet', 'tv',
      'bike', 'games', 'music', 'book',
    ],
  },
  {
    key: 'describing',
    section: 'library',
    sym: '🐘',
    color: 'purple',
    buttons: [
      'big', 'little', 'hot', 'cold', 'fast', 'slow', 'loud', 'quiet', 'wet', 'dry', 'soft', 'hard', 'yummy',
      'yucky', 'good', 'same', 'different', 'more',
    ],
  },
  {
    key: 'colours',
    section: 'library',
    sym: '🎨',
    color: 'coral',
    buttons: ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'brown', 'black', 'white'],
  },
  {
    key: 'animals',
    section: 'library',
    sym: '🐶',
    color: 'yellow',
    buttons: [
      'dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'pig', 'sheep', 'duck', 'rabbit', 'lion', 'elephant', 'monkey',
      'frog', 'bear', 'dinosaur',
    ],
  },
  {
    key: 'clothes',
    section: 'library',
    sym: '👕',
    color: 'sky',
    buttons: [
      't_shirt', 'trousers', 'dress', 'shorts', 'socks', 'shoes', 'coat', 'hat', 'gloves', 'scarf', 'swimsuit',
      'glasses',
    ],
  },
  {
    key: 'questions',
    section: 'library',
    sym: '❓',
    color: 'purple',
    buttons: ['what', 'where', 'who', 'when', 'why', 'how', 'how_many', 'which_one', 'can_i'],
  },
];

// ---------------------------------------------------------------------------
// Routines & schedule templates

export const STD_ROUTINES: StdRoutineDef[] = [
  {
    key: 'today',
    sym: '🗓️',
    color: 'green',
    kind: 'schedule',
    steps: ['wake_up', 'get_dressed', 'breakfast', 'brush_teeth', 'school', 'lunch', 'play', 'dinner', 'bath', 'bedtime'],
  },
  {
    key: 'handwashing',
    sym: '🧼',
    color: 'sky',
    kind: 'routine',
    steps: ['wash_tap_on', 'wash_wet', 'wash_soap', 'wash_rub', 'wash_rinse', 'wash_tap_off', 'wash_dry'],
  },
  {
    key: 'teeth',
    sym: '🪥',
    color: 'mint',
    kind: 'routine',
    steps: ['teeth_get', 'teeth_paste', 'teeth_top', 'teeth_bottom', 'teeth_spit', 'teeth_rinse', 'teeth_done'],
  },
  {
    key: 'dressed',
    sym: '👕',
    color: 'yellow',
    kind: 'routine',
    steps: ['dress_underwear', 'dress_socks', 'dress_trousers', 'dress_top', 'dress_jumper', 'dress_shoes'],
  },
  {
    key: 'schoolbag',
    sym: '🎒',
    color: 'peach',
    kind: 'routine',
    steps: ['bag_lunch', 'bag_bottle', 'bag_books', 'bag_pencils', 'bag_homework', 'bag_close'],
  },
  {
    key: 'bed',
    sym: '🌙',
    color: 'purple',
    kind: 'routine',
    steps: ['bed_bath', 'bed_pyjamas', 'bed_teeth', 'bed_toilet', 'bed_story', 'bed_lights', 'bed_sleep'],
  },
  {
    key: 'tidy',
    sym: '🧹',
    color: 'green',
    kind: 'routine',
    steps: ['tidy_toys', 'tidy_books', 'tidy_clothes', 'tidy_bin', 'tidy_done'],
  },
  {
    key: 'leaving',
    sym: '🚪',
    color: 'coral',
    kind: 'routine',
    steps: ['leave_toilet', 'leave_shoes', 'leave_coat', 'leave_bag', 'leave_door', 'leave_car'],
  },
];

/**
 * Bump when standard boards, buttons or routines are added in an app update.
 * Existing installs then receive the new items without touching anything the
 * user already has (see seedStandardContent 'upgrade').
 */
export const STD_CONTENT_VERSION = 3;

/** Words shown on every communication board by default (rights-based "always there" words). */
export const DEFAULT_QUICK_WORDS = ['yes', 'no', 'stop', 'help', 'more', 'finished'];

// ---------------------------------------------------------------------------
// Stable ID helpers

export const stdButtonId = (key: string) => `std:button:${key}`;
export const stdBoardId = (key: string) => `std:board:${key}`;
export const stdItemId = (board: string, key: string) => `std:item:${board}:${key}`;
export const stdRoutineId = (key: string) => `std:routine:${key}`;
export const stdStepId = (routine: string, index: number) => `std:step:${routine}:${index}`;

export const FAVOURITES_BOARD_ID = stdBoardId('favourites');
export const SAFETY_BOARD_ID = stdBoardId('safety');
export const PHRASES_BOARD_ID = stdBoardId('phrases');
export const TODAY_ROUTINE_ID = stdRoutineId('today');

export function stdBoardByKey(key: string) {
  return STD_BOARDS.find((b) => b.key === key);
}

/** Every emoji referenced by standard content (used by the asset build script). */
export function allStandardSymbols(): string[] {
  const set = new Set<string>();
  Object.values(STD_BUTTONS).forEach((b) => set.add(b.sym));
  Object.values(STD_STEPS).forEach((s) => set.add(s));
  STD_BOARDS.forEach((b) => set.add(b.sym));
  STD_ROUTINES.forEach((r) => set.add(r.sym));
  return [...set];
}
