/**
 * Speech engine wrapping native TTS (expo-speech) and recorded clips (expo-audio).
 *
 * Guarantees:
 *  - Only one utterance at a time: every new request stops the previous one.
 *  - Stop is immediate and cancels the rest of a queued sentence.
 *  - Failures are reported (never silent) so the UI can show the text instead.
 */
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

import { asQuestion, separatorBetween } from '@/i18n/join';
import { baseLanguage, speechTagFor } from '@/i18n/languages';
import { mediaUri } from './media';

export interface SpeakItem {
  id: string;
  text: string;
  lang?: string | null;
  audio?: string | null;
}

export interface VoiceConfig {
  enabled: boolean;
  voiceId: string | null;
  voiceLang: string | null;
  defaultLang: string;
  rate: number;
  pitch: number;
}

export type SpeechResult = 'done' | 'stopped' | 'error' | 'disabled' | 'empty';

export interface SpeechState {
  speaking: boolean;
  activeIds: string[];
}

type Segment =
  | { kind: 'tts'; text: string; lang: string; ids: string[]; offsets: number[] }
  | { kind: 'audio'; uri: string; ids: string[] };

type Listener = (s: SpeechState) => void;
type ErrorListener = (message: string, items: SpeakItem[]) => void;

class SpeechEngine {
  private generation = 0;
  private player: AudioPlayer | null = null;
  private state: SpeechState = { speaking: false, activeIds: [] };
  private listeners = new Set<Listener>();
  private errorListeners = new Set<ErrorListener>();

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  onError(fn: ErrorListener) {
    this.errorListeners.add(fn);
    return () => {
      this.errorListeners.delete(fn);
    };
  }

  getState() {
    return this.state;
  }

  private set(next: Partial<SpeechState>) {
    this.state = { ...this.state, ...next };
    this.listeners.forEach((l) => l(this.state));
  }

  /** Speaks a list of items as one utterance (grouped by language), highlighting as it goes. */
  async speak(items: SpeakItem[], cfg: VoiceConfig, opts: { question?: boolean } = {}): Promise<SpeechResult> {
    const clean = items.filter((i) => i.text.trim() || i.audio);
    await this.stop();
    if (!clean.length) return 'empty';
    if (!cfg.enabled) return 'disabled';

    const gen = ++this.generation;
    const segments = buildSegments(clean, cfg.defaultLang, opts.question ?? false);
    this.set({ speaking: true, activeIds: segments[0]?.ids ?? [] });

    let result: SpeechResult = 'done';
    for (const seg of segments) {
      if (gen !== this.generation) return 'stopped';
      this.set({ activeIds: seg.kind === 'tts' && seg.ids.length > 1 && supportsBoundary() ? [seg.ids[0]] : seg.ids });
      const r = seg.kind === 'audio' ? await this.playClip(seg.uri, gen) : await this.say(seg, cfg, gen);
      if (r === 'error') {
        result = 'error';
        this.errorListeners.forEach((l) => l('speech-failed', clean));
        break;
      }
      if (r === 'stopped') {
        result = 'stopped';
        break;
      }
    }
    if (gen === this.generation) this.set({ speaking: false, activeIds: [] });
    return result;
  }

  async stop() {
    this.generation++;
    try {
      await Speech.stop();
    } catch {
      // nothing to stop
    }
    this.releasePlayer();
    if (this.state.speaking) this.set({ speaking: false, activeIds: [] });
  }

  private say(seg: Extract<Segment, { kind: 'tts' }>, cfg: VoiceConfig, gen: number): Promise<SpeechResult> {
    return new Promise((resolve) => {
      let settled = false;
      const finish = (r: SpeechResult) => {
        if (settled) return;
        settled = true;
        resolve(r);
      };
      // Only force the chosen voice when it matches this segment's language.
      const useVoice = cfg.voiceId && baseLanguage(cfg.voiceLang) === baseLanguage(seg.lang) ? cfg.voiceId : undefined;
      try {
        Speech.speak(seg.text, {
          language: seg.lang,
          voice: useVoice,
          rate: cfg.rate,
          pitch: cfg.pitch,
          onDone: () => finish('done'),
          onStopped: () => finish('stopped'),
          onError: () => finish('error'),
          onBoundary: (ev: any) => {
            if (gen !== this.generation || seg.ids.length < 2) return;
            const idx = typeof ev?.charIndex === 'number' ? ev.charIndex : -1;
            if (idx < 0) return;
            let at = 0;
            for (let i = 0; i < seg.offsets.length; i++) if (seg.offsets[i] <= idx) at = i;
            this.set({ activeIds: [seg.ids[at]] });
          },
        });
      } catch {
        finish('error');
      }
      // Safety net: some engines never fire onDone if the voice is missing.
      const words = seg.text.split(/\s+/).length;
      setTimeout(() => finish(gen === this.generation ? 'done' : 'stopped'), 4000 + words * 1200);
    });
  }

  private playClip(name: string, gen: number): Promise<SpeechResult> {
    return new Promise((resolve) => {
      const uri = mediaUri(name);
      if (!uri) return resolve('error');
      let settled = false;
      const finish = (r: SpeechResult) => {
        if (settled) return;
        settled = true;
        sub?.remove();
        resolve(r);
      };
      let sub: { remove: () => void } | null = null;
      try {
        this.releasePlayer();
        const player = createAudioPlayer({ uri });
        this.player = player;
        sub = player.addListener('playbackStatusUpdate', (status) => {
          if (gen !== this.generation) finish('stopped');
          else if (status.didJustFinish) finish('done');
        });
        player.play();
        setTimeout(() => finish(gen === this.generation ? 'done' : 'stopped'), 60_000);
      } catch {
        finish('error');
      }
    });
  }

  private releasePlayer() {
    if (!this.player) return;
    try {
      this.player.pause();
      this.player.remove();
    } catch {
      // already released
    }
    this.player = null;
  }
}

function supportsBoundary() {
  return Platform.OS === 'ios' || Platform.OS === 'web';
}

/** Groups consecutive TTS items that share a language into one natural-sounding utterance. */
export function buildSegments(items: SpeakItem[], defaultLang: string, question: boolean): Segment[] {
  const out: Segment[] = [];
  for (const it of items) {
    if (it.audio) {
      out.push({ kind: 'audio', uri: it.audio, ids: [it.id] });
      continue;
    }
    // Same language as the default keeps the user's regional voice; others get a full tag.
    const lang = !it.lang || baseLanguage(it.lang) === baseLanguage(defaultLang) ? defaultLang : it.lang.includes('-') ? it.lang : speechTagFor(it.lang);
    const last = out[out.length - 1];
    const text = it.text.trim();
    if (last && last.kind === 'tts' && last.lang === lang) {
      const sep = separatorBetween(last.text, text);
      last.offsets.push(last.text.length + sep.length);
      last.text = `${last.text}${sep}${text}`;
      last.ids.push(it.id);
    } else {
      out.push({ kind: 'tts', text, lang, ids: [it.id], offsets: [0] });
    }
  }
  if (question) {
    const lastTts = [...out].reverse().find((s) => s.kind === 'tts') as Extract<Segment, { kind: 'tts' }> | undefined;
    if (lastTts) lastTts.text = asQuestion(lastTts.text);
  }
  return out;
}

export const speech = new SpeechEngine();

/**
 * iOS: let speech play even when the ring/silent switch is on silent. AAC must
 * not appear to speak while producing no sound (brief §11).
 */
export async function configureAudioSession() {
  try {
    await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers', allowsRecording: false });
  } catch {
    // web / unsupported
  }
}

export interface DeviceVoice {
  identifier: string;
  name: string;
  language: string;
  quality: string;
}

export async function listVoices(): Promise<DeviceVoice[]> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices
      .filter((v) => v.identifier && v.language)
      .map((v) => ({ identifier: v.identifier, name: v.name || v.identifier, language: v.language, quality: String(v.quality) }));
  } catch {
    return [];
  }
}

const normTag = (t: string) => t.replace('_', '-').toLowerCase();

/** Android network voices need the internet, which an offline AAC app must not depend on. */
export function isOfflineVoice(v: DeviceVoice) {
  return !/-network$/i.test(v.identifier) && !/-network$/i.test(v.name);
}

/**
 * Voices for a language, best first: the device's own region (most likely
 * installed), then enhanced quality, then by name. Network-only voices are hidden.
 */
export function voicesFor(voices: DeviceVoice[], code: string) {
  const base = baseLanguage(code);
  const preferred = normTag(speechTagFor(code));
  const rank = (v: DeviceVoice) => (normTag(v.language) === preferred ? 0 : 1);
  return voices
    .filter((v) => baseLanguage(v.language) === base && isOfflineVoice(v))
    .sort((a, b) => {
      const qa = a.quality === 'Enhanced' ? 0 : 1;
      const qb = b.quality === 'Enhanced' ? 0 : 1;
      return rank(a) - rank(b) || normTag(a.language).localeCompare(normTag(b.language)) || qa - qb || a.name.localeCompare(b.name);
    });
}
