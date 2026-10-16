import { useMemo, useState } from 'react';
import { Platform, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { alertDialog, confirm } from '@/components/dialog';
import { Chip, FieldLabel, NavRow, Segmented, ToggleRow } from '@/components/form';
import { Card, InfoBanner, Screen, SectionHeader } from '@/components/layout';
import { PushButton } from '@/components/push-button';
import type { LibraryData } from '@/db/types';
import { useLabels } from '@/i18n/labels';
import {
  exportBackup,
  exportDatabaseFile,
  pickBackupText,
  restoreMedia,
  restoredSettings,
  validateBackup,
  writeSafetyCopy,
} from '@/services/backup';
import { listMedia } from '@/services/media';
import { buildCardsHtml, printCards, savePdf, type CardSize } from '@/services/print';
import { telemetryAvailable } from '@/services/telemetry';
import { stopSpeaking } from '@/hooks/use-speech';
import { useApp } from '@/store/app-store';
import { useSentence } from '@/store/sentence-store';
import { toast } from '@/store/ui-store';

function currentLibrary(): LibraryData {
  const s = useApp.getState();
  return {
    buttons: Object.values(s.buttons),
    boards: s.boards,
    items: Object.values(s.items).flat(),
    routines: s.routines,
    steps: Object.values(s.steps).flat(),
  };
}

export function DataSettings() {
  const L = useLabels();
  const { t } = L;
  const boards = useApp((s) => s.boards);
  const items = useApp((s) => s.items);
  const consent = useApp((s) => s.settings.telemetryConsent);
  const [busy, setBusy] = useState<string | null>(null);
  const printable = useMemo(() => boards.filter((b) => !b.hidden && (items[b.id]?.length ?? 0) > 0), [boards, items]);
  const [printBoard, setPrintBoard] = useState<string | null>(null);
  const [cardSize, setCardSize] = useState<CardSize>('medium');
  const mediaCount = useMemo(() => {
    try {
      return listMedia().length;
    } catch {
      return 0;
    }
  }, [busy]); // eslint-disable-line react-hooks/exhaustive-deps

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      alertDialog(t('errors.generic'), e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(null);
    }
  };

  const doExport = () =>
    run('export', async () => {
      await exportBackup(useApp.getState().settings, currentLibrary());
      toast(t('settings.data.exported'), { tone: 'success' });
    });

  const doRestore = () =>
    run('restore', async () => {
      const text = await pickBackupText();
      if (!text) return;
      const result = await validateBackup(text);
      if (!result.ok) {
        const msg = result.error === 'newer' ? t('settings.data.newer') : result.error === 'missingMedia' ? t('settings.data.missingMedia') : t('settings.data.invalid');
        return void alertDialog(t('settings.data.restore'), msg);
      }
      const ok = await confirm({
        title: t('settings.data.restoreTitle'),
        body: t('settings.data.restoreBody'),
        confirmLabel: t('settings.data.restoreAction'),
        destructive: true,
      });
      if (!ok) return;
      stopSpeaking();
      const app = useApp.getState();
      await writeSafetyCopy(app.settings, currentLibrary());
      restoreMedia(result.backup);
      await app.replaceEverything(result.backup.data.library, restoredSettings(result.backup, app.settings));
      useSentence.getState().clear();
      toast(t('settings.data.restored'), { tone: 'success' });
    });

  const doStandard = (mode: 'restoreMissing' | 'resetOriginal') =>
    run(mode, async () => {
      if (mode === 'resetOriginal') {
        const ok = await confirm({
          title: t('settings.data.resetConfirmTitle'),
          body: t('settings.data.resetStandardBody'),
          confirmLabel: t('common.reset'),
          destructive: true,
        });
        if (!ok) return;
      }
      await useApp.getState().restoreStandard(mode);
      toast(t('settings.data.restoreDone'), { tone: 'success' });
    });

  const doErase = () =>
    run('erase', async () => {
      const ok = await confirm({
        title: t('settings.data.eraseConfirmTitle'),
        body: t('settings.data.eraseConfirmBody'),
        confirmLabel: t('common.delete'),
        destructive: true,
        requireText: t('settings.data.eraseWord'),
      });
      if (!ok) return;
      stopSpeaking();
      useSentence.getState().clear();
      await useApp.getState().eraseEverything();
      toast(t('settings.data.erased'));
    });

  const doPrint = (pdf: boolean) =>
    run(pdf ? 'pdf' : 'print', async () => {
      const board = printable.find((b) => b.id === (printBoard ?? printable[0]?.id));
      if (!board) return;
      const s = useApp.getState();
      const btns = (s.items[board.id] ?? []).filter((i) => !i.hidden).map((i) => s.buttons[i.buttonId]).filter(Boolean);
      const html = await buildCardsHtml(L.boardName(board), btns, cardSize, s.settings.skinTone, s.settings.colorCoded);
      if (pdf) await savePdf(html, `${L.boardName(board)}.pdf`);
      else await printCards(html);
    });

  const selectedPrint = printBoard ?? printable[0]?.id;

  return (
    <Screen>
      <SectionHeader title={t('settings.data.backupTitle')} style={{ marginTop: 4 }} />
      <Card>
        <AppText muted>{t('settings.data.backupBody')}</AppText>
        <View style={{ gap: 10, marginTop: 14 }}>
          <PushButton title={t('settings.data.export')} icon="download-outline" onPress={doExport} loading={busy === 'export'} full />
          <PushButton title={t('settings.data.restore')} icon="cloud-upload-outline" variant="surface" onPress={doRestore} loading={busy === 'restore'} full />
          {Platform.OS !== 'web' ? (
            <PushButton title={t('settings.data.exportDb')} icon="server-outline" variant="surface" size="md" onPress={() => run('db', exportDatabaseFile)} loading={busy === 'db'} full />
          ) : null}
        </View>
        <AppText variant="caption" muted style={{ marginTop: 10 }}>
          {t('settings.data.storage', { count: mediaCount })}
        </AppText>
      </Card>

      <SectionHeader title={t('settings.data.printTitle')} />
      <Card>
        <AppText muted>{t('settings.data.printBody')}</AppText>
        <FieldLabel>{t('settings.data.printBoard')}</FieldLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {printable.map((b) => (
            <Chip key={b.id} label={L.boardName(b)} selected={selectedPrint === b.id} onPress={() => setPrintBoard(b.id)} />
          ))}
        </View>
        <FieldLabel>{t('settings.data.cardSize')}</FieldLabel>
        <Segmented
          value={cardSize}
          onChange={setCardSize}
          options={[
            { value: 'small', label: t('settings.small') },
            { value: 'medium', label: t('settings.medium') },
            { value: 'large', label: t('settings.large') },
          ]}
        />
        <AppText variant="caption" muted style={{ marginTop: 6 }}>
          {cardSize === 'small' ? t('settings.data.cardSmall') : cardSize === 'medium' ? t('settings.data.cardMedium') : t('settings.data.cardLarge')}
        </AppText>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          <PushButton title={t('settings.data.print')} icon="print-outline" onPress={() => doPrint(false)} loading={busy === 'print'} />
          {Platform.OS !== 'web' ? <PushButton title={t('settings.data.savePdf')} icon="document-outline" variant="surface" onPress={() => doPrint(true)} loading={busy === 'pdf'} /> : null}
        </View>
      </Card>

      <SectionHeader title={t('settings.data.standardTitle')} />
      <View style={{ gap: 10 }}>
        <NavRow icon="sparkles-outline" label={t('settings.data.restoreMissing')} sub={t('settings.data.restoreMissingBody')} onPress={() => doStandard('restoreMissing')} />
        <NavRow icon="refresh-outline" label={t('settings.data.resetStandard')} sub={t('settings.data.resetStandardBody')} onPress={() => doStandard('resetOriginal')} />
      </View>

      <SectionHeader title={t('settings.data.privacyTitle')} />
      {telemetryAvailable() ? (
        <ToggleRow
          icon="stats-chart-outline"
          label={t('settings.data.telemetry')}
          sub={t('settings.data.telemetrySub')}
          value={consent}
          onChange={(v) => useApp.getState().updateSettings({ telemetryConsent: v })}
        />
      ) : (
        <InfoBanner icon="shield-checkmark-outline" text={t('settings.data.telemetryNone')} />
      )}

      <SectionHeader title={t('settings.data.eraseTitle')} />
      <NavRow icon="trash-outline" danger label={t('settings.data.eraseTitle')} sub={t('settings.data.eraseBody')} onPress={doErase} />
    </Screen>
  );
}
