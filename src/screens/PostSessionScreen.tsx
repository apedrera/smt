import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '@/contexts/AppContext';
import { GradientBackground } from '@/components/GradientBackground';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { getSessionById, updateSession, deleteSession, Session } from '@/db/sessions';
import { formatDuration } from '@/utils/formatters';
import { HomeStackParamList } from '@/navigation/types';
import { i18n } from '@/i18n';

type PostRoute = RouteProp<HomeStackParamList, 'PostSession'>;
type PostNav = StackNavigationProp<HomeStackParamList, 'PostSession'>;

export function PostSessionScreen() {
  const { colors } = useApp();
  const navigation = useNavigation<PostNav>();
  const route = useRoute<PostRoute>();
  const { sessionId } = route.params;

  const [session, setSession] = useState<Session | null>(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sessionId) {
      getSessionById(sessionId).then(s => {
        if (s) {
          setSession(s);
          setJournalEntry(s.journal_entry ?? '');
        }
      });
    }
  }, [sessionId]);

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);
    try {
      await updateSession(session.id, { journal_entry: journalEntry.trim() || null });
      navigation.popToTop();
    } catch (e) {
      console.warn('Failed to save journal:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      i18n.t('common.confirm'),
      i18n.t('postSession.discardConfirm'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.discard'),
          style: 'destructive',
          onPress: async () => {
            if (session) await deleteSession(session.id);
            navigation.popToTop();
          },
        },
      ]
    );
  };

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={[styles.checkCircle, { borderColor: colors.primary }]}>
            <ThemedText style={{ fontSize: 36 }}>✓</ThemedText>
          </View>

          <ThemedText variant="title" style={styles.title}>
            {i18n.t('postSession.title')}
          </ThemedText>

          <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.statRow}>
              <ThemedText secondary>{i18n.t('postSession.duration')}</ThemedText>
              <ThemedText style={{ fontWeight: '600' }}>
                {session
                  ? formatDuration(session.duration_seconds)
                  : '—'}
              </ThemedText>
            </View>
            {session?.preset_name && (
              <View style={[styles.statRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
                <ThemedText secondary>{i18n.t('postSession.preset')}</ThemedText>
                <ThemedText style={{ fontWeight: '600' }}>
                  {session.preset_name}
                </ThemedText>
              </View>
            )}
            {session?.intention && (
              <View style={[styles.statRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
                <ThemedText secondary>{i18n.t('intention.title')}</ThemedText>
                <ThemedText style={{ flex: 1, textAlign: 'right', marginLeft: 16 }}>
                  {session.intention}
                </ThemedText>
              </View>
            )}
          </View>

          <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
            {i18n.t('postSession.journalEntry')}
          </ThemedText>
          <TextInput
            style={[
              styles.journalInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
            placeholder={i18n.t('postSession.journalPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            multiline
            value={journalEntry}
            onChangeText={setJournalEntry}
            textAlignVertical="top"
          />

          <Button
            label={i18n.t('postSession.saveToJournal')}
            onPress={handleSave}
            loading={saving}
            style={styles.saveBtn}
          />
          <Button
            label={i18n.t('postSession.discardSession')}
            variant="ghost"
            onPress={handleDiscard}
          />
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 16,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
  },
  statsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  journalInput: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    lineHeight: 24,
  },
  saveBtn: {
    marginTop: 8,
  },
});
