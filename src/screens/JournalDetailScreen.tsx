import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { GradientBackground } from '@/components/GradientBackground';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '@/contexts/AppContext';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { ConfirmModal } from '@/components/ConfirmModal';
import { getSessionById, updateSession, deleteSession, Session } from '@/db/sessions';
import { formatDuration, formatDate, formatTime } from '@/utils/formatters';
import { JournalStackParamList } from '@/navigation/types';
import { i18n } from '@/i18n';

type DetailRoute = RouteProp<JournalStackParamList, 'JournalDetail'>;
type DetailNav = StackNavigationProp<JournalStackParamList, 'JournalDetail'>;

export function JournalDetailScreen() {
  const { colors, settings } = useApp();
  const navigation = useNavigation<DetailNav>();
  const route = useRoute<DetailRoute>();
  const { sessionId } = route.params;

  const [session, setSession] = useState<Session | null>(null);
  const [intention, setIntention] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showSaveError, setShowSaveError] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    getSessionById(sessionId).then(s => {
      if (s) {
        setSession(s);
        setIntention(s.intention ?? '');
        setNotes(s.journal_entry ?? '');
      }
    });
  }, [sessionId]);

  const doDelete = async () => {
    setDeleting(true);
    setShowDelete(false);
    try {
      await deleteSession(session!.id);
      navigation.goBack();
    } catch {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);
    try {
      await updateSession(session.id, {
        intention: intention.trim() || null,
        journal_entry: notes.trim() || null,
      });
      navigation.goBack();
    } catch (e) {
      setShowSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  if (!session) return null;

  return (
    <GradientBackground>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ThemedText style={{ color: colors.primary }}>
                ← {i18n.t('common.back')}
              </ThemedText>
            </TouchableOpacity>
            <ThemedText variant="subtitle">{i18n.t('journalDetail.title')}</ThemedText>
            <View style={{ width: 60 }} />
          </View>

          {/* Read-only fields */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.field}>
              <ThemedText secondary style={styles.fieldLabel}>
                {i18n.t('journalDetail.date')}
              </ThemedText>
              <ThemedText style={styles.fieldValue}>
                {formatDate(session.date, settings.locale ?? 'en')}
                {session.start_time ? `  ·  ${formatTime(session.start_time)}` : ''}
              </ThemedText>
            </View>
            <View style={[styles.field, styles.fieldBorder, { borderColor: colors.border }]}>
              <ThemedText secondary style={styles.fieldLabel}>
                {i18n.t('journalDetail.duration')}
              </ThemedText>
              <ThemedText style={styles.fieldValue}>
                {formatDuration(session.duration_seconds)}
              </ThemedText>
            </View>
            {session.preset_name && (
              <View style={[styles.field, styles.fieldBorder, { borderColor: colors.border }]}>
                <ThemedText secondary style={styles.fieldLabel}>
                  {i18n.t('journalDetail.preset')}
                </ThemedText>
                <ThemedText style={styles.fieldValue}>{session.preset_name}</ThemedText>
              </View>
            )}
          </View>

          {/* Editable: Intention */}
          <ThemedText secondary style={styles.sectionLabel}>
            {i18n.t('journalDetail.intention')}
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
            ]}
            placeholder={i18n.t('journalDetail.noIntention')}
            placeholderTextColor={colors.textSecondary}
            value={intention}
            onChangeText={setIntention}
            multiline
            textAlignVertical="top"
            onFocus={() => setTimeout(() => scrollViewRef.current?.scrollTo({ y: 200, animated: true }), 300)}
          />

          {/* Editable: Notes */}
          <ThemedText secondary style={styles.sectionLabel}>
            {i18n.t('journalDetail.notes')}
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.bigInput,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
            ]}
            placeholder={i18n.t('journalDetail.notesPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
            onFocus={() => setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 300)}
          />

          <Button
            label={i18n.t('journalDetail.saveChanges')}
            onPress={handleSave}
            loading={saving}
          />
          <Button
            label={i18n.t('common.deleteEntry')}
            variant="danger"
            onPress={() => setShowDelete(true)}
            loading={deleting}
          />
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showDelete}
        title={i18n.t('common.deleteEntry')}
        message={i18n.t('common.deleteEntryMsg')}
        confirmLabel={i18n.t('common.delete')}
        cancelLabel={i18n.t('common.cancel')}
        destructive
        onConfirm={doDelete}
        onCancel={() => setShowDelete(false)}
      />
      <ConfirmModal
        visible={showSaveError}
        title="Error"
        message="Failed to save changes."
        confirmLabel={i18n.t('common.ok')}
        onConfirm={() => setShowSaveError(false)}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  field: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  fieldBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  fieldLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  fieldValue: {
    fontSize: 15,
  },
  sectionLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 80,
  },
  bigInput: {
    minHeight: 140,
  },
});
