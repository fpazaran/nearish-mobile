import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  withSafeArea?: boolean;
}

export function Background({
  children,
  style,
  withSafeArea = true,
}: Props) {
  const content = (
    <View style={[styles.background, style]}>
      {children}
    </View>
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
    backgroundColor: colors.background,
  },
  background: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
