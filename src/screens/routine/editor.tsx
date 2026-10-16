import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { ButtonPicker } from '@/components/button-picker';
import { alertDialog } from '@/components/dialog';
import { ColorDot, FieldLabel, TextField } from '@/components/form';
import { IconButton } from '@/components/icon-button';
import { PushButton } from '@/components/push-button';
import { SymbolImage } from '@/components/symbol-image';
import { SymbolPicker } from '@/components/symbol-picker';
import type { Routine, RoutineStep } from '@/db/types';
import { routineName, stepLabel, stepSymbol } from '@/i18n/labels';
import { newId } from '@/services/ids';
import { useApp } from '@/store/app-store';
import { CARD_COLORS, CARD_COLOR_NAMES, RADIUS, softShadow, useTheme, type CardColor } from '@/theme';

const NO_STEPS: RoutineStep[] = [];

interface DraftStep {
  step: RoutineStep;
  text: string;
  original: string;
}

export function RoutineEditor() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useApp((s) => (id ? s.routines.find((r) => r.id === id) : undefined));
  const buttons = useApp((s) => s.buttons);
  const existingSteps = useApp((s) => (id ? s.steps[id] ?? NO_STEPS : NO_STEPS));
  const [name, setName] = useState(existing ? routineName(existing) : '');
  const [symbol, setSymbol] = useState<string | null>(existing?.symbol ?? '1f9fc');
  const [color, setColor] = useState<CardColor>(existing?.color ?? 'mint');
  const [steps, setSteps] = useState<DraftStep[]>(() =>
    existingSteps.map((st) => {
      const text = stepLabel(st, buttons);
      return { step: st, text, original: text };
    }),
  );
  const [symbolFor, setSymbolFor] = useState<string | 'routine' | null>(null);
  const [pickButtons, setPickButtons] = useState(false);
  const routineId = existing?.id ?? newId('routine');

  const blankStep = (): DraftStep => ({
    step: { id: newId('step'), routineId, position: 0, buttonId: null, stdKey: null, label: '', spoken: null, symbol: null, photo: null, audio: null, done: false },
    text: '',
    original: '',
  });

  const move = (i: number, d: number) =>
    setSteps((list) => {
      const j = i + d;
      if (j < 0 || j >= list.length) return list;
      const next = [...list];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) return alertDialog(t('routineEditor.nameRequired'));
    const finalSteps = steps
      .filter((d) => d.text.trim() || d.step.buttonId || d.step.symbol)
      .map((d) => ({
        ...d.step,
        // Keep built-in wording linked to translations unless it was changed.
        label: d.text.trim() === d.original && !d.step.label ? null : d.text.trim() || null,
      }));
    if (!finalSteps.length) return alertDialog(t('routineEditor.stepsRequired'));
    const now = Date.now();
    const keepStdName = existing?.stdKey && !existing.name && trimmed === routineName({ name: null, stdKey: existing.stdKey });
    const routine: Routine = {
      id: routineId,
      stdKey: existing?.stdKey ?? null,
      name: keepStdName ? null : trimmed,
      description: existing?.description ?? null,
      kind: existing?.kind ?? 'routine',
      symbol,
      photo: existing?.photo ?? null,
      color,
      isStandard: existing?.isStandard ?? false,
      hidden: false,
      sort: existing?.sort ?? Math.max(0, ...useApp.getState().routines.map((r) => r.sort)) + 1,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await useApp.getState().saveRoutine(routine, finalSteps);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 16 : insets.top + 10 }]}>
        <IconButton icon="close" label={t('common.cancel')} onPress={() => router.back()} size={44} />
        <AppText variant="heading" style={{ flex: 1 }} center accessibilityRole="header">
          {existing ? t('routineEditor.editTitle') : t('routineEditor.newTitle')}
        </AppText>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 120, maxWidth: 760, width: '100%', alignSelf: 'center' }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Pressable
            onPress={() => setSymbolFor('routine')}
            accessibilityRole="button"
            accessibilityLabel={t('boardEditor.icon')}
            style={[styles.bigSym, { backgroundColor: CARD_COLORS[color].bg }]}
          >
            <SymbolImage symbol={symbol} size={60} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <TextField value={name} onChangeText={setName} placeholder={t('routineEditor.namePlaceholder')} accessibilityLabel={t('routineEditor.name')} large maxLength={50} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2, marginTop: 12 }} accessibilityRole="radiogroup">
          {CARD_COLOR_NAMES.map((c) => (
            <ColorDot key={c} size={34} color={CARD_COLORS[c].bg} selected={c === color} onPress={() => setColor(c)} label={c} />
          ))}
        </View>

        <FieldLabel>{t('routineEditor.steps')}</FieldLabel>
        <View style={{ gap: 10 }}>
          {steps.map((d, i) => {
            const sym = stepSymbol(d.step, buttons);
            return (
              <View key={d.step.id} style={[styles.stepRow, { backgroundColor: theme.colors.surface, borderColor: theme.highContrast ? theme.colors.text : 'transparent' }, softShadow(theme, 1)]}>
                <AppText variant="label" muted style={{ width: 22, textAlign: 'center' }}>
                  {i + 1}
                </AppText>
                <Pressable onPress={() => setSymbolFor(d.step.id)} accessibilityRole="button" accessibilityLabel={t('routineEditor.stepPicture')} style={[styles.stepSym, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}>
                  {sym.symbol || sym.photo ? <SymbolImage symbol={sym.symbol} photo={sym.photo} size={40} /> : <AppText muted>+</AppText>}
                </Pressable>
                <View style={{ flex: 1 }}>
                  <TextField
                    value={d.text}
                    onChangeText={(v) => setSteps((list) => list.map((x) => (x.step.id === d.step.id ? { ...x, text: v } : x)))}
                    placeholder={t('routineEditor.stepPlaceholder')}
                    accessibilityLabel={`${t('routineEditor.stepLabel')} ${i + 1}`}
                    maxLength={80}
                    style={{ minHeight: 46 }}
                  />
                </View>
                <View style={{ gap: 4 }}>
                  <IconButton icon="arrow-up" label={t('common.moveUp')} size={32} variant="soft" disabled={i === 0} onPress={() => move(i, -1)} />
                  <IconButton icon="arrow-down" label={t('common.moveDown')} size={32} variant="soft" disabled={i === steps.length - 1} onPress={() => move(i, 1)} />
                </View>
                <IconButton icon="close" label={t('routineEditor.removeStep')} size={34} variant="soft" onPress={() => setSteps((list) => list.filter((x) => x.step.id !== d.step.id))} />
              </View>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          <PushButton title={t('routineEditor.addStep')} icon="add" variant="soft" size="md" onPress={() => setSteps((l) => [...l, blankStep()])} />
          <PushButton title={t('buttonPicker.title')} icon="grid-outline" variant="surface" size="md" onPress={() => setPickButtons(true)} />
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 14, borderTopColor: theme.colors.border }]}>
        <PushButton title={t('routineEditor.save')} icon="checkmark" full onPress={save} style={{ maxWidth: 680, alignSelf: 'center', width: '100%' }} />
      </View>

      <SymbolPicker
        visible={!!symbolFor}
        onClose={() => setSymbolFor(null)}
        onPick={(sid) => {
          if (symbolFor === 'routine') setSymbol(sid);
          else setSteps((list) => list.map((x) => (x.step.id === symbolFor ? { ...x, step: { ...x.step, symbol: sid, photo: null } } : x)));
        }}
      />
      <ButtonPicker
        visible={pickButtons}
        onClose={() => setPickButtons(false)}
        multiple
        onDone={(ids) =>
          setSteps((list) => [
            ...list,
            ...ids.map((bid) => {
              const text = stepLabel({ ...blankStep().step, buttonId: bid, label: null }, buttons);
              return { step: { ...blankStep().step, buttonId: bid, label: null }, text, original: text };
            }),
          ])
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 8 },
  bigSym: { width: 84, height: 84, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: RADIUS.lg, borderWidth: 2 },
  stepSym: { width: 54, height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  footer: { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1 },
});
