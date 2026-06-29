import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { firebaseAuth } from '@/src/lib/firebase';
import { Background } from '@/src/components/ui/Background';
import { Button } from '@/src/components/ui/Button';
import { Typography } from '@/src/components/ui/Typography';
import { colors, spacing } from '@/src/constants/theme';
import { useAuthStore } from '@/src/store/authStore';

WebBrowser.maybeCompleteAuthSession();

export default function LandingScreen() {
  const { isLoading } = useAuthStore();

  // On iOS dev/production builds, iosClientId triggers the native iOS OAuth
  // flow (ASWebAuthenticationSession). Google redirects back via the reverse
  // client ID scheme — no redirect URI needs to be configured manually.
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(firebaseAuth, credential).catch((err) => {
        console.error('Firebase sign-in error:', err);
      });
    }
  }, [response]);

  const handleGoogleSignIn = async () => {
    await promptAsync();
  };

  return (
    <Background withSafeArea={false}>
      <View style={styles.container}>
        {/* Top section: branding */}
        <View style={styles.header}>
          <View style={styles.heartContainer}>
            <Ionicons name="heart" size={64} color={colors.primary} />
          </View>
          <Typography variant="display" style={styles.wordmark}>
            nearish
          </Typography>
          <Typography variant="bodySmall" align="center" style={styles.tagline}>
            your private space,{'\n'}for the distance between you
          </Typography>
        </View>

        {/* Middle: feature hints */}
        <View style={styles.features}>
          {[
            { icon: 'calendar-outline', text: 'Plan visits & countdowns' },
            { icon: 'map-outline', text: 'Build day-by-day itineraries' },
            { icon: 'camera-outline', text: 'Save memories together' },
            { icon: 'gift-outline', text: 'Shared wishlists' },
          ].map(({ icon, text }) => (
            <View key={text} style={styles.featureRow}>
              <Ionicons
                name={icon as keyof typeof Ionicons.glyphMap}
                size={20}
                color={colors.primary}
              />
              <Text style={styles.featureText}>{text}</Text>
            </View>
          ))}
        </View>

        {/* Bottom: sign in */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.googleButton, !request && styles.googleButtonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={!request || isLoading}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-google" size={20} color="#4285F4" />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <Typography variant="caption" align="center" style={styles.legal}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
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
    paddingTop: 80,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    gap: 12,
  },
  heartContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(253,121,121,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  wordmark: {
    color: colors.primary,
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -2,
  },
  tagline: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
  features: {
    gap: 14,
    paddingHorizontal: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  featureText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  footer: {
    gap: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.2,
  },
  legal: {
    opacity: 0.6,
    paddingHorizontal: spacing.sm,
  },
});
