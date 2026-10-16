import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition, ZoomIn } from 'react-native-reanimated';

import { AppText } from './app-text';
import { confirm } from './dialog';
import { IconButton } from './icon-button';
import { Mascot } from './mascot';
import { ShareSheet } from './share-sheet';
import { SymbolImage } from './symbol-image';
import { speakItems, speakSentence, stopSpeaking, useSpeechState } from '@/hooks/use-speech';
import { learnFromText } from '@/services/predict';
import { useApp } from '@/store/app-store';
import { guarded } from '@/store/lock-store';
import { sentenceText, useSentence } from '@/store/sentence-store';
import { RADIUS, softShadow, useTheme } from '@/theme';

export function SentenceStrip({ compact }: { compact?: boolean }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const items = useSentence((s) => s.items);
  const selected = useSentence((s) => s.selected);
  const question = useSentence((s) => s.question);
  const { select, remove, move, removeLast, clear, toggleQuestion } = useSentence.getState();
  const clearAt = useApp((s) => s.settings.clearConfirmAt);
  const { speaking, activeIds } = useSpeechState();
  const sel = items.find((i) => i.key === selected);
  const text = sentenceText(items, question);
  const c = theme.colors;
  const chipSym = compact ? 22 : 28;
  const [sharing, setSharing] = useState(false);

  const speakAll = () => {
    speakSentence();
    learnFromText(text, useApp.getState().settings);
  };

  const onClear = async () => {
    if (!items.length) return;
    if (clearAt > 0 && items.length >= clearAt) {
      const ok = await confirm({
        title: t('sentence.clearConfirmTitle'),
        body: t('sentence.clearConfirmBody', { count: items.length }),
        confirmLabel: t('common.clear'),
        destructive: true,
      });
      if (!ok) return;
    }
    stopSpeaking();
    clear();
  };

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: c.surface, borderColor: theme.highContrast ? c.text : 'transparent' },
        softShadow(theme, 2),
      ]}
    >
      <View style={styles.top}>
        {theme.isTablet ? (
          <View style={{ marginRight: 4, marginTop: -6 }}>
            <Mascot size={58} talking={speaking} sparkle={false} float={false} />
          </View>
        ) : null}
        <ScrollView
          style={{ flex: 1, maxHeight: compact ? 96 : 132 }}
          contentContainerStyle={styles.chips}
          accessible
          accessibilityLabel={items.length ? t('sentence.stripA11y', { text }) : t('sentence.placeholder')}
        >
          {items.length === 0 ? (
            <AppText variant="body" muted style={{ paddingVertical: 10, paddingHorizontal: 4 }}>
              {t('sentence.placeholder')}
            </AppText>
          ) : (
            items.map((it, i) => {
              const active = activeIds.includes(it.key);
              const isSel = it.key === selected;
              return (
                <Animated.View
                  key={it.key}
                  entering={theme.reducedMotion ? FadeIn.duration(100) : ZoomIn.duration(140).withInitialValues({ transform: [{ scale: 0.9 }] })}
                  layout={theme.reducedMotion ? undefined : LinearTransition.duration(150)}
                >
                  <Pressable
                    onPress={() => select(it.key)}
                    accessibilityRole="button"
                    accessibilityLabel={t('sentence.itemA11y', { index: i + 1, total: items.length, label: it.label })}
                    accessibilityState={{ selected: isSel }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? c.highlight : isSel ? c.primarySoft : c.surfaceAlt,
                        borderColor: isSel ? c.primary : theme.highContrast ? c.text : c.border,
                      },
                    ]}
                  >
                    {it.symbol || it.photo ? <SymbolImage symbol={it.symbol} photo={it.photo} size={chipSym} rounded={6} /> : null}
                    <AppText size={compact ? 16 : 18} weight="heavy" maxFontSizeMultiplier={1.6}>
                      {it.label}
                    </AppText>
                    {it.audio ? <Ionicons name="mic" size={12} color={c.primary} /> : null}
                  </Pressable>
                </Animated.View>
              );
            })
          )}
          {question && items.length ? (
            <AppText size={22} weight="black" color={c.primary} style={{ alignSelf: 'center' }}>
              ?
            </AppText>
          ) : null}
        </ScrollView>
        <IconButton
          icon={speaking ? 'stop' : 'volume-high'}
          label={speaking ? t('sentence.stop') : t('sentence.speak')}
          variant={speaking ? 'danger' : 'primary'}
          size={compact ? 52 : 60}
          onPress={() => (speaking ? stopSpeaking() : speakAll())}
          disabled={!items.length && !speaking}
        />
      </View>

      <View style={[styles.actions, { borderTopColor: c.border }]}>
        {sel ? (
          <>
            <IconButton icon="chevron-back" label={t('common.moveLeft')} size={40} variant="soft" onPress={() => move(sel.key, -1)} />
            <IconButton icon="chevron-forward" label={t('common.moveRight')} size={40} variant="soft" onPress={() => move(sel.key, 1)} />
            <IconButton
              icon="volume-medium"
              label={t('sentence.speakWord')}
              size={40}
              variant="soft"
              onPress={() => speakItems([{ id: sel.key, text: sel.spoken, lang: sel.lang, audio: sel.audio }])}
            />
            <View style={{ flex: 1 }} />
            <IconButton icon="trash-outline" label={t('sentence.removeWord')} size={40} variant="soft" onPress={() => remove(sel.key)} />
            <IconButton icon="close" label={t('common.done')} size={40} onPress={() => select(null)} />
          </>
        ) : (
          <>
            <IconButton icon="help" label={t('sentence.question')} size={40} variant="soft" selected={question} onPress={toggleQuestion} />
            <IconButton
              icon="expand"
              label={t('sentence.show')}
              size={40}
              variant="soft"
              disabled={!items.length}
              onPress={() => router.push({ pathname: '/show', params: { text } })}
            />
            <IconButton icon="paper-plane-outline" label={t('share.button')} size={40} variant="soft" disabled={!items.length} onPress={() => setSharing(true)} />
            <IconButton
              icon="bookmark-outline"
              label={t('phrases.fromSentence')}
              size={40}
              variant="soft"
              disabled={!items.length}
              onPress={() => guarded(() => router.push({ pathname: '/phrase-builder', params: { fromSentence: '1' } }))}
            />
            <View style={{ flex: 1 }} />
            <IconButton icon="backspace-outline" label={t('sentence.deleteLast')} size={40} variant="soft" disabled={!items.length} onPress={removeLast} />
            <IconButton icon="trash-outline" label={t('sentence.clear')} size={40} variant="soft" disabled={!items.length} onPress={onClear} />
          </>
        )}
      </View>
      <ShareSheet text={text} visible={sharing} onClose={() => setSharing(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: RADIUS.xl, padding: 12, borderWidth: 2 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center', paddingVertical: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 2,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1 },
});
