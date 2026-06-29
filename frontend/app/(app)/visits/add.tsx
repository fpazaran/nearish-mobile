import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVisitsStore } from '@/src/store/visitsStore';
import { Background, Button, Input, Typography } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants/theme';

export default function AddVisitScreen() {
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { addVisit } = useVisitsStore();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!startDate) newErrors.start = 'Start date is required (YYYY-MM-DD)';
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) newErrors.start = 'Use format YYYY-MM-DD';
    if (!endDate) newErrors.end = 'End date is required (YYYY-MM-DD)';
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) newErrors.end = 'Use format YYYY-MM-DD';
    else if (endDate < startDate) newErrors.end = 'End must be after start';
    return newErrors;
  };

  const handleCreate = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsLoading(true);
    try {
      await addVisit({ description: description.trim(), start: startDate, end: endDate });
      router.back();
    } catch {
      setErrors({ general: 'Failed to create visit. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Background>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Typography variant="h2">New visit</Typography>
            <View style={{ width: 40 }} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Visit name (optional)"
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. Summer trip to NYC"
              autoCapitalize="sentences"
              returnKeyType="next"
            />
            <Input
              label="Start date"
              value={startDate}
              onChangeText={(t) => { setStartDate(t); setErrors((e) => ({ ...e, start: '' })); }}
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
              error={errors.start}
              returnKeyType="next"
            />
            <Input
              label="End date"
              value={endDate}
              onChangeText={(t) => { setEndDate(t); setErrors((e) => ({ ...e, end: '' })); }}
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
              error={errors.end}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            {errors.general ? (
              <Typography variant="caption" color={colors.error}>
                {errors.general}
              </Typography>
            ) : null}
          </View>

          <Button label="Create visit" onPress={handleCreate} loading={isLoading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Background>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  form: {
    gap: spacing.md,
  },
});
