import { configureAxe } from "vitest-axe";

/**
 * Pre-configured axe instance targeting WCAG 2.1 AA.
 * Usage:
 *   const { container } = render(<MyComponent />);
 *   const results = await axe(container);
 *   expect(results.violations).toHaveLength(0);
 */
export const axe = configureAxe({
  rules: {
    // Suppress color-contrast in jsdom — unreliable without real CSS rendering
    "color-contrast": { enabled: false },
  },
});
