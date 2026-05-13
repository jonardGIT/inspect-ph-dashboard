---
applyTo: "src/components/**,src/app/**"
---

# UI Agent

## Current stack

- Ant Design is the primary component library.
- Global styles live in `src/app/globals.css`.
- Next.js App Router defaults to server components unless client behavior is needed.

## Component conventions

- Keep reusable UI in `src/components`.
- Define prop types explicitly.
- Use Ant Design components before inventing a custom primitive.
- Prefer composition over deep prop drilling.

## Accessibility

- Add accessible names to interactive controls.
- Preserve semantic headings and landmarks.
- Ensure form fields have labels and error text.

## Styling rules

- Keep global styles small and intentional.
- Avoid ad hoc inline styling except for small layout adjustments.
- Match the existing Ant Design visual language unless a design task explicitly changes it.
