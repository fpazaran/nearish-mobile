import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVisitsStore } from '@/src/store/visitsStore';
import { GradientBackground, Card, Typography, LoadingScreen } from '@/src/components/ui';
import { colors, spacing, borderRadius, shadows } from '@/src/constants/theme';
import { Visit } from '@/src/types/visits';
import { formatDateRange, daysUntil } from '@/src/utils/dates';

export default function VisitsScreen() {
  const { visits, isLoading, fetchVisits, removeVisit } = useVisitsStore();

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleDelete = (visit: Visit) => {
    Alert.alert(
      'Delete visit',
      `Delete "${visit.description || 'this visit'}"? This will also remove its schedule.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeVisit(visit.id),
        },
      ],
    );
  };

  if (isLoading && visits.length === 0) {
    return <LoadingScreen message="Loading visits…" />;
  }

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchVisits}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h1">Visits</Typography>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(app)/visits/add')}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={22} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Empty state */}
        {visits.length === 0 ? (
          <Card style={styles.emptyCard} tinted>
            <Ionicons name="calendar-outline" size={48} color={colors.medium_pink} />
            <Typography variant="h3" align="center">No visits yet</Typography>
            <Typography variant="bodySmall" align="center">
              Tap + to plan your first visit together.
            </Typography>
          </Card>
        ) : (
          <View style={styles.list}>
            {visits.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                onPress={() => router.push(`/(app)/visits/${visit.id}` as never)}
                onDelete={() => handleDelete(visit)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

interface VisitCardProps {
  visit: Visit;
  onPress: () => void;
  onDelete: () => void;
}

function VisitCard({ visit, onPress, onDelete }: VisitCardProps) {
  const days = daysUntil(visit.start);
  const isActive = days <= 0 && daysUntil(visit.end) >= 0;
  const isPast = daysUntil(visit.end) < 0;

  return (
    <Card onPress={onPress} style={styles.visitCard}>
      <View style={styles.visitCardHeader}>
        <View style={styles.visitCardLeft}>
          {visit.description ? (
            <Typography variant="h3" numberOfLines={1}>{visit.description}</Typography>
          ) : null}
          <Typography variant="bodySmall" style={styles.dateRange}>
            {formatDateRange(visit.start, visit.end)}
          </Typography>
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.visitCardFooter}>
        <View style={[styles.badge, isActive ? styles.badgeActive : isPast ? styles.badgePast : styles.badgePlanned]}>
          <Typography variant="caption" color={isActive ? colors.primary : isPast ? colors.textSecondary : colors.primary}>
            {isActive ? 'Active now' : isPast ? 'Completed' : `${days} day${days !== 1 ? 's' : ''} away`}
          </Typography>
        </View>
        <TouchableOpacity
          style={styles.scheduleLink}
          onPress={() => router.push(`/(app)/visits/${visit.id}/schedule` as never)}
        >
          <Ionicons name="list-outline" size={14} color={colors.primary} />
          <Typography variant="caption" color={colors.primary}>Schedule</Typography>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  list: {
    gap: spacing.md,
  },
  visitCard: {
    gap: spacing.md,
  },
  visitCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  visitCardLeft: {
    flex: 1,
    gap: 4,
  },
  dateRange: {
    marginTop: 2,
  },
  deleteButton: {
    padding: 4,
  },
  visitCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  badgePlanned: {
    backgroundColor: 'rgba(253,121,121,0.1)',
  },
  badgeActive: {
    backgroundColor: 'rgba(253,121,121,0.2)',
  },
  badgePast: {
    backgroundColor: 'rgba(107,114,128,0.1)',
  },
  scheduleLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
