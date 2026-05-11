import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '@/contexts/AppContext';
import { GradientBackground } from '@/components/GradientBackground';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { ConfirmModal } from '@/components/ConfirmModal';
import { BellSelector } from '@/components/BellSelector';
import { WheelPicker } from '@/components/WheelPicker';
import { getPresetById, insertPreset, updatePreset } from '@/db/presets';
import { PresetsStackParamList } from '@/navigation/types';
import { i18n } from '@/i18n';

type FormRoute = RouteProp<PresetsStackParamList, 'PresetForm'>;
type FormNav = StackNavigationProp<PresetsStackParamList, 'PresetForm'>;

const DURATION_VALUES  = Array.from({ length: 121 }, (_, i) => i); // 0–120 min
const WARMUP_VALUES    = Array.from({ length: 31 },  (_, i) => i); // 0–30 min
const INTERVAL_VALUES  = Array.from({ length: 61 },  (_, i) => i); // 0–60 min

type PickerField = 'duration' | 'warmup' | 'interval';

export function PresetFormScreen() {
  const { colors } = useApp();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<FormNav>();
  const route = useRoute<FormRoute>();
  const { presetId } = route.params ?? {};

  const [name, setName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [warmupMinutes, setWarmupMinutes]     = useState(0);
  const [intervalMinutes, setIntervalMinutes] = useState(0);
  const [startingBell, setStartingBell] = useState<string | null>('bell_1');
  const [intervalBell, setIntervalBell] = useState<string | null>(null);
  const [endingBell, setEndingBell]     = useState<string | null>('bell_1');
  const [saving, setSaving] = useState(false);
  const [showUnsaved, setShowUnsaved] = useState(false);
  const isDirty = useRef(false);

  const markDirty = () => { isDirty.current = true; };

  const confirmBack = () => {
    if (!isDirty.current) { navigation.goBack(); return; }
    setShowUnsaved(true);
  };

  // Modal state
  const [pickerField, setPickerField] = useState<PickerField | null>(null);
  const [pickerTemp, setPickerTemp] = useState(0); // temp value while modal is open

  // Intercept Android hardware back
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmBack();
      return true;
    });
    return () => handler.remove();
  }); // no deps — always uses latest isDirty

  useEffect(() => {
    if (presetId) {
      getPresetById(presetId).then(p => {
        if (p) {
          setName(p.name);
          setDurationMinutes(p.duration_minutes);
          setWarmupMinutes(p.warmup_minutes);
          setIntervalMinutes(p.interval_minutes);
          setStartingBell(p.starting_bell_id);
          setIntervalBell(p.interval_bell_id);
          setEndingBell(p.ending_bell_id);
        }
      });
    }
  }, [presetId]);

  const openPicker = (field: PickerField) => {
    const current =
      field === 'duration' ? durationMinutes :
      field === 'warmup'   ? warmupMinutes :
                             intervalMinutes;
    setPickerTemp(current);
    setPickerField(field);
  };

  const confirmPicker = () => {
    if (pickerField === 'duration')  setDurationMinutes(pickerTemp);
    else if (pickerField === 'warmup')    setWarmupMinutes(pickerTemp);
    else if (pickerField === 'interval')  setIntervalMinutes(pickerTemp);
    setPickerField(null);
  };

  const pickerValues =
    pickerField === 'duration'  ? DURATION_VALUES :
    pickerField === 'warmup'    ? WARMUP_VALUES :
                                  INTERVAL_VALUES;

  const pickerTitle =
    pickerField === 'duration'  ? i18n.t('presetForm.durationMinutes') :
    pickerField === 'warmup'    ? i18n.t('presetForm.warmupMinutes') :
                                  i18n.t('presetForm.intervalMinutes');

  const [showNameError, setShowNameError] = useState(false);
  const [showSaveError, setShowSaveError] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      setShowNameError(true);
      return;
    }
    setSaving(true);
    try {
      const data = {
        name: name.trim(),
        duration_minutes: durationMinutes,
        warmup_minutes: warmupMinutes,
        interval_minutes: intervalMinutes,
        starting_bell_id: startingBell,
        interval_bell_id: intervalBell,
        ending_bell_id: endingBell,
        is_default: false,
      };
      if (presetId) await updatePreset(presetId, data);
      else          await insertPreset(data);
      navigation.goBack();
    } catch {
      setShowSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  const Section = ({ title }: { title: string }) => (
    <ThemedText secondary style={styles.sectionLabel}>{title}</ThemedText>
  );

  const formatMinutes = (min: number, zeroLabel: string) =>
    min === 0 ? zeroLabel : `${min} min`;

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={confirmBack}>
              <ThemedText style={{ color: colors.primary }}>← {i18n.t('common.back')}</ThemedText>
            </TouchableOpacity>
            <ThemedText variant="subtitle">
              {presetId ? i18n.t('presetForm.titleEdit') : i18n.t('presetForm.titleCreate')}
            </ThemedText>
            <View style={{ width: 60 }} />
          </View>

          {/* Name */}
          <Section title={i18n.t('presetForm.name')} />
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder={i18n.t('presetForm.namePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={v => { setName(v); markDirty(); }}
          />

          {/* Duration */}
          <Section title={i18n.t('presetForm.durationMinutes')} />
          <TouchableOpacity
            style={[styles.valueRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => { markDirty(); openPicker('duration'); }}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.valueText}>
              {formatMinutes(durationMinutes, i18n.t('presets.free'))}
            </ThemedText>
            <ThemedText secondary style={styles.chevron}>›</ThemedText>
          </TouchableOpacity>

          {/* Warm up */}
          <Section title={i18n.t('presetForm.warmupMinutes')} />
          <TouchableOpacity
            style={[styles.valueRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => { markDirty(); openPicker('warmup'); }}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.valueText}>
              {formatMinutes(warmupMinutes, i18n.t('presets.noWarmup'))}
            </ThemedText>
            <ThemedText secondary style={styles.chevron}>›</ThemedText>
          </TouchableOpacity>

          {/* Interval */}
          <Section title={i18n.t('presetForm.intervalMinutes')} />
          <TouchableOpacity
            style={[styles.valueRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => { markDirty(); openPicker('interval'); }}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.valueText}>
              {formatMinutes(intervalMinutes, i18n.t('presets.noIntervals'))}
            </ThemedText>
            <ThemedText secondary style={styles.chevron}>›</ThemedText>
          </TouchableOpacity>

          {/* Bells */}
          <Section title={i18n.t('presetForm.startingBell')} />
          <BellSelector selected={startingBell} onChange={v => { setStartingBell(v); markDirty(); }} />

          <Section title={i18n.t('presetForm.intervalBell')} />
          <BellSelector selected={intervalBell} onChange={v => { setIntervalBell(v); markDirty(); }} />

          <Section title={i18n.t('presetForm.endingBell')} />
          <BellSelector selected={endingBell} onChange={v => { setEndingBell(v); markDirty(); }} />

          <View style={styles.actions}>
            <Button label={i18n.t('presetForm.cancel')} variant="ghost" onPress={confirmBack} style={{ flex: 1 }} />
            <Button label={i18n.t('presetForm.save')} onPress={handleSave} loading={saving} style={{ flex: 1 }} />
          </View>
        </View>
      </ScrollView>

      {/* Minutes picker modal */}
      <Modal visible={pickerField !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface, paddingBottom: 24 + insets.bottom }]}>
            <ThemedText variant="subtitle" style={styles.modalTitle}>
              {pickerTitle}
            </ThemedText>
            <WheelPicker
              values={pickerValues}
              selectedValue={pickerTemp}
              onChange={setPickerTemp}
              suffix="min"
              visibleItems={5}
            />
            <View style={styles.modalActions}>
              <Button
                label={i18n.t('common.cancel')}
                variant="ghost"
                onPress={() => setPickerField(null)}
                style={{ flex: 1 }}
              />
              <Button
                label={i18n.t('common.ok')}
                onPress={confirmPicker}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
      <ConfirmModal
        visible={showUnsaved}
        title={i18n.t('common.unsavedChanges')}
        message={i18n.t('common.unsavedChangesMsg')}
        confirmLabel={i18n.t('common.discard')}
        cancelLabel={i18n.t('common.cancel')}
        destructive
        onConfirm={() => { setShowUnsaved(false); navigation.goBack(); }}
        onCancel={() => setShowUnsaved(false)}
      />
      <ConfirmModal
        visible={showNameError}
        title={i18n.t('presetForm.name')}
        message={i18n.t('presetForm.namePlaceholder')}
        confirmLabel={i18n.t('common.ok')}
        onConfirm={() => setShowNameError(false)}
      />
      <ConfirmModal
        visible={showSaveError}
        title="Error"
        message="Failed to save preset."
        confirmLabel={i18n.t('common.ok')}
        onConfirm={() => setShowSaveError(false)}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 20,
  },
  modalTitle: {
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
});
