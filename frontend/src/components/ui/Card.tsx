import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { colors, borderRadius, shadows, typography } from '../../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  /** Slightly transparent pink-tinted surface */
  tinted?: boolean;
}

export function Card({ children, style, onPress, tinted = false }: Props) {
  const content = (
    <View style={[styles.card, tinted && styles.tinted, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardSection({ title, children, style }: SectionProps) {
  return (
    <View style={[styles.section, style]}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: borderRadius.lg,
    padding: 20,
    ...shadows.md,
  },
  tinted: {
    backgroundColor: 'rgba(253,172,172,0.18)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
});
