import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import { GradientBackground } from '@/components/GradientBackground';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useApp } from '@/contexts/AppContext';
import { getImportData } from '@/utils/importState';
import { executeImport } from '@/utils/importJournal';
import { JournalStackParamList } from '@/navigation/types';
import { i18n } from '@/i18n';
import { formatDate } from '@/utils/formatters';

type Nav = StackNavigationProp<JournalStackParamList, 'ImportPreview'>;
type Route = RouteProp<JournalStackParamList, 'ImportPreview'>;

export function ImportPreviewScreen() {
  const { colors, settings } = useApp();
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const [loading, setLoading] = useState(false);

  const locale = settings.locale ?? 'en';
  const { totalCount, newCount, identicalCount, conflictCount, oldestDate, newestDate } = params;

  const handleProceed = async () => {
    if (conflictCount > 0) {
      navigation.navigate('ImportConflicts');
      return;
    }
    setLoading(true);
    try {
      const data = getImportData()!;
      const stats = await executeImport(data);
      navigation.dispatch(
        StackActions.replace('ImportSummary', stats)
      );
    } finally {
      setLoading(false);
    }
  };

  const dateRangeText = () => {
    if (!oldestDate || !newestDate) return null;
    if (oldestDate === newestDate) {
      return formatDate(oldestDate, locale);
    }
    return `${formatDate(oldestDate, locale)} – ${formatDate(newestDate, locale)}`;
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText
            style={{ color: colors.primary, fontSize: 16 }}
            onPress={() => navigation.goBack()}
          >
            {i18n.t('common.cancel')}
          </ThemedText>
          <ThemedText variant="subtitle">{i18n.t('import.previewTitle')}</ThemedText>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ThemedText style={styles.countLabel}>
              {totalCount === 1
                ? i18n.t('import.previewEntry')
                : i18n.t('import.previewEntries', { count: totalCount })}
            </ThemedText>

            {dateRangeText() ? (
              <ThemedText secondary style={styles.dateRange}>
                {dateRangeText()}
              </ThemedText>
            ) : null}
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Row
              label={i18n.t('import.previewNew')}
              value={String(newCount)}
              color={colors.primary}
            />
            {identicalCount > 0 && (
              <Row
                label={i18n.t('import.previewIdentical')}
                value={String(identicalCount)}
                color={colors.textSecondary}
              />
            )}
            {conflictCount > 0 && (
              <Row
                label={i18n.t('import.previewConflicts')}
                value={String(conflictCount)}
                color={colors.danger ?? colors.primary}
              />
            )}
          </View>

          {conflictCount > 0 && (
            <ThemedText secondary style={styles.conflictNote}>
              {i18n.t('import.conflictNote')}
            </ThemedText>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={conflictCount > 0 ? i18n.t('import.reviewConflicts') : i18n.t('import.proceed')}
            onPress={handleProceed}
            loading={loading}
            disabled={loading}
          />
          <Button
            label={i18n.t('common.cancel')}
            variant="ghost"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 10 }}
          />
        </View>
      </View>
    </GradientBackground>
  );
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.row}>
      <ThemedText secondary style={{ fontSize: 15 }}>{label}</ThemedText>
      <ThemedText style={{ fontSize: 15, fontWeight: '600', color }}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 16,
  },
  content: {
    gap: 16,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    gap: 8,
  },
  countLabel: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  dateRange: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  conflictNote: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  footer: {
    paddingBottom: 32,
    paddingTop: 8,
  },
});
