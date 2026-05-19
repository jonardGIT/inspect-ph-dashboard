import path from "node:path";
import { fileURLToPath } from "node:url";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// Sentry CDN used for the browser error-reporting SDK
const SENTRY_CDN = "https://browser.sentry-cdn.com";

// Build a strict-but-workable CSP for the dashboard.
// Ant Design injects styles at runtime, so 'unsafe-inline' is required for
// style-src until the project migrates to a CSS-in-JS nonce strategy.
//
// 'unsafe-eval' is only needed in development: Next.js Fast Refresh uses
// eval() internally. It is deliberately excluded from production builds.
const isDev = process.env.NODE_ENV === "development";

// In dev the API runs on a different port, so it's not covered by 'self'.
// NEXT_PUBLIC_API_BASE_URL is respected if set; otherwise fall back to the
// default local API port.
const apiOrigin =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:4000";

const cspDirectives = [
  "default-src 'self'",
  // Scripts: same-origin + Sentry SDK (+ eval only in dev for Fast Refresh)
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${SENTRY_CDN}`,
  // Styles: same-origin + inline (Ant Design runtime injection)
  "style-src 'self' 'unsafe-inline'",
  // Fonts: same-origin + data URIs (Ant Design icon fonts)
  "font-src 'self' data:",
  // Images: same-origin + data URIs (avatar placeholders, QR codes)
  "img-src 'self' data: blob:",
  // API calls + Sentry error ingestion.
  // *.ingest.sentry.io uses a valid leading-subdomain wildcard (o*.ingest.sentry.io
  // is NOT valid CSP syntax; wildcards must replace an entire subdomain label).
  // In development the API origin is explicitly whitelisted because it runs on
  // a different port and is therefore not covered by 'self'.
  `connect-src 'self'${isDev ? ` ${apiOrigin}` : ""} ${SENTRY_CDN} https://*.ingest.sentry.io`,
  // No external frames
  "frame-ancestors 'none'",
  // Block mixed content
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspDirectives },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Suppress Sentry build-time output unless a DSN is configured
  silent: !process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Disable source map upload in CI unless explicitly enabled
  sourcemaps: {
    disable: process.env.SENTRY_SOURCEMAPS !== "true",
  },
  // Automatically tree-shake Sentry logger in production
  disableLogger: true,
});
