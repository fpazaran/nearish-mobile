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
import { useHomeStore } from '@/src/store/homeStore';
import { useUserStore } from '@/src/store/userStore';
import { useAuthStore } from '@/src/store/authStore';
import { Home } from '@/src/types/home';
import { Background, Card, Typography, LoadingScreen } from '@/src/components/ui';
import { colors, spacing, borderRadius } from '@/src/constants/theme';
import { VisitState } from '@/src/types/visits';
import { formatDateRange, getVisitStatusLabel } from '@/src/utils/dates';

export default function HomeScreen() {
  const { home, isLoading, fetchHome } = useHomeStore();
  const { name, couple } = useUserStore();
  const { signOut } = useAuthStore();

  useEffect(() => {
    fetchHome();
  }, []);

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  if (isLoading && !home) {
    return <LoadingScreen message="Loading your space…" />;
  }

  const partnerName = couple?.partner?.name ?? 'your partner';
  const stateLabel = home ? getVisitStatusLabel(home.state) : '';

  return (
    <Background>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchHome}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Typography variant="h2">Hi, {name} 👋</Typography>
            <Typography variant="bodySmall" style={styles.partnerLine}>
              Connected with {partnerName}
            </Typography>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.iconButton}>
            <Ionicons name="log-out-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Visit status card */}
        {home ? (
          <StatusCard home={home} />
        ) : (
          <Card tinted style={styles.emptyCard}>
            <Ionicons name="heart-outline" size={36} color={colors.medium_pink} />
            <Typography variant="bodySmall" align="center">
              Couldn't load your space. Pull to refresh.
            </Typography>
          </Card>
        )}

        {/* Quick actions */}
        <View style={styles.actions}>
          <Typography variant="label" style={styles.sectionTitle}>Quick access</Typography>
          <View style={styles.actionGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.actionCard}
                onPress={() => router.push(action.route as never)}
                activeOpacity={0.85}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name={action.icon as keyof typeof Ionicons.glyphMap} size={24} color={colors.primary} />
                </View>
                <Typography variant="label" style={styles.actionLabel}>{action.label}</Typography>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </Background>
  );
}

function StatusCard({ home }: { home: Home }) {
  const stateLabel = getVisitStatusLabel(home.state);

  if (home.state === VisitState.UNPLANNED) {
    return (
      <Card style={styles.statusCard}>
        <View style={styles.statusCardInner}>
          <Ionicons name="calendar-outline" size={40} color={colors.medium_pink} />
          <Typography variant="h3" align="center">No visits planned yet</Typography>
          <Typography variant="bodySmall" align="center">
            Add your first visit to start counting down.
          </Typography>
          <TouchableOpacity
            style={styles.addVisitButton}
            onPress={() => router.push('/(app)/visits')}
          >
            <Ionicons name="add" size={18} color={colors.textLight} />
            <Typography variant="label" color={colors.textLight}>Plan a visit</Typography>
          </TouchableOpacity>
        </View>
      </Card>
    );
  }

  if (!home.visit) return null;

  return (
    <Card style={styles.statusCard}>
      <View style={styles.statusBadge}>
        <Ionicons
          name={home.state === VisitState.ACTIVE ? 'heart' : 'time-outline'}
          size={14}
          color={colors.primary}
        />
        <Typography variant="caption" color={colors.primary} style={styles.statusLabel}>
          {stateLabel}
        </Typography>
      </View>

      {home.visit.description ? (
        <Typography variant="h2" style={styles.visitName}>
          {home.visit.description}
        </Typography>
      ) : null}

      <Typography variant="bodySmall">
        {formatDateRange(home.visit.start, home.visit.end)}
      </Typography>

      {home.state === VisitState.PLANNED && home.days_till != null && (
        <View style={styles.countdown}>
          <Typography variant="display" color={colors.primary} style={styles.countdownNumber}>
            {home.days_till}
          </Typography>
          <Typography variant="bodySmall" style={styles.countdownUnit}>
            {home.days_till === 1 ? 'day' : 'days'} to go
          </Typography>
        </View>
      )}

      {home.state === VisitState.ACTIVE && (
        <View style={styles.countdown}>
          <Ionicons name="heart" size={32} color={colors.primary} />
          <Typography variant="bodySmall" style={styles.countdownUnit}>
            Enjoy every moment ✨
          </Typography>
        </View>
      )}

      <TouchableOpacity
        style={styles.scheduleButton}
        onPress={() => router.push(`/(app)/visits/${home.visit!.id}/schedule` as never)}
      >
        <Ionicons name="calendar-outline" size={16} color={colors.primary} />
        <Typography variant="label" color={colors.primary}>View schedule</Typography>
        <Ionicons name="chevron-forward" size={14} color={colors.primary} />
      </TouchableOpacity>
    </Card>
  );
}

const QUICK_ACTIONS = [
  { label: 'Visits', icon: 'calendar-outline', route: '/(app)/visits' },
  { label: 'Memories', icon: 'camera-outline', route: '/(app)/memories' },
  { label: 'Activities', icon: 'sparkles-outline', route: '/(app)/activities' },
  { label: 'Wishlist', icon: 'gift-outline', route: '/(app)/wishlist' },
];

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
  partnerLine: {
    marginTop: 2,
  },
  iconButton: {
    padding: 8,
  },
  statusCard: {
    gap: spacing.md,
  },
  statusCardInner: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(253,121,121,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  statusLabel: {
    fontWeight: '600',
  },
  visitName: {
    marginTop: 4,
  },
  countdown: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 4,
  },
  countdownNumber: {
    fontSize: 56,
    lineHeight: 64,
  },
  countdownUnit: {
    fontSize: 18,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(253,121,121,0.08)',
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  addVisitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: borderRadius.full,
    marginTop: 8,
  },
  actions: {
    gap: spacing.md,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.textSecondary,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    minWidth: '44%',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(253,121,121,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 13,
  },
});
