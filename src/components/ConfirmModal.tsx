import React from 'react';
import { View, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { ThemedText } from '@/components/ThemedText';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { colors } = useApp();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <ThemedText variant="subtitle" style={styles.title}>
            {title}
          </ThemedText>
          <ThemedText secondary style={styles.message}>
            {message}
          </ThemedText>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <TouchableOpacity
            style={styles.btn}
            onPress={onConfirm}
            activeOpacity={0.7}
          >
            <ThemedText
              style={[
                styles.btnLabel,
                { color: destructive ? colors.danger : colors.primary },
              ]}
            >
              {confirmLabel}
            </ThemedText>
          </TouchableOpacity>
          {cancelLabel && onCancel && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <TouchableOpacity style={styles.btn} onPress={onCancel} activeOpacity={0.7}>
                <ThemedText secondary style={styles.btnLabel}>
                  {cancelLabel}
                </ThemedText>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000060',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  sheet: {
    borderRadius: 20,
    width: '100%',
    overflow: 'hidden',
  },
  title: {
    textAlign: 'center',
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  message: {
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    lineHeight: 22,
    fontSize: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  btn: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
