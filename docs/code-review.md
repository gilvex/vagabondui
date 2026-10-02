# Source review

## Findings addressed

| Area              | Finding                                                                                                                                                                                    | Change                                                                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Persistence       | Two providers implemented their own parsing and effect-delayed writes. Immediate reloads depended on effect timing.                                                                        | Shared external store with stable snapshots, synchronous persistence, functional updates, and atomic transactions. Failed writes retain in-memory state and can recover.                 |
| Validation        | Business validation inferred structure from the first sample record and maintained separate handwritten types. Dates, IDs, references, and processing invariants were only partly checked. | Explicit Zod schemas with inferred TypeScript types. Schema tests cover malformed records, dates, duplicate IDs, orphaned references, and invalid processing states.                     |
| Parcel processing | Collection-code checks lived in a form; a generic helper allowed status changes and arbitrary field patches. Updates used captured parcel objects.                                         | Pure typed commands enforce the workflow and verification. Transactions apply commands to the latest record; rejected actions append no tracking event. Forms render inputs and results. |
| Routing           | Path validation, type assertions, navigation, title selection, and page rendering lived in one large component.                                                                            | Typed route resolution, a hash subscription hook, separate header/sidebar components, and exhaustive page dispatch. Modified link clicks retain browser behavior.                        |
| Template loading  | Navigation metadata shared a module with fixtures; the template root eagerly referenced page implementations and both providers.                                                           | Lightweight catalog, typed lazy registry, data-driven suite configuration, and provider-specific entry points. The gallery loads independently of application stores.                    |
| Template framing  | Source loading, previews, branding, category filters, and page construction were combined.                                                                                                 | Separate index, thumbnail, source, frame, and provider modules. Source loading uses a discriminated state instead of independent booleans.                                               |
| Overlays          | Dialog and Sheet duplicated focus restoration and Escape handling.                                                                                                                         | A shared internal hook preserves triggerless focus restoration and nested dismissal behavior.                                                                                            |
| Component context | Field created a new context value on every render.                                                                                                                                         | Memoized identity metadata.                                                                                                                                                              |
| Exports           | Dashboard duplicated CSV generation; formatting and download logic lived in a React component module.                                                                                      | Pure CSV serializer, a shared download function, and cached formatting helpers. Tests cover quotes, multiline text, and whitespace-prefixed formulas.                                    |
| Styles            | Library CSS discovery included showcase code, and source barrel imports implicitly loaded global styles.                                                                                   | Separate bundle entry, explicit source stylesheet imports, and scoped Tailwind discovery. The app declares its own sources.                                                              |
| Tooling           | No formatter, lint gate, or domain-level test suite. Dense JSX made changes difficult to review.                                                                                           | Prettier, ESLint with TypeScript/React Hooks rules, focused Vitest coverage, and CI gates alongside the existing browser suite.                                                          |

## Verification

Run `npm run check` for formatting, lint, unit tests, type-checking, both builds, and browser tests. Browser coverage includes all nine templates, component workflows, modal geometry, font-size floors, responsive overflow, and dark/light axe checks.

The review prioritizes correctness and maintainability. Small fixture collections still use straightforward array operations; they do not need generalized data-table frameworks or indexing infrastructure. Static hash routes are deliberate and are tested as routes rather than DOM fragment targets.

## Ownership boundaries

- `src/components/ui/`: reusable visual primitives, including internal overlay behavior.
- `src/lib/`: public exports, tokens, class merging, and optional motion utilities.
- `src/showcase/`: documentation, navigation, and interactive component demonstrations.
- `src/templates/catalog.ts`: lightweight navigation metadata.
- `src/templates/registry.ts`: lazy implementation/source loading.
- `src/templates/*schema.ts` and `business/schema.ts`: persisted data contracts.
- `src/templates/persistent-store.ts`: storage and transaction mechanics.
- `src/templates/business/parcels.ts`: parcel domain rules, independent of React and browser APIs.

Sample applications remain local demos. Their client-side validation is not a replacement for server-side authorization or verification in a production application.
