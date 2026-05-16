import * as Sentry from "@sentry/nextjs";

const PII_KEYS = ["authorization", "cookie", "set-cookie", "x-api-key"];

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
  beforeSend(event) {
    if (event.request?.headers && typeof event.request.headers === "object") {
      event.request.headers = scrubPii(
        event.request.headers as Record<string, unknown>,
      ) as { [key: string]: string };
    }
    return event;
  },
});
