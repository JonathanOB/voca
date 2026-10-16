import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { ButtonPicker } from '@/components/button-picker';
import { confirm } from '@/components/dialog';
import { AppText } from '@/components/app-text';
import { FieldLabel, NavRow, TextField, ToggleRow } from '@/components/form';
import { InfoBanner, Screen, SectionHeader } from '@/components/layout';
import { useLabels } from '@/i18n/labels';
import { stdBoardId } from '@/data/standard-content';
import { useApp } from '@/store/app-store';
import { forgetLearned } from '@/services/predict';
import { lockNow, setupPin } from '@/store/lock-store';
import { MAX_QUICK_WORDS } from '@/store/settings';
import { toast } from '@/store/ui-store';
import { LanguagePanel, TapActionPanel } from './panels';

export function GeneralSettings() {
  const L = useLabels();
  const { t } = L;
  const s = useApp(
    useShallow((st) => ({
      userName: st.settings.userName,
      haptics: st.settings.haptics,
      showSentenceBar: st.settings.showSentenceBar,
      clearConfirmAt: st.settings.clearConfirmAt,
      showQuickWords: st.settings.showQuickWords,
      quickWords: st.settings.quickWords,
      pinOn: !!st.settings.pinHash,
      showLanguageButton: st.settings.showLanguageButton,
      wordSuggestions: st.settings.wordSuggestions,
      learnWords: st.settings.learnWords,
    })),
  );
  const buttons = useApp((st) => st.buttons);
  const [picking, setPicking] = useState(false);
  const update = useApp.getState().updateSettings;

  return (
    <Screen>
      <SectionHeader title={t('settings.language')} style={{ marginTop: 4 }} />
      <LanguagePanel />
      <View style={{ marginTop: 12 }}>
        <ToggleRow icon="language-outline" label={t('langSwitch.show')} sub={t('langSwitch.showSub')} value={s.showLanguageButton} onChange={(v) => update({ showLanguageButton: v })} />
      </View>

      <SectionHeader title={t('lock.title')} />
      <View style={{ gap: 10 }}>
        <AppText variant="caption" muted>
          {t('lock.explain')}
        </AppText>
        <ToggleRow
          icon="lock-closed-outline"
          label={t('lock.on')}
          sub={s.pinOn ? t('lock.onSub') : t('lock.offSub')}
          value={s.pinOn}
          onChange={async (on) => {
            if (on) {
              if (await setupPin()) toast(t('lock.changed'), { tone: 'success' });
              return;
            }
            const ok = await confirm({ title: t('lock.turnOffTitle'), body: t('lock.turnOffBody'), confirmLabel: t('lock.turnOff'), destructive: true });
            if (ok) update({ pinHash: null });
          }}
        />
        {s.pinOn ? (
          <>
            <NavRow icon="key-outline" label={t('lock.change')} onPress={async () => (await setupPin()) && toast(t('lock.changed'), { tone: 'success' })} />
            <NavRow
              icon="lock-closed"
              label={t('lock.lockNow')}
              onPress={() => {
                lockNow();
                toast(t('lock.lockedNow'));
              }}
            />
          </>
        ) : null}
      </View>

      <FieldLabel>{t('settings.name')}</FieldLabel>
      <TextField value={s.userName} onChangeText={(v) => update({ userName: v.slice(0, 40) })} placeholder={t('settings.namePlaceholder')} accessibilityLabel={t('settings.name')} />

      <SectionHeader title={t('settings.tapAction')} />
      <TapActionPanel />

      <SectionHeader title={t('quickWords.title')} />
      <View style={{ gap: 10 }}>
        <ToggleRow icon="star-outline" label={t('quickWords.title')} sub={t('quickWords.sub')} value={s.showQuickWords} onChange={(v) => update({ showQuickWords: v })} />
        {s.showQuickWords ? (
          <NavRow
            icon="create-outline"
            label={t('quickWords.choose')}
            sub={s.quickWords.map((id) => L.buttonLabel(buttons[id])).filter(Boolean).join(' · ')}
            onPress={() => setPicking(true)}
          />
        ) : null}
      </View>
      <ButtonPicker
        visible={picking}
        onClose={() => setPicking(false)}
        multiple
        max={MAX_QUICK_WORDS}
        initial={s.quickWords}
        title={`${t('quickWords.choose')} · ${t('quickWords.limit')}`}
        preferBoards={[stdBoardId('core'), stdBoardId('requests')]}
        onDone={(ids) => update({ quickWords: ids })}
      />

      <SectionHeader title={t('suggest.title')} />
      <View style={{ gap: 10 }}>
        <ToggleRow icon="sparkles-outline" label={t('suggest.words')} sub={t('suggest.wordsSub')} value={s.wordSuggestions} onChange={(v) => update({ wordSuggestions: v })} />
        <ToggleRow icon="school-outline" label={t('suggest.learn')} sub={t('suggest.learnSub')} value={s.learnWords} onChange={(v) => update({ learnWords: v })} />
        <NavRow
          icon="trash-outline"
          label={t('suggest.forget')}
          onPress={async () => {
            const ok = await confirm({ title: t('suggest.forgetTitle'), confirmLabel: t('common.delete'), destructive: true });
            if (!ok) return;
            await forgetLearned();
            toast(t('suggest.forgotten'), { tone: 'success' });
          }}
        />
        <InfoBanner text={t('suggest.deviceNote')} icon="phone-portrait-outline" />
      </View>

      <View style={{ gap: 10, marginTop: 18 }}>
        <ToggleRow icon="reorder-three-outline" label={t('settings.sentenceBar')} sub={t('settings.sentenceBarSub')} value={s.showSentenceBar} onChange={(v) => update({ showSentenceBar: v })} />
        <ToggleRow icon="shield-checkmark-outline" label={t('settings.clearConfirm')} value={s.clearConfirmAt > 0} onChange={(v) => update({ clearConfirmAt: v ? 4 : 0 })} />
        <ToggleRow icon="phone-portrait-outline" label={t('settings.haptics')} sub={t('settings.hapticsSub')} value={s.haptics} onChange={(v) => update({ haptics: v })} />
        <NavRow icon="apps-outline" label={t('settings.quickActions')} onPress={() => router.push('/quick-actions')} />
        <NavRow icon="school-outline" label={t('guide.settingsLink')} sub={t('guide.settingsLinkSub')} onPress={() => router.push('/about/guide')} />
        <NavRow
          icon="refresh-circle-outline"
          label={t('settings.rerun')}
          sub={t('settings.rerunSub')}
          onPress={async () => {
            const ok = await confirm({ title: t('settings.rerunConfirmTitle'), body: t('settings.rerunConfirmBody'), confirmLabel: t('common.continue') });
            if (ok) update({ onboardingDone: false, onboardingStep: 0 });
          }}
        />
      </View>
    </Screen>
  );
}
