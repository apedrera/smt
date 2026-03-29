import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { GradientBackground } from '@/components/GradientBackground';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '@/contexts/AppContext';
import { ThemedText } from '@/components/ThemedText';
import { getAllSessions, Session } from '@/db/sessions';
import { formatDuration, formatDate, formatTime } from '@/utils/formatters';
import { JournalStackParamList } from '@/navigation/types';
import { i18n } from '@/i18n';

type BrowseNav = StackNavigationProp<JournalStackParamList, 'JournalBrowse'>;
type BrowseRoute = RouteProp<JournalStackParamList, 'JournalBrowse'>;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PAD = 20;
const PAGE_WIDTH = SCREEN_WIDTH - H_PAD * 2;

export function JournalBrowseScreen() {
  const { colors, settings } = useApp();
  const navigation = useNavigation<BrowseNav>();
  const route = useRoute<BrowseRoute>();
  const initialIndex = route.params?.initialIndex ?? 0;
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scrollRef = useRef<ScrollView>(null);
  const didScrollRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      didScrollRef.current = false;
      getAllSessions().then(data => {
        setSessions(data);
        setCurrentIndex(initialIndex);
      }).catch(console.warn);
    }, [initialIndex])
  );

  // Scroll to initialIndex once sessions are loaded
  React.useEffect(() => {
    if (sessions.length > 0 && initialIndex > 0 && !didScrollRef.current) {
      didScrollRef.current = true;
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: initialIndex * PAGE_WIDTH, animated: false });
      }, 50);
    }
  }, [sessions, initialIndex]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / PAGE_WIDTH);
    setCurrentIndex(idx);
  };

  const goTo = (idx: number) => {
    scrollRef.current?.scrollTo({ x: idx * PAGE_WIDTH, animated: true });
    setCurrentIndex(idx);
  };

  if (sessions.length === 0) {
    return (
      <GradientBackground>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ThemedText style={{ color: colors.primary }}>← {i18n.t('common.back')}</ThemedText>
          </TouchableOpacity>
          <View style={styles.empty}>
            <ThemedText secondary style={{ textAlign: 'center' }}>
              {i18n.t('journal.empty')}
            </ThemedText>
          </View>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ThemedText style={{ color: colors.primary }}>← {i18n.t('common.back')}</ThemedText>
          </TouchableOpacity>
          <ThemedText variant="subtitle">{i18n.t('journal.browse')}</ThemedText>
          <ThemedText secondary style={{ fontSize: 14 }}>
            {currentIndex + 1} / {sessions.length}
          </ThemedText>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
          style={{ flex: 1 }}
        >
          {sessions.map(session => (
            <View key={session.id} style={[styles.page, { width: PAGE_WIDTH }]}>
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
                {session.intention && (
                  <View style={[styles.field, styles.fieldBorder, { borderColor: colors.border }]}>
                    <ThemedText secondary style={styles.fieldLabel}>
                      {i18n.t('journalDetail.intention')}
                    </ThemedText>
                    <ThemedText style={styles.fieldValue}>{session.intention}</ThemedText>
                  </View>
                )}
                {session.journal_entry && (
                  <View style={[styles.field, styles.fieldBorder, { borderColor: colors.border }]}>
                    <ThemedText secondary style={styles.fieldLabel}>
                      {i18n.t('journalDetail.notes')}
                    </ThemedText>
                    <ThemedText style={styles.fieldValue}>{session.journal_entry}</ThemedText>
                  </View>
                )}
              </View>

              <View style={styles.nav}>
                <TouchableOpacity
                  style={[
                    styles.navBtn,
                    {
                      backgroundColor: currentIndex > 0 ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => currentIndex > 0 && goTo(currentIndex - 1)}
                  disabled={currentIndex === 0}
                >
                  <ThemedText style={{ color: '#FFF', fontSize: 18 }}>‹</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('JournalDetail', { sessionId: session.id })}
                >
                  <ThemedText style={{ color: colors.primary }}>
                    {i18n.t('common.edit')}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.navBtn,
                    {
                      backgroundColor:
                        currentIndex < sessions.length - 1 ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() =>
                    currentIndex < sessions.length - 1 && goTo(currentIndex + 1)
                  }
                  disabled={currentIndex === sessions.length - 1}
                >
                  <ThemedText style={{ color: '#FFF', fontSize: 18 }}>›</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
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
    paddingBottom: 16,
  },
  backBtn: {
    paddingBottom: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  page: {
    paddingHorizontal: 0,
    paddingBottom: 24,
    gap: 20,
    justifyContent: 'space-between',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    flex: 1,
    marginBottom: 16,
  },
  field: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
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
    fontSize: 16,
    lineHeight: 22,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  navBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
