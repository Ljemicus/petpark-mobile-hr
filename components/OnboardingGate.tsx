import React, { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../lib/auth-context';

const ALLOWED_WHEN_ONBOARDING = new Set(['login', 'register', 'onboarding']);

export default function OnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { isLoggedIn, loading, needsOnboarding } = useAuth();

  useEffect(() => {
    if (loading || !isLoggedIn || !needsOnboarding) return;

    const current = segments[segments.length - 1];
    if (!current || ALLOWED_WHEN_ONBOARDING.has(current)) return;

    router.replace('/onboarding');
  }, [isLoggedIn, loading, needsOnboarding, router, segments]);

  return <>{children}</>;
}
