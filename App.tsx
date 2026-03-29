import './src/polyfills';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { AppNavigator } from '@/navigation/AppNavigator';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { LoadingScreen } from '@/components/LoadingScreen';
import { initDatabase } from '@/db/database';

function AppInner() {
  const { settings, isLoaded } = useApp();
  const [dbReady, setDbReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(() => setDbReady(true))
      .catch(e => {
        console.error('DB init failed:', e);
        setDbReady(true);
      });
  }, []);

  useEffect(() => {
    if (isLoaded && !settings.hasSeenOnboarding) {
      setShowOnboarding(true);
    } else if (isLoaded && settings.hasSeenOnboarding) {
      setShowOnboarding(false);
    }
  }, [isLoaded, settings.hasSeenOnboarding]);

  if (!isLoaded || !dbReady) {
    return <LoadingScreen />;
  }

  if (showOnboarding) {
    return <OnboardingScreen onDone={() => setShowOnboarding(false)} />;
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppProvider>
          <AppInner />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
