---
applyTo: "src/**/*Form*.tsx,src/**/*form*.tsx,src/app/**/*.tsx"
---

# Forms Agent

## Current stack

- Ant Design Form should be the default form primitive in this repo.
- Axios and React Query should own submission side effects.
- Add extra validation libraries only when there is a concrete need.

## Form rules

- Keep field definitions close to the form component.
- Show validation feedback inline.
- Disable submission while a mutation is in flight.
- Convert API failures into user-visible form feedback.

## Submission pattern

- Submit through a mutation or dedicated action function.
- Reset or redirect only after a confirmed success state.
- Do not mix unrelated business logic into the form component.

## Accessibility

- Ensure labels and help text are present.
- Preserve keyboard submission behavior.
- Make error text easy to identify and announce.
