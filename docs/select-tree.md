# Select Tree experiment

Open `/#component/select-tree`. The existing Select page also links to a live comparison. Select Tree is opt-in; the ordinary Radix Select is still appropriate for flat choices.

## Try it

1. Open **Pickup destination**. The current selection’s ancestors open automatically.
2. Click **United Kingdom** to choose the whole country (`uk`), or **London** to choose the city (`london`). Labels select the scope; chevrons expand it.
3. Use the chevrons to expand **United Kingdom → Manchester**, then choose **Piccadilly** for a single destination.
4. Search **Berlin** and press Enter to choose the city, or use Right Arrow to browse its pickup points. Search keeps the matching hierarchy rather than flattening the results.
5. Search **Northgate** to inspect a disabled destination. Enter does not select a non-matching ancestor on its behalf.
6. Try the required form example, including selecting a country/city, empty submission, and Reset.
7. In **Project scope**, the Design branch is itself selectable. Its chevron expands the group; its label selects the whole group.
8. Compare the location example’s globe/pin icons with the plain project tree. Icons are supplied per option, never added automatically.

## API

```tsx
import { SelectTree, type SelectTreeOption } from 'vagabond-ui/select-tree'
import { Globe2, MapPin } from 'lucide-react'

const options: SelectTreeOption[] = [
  {
    value: 'uk',
    label: 'United Kingdom',
    icon: <Globe2 size={16} />,
    selectable: true,
    children: [
      {
        value: 'london',
        label: 'London',
        icon: <MapPin size={16} />,
        selectable: true,
        children: [
          { value: 'central', label: 'Central Station' },
          { value: 'harbor', label: 'East Harbor', disabled: true },
        ],
      },
    ],
  },
]

<SelectTree
  label="Destination"
  options={options}
  defaultValue="central"
  name="destination"
  required
  clearable
/>
```

- `value` / `onValueChange` support controlled selection; `defaultValue` supports uncontrolled use.
- Values are globally unique, non-empty IDs. An empty string means no selection.
- Branches are non-selectable by default. Use `selectable: true` to make a branch a valid choice.
- Selecting a branch returns that branch’s ID as the single value, e.g. `uk` or `london`. It represents the group’s scope; it does not emit an array of child values or mark each child separately selected.
- `icon?: ReactNode` supplies an optional decorative icon. Omit it for a plain text row; there are no automatic folder icons or group badges. Mixed trees reserve a consistent icon column so child labels remain correctly indented. Icons do not affect accessible names, search, or submitted values.
- Disabled nodes cannot be selected or expanded. Their descendants inherit the disabled state.
- Search matches labels, descriptions, and ancestor names; accents and case are normalized. Matching branches initially expand, and can still be collapsed while browsing results.
- Closing with Escape or clicking outside preserves the committed value. Arrow navigation does not submit a new value.
- `name`, `form`, `required`, and `disabled` integrate with native forms through a hidden select. Uncontrolled form reset restores the default; controlled consumers own their reset value.
- The trigger displays the selected path, with truncation and a full-path title when space is limited.
- Existing trigger props, including `ref`, are forwarded. `className` styles the trigger and `contentClassName` styles the popup.

## Keyboard and accessibility

The trigger is a select-only combobox with a **dialog popup**. This allows a search field, a single-select tree, and clear/close controls inside one focus-managed popup. The tree uses actual nested `treeitem` / `group` structure, declared levels, expansion state, and a roving tab stop.

- Enter / Space / Down opens the picker; Down starts at the selected or first node.
- Up can open at the last visible node.
- Up / Down traverses visible nodes; Right expands or enters a branch; Left collapses or returns to the parent.
- Home / End reaches the first / last visible node.
- Type-ahead while the tree is focused moves to a matching visible label.
- Enter / Space selects an enabled choice or expands a grouping node.
- Escape dismisses; focus returns to the trigger. Tab stays within the popup controls while it is open.

The experiment follows the [APG combobox dialog-popup interaction](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) and [tree-view pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/). Automated checks cover the interaction model and axe findings; they are not a screen-reader certification.

## Source

- `packages/ui/src/components/ui/select-tree.tsx`: public form control and popup composition.
- `packages/ui/src/components/ui/internal/use-select-tree.ts`: state, keyboard coordination, and native form reset.
- `packages/ui/src/components/ui/internal/select-tree-model.ts`: indexing, path lookup, filtering, and traversal.
- `packages/ui/src/components/ui/internal/select-tree-view.tsx`: nested tree rendering.
- `src/showcase/demos/select-tree.tsx`: location and project-scope examples.

The control uses existing Radix primitives and brand tokens. It keeps a 14px text floor and respects reduced-motion preferences. No additional dependency is required.
