import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useApp } from '@/contexts/AppContext';
import { GradientBackground } from '@/components/GradientBackground';
import { ThemedText } from '@/components/ThemedText';
import { initLocale } from '@/i18n';
import { i18n } from '@/i18n';

type ThemeMode = 'system' | 'light' | 'dark';

export function SettingsScreen() {
  const { colors, settings, updateSettings } = useApp();
  const navigation = useNavigation();

  const setLanguage = async (locale: string | null) => {
    initLocale(locale);
    await updateSettings({ locale });
  };

  const setTheme = async (mode: ThemeMode) => {
    await updateSettings({ themeMode: mode });
  };

  const OptionRow = ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[
        styles.option,
        {
          backgroundColor: active ? colors.primary : colors.surface,
          borderColor: active ? colors.primary : colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <ThemedText
        style={{
          color: active ? '#FFF' : colors.textPrimary,
          fontWeight: active ? '600' : '400',
          fontSize: 15,
        }}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.hamburger}
          >
            <View style={[styles.hLine, { backgroundColor: colors.textPrimary }]} />
            <View style={[styles.hLine, { backgroundColor: colors.textPrimary }]} />
            <View style={[styles.hLine, { backgroundColor: colors.textPrimary }]} />
          </TouchableOpacity>
          <ThemedText variant="subtitle">{i18n.t('settings.title')}</ThemedText>
          <View style={{ width: 36 }} />
        </View>

        {/* Language */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ThemedText secondary style={styles.sectionTitle}>
            {i18n.t('settings.language')}
          </ThemedText>
          <View style={styles.optionRow}>
            <OptionRow
              label="English"
              active={!settings.locale || settings.locale === 'en'}
              onPress={() => setLanguage('en')}
            />
            <OptionRow
              label="Español"
              active={settings.locale === 'es'}
              onPress={() => setLanguage('es')}
            />
          </View>
        </View>

        {/* Appearance */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ThemedText secondary style={styles.sectionTitle}>
            {i18n.t('settings.appearance')}
          </ThemedText>
          <View style={styles.optionRow}>
            <OptionRow
              label={i18n.t('settings.themeSystem')}
              active={settings.themeMode === 'system'}
              onPress={() => setTheme('system')}
            />
            <OptionRow
              label={i18n.t('settings.themeLight')}
              active={settings.themeMode === 'light'}
              onPress={() => setTheme('light')}
            />
            <OptionRow
              label={i18n.t('settings.themeDark')}
              active={settings.themeMode === 'dark'}
              onPress={() => setTheme('dark')}
            />
          </View>
        </View>

        {/* Manage Presets */}
        <TouchableOpacity
          style={[styles.linkRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Presets' as never)}
          activeOpacity={0.75}
        >
          <ThemedText style={{ fontSize: 16 }}>{i18n.t('settings.managePresets')}</ThemedText>
          <ThemedText secondary style={{ fontSize: 18 }}>›</ThemedText>
        </TouchableOpacity>

        {/* Google Drive - disabled */}
        <View style={[styles.linkRow, { backgroundColor: colors.surface, borderColor: colors.border, opacity: 0.5 }]}>
          <View>
            <ThemedText style={{ fontSize: 16 }}>{i18n.t('settings.googleDrive')}</ThemedText>
            <ThemedText secondary style={{ fontSize: 13 }}>{i18n.t('settings.comingSoon')}</ThemedText>
          </View>
          <ThemedText secondary style={{ fontSize: 18 }}>›</ThemedText>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 8,
  },
  hamburger: {
    gap: 5,
    paddingVertical: 4,
  },
  hLine: {
    height: 2,
    width: 24,
    borderRadius: 2,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  option: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  linkRow: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
