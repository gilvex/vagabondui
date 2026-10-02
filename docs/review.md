# 0.2 interface review

## Findings and changes

| Finding                                                  | Change                                                                                   |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Modal began down/right before centering                  | Removed animated `translate`; centered using fixed grid layout and opacity-only entrance |
| 7–13px navigation, code, and labels                      | Replaced with a 14px minimum and 16px body text                                          |
| Generic promotional slogans                              | Replaced with component behavior and setup information                                   |
| Decorative geometry, grids, figure labels, repeated CTAs | Removed from the workbench                                                               |
| Ten components presented as a broad library              | Expanded to 34 implemented families with runnable examples                               |
| One compressed primitives file                           | Replaced with one file per family in `src/components/ui/`                                |
| Details only available in modal previews                 | Added stable `/#component/:id` pages with usage and API documentation                    |
| Hard-coded counts and partial component navigation       | Counts and the complete alphabetical sidebar derive from the catalog                     |
| Hand-built command palette interaction                   | Replaced with the reusable cmdk-backed Command component                                 |
| Architecture did not match copy-owned usage              | Examples now use direct file imports and composable parts                                |

## Review criteria

- Text is readable at default zoom and stays at or above 14px.
- Animation does not move a dialog away from its intended location.
- Labels describe function rather than making generic quality claims.
- Decorative elements must explain something; otherwise remove them.
- Every component listed has an implementation, a runnable example, a direct import, and API notes.
- Keyboard behavior and states are tested in a browser.
- Catalog coverage is stated accurately; no claim of full shadcn parity.

## Regression checks

The browser suite records modal bounds from insertion through the entrance animation, checks computed typography and overflow across documentation routes at 1440px/390px/320px, and exercises the new form and overlay interactions. The complete catalog is checked with axe in both themes.
