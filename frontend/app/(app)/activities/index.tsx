import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, Card, Typography } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants/theme';

// Phase 3 — full implementation planned
export default function ActivitiesScreen() {
  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Typography variant="h1">Activities</Typography>

        <Card tinted style={styles.phaseCard}>
          <Ionicons name="sparkles-outline" size={48} color={colors.medium_pink} />
          <Typography variant="h3" align="center">Coming in Phase 3</Typography>
          <Typography variant="bodySmall" align="center" style={styles.desc}>
            Build a personal library of activity ideas to pull from when planning
            visit schedules.
          </Typography>
          <View style={styles.featureList}>
            {[
              'Save activities by category',
              'Filter and search the library',
              'Random activity suggestions',
              'Add library items to visit schedules',
            ].map((f) => (
              <View key={f} style={styles.featureRow}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary} />
                <Typography variant="bodySmall">{f}</Typography>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  phaseCard: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  desc: { lineHeight: 20 },
  featureList: { gap: 8, width: '100%', marginTop: 4 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
