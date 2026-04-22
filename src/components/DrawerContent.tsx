import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { useApp } from '@/contexts/AppContext';
import { i18n } from '@/i18n';

interface DrawerItem {
  label: string;
  route: string;
  icon: string;
  iconColor?: string;
  iconSize?: number;
}

export function DrawerContent(props: DrawerContentComponentProps) {
  const { colors } = useApp();
  const { navigation, state } = props;

  const items: DrawerItem[] = [
    { label: i18n.t('home.title'), route: 'HomeStack', icon: '🧘' },
    { label: i18n.t('journal.title'), route: 'JournalStack', icon: '📖' },
    { label: i18n.t('presets.title'), route: 'Presets', icon: '◎', iconColor: colors.primary, iconSize: 40 },
    { label: i18n.t('settings.title'), route: 'Settings', icon: '⚙️' },
    { label: i18n.t('donations.title'), route: 'Donations', icon: '💚' },
    { label: i18n.t('about.title'), route: 'About', icon: 'ℹ️' },
  ];

  const activeRoute = state.routeNames[state.index];

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.surface },
      ]}
    >
      <ScrollView style={styles.nav}>
        {items.map(item => {
          const isActive = activeRoute === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              onPress={() => navigation.navigate(item.route)}
              style={[
                styles.item,
                isActive && {
                  backgroundColor: colors.accent + '40',
                },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.icon, item.iconColor ? { color: item.iconColor, fontSize: item.iconSize ?? styles.icon.fontSize } : undefined]}>{item.icon}</Text>
              <Text
                style={[
                  styles.label,
                  {
                    color: isActive ? colors.primary : colors.textPrimary,
                    fontWeight: isActive ? '600' : '400',
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  nav: {
    paddingTop: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    marginHorizontal: 8,
    marginVertical: 2,
    gap: 14,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 16,
  },
});
