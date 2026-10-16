import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Card, Screen, SectionHeader } from '@/components/layout';
import { TextField } from '@/components/form';
import { IconButton } from '@/components/icon-button';
import { PushButton } from '@/components/push-button';
import { SentenceStrip } from '@/components/sentence-strip';
import { ShareSheet } from '@/components/share-sheet';
import { PHRASES_BOARD_ID } from '@/data/standard-content';
import * as repo from '@/db/repo';
import { speakText, stopSpeaking, useSpeechState } from '@/hooks/use-speech';
import { useLabels } from '@/i18n/labels';
import { applyWord, getModel, learnFromText, loadModel, suggestPhrases, suggestWords, vocabularyLexicon } from '@/services/predict';
import { readClipboard } from '@/services/share';
import { useApp } from '@/store/app-store';
import { guarded } from '@/store/lock-store';
import { useSentence } from '@/store/sentence-store';
import { toast } from '@/store/ui-store';
import { RADIUS, useTheme } from '@/theme';

const RECENT_KEY = 'recentTyped';

export function KeyboardScreen() {
  const theme = useTheme();
  const L = useLabels();
  const { t } = L;
  const [text, setText] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [modelReady, setModelReady] = useState(0);
  const { speaking } = useSpeechState();
  const language = useApp((s) => s.settings.language);
  const showSuggestions = useApp((s) => s.settings.wordSuggestions);
  const buttons = useApp((s) => s.buttons);
  const phraseItems = useApp((s) => s.items[PHRASES_BOARD_ID]);

  useEffect(() => {
    repo.getKV<string[]>(RECENT_KEY).then((r) => Array.isArray(r) && setRecent(r));
  }, []);

  useEffect(() => {
    loadModel(language).then(() => setModelReady((n) => n + 1));
  }, [language]);

  const savedPhrases = useMemo(
    () => [...(phraseItems ?? []).map((i) => L.buttonLabel(buttons[i.buttonId])).filter(Boolean), ...recent],
    [phraseItems, buttons, recent, L],
  );
  const lexicon = useMemo(() => vocabularyLexicon(language), [language]);
  const words = useMemo(
    () => (showSuggestions ? suggestWords(text, getModel(language), lexicon) : []),
    // modelReady: recompute once learned words have loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showSuggestions, text, language, lexicon, modelReady],
  );
  const phrases = useMemo(() => (showSuggestions ? suggestPhrases(text, savedPhrases) : []), [showSuggestions, text, savedPhrases]);

  const remember = (phrase: string) => {
    const next = [phrase, ...recent.filter((r) => r !== phrase)].slice(0, 12);
    setRecent(next);
    repo.setKV(RECENT_KEY, next).catch(() => {});
    learnFromText(phrase, useApp.getState().settings);
  };

  const speak = (phrase = text) => {
    const p = phrase.trim();
    if (!p) return;
    if (speaking) stopSpeaking();
    speakText(p);
    remember(p);
  };

  const addToSentence = () => {
    const p = text.trim();
    if (!p) return;
    useSentence.getState().add({ buttonId: null, label: p, spoken: p, lang: null, symbol: null, photo: null, audio: null });
    remember(p);
    setText('');
  };

  const pasteAndRead = async () => {
    const copied = await readClipboard();
    if (!copied) {
      toast(t('messages.empty'), { tone: 'info' });
      return;
    }
    setMessage(copied);
    speakText(copied);
  };

  return (
    <Screen>
      <View style={{ marginBottom: 14 }}>
        <SentenceStrip compact />
      </View>

      <TextField
        value={text}
        onChangeText={setText}
        placeholder={t('keyboard.placeholder')}
        accessibilityLabel={t('keyboard.placeholder')}
        multiline
        large
        // Keep the device keyboard's own word prediction and spelling help.
        autoCorrect
        spellCheck
        autoCapitalize="sentences"
        style={{ minHeight: 120, textAlignVertical: 'top', fontSize: 24 * theme.textScale }}
        onSubmitEditing={() => speak()}
      />

      {words.length || phrases.length ? (
        <View style={styles.suggestions} accessibilityRole="toolbar" accessibilityLabel={t('suggest.title')}>
          {phrases.map((p) => (
            <Suggestion key={`p:${p}`} text={p} phrase onPress={() => setText(p)} />
          ))}
          {words.map((w) => (
            <Suggestion key={`w:${w}`} text={w} onPress={() => setText((cur) => applyWord(cur, w))} />
          ))}
        </View>
      ) : null}

      <View style={styles.actions}>
        <PushButton title={speaking ? t('common.stop') : t('keyboard.speak')} icon={speaking ? 'stop' : 'volume-high'} onPress={() => (speaking ? stopSpeaking() : speak())} disabled={!text.trim() && !speaking} />
        <PushButton title={t('keyboard.addToSentence')} icon="add" variant="soft" onPress={addToSentence} disabled={!text.trim()} />
        <PushButton title={t('share.button')} icon="paper-plane-outline" variant="soft" onPress={() => setSharing(true)} disabled={!text.trim()} />
        <PushButton title={t('keyboard.show')} icon="expand" variant="surface" disabled={!text.trim()} onPress={() => router.push({ pathname: '/show', params: { text: text.trim() } })} />
        <PushButton
          title={t('phrases.fromSentence')}
          icon="bookmark-outline"
          variant="surface"
          disabled={!text.trim()}
          onPress={() => guarded(() => router.push({ pathname: '/phrase-builder', params: { text: text.trim() } }))}
        />
        <PushButton title={t('keyboard.clear')} icon="close" variant="surface" disabled={!text} onPress={() => setText('')} />
      </View>

      <SectionHeader title={t('messages.title')} />
      <Card>
        <AppText variant="body" muted>
          {t('messages.body')}
        </AppText>
        {message ? (
          <View style={[styles.message, { backgroundColor: theme.colors.primarySoft }]}>
            <AppText variant="subheading" selectable accessibilityLiveRegion="polite">
              {message}
            </AppText>
          </View>
        ) : null}
        <View style={[styles.actions, { marginTop: 12 }]}>
          <PushButton title={t('messages.paste')} icon="clipboard-outline" onPress={pasteAndRead} />
          {message ? (
            <>
              <IconButton icon="volume-high" label={t('messages.again')} variant="soft" onPress={() => speakText(message)} />
              <IconButton icon="expand" label={t('keyboard.show')} variant="soft" onPress={() => router.push({ pathname: '/show', params: { text: message } })} />
              <IconButton icon="close" label={t('messages.clear')} variant="soft" onPress={() => setMessage(null)} />
            </>
          ) : null}
        </View>
        {message ? (
          <AppText variant="caption" muted style={{ marginTop: 10 }}>
            {t('messages.replyHint')}
          </AppText>
        ) : null}
      </Card>

      <SectionHeader title={t('keyboard.recent')} />
      {recent.length === 0 ? (
        <AppText muted>{t('keyboard.recentEmpty')}</AppText>
      ) : (
        <View style={{ gap: 10 }}>
          {recent.map((r) => (
            <Pressable
              key={r}
              onPress={() => speak(r)}
              onLongPress={() => setText(r)}
              accessibilityRole="button"
              accessibilityLabel={r}
              accessibilityHint={t('keyboard.speak')}
              style={({ pressed }) => [styles.recent, { backgroundColor: pressed ? theme.colors.primarySoft : theme.colors.surface, borderColor: theme.highContrast ? theme.colors.text : theme.colors.border }]}
            >
              <AppText variant="bodyStrong" style={{ flex: 1 }}>
                {r}
              </AppText>
            </Pressable>
          ))}
        </View>
      )}
      <ShareSheet text={text.trim()} visible={sharing} onClose={() => setSharing(false)} />
    </Screen>
  );
}

function Suggestion({ text, phrase, onPress }: { text: string; phrase?: boolean; onPress: () => void }) {
  const theme = useTheme();
  const { t } = useLabels();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('suggest.a11y', { text })}
      style={({ pressed }) => [
        styles.suggestion,
        {
          backgroundColor: pressed ? theme.colors.primary : phrase ? theme.colors.primarySoft : theme.colors.surface,
          borderColor: theme.highContrast ? theme.colors.text : phrase ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      {({ pressed }) => (
        <AppText variant="bodyStrong" color={pressed ? theme.colors.onPrimary : theme.colors.text} numberOfLines={1}>
          {text}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  suggestion: { minHeight: 48, paddingHorizontal: 16, borderRadius: RADIUS.pill, borderWidth: 2, justifyContent: 'center', maxWidth: '100%' },
  message: { marginTop: 12, padding: 14, borderRadius: RADIUS.lg },
  recent: { padding: 16, borderRadius: RADIUS.lg, borderWidth: 2 },
});
