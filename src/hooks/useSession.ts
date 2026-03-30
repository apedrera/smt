import { useState, useRef, useEffect, useCallback } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { playBell } from '@/audio/bellManager';

export interface SessionConfig {
  durationSeconds: number;
  warmupSeconds: number;
  intervalSeconds: number;
  startingBellId: string | null;
  intervalBellId: string | null;
  endingBellId: string | null;
  intention: string;
  presetId: string | null;
  presetName: string | null;
}

export interface SessionState {
  phase: 'idle' | 'warmup' | 'running' | 'paused' | 'ended';
  elapsedSeconds: number;
  warmupRemainingSeconds: number;
  targetSeconds: number;
  bellsFired: number;
}

const INITIAL_STATE: SessionState = {
  phase: 'idle',
  elapsedSeconds: 0,
  warmupRemainingSeconds: 0,
  targetSeconds: 0,
  bellsFired: 0,
};

export function useSession() {
  const [state, setState] = useState<SessionState>(INITIAL_STATE);

  const configRef = useRef<SessionConfig | null>(null);
  // Anchor times
  const sessionStartRef = useRef<number | null>(null); // when session (post-warmup) started
  const warmupStartRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedMsRef = useRef<number>(0);
  const bellsFiredRef = useRef<number>(0);
  const nextIntervalAtRef = useRef<number | null>(null); // absolute ms when next interval bell fires
  const endingBellFiredRef = useRef<boolean>(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<SessionState['phase']>('idle');

  const stopTicker = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const computeElapsed = useCallback((): number => {
    if (!sessionStartRef.current) return 0;
    const now = Date.now();
    const pausedExtra = pausedAtRef.current
      ? now - pausedAtRef.current
      : 0;
    return Math.floor(
      (now - sessionStartRef.current - totalPausedMsRef.current - pausedExtra) /
        1000
    );
  }, []);

  const computeWarmupRemaining = useCallback((): number => {
    if (!warmupStartRef.current || !configRef.current) return 0;
    const elapsed = Math.floor(
      (Date.now() - warmupStartRef.current) / 1000
    );
    return Math.max(0, configRef.current.warmupSeconds - elapsed);
  }, []);

  const fireSessionStart = useCallback(async () => {
    const cfg = configRef.current;
    if (!cfg) return;
    // Mark session start
    sessionStartRef.current = Date.now();
    totalPausedMsRef.current = 0;
    endingBellFiredRef.current = false;
    bellsFiredRef.current = 0;
    // Set next interval
    if (cfg.intervalSeconds > 0) {
      nextIntervalAtRef.current =
        sessionStartRef.current + cfg.intervalSeconds * 1000;
    } else {
      nextIntervalAtRef.current = null;
    }
    phaseRef.current = 'running';
    setState(prev => ({
      ...prev,
      phase: 'running',
      elapsedSeconds: 0,
      targetSeconds: cfg.durationSeconds,
      bellsFired: 0,
    }));
    if (cfg.startingBellId) {
      await playBell(cfg.startingBellId);
    }
  }, []);

  const tick = useCallback(async () => {
    const cfg = configRef.current;
    if (!cfg) return;
    const phase = phaseRef.current;

    if (phase === 'warmup') {
      const warmupRemaining = computeWarmupRemaining();
      setState(prev => ({ ...prev, warmupRemainingSeconds: warmupRemaining }));
      if (warmupRemaining <= 0) {
        await fireSessionStart();
      }
      return;
    }

    if (phase === 'running') {
      const elapsed = computeElapsed();
      const now = Date.now();
      let bells = bellsFiredRef.current;

      // Check end first — if session is over, skip interval bell
      const sessionEnded = cfg.durationSeconds > 0 && elapsed >= cfg.durationSeconds;

      // Check interval bells (only if session has not ended)
      if (
        !sessionEnded &&
        cfg.intervalBellId &&
        nextIntervalAtRef.current !== null &&
        now >= nextIntervalAtRef.current
      ) {
        // How many intervals have we passed?
        const sessionStart = sessionStartRef.current!;
        const totalElapsedMs =
          now - sessionStart - totalPausedMsRef.current;
        const intervalMs = cfg.intervalSeconds * 1000;
        const expectedBells = Math.floor(totalElapsedMs / intervalMs);
        if (expectedBells > bellsFiredRef.current) {
          bellsFiredRef.current = expectedBells;
          bells = expectedBells;
          await playBell(cfg.intervalBellId);
          nextIntervalAtRef.current =
            sessionStart +
            totalPausedMsRef.current +
            expectedBells * intervalMs +
            intervalMs;
        }
      }

      // Check end
      if (sessionEnded) {
        if (!endingBellFiredRef.current) {
          endingBellFiredRef.current = true;
          if (cfg.endingBellId) {
            await playBell(cfg.endingBellId);
          }
        }
        setState(prev => ({
          ...prev,
          elapsedSeconds: elapsed,
          bellsFired: bells,
        }));
        // Don't auto-stop; user must press Stop
        return;
      }

      setState(prev => ({
        ...prev,
        elapsedSeconds: elapsed,
        bellsFired: bells,
      }));
      return;
    }
  }, [computeElapsed, computeWarmupRemaining, fireSessionStart]);

  const start = useCallback(
    async (config: SessionConfig) => {
      configRef.current = config;
      await activateKeepAwakeAsync();

      if (config.warmupSeconds > 0) {
        warmupStartRef.current = Date.now();
        phaseRef.current = 'warmup';
        setState({
          phase: 'warmup',
          elapsedSeconds: 0,
          warmupRemainingSeconds: config.warmupSeconds,
          targetSeconds: config.durationSeconds,
          bellsFired: 0,
        });
      } else {
        warmupStartRef.current = null;
        await fireSessionStart();
      }

      tickRef.current = setInterval(tick, 1000);
    },
    [fireSessionStart, tick]
  );

  const pausedFromPhaseRef = useRef<'warmup' | 'running' | null>(null);

  const pause = useCallback(() => {
    const phase = phaseRef.current;
    if (phase !== 'running' && phase !== 'warmup') return;
    pausedFromPhaseRef.current = phase;
    pausedAtRef.current = Date.now();
    phaseRef.current = 'paused';
    stopTicker();
    setState(prev => ({ ...prev, phase: 'paused' }));
  }, [stopTicker]);

  const resume = useCallback(() => {
    if (phaseRef.current !== 'paused') return;
    const resumingFrom = pausedFromPhaseRef.current;
    pausedFromPhaseRef.current = null;

    if (resumingFrom === 'warmup' && warmupStartRef.current) {
      // Shift warmupStart forward by the time spent paused
      const pausedDuration = pausedAtRef.current ? Date.now() - pausedAtRef.current : 0;
      warmupStartRef.current += pausedDuration;
      pausedAtRef.current = null;
      phaseRef.current = 'warmup';
      setState(prev => ({ ...prev, phase: 'warmup' }));
      tickRef.current = setInterval(tick, 1000);
      return;
    }

    if (pausedAtRef.current) {
      totalPausedMsRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    // Recalculate next interval relative to accumulated pauses
    const cfg = configRef.current;
    if (cfg && cfg.intervalSeconds > 0 && sessionStartRef.current) {
      const intervalsAlreadyFired = bellsFiredRef.current;
      nextIntervalAtRef.current =
        sessionStartRef.current +
        totalPausedMsRef.current +
        (intervalsAlreadyFired + 1) * cfg.intervalSeconds * 1000;
    }
    phaseRef.current = 'running';
    setState(prev => ({ ...prev, phase: 'running' }));
    tickRef.current = setInterval(tick, 1000);
  }, [computeElapsed, tick]);

  const stop = useCallback(async () => {
    stopTicker();
    deactivateKeepAwake();
    phaseRef.current = 'ended';
    const elapsed = computeElapsed();
    setState(prev => ({
      ...prev,
      phase: 'ended',
      elapsedSeconds: elapsed,
    }));
  }, [computeElapsed, stopTicker]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopTicker();
      deactivateKeepAwake();
    };
  }, [stopTicker]);

  return { state, start, pause, resume, stop };
}
