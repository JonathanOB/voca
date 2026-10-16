import Constants from 'expo-constants';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Card, InfoBanner, Screen, SectionHeader } from '@/components/layout';
import { Mascot } from '@/components/mascot';
import { SymbolImage } from '@/components/symbol-image';
import { DISCLAIMER, LAST_UPDATED, LICENCES, PRIVACY, SUPPORT_CONTACT, TERMS, type LegalSection } from '@/data/legal';
import { GUIDE } from '@/data/guide';
import { REF } from '@/data/research';
import { useLabels } from '@/i18n/labels';
import { RADIUS, useTheme } from '@/theme';

export function AboutScreen() {
  const theme = useTheme();
  const { t } = useLabels();
  const version = Constants.expoConfig?.version ?? '1.0.0';
  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: 4, marginBottom: 12 }}>
        <Mascot size={150} />
        <AppText size={44} style={{ fontFamily: theme.fonts.logo, lineHeight: 52 }}>
          {t('about.title')}
        </AppText>
        <AppText variant="caption" muted>
          {t('about.by')} · {t('about.version', { version })}
        </AppText>
      </View>
      <Card>
        <AppText>{t('about.description')}</AppText>
        <AppText muted style={{ marginTop: 10 }}>
          {t('about.madeWith')}
        </AppText>
      </Card>
      <View style={styles.badges}>
        <Badge emoji="🩺" text={t('about.notMedical')} />
        <Badge emoji="🚨" text={t('about.notEmergency')} />
      </View>
      <SectionHeader title={t('about.disclaimerTitle')} />
      <Card>
        <AppText>{DISCLAIMER}</AppText>
      </Card>
      <SectionHeader title={t('about.contact')} />
      <AppText muted selectable>
        {SUPPORT_CONTACT}
      </AppText>
      <View style={{ marginTop: 16 }}>
        <InfoBanner text={t('about.englishOnly')} />
      </View>
    </Screen>
  );
}

function Badge({ emoji, text }: { emoji: string; text: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <SymbolImage emoji={emoji} size={28} />
      <AppText variant="label">{text}</AppText>
    </View>
  );
}

function Sections({ sections }: { sections: LegalSection[] }) {
  return (
    <View style={{ gap: 12 }}>
      {sections.map((s) => (
        <Card key={s.heading}>
          <AppText variant="subheading" accessibilityRole="header">
            {s.heading}
          </AppText>
          <AppText style={{ marginTop: 6 }}>{s.body}</AppText>
        </Card>
      ))}
    </View>
  );
}

export function PrivacyScreen() {
  const { t } = useLabels();
  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header">
        {t('about.privacyTitle')}
      </AppText>
      <AppText variant="caption" muted style={{ marginBottom: 14 }}>
        {LAST_UPDATED}
      </AppText>
      <Sections sections={PRIVACY} />
    </Screen>
  );
}

export function LegalScreen() {
  const { t } = useLabels();
  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header">
        {t('about.termsTitle')}
      </AppText>
      <AppText variant="caption" muted style={{ marginBottom: 14 }}>
        {LAST_UPDATED}
      </AppText>
      <Sections sections={TERMS} />
      <SectionHeader title={t('about.disclaimerTitle')} />
      <Card>
        <AppText>{DISCLAIMER}</AppText>
      </Card>
    </Screen>
  );
}

export function GuideScreen() {
  const theme = useTheme();
  const { t } = useLabels();
  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header">
        {t('guide.title')}
      </AppText>
      <AppText muted style={{ marginTop: 4, marginBottom: 16 }}>
        {t('guide.intro')}
      </AppText>
      <View style={{ gap: 14 }}>
        {GUIDE.map((g) => (
          <Card key={g.title}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <SymbolImage emoji={g.emoji} size={40} />
              <AppText variant="heading" style={{ flex: 1 }} accessibilityRole="header">
                {g.title}
              </AppText>
            </View>
            <AppText variant="label" color={theme.colors.primary} style={{ marginTop: 12 }}>
              {t('guide.research')}
            </AppText>
            <AppText style={{ marginTop: 4 }}>{g.research}</AppText>
            <AppText variant="label" color={theme.colors.primary} style={{ marginTop: 12 }}>
              {t('guide.tryThis')}
            </AppText>
            {g.tryThis.map((tip) => (
              <View key={tip} style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <AppText>•</AppText>
                <AppText style={{ flex: 1 }}>{tip}</AppText>
              </View>
            ))}
            <View style={[styles.inVoca, { backgroundColor: theme.colors.primarySoft }]}>
              <SymbolImage emoji="✨" size={22} />
              <AppText variant="caption" style={{ flex: 1 }}>
                <AppText variant="caption" weight="heavy">
                  {t('guide.inVoca')}:{' '}
                </AppText>
                {g.inVoca}
              </AppText>
            </View>
            <AppText variant="tiny" muted style={{ marginTop: 12 }}>
              {t('guide.sources')}
            </AppText>
            {g.references.map((r) => (
              <Pressable key={r.url} onPress={() => Linking.openURL(r.url)} accessibilityRole="link" accessibilityLabel={r.citation} hitSlop={4}>
                <AppText variant="tiny" color={theme.colors.primary} style={{ marginTop: 4 }}>
                  {r.citation}
                </AppText>
              </Pressable>
            ))}
          </Card>
        ))}
      </View>
      <View style={{ marginTop: 16 }}>
        <InfoBanner text={t('info.notClinical')} icon="medkit-outline" />
      </View>
    </Screen>
  );
}

export function CreditsScreen() {
  const theme = useTheme();
  const L = useLabels();
  const { t } = L;
  const refs = Object.values(REF).sort((a, b) => a.citation.localeCompare(b.citation));
  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header">
        {t('about.licencesTitle')}
      </AppText>
      <View style={{ gap: 10, marginTop: 14 }}>
        {LICENCES.map((l) => (
          <Card key={l.name}>
            <AppText variant="subheading">{l.name}</AppText>
            <AppText variant="caption" color={theme.colors.primary}>
              {l.licence}
            </AppText>
            <AppText variant="caption" muted style={{ marginTop: 4 }}>
              {l.note}
            </AppText>
          </Card>
        ))}
      </View>
      <SectionHeader title={t('about.researchTitle')} />
      <View style={{ gap: 10 }}>
        {refs.map((r) => (
          <Pressable
            key={r.url}
            onPress={() => Linking.openURL(r.url)}
            accessibilityRole="link"
            accessibilityLabel={r.citation}
            style={({ pressed }) => [styles.ref, { backgroundColor: pressed ? theme.colors.primarySoft : theme.colors.surface, borderColor: theme.colors.border }]}
          >
            <AppText variant="caption">{r.citation}</AppText>
            <AppText variant="tiny" color={theme.colors.primary} numberOfLines={1}>
              {r.url}
            </AppText>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.pill, borderWidth: 2 },
  ref: { padding: 14, borderRadius: RADIUS.lg, borderWidth: 2, gap: 4 },
  inVoca: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 12, borderRadius: RADIUS.md, marginTop: 12 },
});
