import React from 'react';
import { Text, StyleSheet, TextStyle, TextProps } from 'react-native';
import { colors, typography } from '../../constants/theme';

type Variant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label';

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  align?: TextStyle['textAlign'];
  style?: TextStyle;
  children: React.ReactNode;
}

export function Typography({
  variant = 'body',
  color,
  align,
  style,
  children,
  ...props
}: Props) {
  return (
    <Text
      style={[
        styles[variant],
        color ? { color } : undefined,
        align ? { textAlign: align } : undefined,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  display: {
    fontSize: typography['4xl'],
    fontWeight: typography.bold,
    color: colors.text,
    letterSpacing: -1,
    lineHeight: 44,
  },
  h1: {
    fontSize: typography['3xl'],
    fontWeight: typography.bold,
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  h2: {
    fontSize: typography['2xl'],
    fontWeight: typography.semibold,
    color: colors.text,
    lineHeight: 32,
  },
  h3: {
    fontSize: typography.xl,
    fontWeight: typography.semibold,
    color: colors.text,
    lineHeight: 28,
  },
  body: {
    fontSize: typography.base,
    fontWeight: typography.normal,
    color: colors.text,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: typography.sm,
    fontWeight: typography.normal,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  caption: {
    fontSize: typography.xs,
    fontWeight: typography.normal,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  label: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.text,
    letterSpacing: 0.3,
  },
});
