import '../global.css';

import React, { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/store/authStore';
import { useUserStore } from '@/src/store/userStore';
import { getMe } from '@/src/api/auth';

function NavigationGuard() {
  const segments = useSegments();
  const { firebaseUser, isLoading: authLoading } = useAuthStore();
  const { uid, name, couple, isLoading: userLoading } = useUserStore();

  useEffect(() => {
    if (authLoading || userLoading) return;

    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';
    const inApp = segments[0] === '(app)';

    if (!firebaseUser) {
      // Not signed in → always land on auth
      if (!inAuth) router.replace('/(auth)');
      return;
    }

    // Signed in but profile not yet loaded
    if (!uid) return;

    if (!name) {
      // No name set yet
      if (!inOnboarding) router.replace('/(onboarding)/enter-name');
    } else if (!couple?.partner) {
      // Name set but no partner
      if (!inOnboarding) router.replace('/(onboarding)/create-join');
    } else {
      // Fully onboarded
      if (!inApp) router.replace('/(app)/home');
    }
  }, [firebaseUser, authLoading, uid, name, couple, userLoading, segments]);

  return null;
}

export default function RootLayout() {
  const { setFirebaseUser, setLoading: setAuthLoading } = useAuthStore();
  const { setUser, setLoading: setUserLoading, reset: resetUser } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);

      if (user) {
        try {
          setUserLoading(true);
          const userData = await getMe();
          setUser(userData);
        } catch (err) {
          console.error('Error fetching user profile:', err);
        } finally {
          setUserLoading(false);
        }
      } else {
        resetUser();
        setUserLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <NavigationGuard />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </GestureHandlerRootView>
  );
}
