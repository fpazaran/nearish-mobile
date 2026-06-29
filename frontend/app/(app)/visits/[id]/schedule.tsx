import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getVisitSchedule } from '@/src/api/visits';
import { ActivitySnapshot } from '@/src/types/activities';
import { Background, Card, Typography, LoadingScreen } from '@/src/components/ui';
import { colors, spacing, borderRadius } from '@/src/constants/theme';
import { formatDate } from '@/src/utils/dates';

export default function VisitScheduleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [schedule, setSchedule] = useState<ActivitySnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSchedule = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getVisitSchedule(Number(id));
      setSchedule(data);
    } catch {
      setError('Failed to load schedule.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [id]);

  // Group by date
  const grouped = schedule.reduce<Record<string, ActivitySnapshot[]>>((acc, item) => {
    (acc[item.date] ??= []).push(item);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort();

  if (isLoading && schedule.length === 0) {
    return <LoadingScreen message="Loading schedule…" />;
  }

  return (
    <Background>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadSchedule} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Typography variant="h2">Schedule</Typography>
          <View style={{ width: 40 }} />
        </View>

        {error ? (
          <Typography variant="bodySmall" color={colors.error} align="center">
            {error}
          </Typography>
        ) : null}

        {sortedDates.length === 0 ? (
          <Card tinted style={styles.emptyCard}>
            <Ionicons name="list-outline" size={40} color={colors.medium_pink} />
            <Typography variant="bodySmall" align="center">
              No activities planned yet.
            </Typography>
          </Card>
        ) : (
          sortedDates.map((date) => (
            <View key={date} style={styles.daySection}>
              <View style={styles.dayHeader}>
                <View style={styles.dayDot} />
                <Typography variant="label" style={styles.dayLabel}>
                  {formatDate(date)}
                </Typography>
              </View>
              <View style={styles.activities}>
                {grouped[date]
                  .sort((a, b) => a.order - b.order)
                  .map((activity) => (
                    <View key={activity.id} style={styles.activityItem}>
                      <Ionicons name="ellipse" size={8} color={colors.primary} />
                      <View style={styles.activityText}>
                        <Typography variant="body">{activity.title}</Typography>
                        {activity.description ? (
                          <Typography variant="bodySmall">{activity.description}</Typography>
                        ) : null}
                      </View>
                    </View>
                  ))}
              </View>
            </View>
          ))
        )}
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
  emptyCard: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  daySection: {
    gap: spacing.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  dayLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: colors.textSecondary,
  },
  activities: {
    gap: spacing.sm,
    paddingLeft: 18,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  activityText: {
    flex: 1,
    gap: 2,
  },
});
