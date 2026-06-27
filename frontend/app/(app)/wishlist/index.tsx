import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, Card, Typography } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants/theme';

// Phase 5 — full implementation planned
export default function WishlistScreen() {
  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Typography variant="h1">Wishlist</Typography>

        <Card tinted style={styles.phaseCard}>
          <Ionicons name="gift-outline" size={48} color={colors.medium_pink} />
          <Typography variant="h3" align="center">Coming in Phase 5</Typography>
          <Typography variant="bodySmall" align="center" style={styles.desc}>
            Keep a shared wishlist with your partner and track when items are fulfilled.
          </Typography>
          <View style={styles.featureList}>
            {[
              'Your personal wishlist',
              "View partner's wishlist",
              'Mark items as fulfilled',
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
