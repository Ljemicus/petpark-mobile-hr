import type { ComponentType } from 'react';
import * as Sentry from '@sentry/react-native';

type ErrorContext = Record<string, string | number | boolean | null | undefined>;

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();

export const isSentryEnabled = Boolean(sentryDsn);

if (isSentryEnabled) {
  Sentry.init({
    dsn: sentryDsn,
    // Keep telemetry conservative until production sampling is explicitly approved.
    tracesSampleRate: 0,
    profilesSampleRate: 0,
    enableNativeCrashHandling: true,
  });
}

export function withSentry<T extends ComponentType<any>>(Component: T): T {
  return isSentryEnabled ? (Sentry.wrap(Component) as T) : Component;
}

export function captureAppError(source: string, err: unknown, context?: ErrorContext) {
  if (!isSentryEnabled) return;

  const error = err instanceof Error ? err : new Error(String(err ?? 'Unknown error'));
  Sentry.captureException(error, {
    tags: { source },
    extra: context,
  });
}
