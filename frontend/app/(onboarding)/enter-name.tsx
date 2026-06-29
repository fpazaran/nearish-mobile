import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { updateName } from '@/src/api/auth';
import { useUserStore } from '@/src/store/userStore';
import {
  Background,
  Button,
  Input,
  Typography,
} from '@/src/components/ui';
import { colors, spacing } from '@/src/constants/theme';

const MAX_NAME_LENGTH = 32;

export default function EnterNameScreen() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { setUser, uid, couple } = useUserStore();

  const handleContinue = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name.');
      return;
    }
    if (trimmed.length > MAX_NAME_LENGTH) {
      setError(`Name must be ${MAX_NAME_LENGTH} characters or fewer.`);
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await updateName(trimmed);
      setUser({ uid: uid ?? '', name: trimmed, couple });
      router.replace('/(onboarding)/create-join');
    } catch {
      setError('Something went wrong. Please try again.');
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
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="person-circle-outline" size={64} color={colors.primary} />
          </View>

          {/* Heading */}
          <View style={styles.headingBlock}>
            <Typography variant="h1" align="center">
              What's your name?
            </Typography>
            <Typography variant="bodySmall" align="center" style={styles.subtitle}>
              This is how your partner will see you.
            </Typography>
          </View>

          {/* Input */}
          <View style={styles.inputBlock}>
            <Input
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (error) setError('');
              }}
              placeholder="Your first name"
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus
              maxLength={MAX_NAME_LENGTH}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              error={error}
            />
            <Typography variant="caption" style={styles.charCount}>
              {name.trim().length}/{MAX_NAME_LENGTH}
            </Typography>
          </View>

          {/* CTA */}
          <Button
            label="Continue"
            onPress={handleContinue}
            loading={isLoading}
            disabled={!name.trim()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Background>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headingBlock: {
    gap: spacing.sm,
  },
  subtitle: {
    marginTop: 4,
  },
  inputBlock: {
    gap: 4,
  },
  charCount: {
    textAlign: 'right',
    opacity: 0.5,
  },
});
