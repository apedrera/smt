import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { DrawerActions } from '@react-navigation/native';
import { useApp } from '@/contexts/AppContext';
import { GradientBackground } from '@/components/GradientBackground';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { getAllPresets, deletePreset, Preset } from '@/db/presets';
import { PresetsStackParamList } from '@/navigation/types';
import { i18n } from '@/i18n';

type PresetsNav = StackNavigationProp<PresetsStackParamList, 'PresetsScreen'>;

export function PresetsScreen() {
  const { colors } = useApp();
  const navigation = useNavigation<PresetsNav>();
  const [presets, setPresets] = useState<Preset[]>([]);

  useFocusEffect(
    useCallback(() => {
      getAllPresets().then(setPresets).catch(console.warn);
    }, [])
  );

  const handleDelete = (preset: Preset) => {
    Alert.alert(
      i18n.t('common.confirm'),
      i18n.t('presets.deleteConfirm'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await deletePreset(preset.id);
            setPresets(prev => prev.filter(p => p.id !== preset.id));
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Preset }) => (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.rowContent}
        onPress={() => navigation.navigate('PresetForm', { presetId: item.id })}
        activeOpacity={0.75}
      >
        <View style={styles.rowInfo}>
          <View style={styles.rowTitleRow}>
            <ThemedText style={{ fontWeight: '600', fontSize: 15 }}>{item.name}</ThemedText>
            {item.is_default && (
              <View style={[styles.badge, { backgroundColor: colors.accent + '50' }]}>
                <ThemedText style={{ fontSize: 11, color: colors.primary }}>
                  {i18n.t('presets.default')}
                </ThemedText>
              </View>
            )}
          </View>
          <ThemedText secondary style={{ fontSize: 13 }}>
            {item.duration_minutes === 0
              ? i18n.t('presets.free')
              : `${item.duration_minutes} ${i18n.t('presets.min')}`}
            {item.interval_minutes > 0
              ? ` · ${item.interval_minutes}${i18n.t('presets.min')} intervals`
              : ` · ${i18n.t('presets.noIntervals')}`}
            {item.warmup_minutes > 0
              ? ` · ${item.warmup_minutes}${i18n.t('presets.min')} ${i18n.t('presets.warmup')}`
              : ''}
          </ThemedText>
        </View>
        <ThemedText secondary style={{ fontSize: 18 }}>›</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDelete(item)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <ThemedText style={{ color: colors.danger, fontSize: 18 }}>✕</ThemedText>
      </TouchableOpacity>
    </View>
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
          <ThemedText variant="subtitle">{i18n.t('presets.title')}</ThemedText>
          <View style={{ width: 36 }} />
        </View>

        {presets.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText secondary style={{ textAlign: 'center', lineHeight: 24 }}>
              {i18n.t('presets.empty')}
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={presets}
            keyExtractor={p => p.id}
            renderItem={renderItem}
            contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          />
        )}

        <Button
          label={i18n.t('presets.add')}
          onPress={() => navigation.navigate('PresetForm', {})}
          style={styles.addBtn}
        />
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 16,
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
  addBtn: {
    marginTop: 12,
    marginBottom: 16,
  },
  row: {
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  rowContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  rowInfo: {
    flex: 1,
    gap: 4,
  },
  rowTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  deleteBtn: {
    padding: 14,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
