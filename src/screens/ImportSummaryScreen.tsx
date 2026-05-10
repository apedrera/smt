import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackActions } from '@react-navigation/native';
import { GradientBackground } from '@/components/GradientBackground';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useApp } from '@/contexts/AppContext';
import { clearImportData } from '@/utils/importState';
import { JournalStackParamList } from '@/navigation/types';
import { i18n } from '@/i18n';

type Nav = StackNavigationProp<JournalStackParamList, 'ImportSummary'>;
type Route = RouteProp<JournalStackParamList, 'ImportSummary'>;

export function ImportSummaryScreen() {
  const { colors } = useApp();
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { added, replaced, skipped } = params;

  const handleDone = () => {
    clearImportData();
    navigation.dispatch(StackActions.popToTop());
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText variant="subtitle">{i18n.t('import.summaryTitle')}</ThemedText>
        </View>

        <View style={styles.content}>
          <ThemedText style={styles.checkmark}>✓</ThemedText>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <StatRow
              label={i18n.t('import.summaryAdded')}
              value={added}
              color={colors.primary}
            />
            <StatRow
              label={i18n.t('import.summaryReplaced')}
              value={replaced}
              color={colors.primary}
            />
            <StatRow
              label={i18n.t('import.summarySkipped')}
              value={skipped}
              color={colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Button label={i18n.t('import.done')} onPress={handleDone} />
        </View>
      </View>
    </GradientBackground>
  );
}

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.row}>
      <ThemedText secondary style={{ fontSize: 15 }}>{label}</ThemedText>
      <ThemedText style={{ fontSize: 18, fontWeight: '700', color }}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 64,
    color: '#4CAF50',
    lineHeight: 80,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    gap: 6,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  footer: {
    paddingBottom: 32,
    paddingTop: 8,
  },
});
