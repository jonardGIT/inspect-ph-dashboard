---
applyTo: "src/lib/**,src/hooks/**,src/app/**"
---
# Data Agent

## Current stack
- HTTP client: Axios
- Server state: TanStack Query v5
- Shared contract source: `shared/types/api.ts`

## API module pattern
- Keep raw HTTP calls in dedicated API modules.
- Normalize API payloads to the shared `{ data }` and `{ data, meta }` shapes.
- Keep hooks thin wrappers around query and mutation behavior.

## Hook pattern
- Use stable query keys.
- Invalidate related queries after mutations.
- Surface useful loading and error state to calling components.
- Keep retry behavior explicit when API semantics require it.

## Error handling
- Bubble user-facing messages from `error.response?.data?.error?.message` when safe.
- Fall back to a generic connection or unexpected error message.
- Handle 401 and 403 intentionally in the route flow.
