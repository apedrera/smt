import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';

interface GradientBackgroundProps {
  children: React.ReactNode;
}

export function GradientBackground({ children }: GradientBackgroundProps) {
  const { colors, isDark } = useApp();

  const gradientColors: [string, string, string] = isDark
    ? ['#0D1610', '#122B1E', '#1A3D2A']
    : ['#F0F7F2', '#DCF0E6', '#C4E8D4'];

  return (
    <LinearGradient
      colors={gradientColors}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      <View style={[styles.blob, styles.blobTopRight, { backgroundColor: colors.primary + '18' }]} />
      <View style={[styles.blob, styles.blobBottomLeft, { backgroundColor: colors.primary + '12' }]} />
      <View style={[styles.blob, styles.blobCenter, { backgroundColor: colors.accent + '0D' }]} />
      <SafeAreaView style={{ flex: 1 }}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    borderRadius: 9999,
  },
  blobTopRight: {
    width: 280,
    height: 280,
    top: -80,
    right: -80,
  },
  blobBottomLeft: {
    width: 240,
    height: 240,
    bottom: 40,
    left: -100,
  },
  blobCenter: {
    width: 200,
    height: 200,
    top: '40%',
    right: -60,
  },
});
