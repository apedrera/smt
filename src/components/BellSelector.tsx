import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { Audio } from 'expo-av';
import { useApp } from '@/contexts/AppContext';
import { i18n } from '@/i18n';

const BELL_SOURCES: Record<string, ReturnType<typeof require>> = {
  bell_1: require('../../assets/audio/bell_1.mp3'),
  bell_2: require('../../assets/audio/bell_2.mp3'),
  bell_3: require('../../assets/audio/bell_3.mp3'),
  bell_4: require('../../assets/audio/bell_4.mp3'),
  bell_5: require('../../assets/audio/bell_5.mp3'),
  bell_6: require('../../assets/audio/bell_6.mp3'),
  bell_7: require('../../assets/audio/bell_7.mp3'),
  bell_8: require('../../assets/audio/bell_8.mp3'),
  bell_9: require('../../assets/audio/bell_9.mp3'),
};

const BELL_OPTIONS: Array<{ id: string | null; labelKey: string }> = [
  { id: null,     labelKey: 'presetForm.noBell' },
  { id: 'bell_1', labelKey: 'presetForm.bell1' },
  { id: 'bell_2', labelKey: 'presetForm.bell2' },
  { id: 'bell_3', labelKey: 'presetForm.bell3' },
  { id: 'bell_4', labelKey: 'presetForm.bell4' },
  { id: 'bell_5', labelKey: 'presetForm.bell5' },
  { id: 'bell_6', labelKey: 'presetForm.bell6' },
  { id: 'bell_7', labelKey: 'presetForm.bell7' },
  { id: 'bell_8', labelKey: 'presetForm.bell8' },
  { id: 'bell_9', labelKey: 'presetForm.bell9' },
];

interface BellSelectorProps {
  selected: string | null;
  onChange: (bellId: string | null) => void;
}

export function BellSelector({ selected, onChange }: BellSelectorProps) {
  const { colors } = useApp();
  const soundRef = useRef<Audio.Sound | null>(null);

  const currentIndex = BELL_OPTIONS.findIndex(o => o.id === selected);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const current = BELL_OPTIONS[safeIndex];

  // Stop and unload current sound
  const stopCurrent = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
  };

  // Stop sound when component unmounts
  useEffect(() => {
    return () => { stopCurrent(); };
  }, []);

  const navigate = async (newIndex: number) => {
    const newBell = BELL_OPTIONS[newIndex];
    onChange(newBell.id);

    await stopCurrent();

    if (newBell.id) {
      try {
        const { sound } = await Audio.Sound.createAsync(
          BELL_SOURCES[newBell.id],
          { shouldPlay: true, volume: 0.8 }
        );
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate(status => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync().catch(() => {});
            soundRef.current = null;
          }
        });
      } catch {}
    }
  };

  const prev = () => {
    const newIndex = safeIndex === 0 ? BELL_OPTIONS.length - 1 : safeIndex - 1;
    navigate(newIndex);
  };

  const next = () => {
    const newIndex = safeIndex === BELL_OPTIONS.length - 1 ? 0 : safeIndex + 1;
    navigate(newIndex);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity onPress={prev} style={styles.arrowBtn} activeOpacity={0.6}>
        <Text style={[styles.arrowText, { color: colors.primary }]}>‹</Text>
      </TouchableOpacity>

      <View style={styles.label}>
        <Text style={[styles.labelText, { color: colors.textPrimary }]}>
          {i18n.t(current.labelKey)}
        </Text>
        <Text style={[styles.counter, { color: colors.textSecondary }]}>
          {safeIndex + 1} / {BELL_OPTIONS.length}
        </Text>
      </View>

      <TouchableOpacity onPress={next} style={styles.arrowBtn} activeOpacity={0.6}>
        <Text style={[styles.arrowText, { color: colors.primary }]}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  arrowBtn: {
    width: 56,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '300',
  },
  label: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  labelText: {
    fontSize: 15,
    fontWeight: '500',
  },
  counter: {
    fontSize: 11,
    marginTop: 2,
  },
});
