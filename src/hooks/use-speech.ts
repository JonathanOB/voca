import { router } from 'expo-router';
import { useCallback, useSyncExternalStore } from 'react';

import type { Board, Button } from '@/db/types';
import { joinWords } from '@/i18n/join';
import { buttonLabel, buttonSpoken } from '@/i18n/labels';
import { baseLanguage, speechTagFor } from '@/i18n/languages';
import { i18n } from '@/i18n';
import { useApp } from '@/store/app-store';
import { useSentence, type SentenceItem } from '@/store/sentence-store';
import type { Settings, TapAction } from '@/store/settings';
import { toast } from '@/store/ui-store';
import { tapHaptic } from '@/services/haptics';
import { speech, type DeviceVoice, type SpeakItem, type SpeechResult, type VoiceConfig } from '@/services/speech';

export function voiceConfig(settings: Settings, voices: DeviceVoice[]): VoiceConfig {
  const chosen = settings.voiceId ? voices.find((v) => v.identifier === settings.voiceId) : undefined;
  const defaultLang =
    chosen && baseLanguage(chosen.language) === settings.language
      ? chosen.language.replace('_', '-')
      : speechTagFor(settings.language);
  return {
    enabled: settings.speechEnabled,
    voiceId: chosen?.identifier ?? null,
    voiceLang: chosen?.language ?? null,
    defaultLang,
    rate: settings.rate,
    pitch: settings.pitch,
  };
}

export function useSpeechState() {
  return useSyncExternalStore(
    (cb) => speech.subscribe(cb),
    () => speech.getState(),
    () => speech.getState(),
  );
}

export function toSentenceItem(btn: Button): Omit<SentenceItem, 'key'> {
  return {
    buttonId: btn.id,
    label: buttonLabel(btn),
    spoken: buttonSpoken(btn),
    lang: btn.lang,
    symbol: btn.symbol,
    photo: btn.photo,
    audio: btn.audio,
  };
}

function handleResult(result: SpeechResult, text: string) {
  if (result === 'error' || result === 'disabled') {
    toast(i18n.t(result === 'error' ? 'sentence.speechFailed' : 'sentence.speechOff'), {
      tone: 'warning',
      action: { label: i18n.t('common.show'), onPress: () => router.push({ pathname: '/show', params: { text } }) },
    });
  }
}

/** Speak arbitrary items (a word, a step, a typed phrase). */
export async function speakItems(items: SpeakItem[], opts: { question?: boolean } = {}) {
  const { settings, voices } = useApp.getState();
  const result = await speech.speak(items, voiceConfig(settings, voices), opts);
  handleResult(result, joinWords(items.map((i) => i.text)));
  return result;
}

/** Plays a sample with a specific device voice (without changing the user's choice). */
export async function previewVoice(voice: DeviceVoice, text: string) {
  const { settings, voices } = useApp.getState();
  const cfg = { ...voiceConfig(settings, voices), enabled: true, voiceId: voice.identifier, voiceLang: voice.language };
  return speech.speak([{ id: 'voice-preview', text, lang: voice.language.replace('_', '-') }], cfg);
}

export function speakText(text: string, lang?: string | null) {
  return speakItems([{ id: 'text', text, lang: lang ?? null }]);
}

export function speakButton(btn: Button) {
  return speakItems([{ id: btn.id, text: buttonSpoken(btn), lang: btn.lang, audio: btn.audio }]);
}

export function speakSentence() {
  const { items, question } = useSentence.getState();
  return speakItems(
    items.map((i) => ({ id: i.key, text: i.spoken, lang: i.lang, audio: i.audio })),
    { question },
  );
}

export function stopSpeaking() {
  return speech.stop();
}

/** Activates a communication button according to board and user settings. */
export function useActivateButton(board?: Pick<Board, 'tapAction'> | null) {
  const settingAction = useApp((s) => s.settings.tapAction);
  return useCallback(
    /** `form` replaces the wording, e.g. "wanted" chosen from the word-forms bubble. */
    (btn: Button, override?: TapAction, form?: string) => {
      tapHaptic();
      const action = override ?? board?.tapAction ?? settingAction;
      const say = () => (form ? speakItems([{ id: btn.id, text: form, lang: btn.lang }]) : speakButton(btn));
      if (action === 'speak') {
        say();
        return;
      }
      // A recorded clip says the base word, so it is not used for another form.
      useSentence.getState().add(form ? { ...toSentenceItem(btn), label: form, spoken: form, audio: null } : toSentenceItem(btn));
      if (action === 'speakAndAdd') say();
    },
    [board?.tapAction, settingAction],
  );
}
