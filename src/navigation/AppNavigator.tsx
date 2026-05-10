import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { useApp } from '@/contexts/AppContext';
import { DrawerContent } from '@/components/DrawerContent';

import {
  RootDrawerParamList,
  HomeStackParamList,
  JournalStackParamList,
  PresetsStackParamList,
} from './types';

// Screens
import { HomeScreen } from '@/screens/HomeScreen';
import { IntentionScreen } from '@/screens/IntentionScreen';
import { SessionScreen } from '@/screens/SessionScreen';
import { PostSessionScreen } from '@/screens/PostSessionScreen';
import { JournalListScreen } from '@/screens/JournalListScreen';
import { JournalBrowseScreen } from '@/screens/JournalBrowseScreen';
import { JournalDetailScreen } from '@/screens/JournalDetailScreen';
import { ImportPreviewScreen } from '@/screens/ImportPreviewScreen';
import { ImportConflictsScreen } from '@/screens/ImportConflictsScreen';
import { ImportSummaryScreen } from '@/screens/ImportSummaryScreen';
import { PresetsScreen } from '@/screens/PresetsScreen';
import { PresetFormScreen } from '@/screens/PresetFormScreen';
import { StatsScreen } from '@/screens/StatsScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { DonationsScreen } from '@/screens/DonationsScreen';
import { AboutScreen } from '@/screens/AboutScreen';

const Drawer = createDrawerNavigator<RootDrawerParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const JournalStack = createStackNavigator<JournalStackParamList>();
const PresetsStack = createStackNavigator<PresetsStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen
        name="Intention"
        component={IntentionScreen}
        options={{ presentation: 'modal' }}
      />
      <HomeStack.Screen
        name="Session"
        component={SessionScreen}
        options={{ presentation: 'modal' }}
      />
      <HomeStack.Screen
        name="PostSession"
        component={PostSessionScreen}
        options={{ presentation: 'modal' }}
      />
    </HomeStack.Navigator>
  );
}

function JournalStackNavigator() {
  return (
    <JournalStack.Navigator screenOptions={{ headerShown: false }}>
      <JournalStack.Screen name="JournalList" component={JournalListScreen} />
      <JournalStack.Screen name="JournalBrowse" component={JournalBrowseScreen} />
      <JournalStack.Screen name="JournalDetail" component={JournalDetailScreen} />
      <JournalStack.Screen name="ImportPreview" component={ImportPreviewScreen} />
      <JournalStack.Screen name="ImportConflicts" component={ImportConflictsScreen} />
      <JournalStack.Screen name="ImportSummary" component={ImportSummaryScreen} />
    </JournalStack.Navigator>
  );
}

function PresetsStackNavigator() {
  return (
    <PresetsStack.Navigator screenOptions={{ headerShown: false }}>
      <PresetsStack.Screen name="PresetsScreen" component={PresetsScreen} />
      <PresetsStack.Screen name="PresetForm" component={PresetFormScreen} />
    </PresetsStack.Navigator>
  );
}

export function AppNavigator() {
  const { isDark, colors } = useApp();

  const navTheme = isDark
    ? {
        ...DarkTheme,
        colors: { ...DarkTheme.colors, background: colors.background, card: colors.surface },
      }
    : {
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, background: colors.background, card: colors.surface },
      };

  return (
    <NavigationContainer theme={navTheme}>
      <Drawer.Navigator
        drawerContent={props => <DrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerType: 'front',
        }}
      >
        <Drawer.Screen name="HomeStack" component={HomeStackNavigator} />
        <Drawer.Screen name="JournalStack" component={JournalStackNavigator} />
        <Drawer.Screen name="Stats" component={StatsScreen} />
        <Drawer.Screen name="Presets" component={PresetsStackNavigator} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
        <Drawer.Screen name="Donations" component={DonationsScreen} />
        <Drawer.Screen name="About" component={AboutScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
