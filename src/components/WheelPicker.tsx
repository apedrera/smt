import React, { useRef, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useApp } from '@/contexts/AppContext';

const ITEM_HEIGHT = 52;

interface WheelPickerProps {
  values: number[];
  selectedValue: number;
  onChange: (value: number) => void;
  suffix?: string;
  visibleItems?: number;
}

export function WheelPicker({
  values,
  selectedValue,
  onChange,
  suffix = '',
  visibleItems = 5,
}: WheelPickerProps) {
  const VISIBLE_ITEMS = visibleItems;
  const { colors } = useApp();
  const flatRef = useRef<ScrollView>(null);

  const selectedIndex = values.indexOf(selectedValue);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = e.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(index, values.length - 1));
      onChange(values[clamped]);
    },
    [values, onChange]
  );

  const containerHeight = ITEM_HEIGHT * VISIBLE_ITEMS;
  const paddingItems = Math.floor(VISIBLE_ITEMS / 2);

  const paddedValues = [
    ...Array(paddingItems).fill(null),
    ...values,
    ...Array(paddingItems).fill(null),
  ];

  return (
    <View
      style={[
        styles.container,
        { height: containerHeight, borderColor: colors.border },
      ]}
    >
      {/* Center highlight */}
      <View
        style={[
          styles.highlight,
          {
            top: ITEM_HEIGHT * paddingItems,
            height: ITEM_HEIGHT,
            backgroundColor: colors.accent + '40',
            borderColor: colors.primary,
          },
        ]}
        pointerEvents="none"
      />
      <ScrollView
        ref={flatRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumScrollEnd}
        nestedScrollEnabled
        contentOffset={{ x: 0, y: (selectedIndex >= 0 ? selectedIndex : 0) * ITEM_HEIGHT }}
      >
        {paddedValues.map((item, i) => (
          <View key={i} style={[styles.item, { height: ITEM_HEIGHT }]}>
            <Text
              style={[
                styles.itemText,
                {
                  color: item === selectedValue ? colors.primary : colors.textSecondary,
                  fontWeight: item === selectedValue ? '600' : '400',
                },
              ]}
            >
              {item !== null ? `${item}${suffix ? ' ' + suffix : ''}` : ''}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    zIndex: 1,
    pointerEvents: 'none',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 22,
  },
});
