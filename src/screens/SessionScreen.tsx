import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  BackHandler,
  StatusBar,
} from 'react-native';
import { GradientBackground } from '@/components/GradientBackground';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '@/contexts/AppContext';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useSession } from '@/hooks/useSession';
import { insertSession } from '@/db/sessions';
import { configureBellAudio } from '@/audio/bellManager';
import { formatDurationShort } from '@/utils/formatters';
import { HomeStackParamList } from '@/navigation/types';
import { i18n } from '@/i18n';
import dayjs from 'dayjs';

type SessionRoute = RouteProp<HomeStackParamList, 'Session'>;
type SessionNav = StackNavigationProp<HomeStackParamList, 'Session'>;

export function SessionScreen() {
  const { colors } = useApp();
  const navigation = useNavigation<SessionNav>();
  const route = useRoute<SessionRoute>();
  const params = route.params;
  const { state, start, pause, resume, stop } = useSession();
  const startTimeRef = useRef<string>(new Date().toISOString());
  const sessionIdRef = useRef<string | null>(null);
  const stoppedRef = useRef(false);
  const [showStop, setShowStop] = useState(false);

  useEffect(() => {
    (async () => {
      await configureBellAudio();
      startTimeRef.current = new Date().toISOString();
      await start({
        durationSeconds: params.durationSeconds,
        warmupSeconds: params.warmupSeconds,
        intervalSeconds: params.intervalSeconds,
        startingBellId: params.startingBellId,
        intervalBellId: params.intervalBellId,
        endingBellId: params.endingBellId,
        intention: params.intention,
        presetId: params.presetId,
        presetName: params.presetName,
      });
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When session ends (phase === 'ended'), save and navigate
  useEffect(() => {
    if (state.phase === 'ended' && !stoppedRef.current) {
      stoppedRef.current = true;
      handleSave(state.elapsedSeconds);
    }
  }, [state.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (durationSeconds: number) => {
    try {
      const session = await insertSession({
        date: dayjs(startTimeRef.current).format('YYYY-MM-DD'),
        start_time: startTimeRef.current,
        duration_seconds: durationSeconds,
        preset_id: params.presetId,
        preset_name: params.presetName,
        intention: params.intention || null,
        journal_entry: null,
      });
      sessionIdRef.current = session.id;
      navigation.replace('PostSession', { sessionId: session.id });
    } catch (e) {
      console.warn('Failed to save session:', e);
      navigation.replace('PostSession', { sessionId: '' });
    }
  };

  const doStop = async () => {
    if (stoppedRef.current) return;
    stoppedRef.current = true;
    const elapsed = await stop();
    await handleSave(elapsed);
  };

  const handleStop = () => setShowStop(true);

  // Android back button interception
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      setShowStop(true);
      return true;
    });
    return () => handler.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isWarmup = state.phase === 'warmup';
  const isPaused = state.phase === 'paused';
  const isRunning = state.phase === 'running';

  const remaining =
    params.durationSeconds > 0
      ? Math.max(0, params.durationSeconds - state.elapsedSeconds)
      : null;

  const inWarmup = isWarmup || (isPaused && state.warmupRemainingSeconds > 0);

  return (
    <GradientBackground>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {inWarmup ? (
          <>
            <ThemedText style={[styles.warmupLabel, { color: '#A8D5BA' }]}>
              {i18n.t('session.warmup')}
            </ThemedText>
            <ThemedText variant="timer" style={[styles.timerText, { color: '#FFFFFF' }]}>
              {formatDurationShort(state.warmupRemainingSeconds)}
            </ThemedText>
            <View style={styles.controls}>
              {isPaused ? (
                <Button
                  label={i18n.t('session.resume')}
                  variant="primary"
                  onPress={resume}
                  style={styles.controlBtn}
                />
              ) : (
                <Button
                  label={i18n.t('session.pause')}
                  variant="secondary"
                  onPress={pause}
                  style={styles.controlBtn}
                />
              )}
              <Button
                label={i18n.t('session.stop')}
                variant="danger"
                onPress={handleStop}
                style={styles.controlBtn}
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.timeArea}>
              <ThemedText secondary style={styles.timeLabel}>
                {i18n.t('session.elapsed')}
              </ThemedText>
              <ThemedText variant="timer" style={styles.timerText}>
                {formatDurationShort(state.elapsedSeconds)}
              </ThemedText>

              {remaining !== null && (
                <View style={styles.remainingArea}>
                  <ThemedText secondary style={styles.timeLabel}>
                    {i18n.t('session.remaining')}
                  </ThemedText>
                  <ThemedText variant="subtitle" style={{ color: colors.primary }}>
                    {formatDurationShort(remaining)}
                  </ThemedText>
                </View>
              )}

              {params.presetName && (
                <ThemedText secondary style={styles.presetLabel}>
                  {params.presetName}
                </ThemedText>
              )}
            </View>

            <View style={styles.controls}>
              {isRunning && (
                <Button
                  label={i18n.t('session.pause')}
                  variant="secondary"
                  onPress={pause}
                  style={styles.controlBtn}
                />
              )}
              {isPaused && (
                <Button
                  label={i18n.t('session.resume')}
                  variant="primary"
                  onPress={resume}
                  style={styles.controlBtn}
                />
              )}
              <Button
                label={(remaining === null || remaining === 0) ? i18n.t('session.finish') : i18n.t('session.stop')}
                variant="danger"
                onPress={handleStop}
                style={styles.controlBtn}
              />
            </View>
          </>
        )}
      </View>

      <ConfirmModal
        visible={showStop}
        title={i18n.t('common.stopSession')}
        message={i18n.t('common.stopSessionMsg')}
        confirmLabel={i18n.t('common.yes')}
        cancelLabel={i18n.t('common.no')}
        destructive
        onConfirm={() => { setShowStop(false); doStop(); }}
        onCancel={() => setShowStop(false)}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warmupLabel: {
    fontSize: 18,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 72,
    fontWeight: '200',
    letterSpacing: 2,
  },
  timeArea: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 60,
  },
  timeLabel: {
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  remainingArea: {
    alignItems: 'center',
    gap: 4,
    marginTop: 16,
  },
  presetLabel: {
    fontSize: 14,
    marginTop: 8,
  },
  controls: {
    gap: 14,
    width: '80%',
    marginTop: 48,
  },
  controlBtn: {
    width: '100%',
  },
});
