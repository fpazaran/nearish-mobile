import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  withSafeArea?: boolean;
  /** Use a stronger pink gradient for auth/onboarding screens */
  variant?: 'default' | 'warm';
}

export function GradientBackground({
  children,
  style,
  withSafeArea = true,
  variant = 'default',
}: Props) {
  const gradientColors: [string, string, string] =
    variant === 'warm'
      ? [colors.lightest_pink, colors.bg_pink, colors.medium_dark_pink]
      : [colors.lightest_pink, colors.bg_pink, colors.lightest_pink];

  const content = (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );

  if (withSafeArea) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {content}
      </SafeAreaView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.lightest_pink,
  },
  gradient: {
    flex: 1,
  },
});
