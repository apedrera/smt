import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useApp } from '@/contexts/AppContext';

type TextVariant = 'body' | 'title' | 'subtitle' | 'caption' | 'timer';

interface ThemedTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  secondary?: boolean;
}

const variantStyles = StyleSheet.create({
  body: { fontSize: 16, lineHeight: 24 },
  title: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
  subtitle: { fontSize: 20, fontWeight: '600', lineHeight: 26 },
  caption: { fontSize: 13, lineHeight: 18 },
  timer: { fontSize: 64, fontWeight: '200', letterSpacing: 2, lineHeight: 72 },
});

export function ThemedText({
  variant = 'body',
  color,
  secondary = false,
  style,
  ...props
}: ThemedTextProps) {
  const { colors } = useApp();
  const textColor =
    color ?? (secondary ? colors.textSecondary : colors.textPrimary);
  return (
    <Text
      style={[variantStyles[variant], { color: textColor }, style]}
      {...props}
    />
  );
}
