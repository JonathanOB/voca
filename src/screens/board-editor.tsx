import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { alertDialog, confirm } from '@/components/dialog';
import { ColorDot, FieldLabel, OptionCard, TextField } from '@/components/form';
import { IconButton } from '@/components/icon-button';
import { PushButton } from '@/components/push-button';
import { SymbolImage } from '@/components/symbol-image';
import { SymbolPicker } from '@/components/symbol-picker';
import type { Board } from '@/db/types';
import { boardName, boardPurpose } from '@/i18n/labels';
import { newId } from '@/services/ids';
import { useApp } from '@/store/app-store';
import type { TapAction } from '@/store/settings';
import { CARD_COLORS, CARD_COLOR_NAMES, RADIUS, cardSwatch, softShadow, useTheme, type CardColor } from '@/theme';

export function BoardEditor() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useApp((s) => (id ? s.boards.find((b) => b.id === id) : undefined));
  const [name, setName] = useState(existing ? boardName(existing) : '');
  const [description, setDescription] = useState(existing ? boardPurpose(existing) : '');
  const [symbol, setSymbol] = useState<string | null>(existing?.symbol ?? '1f4ac');
  const [color, setColor] = useState<CardColor>(existing?.color ?? 'purple');
  const [tapAction, setTapAction] = useState<TapAction | null>(existing?.tapAction ?? null);
  const [picker, setPicker] = useState(false);
  const isNew = !existing;
  const sw = cardSwatch(color, theme.mode);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) return alertDialog(t('boardEditor.nameRequired'));
    const now = Date.now();
    const st = useApp.getState();
    const keepStdName = existing?.stdKey && !existing.name && trimmed === boardName({ name: null, stdKey: existing.stdKey });
    const keepStdDesc = existing?.stdKey && !existing.description && description.trim() === boardPurpose({ description: null, stdKey: existing.stdKey });
    const board: Board = {
      id: existing?.id ?? newId('board'),
      stdKey: existing?.stdKey ?? null,
      name: keepStdName ? null : trimmed,
      description: keepStdDesc ? null : description.trim() || null,
      section: existing?.section ?? 'custom',
      symbol,
      photo: existing?.photo ?? null,
      color,
      isStandard: existing?.isStandard ?? false,
      hidden: existing?.hidden ?? false,
      sort: existing?.sort ?? Math.max(0, ...st.boards.map((b) => b.sort)) + 1,
      tapAction,
      tone: existing?.tone ?? null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await st.saveBoard(board);
    if (isNew) router.replace({ pathname: '/board/[id]', params: { id: board.id } });
    else router.back();
  };

  const remove = async () => {
    if (!existing) return;
    const ok = await confirm(
      existing.isStandard
        ? { title: t('boardEditor.hideStandardTitle'), body: t('boardEditor.hideStandardBody'), confirmLabel: t('common.hide'), destructive: true }
        : { title: t('boardEditor.deleteConfirmTitle'), body: t('boardEditor.deleteConfirmBody'), confirmLabel: t('common.delete'), destructive: true },
    );
    if (!ok) return;
    await useApp.getState().deleteBoard(existing.id);
    router.dismissAll();
    router.replace('/my-boards');
  };

  const taps: (TapAction | null)[] = [null, 'speakAndAdd', 'add', 'speak'];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 16 : insets.top + 10 }]}>
        <IconButton icon="close" label={t('common.cancel')} onPress={() => router.back()} size={44} />
        <AppText variant="heading" style={{ flex: 1 }} center accessibilityRole="header">
          {isNew ? t('boardEditor.newTitle') : t('boardEditor.editTitle')}
        </AppText>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 120, maxWidth: 720, width: '100%', alignSelf: 'center' }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor: sw.edge, borderRadius: RADIUS.xl, paddingBottom: 5 }}>
          <View style={[styles.preview, { backgroundColor: theme.highContrast ? theme.colors.surface : sw.bg }]}>
            <SymbolImage symbol={symbol} size={64} />
            <View style={{ flex: 1 }}>
              <AppText variant="heading" color={theme.highContrast ? theme.colors.text : sw.text} numberOfLines={2}>
                {name.trim() || t('boardEditor.namePlaceholder')}
              </AppText>
              {description.trim() ? (
                <AppText variant="caption" color={theme.highContrast ? theme.colors.textMuted : sw.text} numberOfLines={2}>
                  {description}
                </AppText>
              ) : null}
            </View>
          </View>
        </View>

        <FieldLabel>{t('boardEditor.name')}</FieldLabel>
        <TextField value={name} onChangeText={setName} placeholder={t('boardEditor.namePlaceholder')} accessibilityLabel={t('boardEditor.name')} maxLength={50} large autoFocus={isNew} />

        <FieldLabel>{t('boardEditor.description')}</FieldLabel>
        <TextField value={description} onChangeText={setDescription} placeholder={t('boardEditor.descriptionPlaceholder')} accessibilityLabel={t('boardEditor.description')} maxLength={200} multiline />

        <FieldLabel>{t('boardEditor.icon')}</FieldLabel>
        <PushButton title={t('buttonEditor.symbols')} icon="happy-outline" variant="surface" size="md" onPress={() => setPicker(true)} />

        <FieldLabel>{t('boardEditor.colour')}</FieldLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }} accessibilityRole="radiogroup">
          {CARD_COLOR_NAMES.map((c) => (
            <ColorDot key={c} color={CARD_COLORS[c].bg} selected={c === color} onPress={() => setColor(c)} label={c} />
          ))}
        </View>

        <FieldLabel>{t('boardEditor.tapAction')}</FieldLabel>
        <View style={{ gap: 8 }} accessibilityRole="radiogroup">
          {taps.map((ta) => (
            <OptionCard
              compact
              key={ta ?? 'default'}
              title={ta ? t(`tapActions.${ta}.title`) : t('boardEditor.tapDefault')}
              sub={ta ? t(`tapActions.${ta}.sub`) : undefined}
              selected={tapAction === ta}
              onPress={() => setTapAction(ta)}
            />
          ))}
        </View>

        {!isNew && existing && existing.section !== 'home' && existing.section !== 'safety' ? (
          <View style={{ marginTop: 28, alignItems: 'center' }}>
            <PushButton
              title={existing.isStandard ? t('boardEditor.hide') : t('boardEditor.delete')}
              variant="surface"
              size="md"
              icon={existing.isStandard ? 'eye-off-outline' : 'trash-outline'}
              onPress={remove}
            />
          </View>
        ) : null}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 14, borderTopColor: theme.colors.border }, softShadow(theme, 1)]}>
        <PushButton title={isNew ? t('boardEditor.create') : t('common.save')} icon="checkmark" full onPress={save} style={{ maxWidth: 680, alignSelf: 'center', width: '100%' }} />
      </View>
      <SymbolPicker visible={picker} onClose={() => setPicker(false)} onPick={setSymbol} initialQuery="" />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 8 },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18, borderRadius: RADIUS.xl },
  footer: { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1 },
});
