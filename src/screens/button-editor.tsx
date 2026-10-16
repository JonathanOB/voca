import { Ionicons } from '@expo/vector-icons';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { alertDialog, confirm } from '@/components/dialog';
import { Chip, FieldLabel, TextField, ToggleRow } from '@/components/form';
import { IconButton } from '@/components/icon-button';
import { InfoBanner } from '@/components/layout';
import { PushButton } from '@/components/push-button';
import { SymbolImage } from '@/components/symbol-image';
import { SymbolPicker } from '@/components/symbol-picker';
import { Tile } from '@/components/tile';
import { FAVOURITES_BOARD_ID } from '@/data/standard-content';
import type { Button } from '@/db/types';
import { speakItems, stopSpeaking, useSpeechState } from '@/hooks/use-speech';
import { parseFormsInput, wordForms } from '@/i18n/forms';
import { buttonLabel, buttonSpoken, useLabels } from '@/i18n/labels';
import { LANGUAGES, languageInfo } from '@/i18n/languages';
import { newId } from '@/services/ids';
import { importAudio, importPhoto } from '@/services/media';
import { configureAudioSession } from '@/services/speech';
import { boardsUsingButton, isFavourite, useApp } from '@/store/app-store';
import { toast } from '@/store/ui-store';
import { RADIUS, WORD_COLORS, WORD_TYPES, softShadow, useTheme, type WordType } from '@/theme';

export function ButtonEditor() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const L = useLabels();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ boardId?: string; itemId?: string; buttonId?: string; label?: string }>();
  const [buttonId, setButtonId] = useState(params.buttonId);
  const boardId = params.boardId;
  const existing = useApp((s) => (buttonId ? s.buttons[buttonId] : undefined));
  const board = useApp((s) => s.boards.find((b) => b.id === boardId));
  // Select stable slices, then derive (a selector returning a new array would re-render forever).
  const allBoards = useApp((s) => s.boards);
  const allItems = useApp((s) => s.items);
  const usedOn = useMemo(
    () =>
      existing
        ? boardsUsingButton({ boards: allBoards, items: allItems } as never, existing.id).filter((b) => b.id !== FAVOURITES_BOARD_ID)
        : [],
    [existing, allBoards, allItems],
  );
  // A new button made outside any board (e.g. from the keyboard) goes to Favourites so it is never lost.
  const startFav = useApp((s) => (existing ? isFavourite(s, existing.id) : !boardId || boardId === FAVOURITES_BOARD_ID));
  const display = useApp((s) => s.settings.buttonDisplay);
  const appLang = useApp((s) => s.settings.language);
  const { speaking } = useSpeechState();

  const [label, setLabel] = useState(existing ? buttonLabel(existing) : (params.label ?? ''));
  const [spoken, setSpoken] = useState(existing?.spoken ?? '');
  const [lang, setLang] = useState<string | null>(existing?.lang ?? null);
  const [type, setType] = useState<WordType>(existing?.type ?? 'thing');
  const [symbol, setSymbol] = useState<string | null>(existing?.symbol ?? null);
  const [photo, setPhoto] = useState<string | null>(existing?.photo ?? null);
  const [audio, setAudio] = useState<string | null>(existing?.audio ?? null);
  const [formsText, setFormsText] = useState((existing?.forms ?? []).join(', '));
  const [favourite, setFavourite] = useState(startFav);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const forked = useRef(false);

  // When forking to a board-only copy, reload the fields from the copy.
  useEffect(() => {
    if (existing && forked.current) {
      forked.current = false;
      setLabel(buttonLabel(existing));
    }
  }, [existing]);

  const isNew = !existing;
  const previewLabel = label.trim() || t('buttonEditor.labelPlaceholder');

  const pickPhoto = async (source: 'camera' | 'library') => {
    try {
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return alertDialog(t('buttonEditor.camera'), t('buttonEditor.cameraPermission'));
      }
      const opts: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: Platform.OS === 'web',
      };
      const res = source === 'camera' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
      if (res.canceled || !res.assets?.[0]) return;
      const name = await importPhoto(res.assets[0].uri, res.assets[0].base64);
      setPhoto(name);
    } catch {
      alertDialog(t('buttonEditor.photos'), t('buttonEditor.photoPermission'));
    }
  };

  const hear = () => {
    if (speaking) return stopSpeaking();
    const text = spoken.trim() || label.trim();
    if (!text && !audio) return;
    speakItems([{ id: 'preview', text, lang, audio }]);
  };

  const editHereOnly = async () => {
    if (!boardId || !params.itemId) return;
    const copyId = await useApp.getState().forkButtonForBoard(boardId, params.itemId);
    if (copyId) {
      forked.current = true;
      setButtonId(copyId);
      toast(t('buttonEditor.editingCopy'), { tone: 'success' });
    }
  };

  const save = async () => {
    const trimmed = label.trim();
    if (!trimmed) return alertDialog(t('buttonEditor.labelRequired'));
    setSaving(true);
    try {
      const now = Date.now();
      // Keep standard wording linked to translations unless the user really changed it.
      const sameAsStd = existing?.stdKey && !existing.label && trimmed === buttonLabel({ label: null, stdKey: existing.stdKey });
      const spokenTrim = spoken.trim();
      const btn: Button = {
        id: existing?.id ?? newId('btn'),
        stdKey: existing?.stdKey ?? null,
        label: sameAsStd ? null : trimmed,
        spoken: spokenTrim && spokenTrim !== trimmed ? spokenTrim : null,
        lang,
        symbol,
        photo,
        audio,
        type,
        forms: parseFormsInput(formsText).length ? parseFormsInput(formsText) : null,
        isStandard: existing?.isStandard ?? false,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      await useApp.getState().saveButton(btn, {
        addToBoard: isNew && boardId ? boardId : undefined,
        favourite: boardId === FAVOURITES_BOARD_ID && isNew ? undefined : favourite,
      });
      toast(t('buttonEditor.saved'), { tone: 'success' });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!boardId || !params.itemId) return;
    const ok = await confirm({
      title: t('buttonEditor.deleteConfirmTitle'),
      body: t('buttonEditor.deleteConfirmBody'),
      confirmLabel: t('common.delete'),
      destructive: true,
    });
    if (!ok) return;
    await useApp.getState().removeItem(boardId, params.itemId);
    router.back();
  };

  const langOptions = useMemo(() => LANGUAGES, []);
  // Automatic forms for the current wording, shown as an example of what the bubble will offer.
  const autoForms = useMemo(
    () => wordForms({ ...(existing ?? { id: '', stdKey: null, symbol: null, photo: null, audio: null, spoken: null, isStandard: false, createdAt: 0, updatedAt: 0 }), label: label.trim() || null, lang, type, forms: null }, appLang),
    [existing, label, lang, type, appLang],
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 16 : insets.top + 10 }]}>
        <IconButton icon="close" label={t('common.cancel')} onPress={() => router.back()} size={44} />
        <AppText variant="heading" style={{ flex: 1 }} center accessibilityRole="header">
          {isNew ? t('buttonEditor.newTitle') : t('buttonEditor.editTitle')}
        </AppText>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 120, maxWidth: 720, width: '100%', alignSelf: 'center' }} keyboardShouldPersistTaps="handled">
        {/* live preview */}
        <View style={[styles.preview, { backgroundColor: theme.colors.surface }, softShadow(theme, 2)]}>
          <Tile label={previewLabel} symbol={symbol} photo={photo} type={type} width={140} display={display} hasAudio={!!audio} onPress={hear} a11yHint={t('buttonEditor.hear')} />
          <View style={{ flex: 1, gap: 10 }}>
            <AppText variant="caption" muted>
              {t('buttonEditor.preview')}
              {board ? ` · ${L.boardName(board)}` : ''}
            </AppText>
            <PushButton title={speaking ? t('common.stop') : t('buttonEditor.hear')} icon={speaking ? 'stop' : 'volume-high'} size="md" onPress={hear} variant="soft" />
          </View>
        </View>

        {existing && usedOn.length > 1 ? (
          <View style={{ marginTop: 16, gap: 10 }}>
            <InfoBanner text={`${t('buttonEditor.sharedTitle', { count: usedOn.length })}. ${t('buttonEditor.sharedBody')}`} icon="git-branch-outline" />
            {params.itemId ? <PushButton title={t('buttonEditor.editHereOnly')} variant="surface" size="md" icon="copy-outline" onPress={editHereOnly} /> : null}
          </View>
        ) : null}

        <FieldLabel>{t('buttonEditor.label')}</FieldLabel>
        <TextField
          value={label}
          onChangeText={setLabel}
          placeholder={t('buttonEditor.labelPlaceholder')}
          accessibilityLabel={t('buttonEditor.label')}
          maxLength={60}
          large
          autoFocus={isNew}
        />

        <FieldLabel hint={t('buttonEditor.spokenHint')}>{t('buttonEditor.spoken')}</FieldLabel>
        <TextField
          value={spoken}
          onChangeText={setSpoken}
          placeholder={existing ? buttonSpoken(existing) : t('buttonEditor.spokenPlaceholder')}
          accessibilityLabel={t('buttonEditor.spoken')}
          maxLength={300}
          multiline
        />

        <FieldLabel>{t('buttonEditor.picture')}</FieldLabel>
        <View style={styles.pictureRow}>
          <PictureChoice icon="happy-outline" label={t('buttonEditor.symbols')} onPress={() => setPickerOpen(true)} active={!!symbol && !photo} />
          {Platform.OS !== 'web' ? <PictureChoice icon="camera-outline" label={t('buttonEditor.camera')} onPress={() => pickPhoto('camera')} /> : null}
          <PictureChoice icon="images-outline" label={t('buttonEditor.photos')} onPress={() => pickPhoto('library')} active={!!photo} />
          <PictureChoice
            icon="remove-circle-outline"
            label={t('buttonEditor.noPicture')}
            onPress={() => {
              setPhoto(null);
              setSymbol(null);
            }}
            active={!photo && !symbol}
          />
        </View>
        {photo ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <SymbolImage photo={photo} size={72} />
            <Chip label={t('common.remove')} icon="close" onPress={() => setPhoto(null)} />
          </View>
        ) : null}

        <FieldLabel>{t('buttonEditor.colour')}</FieldLabel>
        <View style={styles.typeGrid} accessibilityRole="radiogroup">
          {WORD_TYPES.filter((w) => w !== 'urgent').map((w) => (
            <Pressable
              key={w}
              onPress={() => setType(w)}
              accessibilityRole="radio"
              accessibilityState={{ checked: type === w }}
              accessibilityLabel={t(`buttonEditor.typeLabels.${w}`)}
              style={[
                styles.typeChip,
                {
                  backgroundColor: theme.mode === 'light' ? WORD_COLORS[w].bg : theme.colors.surface,
                  borderColor: type === w ? theme.colors.text : WORD_COLORS[w].edge,
                  borderWidth: type === w ? 3 : 2,
                },
              ]}
            >
              <View style={[styles.swatch, { backgroundColor: WORD_COLORS[w].edge }]} />
              <AppText variant="caption">{t(`buttonEditor.typeLabels.${w}`)}</AppText>
            </Pressable>
          ))}
        </View>

        <FieldLabel hint={t('forms.hint')}>{t('forms.label')}</FieldLabel>
        <TextField
          value={formsText}
          onChangeText={setFormsText}
          placeholder={t('forms.placeholder', { example: autoForms.slice(0, 3).join(', ') || '…' })}
          accessibilityLabel={t('forms.label')}
          autoCapitalize="none"
        />

        <FieldLabel>{t('buttonEditor.language')}</FieldLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip label={`${t('buttonEditor.languageDefault')} (${languageInfo(appLang).native})`} selected={!lang} onPress={() => setLang(null)} />
          {langOptions.map((l) => (
            <Chip key={l.code} label={l.native} selected={lang === l.code} onPress={() => setLang(l.code)} />
          ))}
        </ScrollView>

        <FieldLabel hint={t('buttonEditor.recordingHint')}>{t('buttonEditor.recording')}</FieldLabel>
        <Recorder audio={audio} onChange={setAudio} />

        <View style={{ marginTop: 18 }}>
          {boardId !== FAVOURITES_BOARD_ID || !isNew ? (
            <ToggleRow icon="star-outline" label={t('buttonEditor.favourite')} value={favourite} onChange={setFavourite} />
          ) : null}
        </View>

        {!isNew && params.itemId ? (
          <View style={{ marginTop: 24, alignItems: 'center' }}>
            <PushButton title={t('buttonEditor.deleteButton')} variant="surface" size="md" icon="trash-outline" onPress={remove} />
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14, backgroundColor: theme.colors.bg, borderTopColor: theme.colors.border }]}>
        <PushButton title={t('buttonEditor.save')} icon="checkmark" full onPress={save} loading={saving} style={{ maxWidth: 680, alignSelf: 'center', width: '100%' }} />
      </View>

      <SymbolPicker visible={pickerOpen} onClose={() => setPickerOpen(false)} initialQuery={label} onPick={(id) => { setSymbol(id); setPhoto(null); }} />
    </View>
  );
}

function PictureChoice({ icon, label, onPress, active }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void; active?: boolean }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.picChoice,
        {
          backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface,
          borderColor: active ? theme.colors.primary : theme.highContrast ? theme.colors.text : theme.colors.border,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
    >
      <Ionicons name={icon} size={26} color={theme.colors.primary} />
      <AppText variant="caption" center numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

function Recorder({ audio, onChange }: { audio: string | null; onChange: (v: string | null) => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder, 250);

  const start = async () => {
    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) return alertDialog(t('buttonEditor.recording'), t('buttonEditor.micPermission'));
    await stopSpeaking();
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const stop = async () => {
    await recorder.stop();
    await configureAudioSession();
    if (recorder.uri) onChange(await importAudio(recorder.uri));
  };

  const secs = Math.floor((state.durationMillis ?? 0) / 1000);
  return (
    <View style={[styles.recorder, { backgroundColor: theme.colors.surface, borderColor: state.isRecording ? theme.colors.danger : theme.highContrast ? theme.colors.text : theme.colors.border }]}>
      {state.isRecording ? (
        <>
          <PushButton title={`${t('buttonEditor.recordingNow')} ${secs}s`} icon="stop" variant="danger" size="md" onPress={stop} />
        </>
      ) : audio ? (
        <>
          <PushButton title={t('buttonEditor.play')} icon="play" variant="soft" size="md" onPress={() => speakItems([{ id: 'rec', text: '', audio }])} />
          <PushButton title={t('buttonEditor.record')} icon="mic" variant="surface" size="md" onPress={start} />
          <IconButton icon="trash-outline" label={t('buttonEditor.deleteRecording')} onPress={() => onChange(null)} size={44} />
        </>
      ) : (
        <PushButton title={t('buttonEditor.record')} icon="mic" variant="soft" size="md" onPress={start} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 8 },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 18, padding: 16, borderRadius: RADIUS.xl },
  pictureRow: { flexDirection: 'row', gap: 10 },
  picChoice: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 14, borderRadius: RADIUS.lg, borderWidth: 2.5 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.pill, minHeight: 42 },
  swatch: { width: 16, height: 16, borderRadius: 8 },
  recorder: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: RADIUS.lg, borderWidth: 2, flexWrap: 'wrap' },
  footer: { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1 },
});
