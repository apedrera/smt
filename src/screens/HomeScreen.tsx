import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Text,
  Image,
} from 'react-native';
import { GradientBackground } from '@/components/GradientBackground';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '@/contexts/AppContext';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { WheelPicker } from '@/components/WheelPicker';
import { getAllPresets, Preset } from '@/db/presets';
import { HomeStackParamList } from '@/navigation/types';
import { i18n } from '@/i18n';

type HomeNav = StackNavigationProp<HomeStackParamList, 'Home'>;

const MINUTES = Array.from({ length: 121 }, (_, i) => i);

export function HomeScreen() {
  const { colors, isDark } = useApp();
  const navigation = useNavigation<HomeNav>();
  const [showTimedPicker, setShowTimedPicker] = useState(false);
  const [timedMinutes, setTimedMinutes] = useState(20);
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [presets, setPresets] = useState<Preset[]>([]);

  useFocusEffect(
    useCallback(() => {
      getAllPresets().then(setPresets).catch(console.warn);
    }, [])
  );

  const navigateToIntention = (params: {
    durationSeconds: number;
    warmupSeconds: number;
    intervalSeconds: number;
    startingBellId: string | null;
    intervalBellId: string | null;
    endingBellId: string | null;
    presetId: string | null;
    presetName: string | null;
  }) => {
    navigation.navigate('Intention', params);
  };

  const onFree = () => {
    navigateToIntention({
      durationSeconds: 0,
      warmupSeconds: 0,
      intervalSeconds: 0,
      startingBellId: null,
      intervalBellId: null,
      endingBellId: null,
      presetId: null,
      presetName: null,
    });
  };

  const onTimed = () => {
    setShowTimedPicker(true);
  };

  const onTimedConfirm = () => {
    setShowTimedPicker(false);
    navigateToIntention({
      durationSeconds: timedMinutes * 60,
      warmupSeconds: 0,
      intervalSeconds: 0,
      startingBellId: 'bell_1',
      intervalBellId: null,
      endingBellId: 'bell_1',
      presetId: null,
      presetName: `${timedMinutes} min`,
    });
  };

  const onPresetSelect = (preset: Preset) => {
    setShowPresetPicker(false);
    navigateToIntention({
      durationSeconds: preset.duration_minutes * 60,
      warmupSeconds: preset.warmup_minutes * 60,
      intervalSeconds: preset.interval_minutes * 60,
      startingBellId: preset.starting_bell_id,
      intervalBellId: preset.interval_bell_id,
      endingBellId: preset.ending_bell_id,
      presetId: preset.id,
      presetName: preset.name,
    });
  };

  const CARDS = [
    { icon: '∞',  label: i18n.t('home.freeMeditation'),  desc: i18n.t('session.free'),   onPress: onFree,                              iconSize: 34, iconColor: '#4A80E4' },
    { icon: '⏱', label: i18n.t('home.timedMeditation'), desc: i18n.t('session.manual'), onPress: onTimed,                             iconSize: 32 },
    { icon: '◎',  label: i18n.t('home.selectPreset'),    desc: presets.length > 0 ? `${presets.length} presets` : i18n.t('presets.empty'), onPress: () => setShowPresetPicker(true), iconSize: 42 },
    { icon: '📖', label: i18n.t('home.viewJournal'),     desc: i18n.t('journal.title'),  onPress: () => navigation.getParent()?.navigate('JournalStack') },
  ];

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.hamburger}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <View style={[styles.hamburgerLine, { backgroundColor: colors.textPrimary }]} />
            <View style={[styles.hamburgerLine, { backgroundColor: colors.textPrimary }]} />
            <View style={[styles.hamburgerLine, { backgroundColor: colors.textPrimary }]} />
          </TouchableOpacity>
        </View>

        {/* Logo */}
        <View style={styles.logoArea}>
          <Image source={isDark ? require('../../assets/logo-light.png') : require('../../assets/logo.png')} style={{ width: 160, height: 160 }} resizeMode="contain" />
        </View>

        {/* Main options */}
        <View style={styles.options}>
          {CARDS.map(card => (
            <TouchableOpacity
              key={card.label}
              style={[styles.card, { backgroundColor: colors.surface + 'E8', borderColor: colors.border }]}
              onPress={card.onPress}
              activeOpacity={0.8}
            >
              <Text style={[styles.cardIcon, { color: card.iconColor ?? colors.primary, fontSize: card.iconSize ?? 24 }]}>{card.icon}</Text>
              <View style={styles.cardText}>
                <ThemedText style={{ fontWeight: '600', fontSize: 16 }}>{card.label}</ThemedText>
                <ThemedText secondary style={styles.cardDesc}>{card.desc}</ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Donation CTA */}
        <TouchableOpacity
          style={[styles.donationCard, { backgroundColor: colors.primary }]}
          onPress={() => navigation.getParent()?.navigate('Donations')}
          activeOpacity={0.85}
        >
          <Text style={styles.donationIcon}>💚</Text>
          <View style={styles.donationBody}>
            <ThemedText style={styles.donationTitle}>{i18n.t('home.donate')}</ThemedText>
            <ThemedText style={styles.donationSub}>{i18n.t('home.donationBanner')}</ThemedText>
          </View>
          <ThemedText style={styles.donationArrow}>›</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Timed picker modal */}
      <Modal visible={showTimedPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <ThemedText variant="subtitle" style={styles.modalTitle}>
              {i18n.t('home.timedMeditation')}
            </ThemedText>
            <WheelPicker
              values={MINUTES.slice(1)}
              selectedValue={timedMinutes}
              onChange={setTimedMinutes}
              suffix="min"
            />
            <View style={styles.modalButtons}>
              <Button
                label={i18n.t('common.cancel')}
                variant="ghost"
                onPress={() => setShowTimedPicker(false)}
                style={{ flex: 1 }}
              />
              <Button
                label={i18n.t('common.ok')}
                onPress={onTimedConfirm}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Preset picker modal */}
      <Modal visible={showPresetPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <ThemedText variant="subtitle" style={styles.modalTitle}>
              {i18n.t('home.selectPreset')}
            </ThemedText>
            <FlatList
              data={presets}
              keyExtractor={p => p.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.presetItem, { borderColor: colors.border }]}
                  onPress={() => onPresetSelect(item)}
                >
                  <ThemedText style={{ fontWeight: '500' }}>{item.name}</ThemedText>
                  <ThemedText secondary style={{ fontSize: 13 }}>
                    {item.duration_minutes === 0
                      ? i18n.t('presets.free')
                      : `${item.duration_minutes} ${i18n.t('presets.min')}`}
                    {item.interval_minutes > 0
                      ? ` · ${item.interval_minutes}${i18n.t('presets.min')} intervals`
                      : ''}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
            <View style={styles.modalButtons}>
              <Button
                label={i18n.t('settings.managePresets')}
                variant="secondary"
                onPress={() => {
                  setShowPresetPicker(false);
                  navigation.getParent()?.navigate('Presets');
                }}
                style={{ flex: 1 }}
              />
              <Button
                label={i18n.t('common.cancel')}
                variant="ghost"
                onPress={() => setShowPresetPicker(false)}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 0,
  },
  hamburger: {
    width: 36,
    gap: 5,
    paddingVertical: 4,
  },
  hamburgerLine: {
    height: 2,
    borderRadius: 2,
    width: 24,
  },
  options: {
    gap: 8,
    marginBottom: 16,
  },
  logoArea: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardIcon: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardDesc: {
    fontSize: 12,
  },
  donationCard: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  donationIcon: {
    fontSize: 24,
  },
  donationBody: {
    flex: 1,
    gap: 2,
  },
  donationTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  donationSub: {
    color: '#ffffffaa',
    fontSize: 11,
    lineHeight: 15,
  },
  donationArrow: {
    color: '#ffffffcc',
    fontSize: 24,
    lineHeight: 26,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  presetItem: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
});
