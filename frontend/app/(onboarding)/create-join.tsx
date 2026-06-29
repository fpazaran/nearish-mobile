import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Background, Typography } from '@/src/components/ui';
import { colors, spacing, borderRadius, shadows } from '@/src/constants/theme';
import { useUserStore } from '@/src/store/userStore';

export default function CreateJoinScreen() {
  const { name } = useUserStore();

  return (
    <Background>
      <View style={styles.container}>
        {/* Greeting */}
        <View style={styles.header}>
          <View style={styles.heartContainer}>
            <Ionicons name="heart" size={40} color={colors.primary} />
          </View>
          <Typography variant="h1" align="center">
            Hi, {name || 'there'} 👋
          </Typography>
          <Typography variant="bodySmall" align="center" style={styles.subtitle}>
            Connect with your partner to get started.
          </Typography>
        </View>

        {/* Options */}
        <View style={styles.options}>
          <OptionCard
            icon="add-circle-outline"
            title="Create a code"
            description="Generate an invite code and share it with your partner."
            onPress={() => router.push('/(onboarding)/create-code')}
          />
          <OptionCard
            icon="enter-outline"
            title="Enter a code"
            description="Have a code from your partner? Enter it here."
            onPress={() => router.push('/(onboarding)/enter-code')}
          />
        </View>

        <Typography variant="caption" align="center" style={styles.hint}>
          Each code is valid for 30 minutes.
        </Typography>
      </View>
    </Background>
  );
}

interface OptionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
}

function OptionCard({ icon, title, description, onPress }: OptionCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.cardIcon}>
        <Ionicons name={icon} size={28} color={colors.primary} />
      </View>
      <View style={styles.cardText}>
        <Typography variant="h3">{title}</Typography>
        <Typography variant="bodySmall" style={styles.cardDesc}>
          {description}
        </Typography>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.medium_pink} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl + spacing.md,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  heartContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(253,121,121,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginTop: 4,
  },
  options: {
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.md,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(253,121,121,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  cardDesc: {
    lineHeight: 18,
  },
  hint: {
    opacity: 0.5,
  },
});
