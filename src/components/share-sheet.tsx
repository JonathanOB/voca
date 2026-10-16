import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from './app-text';
import { NavRow } from './form';
import { Sheet } from './sheet';
import { copyText, shareText, shareToWhatsApp } from '@/services/share';
import { toast } from '@/store/ui-store';

/** "Send this message": WhatsApp, other apps, or copy. */
export function ShareSheet({ text, visible, onClose }: { text: string; visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <Sheet visible={visible} onClose={onClose} title={t('share.title')}>
      <View style={{ gap: 10, paddingBottom: 8 }}>
        <AppText variant="subheading" style={{ marginBottom: 4 }}>
          “{text}”
        </AppText>
        <NavRow
          icon="logo-whatsapp"
          label={t('share.whatsapp')}
          sub={t('share.whatsappSub')}
          onPress={async () => {
            onClose();
            const opened = await shareToWhatsApp(text);
            if (!opened) toast(t('share.noWhatsapp'), { tone: 'info' });
          }}
        />
        <NavRow
          icon="share-outline"
          label={t('share.other')}
          sub={t('share.otherSub')}
          onPress={() => {
            onClose();
            shareText(text);
          }}
        />
        <NavRow
          icon="copy-outline"
          label={t('share.copy')}
          sub={t('share.copySub')}
          onPress={async () => {
            onClose();
            await copyText(text);
            toast(t('share.copied'), { tone: 'success' });
          }}
        />
      </View>
    </Sheet>
  );
}
