import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { AppText } from '@/components/app-text';
import { Chip, FieldLabel, NavRow, ToggleRow } from '@/components/form';
import { InfoBanner, Screen, SectionHeader } from '@/components/layout';
import { PushButton } from '@/components/push-button';
import { Tile } from '@/components/tile';
import { stdButtonId } from '@/data/standard-content';
import { useLabels } from '@/i18n/labels';
import { HOLD_CHOICES, REPEAT_CHOICES } from '@/services/touch-calibration';
import { useApp } from '@/store/app-store';
import { useTheme } from '@/theme';

const TRY_KEYS = ['yes', 'no', 'more'];

export function TouchSettings() {
  const theme = useTheme();
  const L = useLabels();
  const { t } = L;
  const s = useApp(useShallow((st) => ({ ignoreRepeatMs: st.settings.ignoreRepeatMs, holdMs: st.settings.holdMs, allowSlips: st.settings.allowSlips, display: st.settings.buttonDisplay })));
  const buttons = useApp((st) => st.buttons);
  const update = useApp.getState().updateSettings;
  const [count, setCount] = useState(0);
  const secs = (ms: number) => t('touch.seconds', { n: (ms / 1000).toLocaleString() });
  const tryButtons = TRY_KEYS.map((k) => buttons[stdButtonId(k)]).filter(Boolean);
  // Three tiles in a row inside the screen padding (16 on phones, 28 on tablets); floor to avoid wrapping.
  const tileW = Math.floor(Math.min(120, (Math.min(theme.width, 720) - (theme.isTablet ? 56 : 32) - 24) / 3 - 1));

  return (
    <Screen>
      <AppText variant="body" muted style={{ marginTop: 4 }}>
        {t('touch.intro')}
      </AppText>
      <View style={{ marginTop: 14 }}>
        <NavRow icon="game-controller-outline" label={t('touch.check')} sub={t('touch.checkSub')} onPress={() => router.push('/touch-check')} />
      </View>

      <FieldLabel hint={t('touch.repeatSub')}>{t('touch.repeat')}</FieldLabel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }} accessibilityRole="radiogroup" accessibilityLabel={t('touch.repeat')}>
        {[0, ...REPEAT_CHOICES].map((ms) => (
          <Chip key={ms} label={ms ? secs(ms) : t('touch.off')} selected={s.ignoreRepeatMs === ms} onPress={() => update({ ignoreRepeatMs: ms })} />
        ))}
      </View>

      <FieldLabel hint={t('touch.holdSub')}>{t('touch.hold')}</FieldLabel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }} accessibilityRole="radiogroup" accessibilityLabel={t('touch.hold')}>
        {[0, ...HOLD_CHOICES].map((ms) => (
          <Chip key={ms} label={ms ? secs(ms) : t('touch.off')} selected={s.holdMs === ms} onPress={() => update({ holdMs: ms })} />
        ))}
      </View>

      <View style={{ marginTop: 18 }}>
        <ToggleRow icon="hand-left-outline" label={t('touch.slips')} sub={t('touch.slipsSub')} value={s.allowSlips} onChange={(v) => update({ allowSlips: v })} />
      </View>

      <SectionHeader title={t('touch.tryTitle')} />
      {s.holdMs > 0 ? (
        <AppText variant="caption" muted style={{ marginBottom: 8 }}>
          {t('touch.holdHint')}
        </AppText>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
        {tryButtons.map((b) => (
          <Tile key={b.id} label={L.buttonLabel(b)} symbol={b.symbol} type={b.type} width={tileW} display={s.display} onPress={() => setCount((c) => c + 1)} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 }}>
        <AppText variant="subheading" accessibilityLiveRegion="polite">
          {t('touch.tryCount', { count })}
        </AppText>
        <PushButton title={t('touch.tryReset')} variant="surface" size="md" onPress={() => setCount(0)} disabled={!count} />
      </View>

      <View style={{ gap: 10, marginTop: 18 }}>
        <NavRow icon="resize-outline" label={t('touch.sizeTip')} onPress={() => router.push('/settings/display')} />
        <InfoBanner text={t('touch.a11yNote')} icon="accessibility-outline" />
      </View>
    </Screen>
  );
}
