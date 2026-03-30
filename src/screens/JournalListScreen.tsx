import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { ConfirmModal } from '@/components/ConfirmModal';
import { GradientBackground } from '@/components/GradientBackground';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { DrawerActions } from '@react-navigation/native';
import { useApp } from '@/contexts/AppContext';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { getAllSessions, Session } from '@/db/sessions';
import { exportAsTxt, exportAsJson, exportAsXlsx } from '@/utils/exportJournal';
import { formatDuration, formatDate, formatTime } from '@/utils/formatters';
import { JournalStackParamList } from '@/navigation/types';
import { i18n } from '@/i18n';

type JournalNav = StackNavigationProp<JournalStackParamList, 'JournalList'>;

export function JournalListScreen() {
  const { colors, settings } = useApp();
  const navigation = useNavigation<JournalNav>();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [exporting, setExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showExportError, setShowExportError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getAllSessions().then(setSessions).catch(console.warn);
    }, [])
  );

  const handleExport = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            i18n.t('export.exportTxt'),
            i18n.t('export.exportJson'),
            i18n.t('export.exportXlsx'),
            i18n.t('common.cancel'),
          ],
          cancelButtonIndex: 3,
          title: i18n.t('export.title'),
        },
        async idx => {
          if (idx === 3) return;
          await doExport(idx);
        }
      );
    } else {
      setShowExportModal(true);
    }
  };

  const doExport = async (idx: number) => {
    setExporting(true);
    try {
      if (idx === 0) await exportAsTxt(sessions);
      else if (idx === 1) await exportAsJson(sessions);
      else if (idx === 2) await exportAsXlsx(sessions);
    } catch {
      setShowExportError(true);
    } finally {
      setExporting(false);
    }
  };

  const renderItem = ({ item, index }: { item: Session; index: number }) => (
    <TouchableOpacity
      style={[styles.row, { borderColor: colors.border, backgroundColor: colors.surface }]}
      onPress={() => navigation.navigate('JournalBrowse', { initialIndex: index })}
      activeOpacity={0.75}
    >
      <View style={styles.rowLeft}>
        <ThemedText style={{ fontWeight: '600', fontSize: 15 }}>
          {formatDate(item.date, settings.locale ?? 'en')}
          {item.start_time ? `  ${formatTime(item.start_time)}` : ''}
        </ThemedText>
        <ThemedText secondary style={{ fontSize: 13 }}>
          {formatDuration(item.duration_seconds)}
          {item.preset_name ? ` · ${item.preset_name}` : ''}
        </ThemedText>
        {(item.intention || item.journal_entry) ? (
          <View>
            {item.intention ? (
              <ThemedText secondary style={{ fontSize: 13, lineHeight: 17 }} numberOfLines={1}>
                <ThemedText secondary style={{ fontSize: 13, fontWeight: '700' }}>{i18n.t('journalDetail.intention')}: </ThemedText>
                {item.intention}
              </ThemedText>
            ) : null}
            {item.journal_entry ? (
              <ThemedText secondary style={{ fontSize: 13, lineHeight: 17 }} numberOfLines={1}>
                <ThemedText secondary style={{ fontSize: 13, fontWeight: '700' }}>{i18n.t('journalDetail.notes')}: </ThemedText>
                {item.journal_entry}
              </ThemedText>
            ) : null}
          </View>
        ) : null}
      </View>
      <ThemedText secondary style={{ fontSize: 20 }}>›</ThemedText>
    </TouchableOpacity>
  );

  const exportOptions = [
    { label: i18n.t('export.exportTxt'), idx: 0 },
    { label: i18n.t('export.exportJson'), idx: 1 },
    { label: i18n.t('export.exportXlsx'), idx: 2 },
  ];

  return (
    <GradientBackground>
      <Modal
        visible={showExportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExportModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowExportModal(false)}
        >
          <Pressable
            style={[styles.modalBox, { backgroundColor: colors.surface }]}
            onPress={() => {}}
          >
            <ThemedText variant="subtitle" style={styles.modalTitle}>
              {i18n.t('export.title')}
            </ThemedText>
            {exportOptions.map(opt => (
              <TouchableOpacity
                key={opt.idx}
                style={[styles.modalOption, { borderTopColor: colors.border }]}
                onPress={async () => {
                  setShowExportModal(false);
                  await doExport(opt.idx);
                }}
              >
                <ThemedText style={{ color: colors.primary, fontSize: 16 }}>
                  {opt.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalCancel, { borderTopColor: colors.border }]}
              onPress={() => setShowExportModal(false)}
            >
              <ThemedText style={{ color: colors.textSecondary, fontSize: 16 }}>
                {i18n.t('common.cancel')}
              </ThemedText>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.hamburger}
          >
            <View style={[styles.hLine, { backgroundColor: colors.textPrimary }]} />
            <View style={[styles.hLine, { backgroundColor: colors.textPrimary }]} />
            <View style={[styles.hLine, { backgroundColor: colors.textPrimary }]} />
          </TouchableOpacity>
          <ThemedText variant="subtitle">{i18n.t('journal.title')}</ThemedText>
          <TouchableOpacity onPress={handleExport} disabled={exporting || sessions.length === 0}>
            <ThemedText style={{ color: colors.primary }}>
              {exporting ? '...' : i18n.t('journal.download')}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {sessions.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText secondary style={{ textAlign: 'center', lineHeight: 24 }}>
              {i18n.t('journal.empty')}
            </ThemedText>
          </View>
        ) : (
          <>
            <ThemedText secondary style={styles.count}>
              {sessions.length}{' '}
              {sessions.length === 1
                ? i18n.t('journal.session')
                : i18n.t('journal.sessions')}
            </ThemedText>
            <FlatList
              data={sessions}
              keyExtractor={s => s.id}
              renderItem={renderItem}
              contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>
      <ConfirmModal
        visible={showExportError}
        title={i18n.t('export.error')}
        message={i18n.t('export.error')}
        confirmLabel={i18n.t('common.ok')}
        onConfirm={() => setShowExportError(false)}
      />
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
    paddingBottom: 16,
  },
  hamburger: {
    gap: 5,
    paddingVertical: 4,
  },
  hLine: {
    height: 2,
    width: 24,
    borderRadius: 2,
  },
  count: {
    fontSize: 13,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  rowLeft: {
    flex: 1,
    gap: 4,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalBox: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalTitle: {
    padding: 20,
    paddingBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    padding: 18,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  modalCancel: {
    padding: 18,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
});
