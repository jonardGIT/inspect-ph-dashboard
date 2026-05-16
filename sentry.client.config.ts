import * as Sentry from "@sentry/nextjs";

// Fields whose values must never appear in Sentry error context
const PII_KEYS = [
  "password",
  "passwordHash",
  "token",
  "refreshToken",
  "accessToken",
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "email",
  "name",
  "phone",
];

function scrubPii(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (PII_KEYS.includes(k.toLowerCase())) {
      out[k] = "[Filtered]";
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = scrubPii(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV ?? "development",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  // Replay only in production to avoid collecting dev-time noise
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 1.0 : 0,
  beforeSend(event) {
    // Scrub PII from request data and extra context before sending to Sentry
    if (event.request?.data && typeof event.request.data === "object") {
      event.request.data = scrubPii(
        event.request.data as Record<string, unknown>,
      );
    }
    if (event.extra && typeof event.extra === "object") {
      event.extra = scrubPii(event.extra as Record<string, unknown>);
    }
    // Remove user email from Sentry user context (keep id + role only)
    if (event.user) {
      const { id, username } = event.user;
      event.user = { id, username };
    }
    return event;
  },
});
