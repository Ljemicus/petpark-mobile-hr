# ENV MATRIX — KIT-0 (2026-07-02)

No values printed; env var names only.

## Web

| Varijabla | Ref count | Local | Preview | Prod | Obavezna? | Missing behavior / napomena |
|---|---:|---|---|---|---|---|
| `NODE_ENV` | 31 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `NEXT_PUBLIC_APP_URL` | 30 | set as needed | set as needed | set as needed | NE/feature | Client-visible public config/feature flag; verify no silent placeholder in KIT-B/D. |
| `NEXT_PUBLIC_SUPABASE_URL` | 25 | set as needed | set as needed | set as needed | DA | Required by Supabase client; missing should fail validation/type-check runtime early. |
| `SUPABASE_SERVICE_ROLE_KEY` | 17 | set as needed | set as needed | set as needed | DA | Server-only/secret; required only when related feature/route is enabled; never expose client-side. |
| `UPSTASH_REDIS_REST_URL` | 13 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 12 | set as needed | set as needed | set as needed | DA | Required by Supabase client; missing should fail validation/type-check runtime early. |
| `UPSTASH_REDIS_REST_TOKEN` | 11 | set as needed | set as needed | set as needed | DA | Server-only/secret; required only when related feature/route is enabled; never expose client-side. |
| `SENTRY_DSN` | 6 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `STRIPE_SECRET_KEY` | 5 | set as needed | set as needed | set as needed | DA | Server-only/secret; required only when related feature/route is enabled; never expose client-side. |
| `RESEND_API_KEY` | 4 | set as needed | set as needed | set as needed | DA | Server-only/secret; required only when related feature/route is enabled; never expose client-side. |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | 4 | set as needed | set as needed | set as needed | NE/feature | Client-visible public config/feature flag; verify no silent placeholder in KIT-B/D. |
| `NEXT_PUBLIC_SENTRY_DSN` | 4 | set as needed | set as needed | set as needed | NE/feature | Client-visible public config/feature flag; verify no silent placeholder in KIT-B/D. |
| `CLOUDINARY_API_SECRET` | 4 | set as needed | set as needed | set as needed | DA | Server-only/secret; required only when related feature/route is enabled; never expose client-side. |
| `STRIPE_WEBHOOK_SECRET` | 3 | set as needed | set as needed | set as needed | DA | Server-only/secret; required only when related feature/route is enabled; never expose client-side. |
| `SLACK_OPS_WEBHOOK` | 3 | set as needed | set as needed | set as needed | DA | Server-only/secret; required only when related feature/route is enabled; never expose client-side. |
| `SLACK_INCIDENTS_WEBHOOK` | 3 | set as needed | set as needed | set as needed | DA | Server-only/secret; required only when related feature/route is enabled; never expose client-side. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 3 | set as needed | set as needed | set as needed | NE/feature | Client-visible public config/feature flag; verify no silent placeholder in KIT-B/D. |
| `NEXT_PUBLIC_ANALYTICS_API_KEY` | 3 | set as needed | set as needed | set as needed | NE/feature | Client-visible public config/feature flag; verify no silent placeholder in KIT-B/D. |
| `CLOUDINARY_API_KEY` | 3 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `NEXT_PUBLIC_GSC_TOKEN` | 2 | set as needed | set as needed | set as needed | NE/feature | Client-visible public config/feature flag; verify no silent placeholder in KIT-B/D. |
| `NEXT_PUBLIC_ENABLE_ALL_FEATURES` | 2 | set as needed | set as needed | set as needed | NE/feature | Client-visible public config/feature flag; verify no silent placeholder in KIT-B/D. |
| `NEXT_PUBLIC_ANALYTICS_ENDPOINT` | 2 | set as needed | set as needed | set as needed | NE/feature | Client-visible public config/feature flag; verify no silent placeholder in KIT-B/D. |
| `NEXTAUTH_SECRET` | 2 | set as needed | set as needed | set as needed | NE/feature | Legacy candidate: no active next-auth import found; references are in env helper/tests only. |
| `CRON_SECRET` | 2 | set as needed | set as needed | set as needed | DA | Server-only/secret; required only when related feature/route is enabled; never expose client-side. |
| `CLOUDINARY_CLOUD_NAME` | 2 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `APP_VERSION` | 2 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `VERCEL_ENV` | 1 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `VAPID_SUBJECT` | 1 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `VAPID_PRIVATE_KEY` | 1 | set as needed | set as needed | set as needed | DA | Server-only/secret; required only when related feature/route is enabled; never expose client-side. |
| `TWILIO_PHONE_NUMBER` | 1 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `TWILIO_AUTH_TOKEN` | 1 | set as needed | set as needed | set as needed | DA | Server-only/secret; required only when related feature/route is enabled; never expose client-side. |
| `TWILIO_ACCOUNT_SID` | 1 | set as needed | set as needed | set as needed | DA | Server-only/secret; required only when related feature/route is enabled; never expose client-side. |
| `SMS_PROVIDER` | 1 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `SMS_INTERNAL_KEY` | 1 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `SITE` | 1 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `SESSION_TIMEOUT_HOURS` | 1 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `SESSION_REFRESH_INTERVAL_MINUTES` | 1 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `PASSWORD_REQUIRE_UPPERCASE` | 1 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `PASSWORD_REQUIRE_SPECIAL_CHARS` | 1 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `PASSWORD_REQUIRE_NUMBERS` | 1 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `PASSWORD_REQUIRE_LOWERCASE` | 1 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `PASSWORD_MIN_LENGTH` | 1 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `PASSWORD_MAX_ATTEMPTS` | 1 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `PASSWORD_LOCKOUT_MINUTES` | 1 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | 1 | set as needed | set as needed | set as needed | NE/feature | Client-visible public config/feature flag; verify no silent placeholder in KIT-B/D. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | 1 | set as needed | set as needed | set as needed | NE/feature | Client-visible public config/feature flag; verify no silent placeholder in KIT-B/D. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | 1 | set as needed | set as needed | set as needed | NE/feature | Client-visible public config/feature flag; verify no silent placeholder in KIT-B/D. |
| `NEXT_PUBLIC_APP_VERSION` | 1 | set as needed | set as needed | set as needed | NE/feature | Client-visible public config/feature flag; verify no silent placeholder in KIT-B/D. |
| `NEXT_PUBLIC_APP_ENV` | 1 | set as needed | set as needed | set as needed | NE/feature | Client-visible public config/feature flag; verify no silent placeholder in KIT-B/D. |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | 1 | set as needed | set as needed | set as needed | NE/feature | Client-visible public config/feature flag; verify no silent placeholder in KIT-B/D. |
| `NEXTAUTH_URL` | 1 | set as needed | set as needed | set as needed | NE/feature | Legacy candidate: no active next-auth import found; references are in env helper/tests only. |
| `INFOBIP_SENDER` | 1 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `INFOBIP_BASE_URL` | 1 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `INFOBIP_API_KEY` | 1 | set as needed | set as needed | set as needed | DA | Server-only/secret; required only when related feature/route is enabled; never expose client-side. |
| `GOOGLE_MAPS_API_KEY` | 1 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `GOOGLE_CLIENT_SECRET` | 1 | set as needed | set as needed | set as needed | DA | Server-only/secret; required only when related feature/route is enabled; never expose client-side. |
| `GOOGLE_CLIENT_ID` | 1 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `EMAIL_FROM` | 1 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `CI` | 1 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |
| `APP_URL` | 1 | set as needed | set as needed | set as needed | NE/feature | Runtime/optional feature config; verify fail-closed if feature is active. |

## Mobile

| Varijabla | Ref count | Local | Preview | Prod | Obavezna? | Missing behavior / napomena |
|---|---:|---|---|---|---|---|
| `EXPO_PUBLIC_API_URL` | 2 | set | set | set | NE/feature | API base URL / feature endpoint; verify fallback behavior in KIT-E. |
| `EXPO_PUBLIC_SUPABASE_URL` | 1 | set | set | set | DA | Required for remote Supabase access. |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | 1 | set | set | set | DA | Required for remote Supabase access. |

## NextAuth presuda

No active `next-auth`/`NextAuth` implementation found under app/lib/components. `NEXTAUTH_*` remains a legacy cleanup candidate, not removed in KIT-0.
