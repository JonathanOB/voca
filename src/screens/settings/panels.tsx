/**
 * Settings panels shared by onboarding and the Settings section, so every
 * choice made during setup can be changed later in exactly the same way.
 */
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as IntentLauncher from 'expo-intent-launcher';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, Linking, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { AppText } from '@/components/app-text';
import { ColorKey } from '@/components/color-key';
import { Chip, ColorDot, FieldLabel, NavRow, OptionCard, Segmented, Stepper, ToggleRow } from '@/components/form';
import { IconButton } from '@/components/icon-button';
import { InfoBanner } from '@/components/layout';
import { PushButton } from '@/components/push-button';
import { Sheet } from '@/components/sheet';
import { SymbolImage } from '@/components/symbol-image';
import { Tile } from '@/components/tile';
import { MAX_QUICK_ACTIONS, QUICK_ACTIONS } from '@/data/quick-actions';
import { SKIN_TONES, symbolSource } from '@/data/symbols';
import { previewVoice, speakText, stopSpeaking, useSpeechState } from '@/hooks/use-speech';
import { setLanguage } from '@/i18n';
import { accentKey, accentName } from '@/i18n/accents';
import { LANGUAGES, speechTagFor } from '@/i18n/languages';
import { vocabLabel } from '@/i18n/labels';
import { useApp } from '@/store/app-store';
import { ALL_QUICK_ACTIONS, VOICE_STYLES, type QuickActionId, type Settings, type TapAction, type VoiceStyle } from '@/store/settings';
import { toast } from '@/store/ui-store';
import { voicesFor, type DeviceVoice } from '@/services/speech';
import { PALETTES, PALETTE_ORDER, RADIUS, cardSwatch, softShadow, useTheme } from '@/theme';

const update = (patch: Partial<Settings>) => useApp.getState().updateSettings(patch);

// ---------------------------------------------------------------------------

export function LanguagePanel() {
  const theme = useTheme();
  const language = useApp((s) => s.settings.language);
  const cols = theme.width > 700 ? 3 : 2;
  return (
    <View style={styles.wrapGrid} accessibilityRole="radiogroup">
      {LANGUAGES.map((l) => {
        const selected = l.code === language;
        return (
          <Pressable
            key={l.code}
            onPress={() => {
              update({ language: l.code, voiceId: null });
              setLanguage(l.code);
            }}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={`${l.native} (${l.english})`}
            style={({ pressed }) => [
              styles.langCard,
              {
                width: `${100 / cols - 2.5}%`,
                backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
                borderColor: selected ? theme.colors.primary : theme.highContrast ? theme.colors.text : theme.colors.border,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
              softShadow(theme, 1),
            ]}
          >
            <SymbolImage emoji={l.sym} size={40} />
            <View style={{ flex: 1 }}>
              <AppText variant="subheading" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                {l.native}
              </AppText>
              <AppText variant="caption" muted numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                {l.hello}
              </AppText>
            </View>
            {selected ? <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------

export function ThemePanel({ showPreview = true }: { showPreview?: boolean }) {
  const { t } = useTranslation();
  const s = useApp(useShallow((st) => ({ themeMode: st.settings.themeMode, palette: st.settings.palette, highContrast: st.settings.highContrast, motion: st.settings.motion })));
  return (
    <View>
      {showPreview ? <ThemePreview /> : null}
      <FieldLabel>{t('settings.theme')}</FieldLabel>
      <Segmented
        value={s.themeMode}
        onChange={(v) => update({ themeMode: v })}
        options={[
          { value: 'system', label: t('settings.themeSystem'), icon: 'phone-portrait-outline' },
          { value: 'light', label: t('settings.themeLight'), icon: 'sunny-outline' },
          { value: 'dark', label: t('settings.themeDark'), icon: 'moon-outline' },
        ]}
      />
      <FieldLabel>{t('settings.palette')}</FieldLabel>
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }} accessibilityRole="radiogroup">
        {PALETTE_ORDER.map((p) => (
          <View key={p} style={{ alignItems: 'center', width: 76 }}>
            <ColorDot color={PALETTES[p].primary} selected={s.palette === p} onPress={() => update({ palette: p })} label={t(`settings.palettes.${p}`)} />
            <AppText variant="tiny" muted>
              {t(`settings.palettes.${p}`)}
            </AppText>
          </View>
        ))}
      </View>
      <View style={{ gap: 10, marginTop: 18 }}>
        <ToggleRow icon="contrast-outline" label={t('settings.highContrast')} sub={t('settings.highContrastSub')} value={s.highContrast} onChange={(v) => update({ highContrast: v })} />
      </View>
      <FieldLabel>{t('settings.motion')}</FieldLabel>
      <Segmented
        value={s.motion}
        onChange={(v) => update({ motion: v })}
        options={[
          { value: 'system', label: t('settings.motionSystem') },
          { value: 'reduced', label: t('settings.motionReduced') },
          { value: 'full', label: t('settings.motionFull') },
        ]}
      />
    </View>
  );
}

function ThemePreview() {
  const theme = useTheme();
  const { t } = useTranslation();
  const cards: ('purple' | 'green' | 'coral' | 'yellow')[] = ['purple', 'green', 'coral', 'yellow'];
  const emojis = ['💬', '🗓️', '😊', '👆'];
  const keys = ['talk', 'myday', 'feelings', 'choices'] as const;
  return (
    <View style={[styles.preview, { backgroundColor: theme.colors.bg, borderColor: theme.colors.border }]} accessible accessibilityLabel={t('onboarding.theme.preview')}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {cards.map((c, i) => {
          const sw = cardSwatch(c, theme.mode);
          return (
            <View key={c} style={{ width: '48%', backgroundColor: sw.edge, borderRadius: 16, paddingBottom: 3 }}>
              <View style={{ backgroundColor: theme.highContrast ? theme.colors.surface : sw.bg, borderRadius: 16, padding: 10, gap: 4, borderWidth: theme.highContrast ? 2 : 0, borderColor: theme.colors.text }}>
                <SymbolImage emoji={emojis[i]} size={26} />
                <AppText variant="label" color={theme.highContrast ? theme.colors.text : sw.text}>
                  {t(`quick.${keys[i]}.title`)}
                </AppText>
              </View>
            </View>
          );
        })}
      </View>
      <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'center' }}>
        <View style={{ backgroundColor: theme.colors.primaryEdge, borderRadius: 999, paddingBottom: 3 }}>
          <View style={{ backgroundColor: theme.colors.primary, borderRadius: 999, paddingHorizontal: 22, paddingVertical: 8 }}>
            <AppText variant="label" color={theme.colors.onPrimary}>
              {t('common.speak')}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------

export function DisplayPanel({ compact }: { compact?: boolean }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const s = useApp(
    useShallow((st) => ({
      buttonDisplay: st.settings.buttonDisplay,
      gridSize: st.settings.gridSize,
      textScale: st.settings.textScale,
      font: st.settings.font,
      colorCoded: st.settings.colorCoded,
      stableLayout: st.settings.stableLayout,
      fixedGrid: st.settings.fixedGrid,
      skinTone: st.settings.skinTone,
    })),
  );
  const [keyOpen, setKeyOpen] = useState(false);
  const sampleW = Math.min(110, (theme.width - 80) / 3);
  return (
    <View>
      <FieldLabel>{t('settings.buttonStyle')}</FieldLabel>
      <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'space-between' }} accessibilityRole="radiogroup">
        {(['imageText', 'text', 'image'] as const).map((d) => {
          const selected = s.buttonDisplay === d;
          const label = d === 'imageText' ? t('settings.imageText') : d === 'text' ? t('settings.textOnly') : t('settings.imageOnly');
          return (
            <Pressable
              key={d}
              onPress={() => update({ buttonDisplay: d })}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={label}
              style={[styles.displayOpt, { borderColor: selected ? theme.colors.primary : 'transparent', backgroundColor: selected ? theme.colors.primarySoft : 'transparent' }]}
            >
              <View pointerEvents="none" importantForAccessibility="no-hide-descendants">
                <Tile label={vocabLabel('happy')} symbol="1f60a" type="feeling" width={sampleW} display={d} />
              </View>
              <AppText variant="caption" center style={{ marginTop: 6 }} color={selected ? theme.colors.primary : theme.colors.text}>
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <FieldLabel>{t('settings.gridSize')}</FieldLabel>
      <Segmented
        value={s.gridSize}
        onChange={(v) => update({ gridSize: v })}
        options={[
          { value: 'large', label: t('settings.large') },
          { value: 'medium', label: t('settings.medium') },
          { value: 'small', label: t('settings.small') },
        ]}
      />

      <FieldLabel>{t('settings.textSize')}</FieldLabel>
      <Stepper
        label={t('settings.textSize')}
        value={s.textScale}
        display={`${Math.round(s.textScale * 100)}%`}
        step={0.1}
        min={0.9}
        max={1.6}
        lessLabel="A−"
        moreLabel="A+"
        onChange={(v) => update({ textScale: v })}
      />

      {!compact ? (
        <>
          <FieldLabel>{t('settings.font')}</FieldLabel>
          <Segmented
            value={s.font}
            onChange={(v) => update({ font: v })}
            options={[
              { value: 'rounded', label: t('settings.fontRounded') },
              { value: 'legible', label: t('settings.fontLegible') },
            ]}
          />
        </>
      ) : null}

      <FieldLabel>{t('settings.skinTone')}</FieldLabel>
      <SkinTonePicker value={s.skinTone} />

      <View style={{ gap: 10, marginTop: 18 }}>
        <ToggleRow icon="color-palette-outline" label={t('settings.colorCoded')} sub={t('settings.colorCodedSub')} value={s.colorCoded} onChange={(v) => update({ colorCoded: v })} />
        <NavRow icon="key-outline" label={t('settings.colorKey')} sub={t('settings.colorKeySub')} onPress={() => setKeyOpen(true)} />
        {!compact ? (
          <>
            <ToggleRow icon="apps-outline" label={t('settings.fixedGrid')} sub={t('settings.fixedGridSub')} value={s.fixedGrid} onChange={(v) => update({ fixedGrid: v })} />
            <ToggleRow icon="grid-outline" label={t('settings.stableLayout')} sub={t('settings.stableLayoutSub')} value={s.stableLayout} onChange={(v) => update({ stableLayout: v })} />
          </>
        ) : null}
      </View>
      <Sheet visible={keyOpen} onClose={() => setKeyOpen(false)} title={t('settings.colorKey')}>
        <ColorKey />
      </Sheet>
    </View>
  );
}

export function SkinTonePicker({ value }: { value: Settings['skinTone'] }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' }} accessibilityRole="radiogroup" accessibilityLabel={t('settings.skinTone')}>
      {SKIN_TONES.map((tone, i) => (
        <Pressable
          key={tone.id}
          onPress={() => update({ skinTone: tone.id })}
          accessibilityRole="radio"
          accessibilityState={{ checked: value === tone.id }}
          accessibilityLabel={`${t('settings.skinTone')} ${i + 1}`}
          style={{
            padding: 4,
            borderRadius: 16,
            borderWidth: 3,
            borderColor: value === tone.id ? theme.colors.primary : 'transparent',
            backgroundColor: value === tone.id ? theme.colors.primarySoft : 'transparent',
          }}
        >
          <View pointerEvents="none">
            <SymbolImageWithTone tone={tone.id} />
          </View>
        </Pressable>
      ))}
    </View>
  );
}

/** The waving hand in a given tone, regardless of the current setting. */
function SymbolImageWithTone({ tone }: { tone: Settings['skinTone'] }) {
  return <Image source={symbolSource('1f44b', tone)} style={{ width: 34, height: 34 }} contentFit="contain" />;
}

// ---------------------------------------------------------------------------

interface AccentGroup {
  key: string;
  name: string;
  voices: DeviceVoice[];
}

/** Groups device voices into a small library by accent: "American English", "Irish English", … */
function groupByAccent(list: DeviceVoice[]): AccentGroup[] {
  const groups = new Map<string, DeviceVoice[]>();
  for (const v of list) {
    const k = accentKey(v.language);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(v);
  }
  return [...groups.entries()].map(([key, voices]) => ({ key, name: accentName(voices[0].language), voices }));
}

/** iOS voices have real names ("Moira"); Android voices are IDs, so they are numbered within their accent. */
function voiceTitle(v: DeviceVoice, group: DeviceVoice[], voiceWord: string) {
  const looksLikeId = v.name === v.identifier || /-x-|#|_|-language$|^[a-z]{2,3}-[a-z]{2}/i.test(v.name);
  if (!looksLikeId) return v.name.replace(/\s*\((Enhanced|Premium|Compact)\)\s*$/i, '');
  return `${voiceWord} ${group.indexOf(v) + 1}`;
}

export function VoicePanel({ compact }: { compact?: boolean }) {
  const { t } = useTranslation();
  const s = useApp(
    useShallow((st) => ({
      language: st.settings.language,
      voiceId: st.settings.voiceId,
      voiceStyle: st.settings.voiceStyle,
      rate: st.settings.rate,
      pitch: st.settings.pitch,
      speechEnabled: st.settings.speechEnabled,
    })),
  );
  const voices = useApp((st) => st.voices);
  const voicesLoaded = useApp((st) => st.voicesLoaded);
  const { speaking } = useSpeechState();
  const langVoices = useMemo(() => voicesFor(voices, s.language), [voices, s.language]);
  const accents = useMemo(() => groupByAccent(langVoices), [langVoices]);
  const selectedVoice = langVoices.find((v) => v.identifier === s.voiceId);
  const defaultAccent = selectedVoice ? accentKey(selectedVoice.language) : accentKey(speechTagFor(s.language));
  const [accent, setAccent] = useState<string | null>(null);
  const activeAccent = accents.find((a) => a.key === (accent ?? defaultAccent)) ?? accents[0];

  const sample = () => (speaking ? stopSpeaking() : speakText(t('voice.sample')));

  const chooseStyle = (style: VoiceStyle) => {
    if (style === 'custom') return update({ voiceStyle: style });
    update({ voiceStyle: style, ...VOICE_STYLES[style] });
    setTimeout(() => speakText(t('voice.sample')), 50);
  };

  return (
    <View>
      {!compact ? (
        <ToggleRow icon="volume-high-outline" label={t('voice.speechEnabled')} sub={t('voice.speechEnabledSub')} value={s.speechEnabled} onChange={(v) => update({ speechEnabled: v })} />
      ) : null}

      {voicesLoaded && langVoices.length === 0 ? (
        <View style={{ marginTop: 14 }}>
          <InfoBanner tone="warning" icon="alert-circle-outline" text={t('onboarding.voice.noVoices')} />
        </View>
      ) : null}

      <FieldLabel>{t('voice.style')}</FieldLabel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {(['natural', 'bright', 'calm', 'deep'] as const).map((st) => (
          <Chip key={st} label={t(`voice.styles.${st}`)} selected={s.voiceStyle === st} onPress={() => chooseStyle(st)} />
        ))}
        {s.voiceStyle === 'custom' ? <Chip label={t('voice.styles.custom')} selected onPress={() => {}} /> : null}
      </View>

      <FieldLabel hint={voicesLoaded ? t('voice.voicesFound', { count: langVoices.length }) : undefined}>{t('voice.voice')}</FieldLabel>
      <OptionCard compact title={t('voice.automatic')} sub={t('voice.automaticSub')} emoji="✨" selected={!s.voiceId} onPress={() => update({ voiceId: null })} />

      {accents.length ? (
        <>
          <FieldLabel>{t('voice.accent')}</FieldLabel>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
            {accents.map((a) => (
              <Chip key={a.key} label={`${a.name} · ${a.voices.length}`} selected={activeAccent?.key === a.key} onPress={() => setAccent(a.key)} />
            ))}
          </ScrollView>
          <View style={{ gap: 8, marginTop: 12 }} accessibilityRole="radiogroup" accessibilityLabel={activeAccent?.name}>
            {activeAccent?.voices.map((v) => (
              <OptionCard
                compact
                key={v.identifier}
                title={voiceTitle(v, activeAccent.voices, t('voice.voice'))}
                sub={[activeAccent.name, v.quality === 'Enhanced' ? t('voice.enhanced') : t('voice.standard')].join(' · ')}
                emoji="🎙️"
                selected={s.voiceId === v.identifier}
                onPress={() => {
                  update({ voiceId: v.identifier });
                  previewVoice(v, t('voice.sample'));
                }}
                right={
                  <IconButton icon="play" label={`${t('voice.preview')}: ${voiceTitle(v, activeAccent.voices, t('voice.voice'))}`} size={38} variant="soft" onPress={() => previewVoice(v, t('voice.sample'))} />
                }
              />
            ))}
          </View>
          {Platform.OS === 'android' ? (
            <View style={{ marginTop: 12 }}>
              <InfoBanner icon="cloud-download-outline" text={t('voice.androidNote')} />
            </View>
          ) : null}
        </>
      ) : null}

      <View style={{ gap: 10, marginTop: 18 }}>
        <Stepper
          label={t('voice.rate')}
          value={s.rate}
          display={`${Math.round(s.rate * 100)}%`}
          step={0.05}
          min={0.5}
          max={1.6}
          lessLabel={t('voice.slower')}
          moreLabel={t('voice.faster')}
          onChange={(v) => update({ rate: v, voiceStyle: 'custom' })}
        />
        <Stepper
          label={t('voice.pitch')}
          value={s.pitch}
          display={`${Math.round(s.pitch * 100)}%`}
          step={0.05}
          min={0.5}
          max={1.8}
          lessLabel={t('voice.lower')}
          moreLabel={t('voice.higher')}
          onChange={(v) => update({ pitch: v, voiceStyle: 'custom' })}
        />
      </View>

      <View style={{ marginTop: 18, alignItems: 'center' }}>
        <PushButton title={speaking ? t('common.stop') : t('voice.test')} icon={speaking ? 'stop' : 'play'} onPress={sample} variant="primary" style={{ alignSelf: 'center' }} />
      </View>

      {Platform.OS === 'ios' && !compact ? (
        <View style={{ marginTop: 14 }}>
          <InfoBanner text={t('voice.silentNote')} icon="notifications-off-outline" />
        </View>
      ) : null}

      {Platform.OS !== 'web' && (!compact || (voicesLoaded && langVoices.length === 0)) ? <FreeVoicesHelp /> : null}
    </View>
  );
}

/** How to download extra voices. Only free voices that come with the device are used. */
function FreeVoicesHelp() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const count = useApp((st) => st.voices.length);

  // Coming back from the device settings: look for newly downloaded voices.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') useApp.getState().refreshVoices();
    });
    return () => sub.remove();
  }, []);

  return (
    <View style={{ marginTop: 14 }}>
      <NavRow icon="cloud-download-outline" label={t('voiceHelp.title')} sub={t('voiceHelp.sub')} onPress={() => setOpen(true)} />
      <Sheet visible={open} onClose={() => setOpen(false)} title={t('voiceHelp.title')}>
        <View style={{ gap: 12, paddingBottom: 8 }}>
          <AppText variant="body">{Platform.OS === 'ios' ? t('voiceHelp.ios') : t('voiceHelp.android')}</AppText>
          {Platform.OS === 'android' ? (
            <PushButton
              title={t('voiceHelp.open')}
              icon="settings-outline"
              onPress={() => IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.TTS_SETTINGS).catch(() => Linking.openSettings())}
            />
          ) : null}
          <PushButton
            title={t('voiceHelp.refresh')}
            icon="refresh"
            variant="soft"
            onPress={async () => {
              await useApp.getState().refreshVoices();
              toast(t('voiceHelp.found', { count: useApp.getState().voices.length }), { tone: 'success' });
            }}
          />
          <AppText variant="caption" muted>
            {t('voiceHelp.found', { count })} · {t('voiceHelp.freeNote')}
          </AppText>
        </View>
      </Sheet>
    </View>
  );
}

// ---------------------------------------------------------------------------

export function TapActionPanel() {
  const { t } = useTranslation();
  const tapAction = useApp((s) => s.settings.tapAction);
  const options: { value: TapAction; emoji: string }[] = [
    { value: 'speakAndAdd', emoji: '💬' },
    { value: 'add', emoji: '🧩' },
    { value: 'speak', emoji: '🔊' },
  ];
  return (
    <View style={{ gap: 10 }} accessibilityRole="radiogroup">
      {options.map((o) => (
        <OptionCard
          key={o.value}
          title={t(`tapActions.${o.value}.title`)}
          sub={t(`tapActions.${o.value}.sub`)}
          emoji={o.emoji}
          selected={tapAction === o.value}
          onPress={() => update({ tapAction: o.value })}
        />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------

/** Toggle grid for picking Home shortcuts (used in onboarding). */
export function QuickActionsPicker() {
  const { t } = useTranslation();
  const theme = useTheme();
  const selected = useApp((s) => s.settings.quickActions);
  const toggle = (id: QuickActionId) => {
    if (selected.includes(id)) return update({ quickActions: selected.filter((x) => x !== id) });
    if (selected.length >= MAX_QUICK_ACTIONS) return toast(t('quickEditor.limit'), { tone: 'warning' });
    update({ quickActions: [...selected, id] });
  };
  const cols = theme.width > 700 ? 4 : 2;
  return (
    <View style={styles.wrapGrid}>
      {ALL_QUICK_ACTIONS.map((id) => {
        const qa = QUICK_ACTIONS[id];
        const on = selected.includes(id);
        const sw = cardSwatch(qa.color, theme.mode);
        return (
          <Pressable
            key={id}
            onPress={() => toggle(id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
            accessibilityLabel={`${t(`quick.${id}.title`)}. ${t(`quick.${id}.sub`)}`}
            style={({ pressed }) => [
              styles.qaCard,
              {
                width: `${100 / cols - 2.5}%`,
                backgroundColor: on ? sw.bg : theme.colors.surface,
                borderColor: on ? sw.edge : theme.highContrast ? theme.colors.text : theme.colors.border,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <SymbolImage emoji={qa.emoji} size={36} />
              <Ionicons name={on ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={on ? sw.text : theme.colors.textSoft} />
            </View>
            <AppText variant="label" color={on ? sw.text : theme.colors.text} numberOfLines={2} style={{ marginTop: 6 }}>
              {t(`quick.${id}.title`)}
            </AppText>
            <AppText variant="tiny" color={on ? sw.text : theme.colors.textMuted} numberOfLines={2}>
              {t(`quick.${id}.sub`)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  langCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: RADIUS.lg, borderWidth: 2.5, minHeight: 68 },
  preview: { borderRadius: RADIUS.lg, padding: 12, borderWidth: 2 },
  displayOpt: { flex: 1, alignItems: 'center', padding: 6, borderRadius: RADIUS.lg, borderWidth: 2.5 },
  qaCard: { padding: 12, borderRadius: RADIUS.lg, borderWidth: 2.5, minHeight: 112 },
});
