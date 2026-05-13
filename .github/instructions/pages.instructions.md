---
applyTo: "src/app/**"
---

# Pages Agent

## App Router conventions

- Route files live under `src/app`.
- Default to server components and opt into client components only when needed.
- Add `loading.tsx` and `error.tsx` when the route complexity warrants them.

## Page rules

- Keep page files focused on route composition.
- Move reusable UI and client interactivity into components.
- Keep metadata accurate and route-specific.
- Prefer colocated route concerns over global abstractions too early.

## Loading and error states

- Loading states should reflect the eventual layout.
- Error states should provide a clear recovery path.
- Do not leave new routes without an error handling story.
