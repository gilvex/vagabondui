# Research and implementation decisions

## References

- [Effect 4.0 release page](https://effect.website/blog/releases/effect/40)
- [Effect homepage](https://effect.website/)
- [shadcn/ui component index](https://ui.shadcn.com/docs/components)
- [Motion for React](https://motion.dev/docs/react)
- [GSAP React integration](https://gsap.com/resources/React/)
- [Radix accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)

The Effect reference was inspected through fetched HTML, embedded CSS, font declarations, and layout classes. shadcn’s component index was reviewed for catalog breadth and documentation organization.

## What carries over from Effect

- Zinc-based light/dark surfaces and one-pixel borders.
- Inter for interface text; JetBrains Mono for code and technical values.
- Bounded content and clear documentation hierarchy.
- Restrained interaction rather than decorative animation.

The current workbench deliberately omits the previous geometric hero, grid artwork, marketing slogans, status decorations, and repeated promotional sections. Those were original additions, not requirements of the reference, and made the interface less useful.

## What follows shadcn conventions

- Source-owned components in `src/components/ui/`.
- One component family per file.
- Composable named parts rather than a single heavily configured wrapper.
- Direct imports, native props, `className` customization, and a shared `cn()` helper.
- A dedicated documentation route with preview, usage, and API notes for each family.
- Radix behavior for keyboard navigation, state, and focus management.

This is not a shadcn CLI registry and does not claim parity with the entire shadcn catalog. The component catalog is implemented in this repository, not a set of placeholder entries.

## Motion vs GSAP

| Requirement                  | Motion                                      | GSAP                                                      |
| ---------------------------- | ------------------------------------------- | --------------------------------------------------------- |
| React state transitions      | Declarative props and spring transitions    | Imperative tweens/timelines with React integration        |
| Lifecycle integration        | React-oriented components and presence APIs | `useGSAP` scoping and cleanup                             |
| Complex timelines and scenes | Supports scroll and SVG use cases           | Strong timeline, ScrollTrigger, canvas, and WebGL tooling |
| Reduced motion               | MotionConfig and useReducedMotion           | Media-query-aware behavior can be implemented             |

**Decision: Motion**, because the relevant behavior is a small component responding to React state. Simple visual changes use CSS; dialogs use a short opacity fade. No claim is made that either animation library is universally faster.

Neither has a special integration with the Effect runtime. An application can keep Effect workflows in its business layer and expose their state to React without coupling the visual library to that runtime.

## Typography correction

The initial workbench used 7–13px labels and metadata. The revised system enforces a 14px floor, 16px body text, and responsive layouts that accommodate those sizes. The floor is tested by reading browser-computed font sizes, not just searching class names.
