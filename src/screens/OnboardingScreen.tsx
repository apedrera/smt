import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { GradientBackground } from '@/components/GradientBackground';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { i18n } from '@/i18n';

export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const { colors, isDark, updateSettings } = useApp();

  const handleStart = async () => {
    await updateSettings({ hasSeenOnboarding: true });
    onDone();
  };

  return (
    <GradientBackground>
    <View style={styles.container}>
      <View style={styles.logoArea}>
        <Image source={isDark ? require('../../assets/logo-light.png') : require('../../assets/logo.png')} style={{ width: 220, height: 220 }} resizeMode="contain" />
        <View
          style={[styles.divider, { backgroundColor: colors.accent }]}
        />
        <ThemedText variant="body" secondary style={styles.subtitle}>
          {i18n.t('onboarding.subtitle')}
        </ThemedText>
      </View>
      <Button
        label={i18n.t('onboarding.start')}
        onPress={handleStart}
        style={styles.button}
      />
    </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 60,
  },
  divider: {
    width: 48,
    height: 3,
    borderRadius: 2,
    marginTop: 8,
    marginBottom: 20,
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
  },
  button: {
    minWidth: 220,
  },
});
