import React from 'react';
import { View, ViewProps } from 'react-native';
import { useApp } from '@/contexts/AppContext';

interface ThemedViewProps extends ViewProps {
  variant?: 'background' | 'surface' | 'card';
}

export function ThemedView({
  variant = 'background',
  style,
  ...props
}: ThemedViewProps) {
  const { colors } = useApp();
  const bg =
    variant === 'surface'
      ? colors.surface
      : variant === 'card'
      ? colors.cardBackground
      : colors.background;
  return <View style={[{ backgroundColor: bg }, style]} {...props} />;
}
