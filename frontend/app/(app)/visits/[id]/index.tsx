import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVisitsStore } from '@/src/store/visitsStore';
import { Background, Card, Button, Typography } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants/theme';
import { formatDateRange, daysUntil } from '@/src/utils/dates';

export default function VisitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { visits } = useVisitsStore();
  const visit = visits.find((v) => v.id === Number(id));

  if (!visit) {
    return (
      <Background>
        <View style={styles.centered}>
          <Typography variant="bodySmall">Visit not found.</Typography>
          <Button label="Back" onPress={() => router.back()} variant="ghost" fullWidth={false} />
        </View>
      </Background>
    );
  }

  const days = daysUntil(visit.start);
  const isActive = days <= 0 && daysUntil(visit.end) >= 0;
  const isPast = daysUntil(visit.end) < 0;

  return (
    <Background>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Typography variant="h2" numberOfLines={1} style={styles.title}>
            {visit.description || 'Visit details'}
          </Typography>
          <View style={{ width: 40 }} />
        </View>

        {/* Info card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Typography variant="body">{formatDateRange(visit.start, visit.end)}</Typography>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Typography variant="body">
              {isActive
                ? 'Happening now ✨'
                : isPast
                ? 'Completed'
                : `${days} day${days !== 1 ? 's' : ''} away`}
            </Typography>
          </View>
        </Card>

        {/* Schedule CTA */}
        <Button
          label="View schedule"
          onPress={() => router.push(`/(app)/visits/${visit.id}/schedule` as never)}
          variant="outline"
        />
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  infoCard: {
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});
