import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@smt_settings';

export interface BellSettings {
  startingBellId: string | null;
  endingBellId: string | null;
}

export interface AppSettings {
  locale: string | null;
  themeMode: 'system' | 'light' | 'dark';
  hasSeenOnboarding: boolean;
  freeBells: BellSettings;
  timedBells: BellSettings;
}

const DEFAULT_SETTINGS: AppSettings = {
  locale: null,
  themeMode: 'system',
  hasSeenOnboarding: false,
  freeBells: { startingBellId: null, endingBellId: null },
  timedBells: { startingBellId: 'bell_1', endingBellId: 'bell_1' },
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<AppSettings>;
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }
      } catch (e) {
        console.warn('Failed to load settings:', e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const updateSettings = useCallback(
    async (partial: Partial<AppSettings>) => {
      setSettings(prev => {
        const next = { ...prev, ...partial };
        AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(e =>
          console.warn('Failed to save settings:', e)
        );
        return next;
      });
    },
    []
  );

  return { settings, isLoaded, updateSettings };
}
