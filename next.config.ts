import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'standalone',
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  allowedDevOrigins: ['localhost', '127.0.0.1'],
};

export default withSentryConfig(nextConfig, {
  // Suppress Sentry build-time output unless a DSN is configured
  silent: !process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Disable source map upload in CI unless explicitly enabled
  sourcemaps: {
    disable: process.env.SENTRY_SOURCEMAPS !== 'true',
  },
  // Automatically tree-shake Sentry logger in production
  disableLogger: true,
});
