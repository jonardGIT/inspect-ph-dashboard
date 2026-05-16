import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV ?? "development",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  // Replay only in production to avoid collecting dev-time noise
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 1.0 : 0,
});
