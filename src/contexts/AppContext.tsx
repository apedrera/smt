import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useColorScheme } from 'react-native';
import { useSettings, AppSettings } from '@/hooks/useSettings';
import { ThemeColors, getColors } from '@/theme/colors';
import { initLocale } from '@/i18n';

interface AppContextValue {
  settings: AppSettings;
  isLoaded: boolean;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  colors: ThemeColors;
  isDark: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { settings, isLoaded, updateSettings } = useSettings();
  const systemScheme = useColorScheme();

  const isDark = useMemo(() => {
    if (settings.themeMode === 'dark') return true;
    if (settings.themeMode === 'light') return false;
    return systemScheme === 'dark';
  }, [settings.themeMode, systemScheme]);

  const colors = useMemo(() => getColors(isDark), [isDark]);

  useEffect(() => {
    if (isLoaded) {
      initLocale(settings.locale);
    }
  }, [isLoaded, settings.locale]);

  const value = useMemo(
    () => ({ settings, isLoaded, updateSettings, colors, isDark }),
    [settings, isLoaded, updateSettings, colors, isDark]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
