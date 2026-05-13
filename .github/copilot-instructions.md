# Dashboard Repo Orchestrator

## Inherits global contract
See the workspace root `.github/copilot-instructions.md` and `shared/ARCHITECTURE.md`.

## Stack
- Framework: Next.js 16 App Router in `src/app`
- Language: TypeScript strict mode
- UI library: Ant Design 6
- Data fetching: Axios + TanStack Query v5
- Testing: Vitest + Testing Library

## Skill agents in this repo
| Task | Agent |
|------|------|
| Reusable UI and composition | `ui.instructions.md` |
| API clients, query hooks, and contract use | `data.instructions.md` |
| Form flows and validation UX | `forms.instructions.md` |
| New routes, layouts, loading, and error states | `pages.instructions.md` |

## Orchestrator rules
- Do not fetch directly inside presentation-only components.
- Keep API calls in dedicated client modules and hooks.
- Match shared API shapes exactly.
- Every new route should consider loading and error states.
