import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { createCode } from '@/src/api/auth';
import { useUserStore } from '@/src/store/userStore';
import {
  Background,
  Button,
  Typography,
  LoadingScreen,
} from '@/src/components/ui';
import { colors, spacing, borderRadius, shadows } from '@/src/constants/theme';
import { formatExpiry } from '@/src/utils/dates';

export default function CreateCodeScreen() {
  const { inviteCode, setInviteCode } = useUserStore();
  const [isGenerating, setIsGenerating] = useState(!inviteCode);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!inviteCode) generateCode();
  }, []);

  const generateCode = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const code = await createCode();
      setInviteCode(code);
    } catch {
      setError('Failed to generate code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteCode) return;
    await Clipboard.setStringAsync(String(inviteCode.code));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isGenerating) {
    return <LoadingScreen message="Generating your code…" />;
  }

  const codeStr = inviteCode ? String(inviteCode.code).padStart(6, '0') : '------';
  const expiry = inviteCode ? formatExpiry(inviteCode.expires_at) : '';

  return (
    <Background>
      <View style={styles.container}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
          <Typography variant="label" color={colors.primary}>Back</Typography>
        </TouchableOpacity>

        {/* Heading */}
        <View style={styles.headingBlock}>
          <Ionicons name="key-outline" size={48} color={colors.primary} />
          <Typography variant="h1" align="center">Your invite code</Typography>
          <Typography variant="bodySmall" align="center">
            Share this code with your partner so they can join.
          </Typography>
        </View>

        {/* Code display */}
        <View style={styles.codeCard}>
          <Typography variant="display" align="center" style={styles.codeText}>
            {codeStr}
          </Typography>
          <Typography variant="caption" align="center" style={styles.expiry}>
            {expiry}
          </Typography>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            label={copied ? 'Copied!' : 'Copy code'}
            onPress={handleCopy}
            variant={copied ? 'secondary' : 'primary'}
          />
          <Button
            label="Generate new code"
            onPress={generateCode}
            variant="outline"
          />
        </View>

        {error ? (
          <Typography variant="caption" color={colors.error} align="center">
            {error}
          </Typography>
        ) : null}

        {/* Waiting hint */}
        <View style={styles.waitingHint}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Typography variant="caption" style={styles.waitingText}>
            This screen will update automatically once your partner joins.
          </Typography>
        </View>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
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
  codeCard: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.lg,
  },
  codeText: {
    letterSpacing: 10,
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  expiry: {
    opacity: 0.6,
  },
  actions: {
    gap: spacing.sm,
  },
  waitingHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(253,172,172,0.2)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  waitingText: {
    flex: 1,
    lineHeight: 18,
  },
});
