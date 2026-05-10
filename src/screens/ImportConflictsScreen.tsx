import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import { GradientBackground } from '@/components/GradientBackground';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useApp } from '@/contexts/AppContext';
import { ConflictItem, ConflictResolution, getImportData, setImportData } from '@/utils/importState';
import { executeImport } from '@/utils/importJournal';
import { Session } from '@/db/sessions';
import { formatDuration } from '@/utils/formatters';
import { JournalStackParamList } from '@/navigation/types';
import { i18n } from '@/i18n';

type Nav = StackNavigationProp<JournalStackParamList, 'ImportConflicts'>;

interface FieldDiff {
  field: string;
  existing: string;
  incoming: string;
}

function computeDiff(existing: Session, incoming: Session): FieldDiff[] {
  const diffs: FieldDiff[] = [];
  if (existing.duration_seconds !== incoming.duration_seconds) {
    diffs.push({
      field: i18n.t('journalDetail.duration'),
      existing: formatDuration(existing.duration_seconds),
      incoming: formatDuration(incoming.duration_seconds),
    });
  }
  if ((existing.preset_name ?? '') !== (incoming.preset_name ?? '')) {
    diffs.push({
      field: i18n.t('journalDetail.preset'),
      existing: existing.preset_name ?? '—',
      incoming: incoming.preset_name ?? '—',
    });
  }
  if ((existing.intention ?? '') !== (incoming.intention ?? '')) {
    diffs.push({
      field: i18n.t('journalDetail.intention'),
      existing: existing.intention ?? '—',
      incoming: incoming.intention ?? '—',
    });
  }
  if ((existing.journal_entry ?? '') !== (incoming.journal_entry ?? '')) {
    diffs.push({
      field: i18n.t('journalDetail.notes'),
      existing: existing.journal_entry ?? '—',
      incoming: incoming.journal_entry ?? '—',
    });
  }
  return diffs;
}

export function ImportConflictsScreen() {
  const { colors } = useApp();
  const navigation = useNavigation<Nav>();
  const importData = getImportData()!;

  const [resolutions, setResolutions] = useState<ConflictResolution[]>(
    importData.conflicts.map(c => c.resolution)
  );
  const [loading, setLoading] = useState(false);

  const setAll = (res: ConflictResolution) => {
    setResolutions(importData.conflicts.map(() => res));
  };

  const toggle = (index: number) => {
    setResolutions(prev =>
      prev.map((r, i) => (i === index ? (r === 'skip' ? 'replace' : 'skip') : r))
    );
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const updatedData = {
        ...importData,
        conflicts: importData.conflicts.map((c, i) => ({ ...c, resolution: resolutions[i] })),
      };
      setImportData(updatedData);
      const stats = await executeImport(updatedData);
      navigation.dispatch(StackActions.replace('ImportSummary', stats));
    } finally {
      setLoading(false);
    }
  };

  const renderConflict = ({ item, index }: { item: ConflictItem; index: number }) => {
    const diffs = computeDiff(item.existing, item.incoming);
    const isReplace = resolutions[index] === 'replace';

    return (
      <View style={[styles.conflictCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.conflictHeader}>
          <ThemedText style={{ fontWeight: '600', fontSize: 15 }}>
            {item.existing.date}
          </ThemedText>
          <View style={[styles.toggle, { borderColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                !isReplace && { backgroundColor: colors.primary },
              ]}
              onPress={() => toggle(index)}
            >
              <ThemedText style={{ fontSize: 13, color: !isReplace ? '#fff' : colors.textSecondary, fontWeight: '600' }}>
                {i18n.t('import.skip')}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                isReplace && { backgroundColor: colors.primary },
              ]}
              onPress={() => toggle(index)}
            >
              <ThemedText style={{ fontSize: 13, color: isReplace ? '#fff' : colors.textSecondary, fontWeight: '600' }}>
                {i18n.t('import.replace')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {diffs.map(diff => (
          <View key={diff.field} style={[styles.diffBlock, { borderColor: colors.border }]}>
            <ThemedText secondary style={styles.diffField}>{diff.field}</ThemedText>
            <View style={styles.diffRow}>
              <ThemedText secondary style={styles.diffLabel}>{i18n.t('import.existing')}</ThemedText>
              <ThemedText style={[styles.diffValue, { color: colors.textSecondary }]} numberOfLines={2}>
                {diff.existing}
              </ThemedText>
            </View>
            <View style={styles.diffRow}>
              <ThemedText secondary style={styles.diffLabel}>{i18n.t('import.incoming')}</ThemedText>
              <ThemedText style={[styles.diffValue, { color: colors.textPrimary }]} numberOfLines={2}>
                {diff.incoming}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText
            style={{ color: colors.primary, fontSize: 16 }}
            onPress={() => navigation.goBack()}
          >
            {i18n.t('common.back')}
          </ThemedText>
          <ThemedText variant="subtitle">
            {i18n.t('import.conflictsTitle')} ({importData.conflicts.length})
          </ThemedText>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.bulkRow}>
          <TouchableOpacity
            style={[styles.bulkBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => setAll('skip')}
          >
            <ThemedText style={{ fontSize: 13, color: colors.primary, fontWeight: '600' }}>
              {i18n.t('import.skipAll')}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bulkBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => setAll('replace')}
          >
            <ThemedText style={{ fontSize: 13, color: colors.primary, fontWeight: '600' }}>
              {i18n.t('import.replaceAll')}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <FlatList
          data={importData.conflicts}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderConflict}
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <Button
            label={i18n.t('import.confirm')}
            onPress={handleConfirm}
            loading={loading}
            disabled={loading}
          />
        </View>
      </View>
    </GradientBackground>
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
    paddingBottom: 12,
  },
  bulkRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  bulkBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  conflictCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  conflictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggle: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  toggleOption: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  diffBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    gap: 4,
  },
  diffField: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  diffRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  diffLabel: {
    fontSize: 12,
    width: 52,
    paddingTop: 1,
  },
  diffValue: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    paddingBottom: 32,
    paddingTop: 8,
  },
});
