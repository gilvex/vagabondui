# Template pages

## Routes and files

| Route                  | Source                        | Demonstrates                                              |
| ---------------------- | ----------------------------- | --------------------------------------------------------- |
| `/#templates`          | `src/templates/Templates.tsx` | Template index and navigation                             |
| `/#template/dashboard` | `src/templates/Dashboard.tsx` | Metrics, chart, task table, CSV download                  |
| `/#template/projects`  | `src/templates/Projects.tsx`  | Board/list, filters, task movement, editing, undo         |
| `/#template/settings`  | `src/templates/Settings.tsx`  | Validation, preferences, members, reset confirmation      |
| `/#template/chat`      | `src/templates/Chat.tsx`      | Channels, DMs, threads, reactions, pins, editing          |
| `/#template/hr`        | `src/templates/HR.tsx`        | Directory, employee profiles, leave approvals, onboarding |
| `/#template/sorting`   | `src/templates/Sorting.tsx`   | Scanning, sorting lanes, manifests, exceptions            |
| `/#template/pickup`    | `src/templates/Pickup.tsx`    | Receipt, shelf assignment, collection verification        |
| `/#template/support`   | `src/templates/Support.tsx`   | Conversations, notes, assignment, linked orders           |
| `/#template/billing`   | `src/templates/Billing.tsx`   | Drafts, receivables, payment records, invoice exports     |

`TaskControls.tsx` shares the new-task dialog, editing sheet, status badge, and assignee display. `templates.css` contains layout styles. Components use direct imports from `src/components/ui/`.

The business pages share data, forms, and styles under `src/templates/business/`. `EmployeeForms.tsx` supplies employee creation/profile editing. `ParcelControls.tsx` re-exports the separate queue and details components; `ParcelActionDialog.tsx` owns action input. `parcels.ts` implements pure commands and `use-parcel-command.ts` applies them atomically through the store. All nine page implementations are separately lazy-loaded.

## Data model

`data.ts` defines the sample workspace. `schema.ts` defines its runtime schema and inferred types. `store.tsx` exposes the React context; `persistent-store.ts` owns synchronous browser-local persistence and atomic transactions. The storage key is `vagabond-template-workspace-v1`.

- Task and member actions update the same workspace across all three pages.
- Task changes and settings survive reloads when local storage is available.
- Invalid storage falls back to the sample dataset.
- If a write fails, the preview is labeled “this session only.”
- Reset is explicit, confirmed, and limited to this demo storage key.
- Charts use a labeled sample dataset; the export contains the selected period’s chart rows.
- Invitations are local examples and never send email.

## Business data and workflows

The business templates use a separate provider and storage key, `vagabond-business-templates-v1`, so they do not overwrite the original task workspace. Explicit schemas validate data shapes, statuses, dates, identities, references, and processing invariants when loading. They use fictional names, sample orders, and local message histories.

### Parcel processing

The sorting and pickup views share a state machine:

```text
Received → Sorted → In transit → Ready for pickup → Collected
    └─────────────── Exception / resolution ───────────────┘
```

- A received parcel needs a lane before sorting.
- Only sorted parcels can be dispatched, individually or in a selected batch.
- The pickup point receives in-transit parcels and assigns a shelf.
- The domain command (not only the form) requires the fixture’s six-digit code; incorrect codes leave the parcel unchanged and append no event.
- Active parcels may be put on hold with a reason. Resolving the exception records a note and returns to the previous processing state.
- Collected parcels have no further processing action.
- Each transition appends a timestamped event to the parcel history.

Try `PKG-1042` for the full sorting-to-collection journey, `PKG-1044` for an inbound pickup delivery, `PKG-1045` for a ready collection, and `PKG-1048` for exception handling. Demo codes are shown in the collection dialog. This is a UI workflow example, not a production verification service.

### Chat and support

Messages are scoped by channel or DM room. Threads refer to a parent message; reactions and pins are persisted with messages. Own messages can be edited or deleted with undo. Enter sends; Shift+Enter adds a line; IME composition is respected.

Support replies and internal notes are saved to their ticket. Status, priority, and assignee updates persist. The linked-parcel panel reads the same parcel record used by logistics. No email, websocket, or external message service is connected.

### People and finance

New employees begin in onboarding with three checklist steps. Completing the checklist enables activation. Leave requests check date order and overlapping active requests. Requests can be approved or declined with a reason. Employment status is separate from leave-request approval, so approving future leave does not immediately mark an employee absent.

Invoices progress from Draft to Sent/Overdue to Paid. Payment recording requires a reference and does not process a transaction. The example ledger date is October 2, 2026. CSV exports quote values and neutralize formula-prefixed user text.

## Motion

All motion is tied to an interaction or entrance. Select a chart period to redraw its paths; move a task via its menu to see layout transitions; switch Board/List or settings sections to see the shared tab indicator; toggle a notification to see the spring thumb.

Dialogs retain fixed-grid centering and opacity-only entrances. Their geometry is covered by the original first-frame regression tests. Motion and CSS both honor the operating-system reduced-motion preference.

## Reuse

Copy the template directory and referenced component files. Import `templates.css`, the system tokens, and the fonts of your choice. Mount the template within `WorkspaceProvider`, or replace `useWorkspace` with an application data layer while retaining the presentational components.

The “View source” control dynamically loads the actual template source using Vite raw imports. Source is not fetched from a remote server.
