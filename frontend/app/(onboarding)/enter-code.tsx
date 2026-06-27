import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { joinCouple } from '@/src/api/auth';
import { useUserStore } from '@/src/store/userStore';
import {
  GradientBackground,
  Button,
  Typography,
} from '@/src/components/ui';
import { colors, spacing, borderRadius } from '@/src/constants/theme';

const CODE_LENGTH = 6;

export default function EnterCodeScreen() {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const { setCouple } = useUserStore();

  const code = digits.join('');
  const isComplete = code.length === CODE_LENGTH && digits.every((d) => d !== '');

  const handleDigitChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];

    if (value.length > 1) {
      // Handle paste: distribute across remaining cells
      const pasted = value.slice(0, CODE_LENGTH - index);
      pasted.split('').forEach((char, i) => {
        if (index + i < CODE_LENGTH) newDigits[index + i] = char;
      });
      setDigits(newDigits);
      const nextIndex = Math.min(index + pasted.length, CODE_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newDigits[index] = value;
    setDigits(newDigits);
    if (error) setError('');

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    if (!isComplete) return;
    setError('');
    setIsLoading(true);
    try {
      const couple = await joinCouple(Number(code));
      setCouple(couple);
      router.replace('/(app)/home');
    } catch {
      setError('Invalid or expired code. Please check and try again.');
      setDigits(Array(CODE_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GradientBackground variant="warm">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
            <Typography variant="label" color={colors.primary}>Back</Typography>
          </TouchableOpacity>

          {/* Heading */}
          <View style={styles.headingBlock}>
            <Ionicons name="link-outline" size={48} color={colors.primary} />
            <Typography variant="h1" align="center">Enter partner's code</Typography>
            <Typography variant="bodySmall" align="center">
              Ask your partner for their 6-digit invite code.
            </Typography>
          </View>

          {/* Digit input boxes */}
          <View style={styles.digitRow}>
            {digits.map((digit, i) => (
              <TextInput
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                style={[
                  styles.digitBox,
                  digit ? styles.digitBoxFilled : null,
                  error ? styles.digitBoxError : null,
                ]}
                value={digit}
                onChangeText={(v) => handleDigitChange(v, i)}
                onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(key, i)}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus={i === 0}
                selectTextOnFocus
                textContentType="oneTimeCode"
                caretHidden
              />
            ))}
          </View>

          {/* Error */}
          {error ? (
            <Typography variant="caption" color={colors.error} align="center">
              {error}
            </Typography>
          ) : null}

          {/* Submit */}
          <Button
            label="Connect"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={!isComplete}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  headingBlock: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  digitRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  digitBox: {
    width: 48,
    height: 60,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  digitBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(253,121,121,0.05)',
  },
  digitBoxError: {
    borderColor: colors.error,
  },
});
