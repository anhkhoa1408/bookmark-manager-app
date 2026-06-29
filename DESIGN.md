# bookmark-manager-app Design Guidelines

## Source

- Figma file: `bookmark-manager-app`
- Figma page: `Overview`
- Extracted at: `2026-06-28T05:31:38.121Z`
- Implementation source: `src/styles.css`

This document defines the design system rules for this app. Figma is the design source, while `src/styles.css` is the implementation source for Tailwind v4 tokens and utilities.

## Design Principles

- Use existing design tokens before introducing new visual values.
- Keep Figma token names and CSS token values synchronized.
- Build UI with the Atomic Design structure already used in `src/components`.
- Keep atoms generic and free from business or data-fetching logic.
- Preserve visible hover, active, disabled, invalid, and focus-visible states.
- Prefer tokenized colors, spacing, typography, radius, and effects over raw one-off values.

## Atomic Design

| Layer | Folder | Responsibility |
| --- | --- | --- |
| Atoms | `src/components/atoms` | Base primitives: buttons, inputs, cards, labels, checkboxes, separators, dropdowns, toasts |
| Molecules | `src/components/molecules` | Small composed UI: bookmark cards, dialogs, action menus, profile menu, logo, avatar |
| Organisms | `src/components/organisms` | Larger feature sections: header, sidebar, auth forms, bookmark grid, import dialog |
| Templates | `src/components/templates` | Route and page layout shells |

Rules:

- Reuse existing atoms before adding a new primitive.
- Keep shadcn/ui-style primitives in `atoms`.
- Delete unused variants, props, helpers, and scaffolded exports when adapting primitives.
- Put feature coordination in organisms, not atoms.

## Color Tokens

Use Tailwind classes generated from `src/styles.css`, such as `bg-neutral-100`, `text-neutral-900`, `border-neutral-400`, and `dark:bg-neutral-dark-800`.

### Neutral Light Mode

| Figma token | CSS/Tailwind token | Value | Usage |
| --- | --- | --- | --- |
| `Collections/colors/neutral (light mode)/0` | `neutral-0` | `#FFFFFF` | white surfaces, cards, controls |
| `Collections/colors/neutral (light mode)/100` | `neutral-100` | `#E8F0EF` | app background |
| `Collections/colors/neutral (light mode)/300` | `neutral-300` | `#DDE9E7` | subtle hover and soft backgrounds |
| `Collections/colors/neutral (light mode)/400` | `neutral-400` | `#C0CFCC` | borders and dividers |
| `Collections/colors/neutral (light mode)/500` | `neutral-500` | `#899492` | stronger borders, muted UI |
| `Collections/colors/neutral (light mode)/800` | `neutral-800` | `#4C5C59` | secondary text |
| `Collections/colors/neutral (light mode)/900` | `neutral-900` | `#051513` | primary text |

### Neutral Dark Mode

| Figma token | CSS/Tailwind token | Value | Usage |
| --- | --- | --- | --- |
| `Collections/colors/neutral (dark mode)/0` | `neutral-dark-0` | `#FFFFFF` | primary text on dark surfaces |
| `Collections/colors/neutral (dark mode)/100` | `neutral-dark-100` | `#B1B9B9` | secondary text on dark surfaces |
| `Collections/colors/neutral (dark mode)/300` | `neutral-dark-300` | `#00706E` | dark-mode borders and accents |
| `Collections/colors/neutral (dark mode)/400` | `neutral-dark-400` | `#004746` | subdued borders |
| `Collections/colors/neutral (dark mode)/500` | `neutral-dark-500` | `#004241` | hover surfaces |
| `Collections/colors/neutral (dark mode)/600` | `neutral-dark-600` | `#002E2D` | controls and input surfaces |
| `Collections/colors/neutral (dark mode)/800` | `neutral-dark-800` | `#001F1F` | elevated dark surfaces |
| `Collections/colors/neutral (dark mode)/900` | `neutral-dark-900` | `#001414` | deepest dark background |

### Accent and Feedback

| Figma token | CSS/Tailwind token | Value | Usage |
| --- | --- | --- | --- |
| `Collections/colors/teal/700` | `teal-700` | `#014745` | primary actions, checked states, focus rings |
| `Collections/colors/teal/800` | `teal-800` | `#013C3B` | primary hover and active states |
| `Collections/colors/red/600` | `red-600` | `#FD4740` | error accents and alert emphasis |
| `Collections/colors/red/800` | `red-800` | `#CB0A04` | destructive actions, invalid states, error text |

Color rules:

- Use `neutral-900` for primary text in light mode.
- Use `neutral-800` for secondary text in light mode.
- Use `neutral-dark-0` or `neutral-dark-100` for text in dark mode.
- Use teal only for primary interaction, selection, and focus.
- Use red only for invalid, error, or destructive states.
- Favicon image tokens from Figma are asset references, not reusable UI color tokens.

## Typography Tokens

Font family: Manrope.

Use the utility classes defined in `src/styles.css`.

| Figma token | CSS utility | Font | Size | Line height | Weight | Tracking | Usage |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `text-preset-1` | `text-preset-1` | Manrope | `24px` | `140%` | Bold `700` | `0px` | page titles, main card titles |
| `text-preset-2` | `text-preset-2` | Manrope | `20px` | `120%` | Bold `700` | `0px` | section headings |
| `text-preset-2 (semibold)` | `text-preset-2sb` | Manrope | `20px` | `120%` | SemiBold `600` | `0%` | softer section headings |
| `text-preset-3` | `text-preset-3` | Manrope | `16px` | `140%` | SemiBold `600` | `0%` | buttons, emphasized labels |
| `text-preset-3 (Medium)` | `text-preset-3m` | Manrope | `16px` | `130%` | Medium `500` | `0%` | prominent body text |
| `text-preset-4` | `text-preset-4` | Manrope | `14px` | `140%` | SemiBold `600` | `0%` | field labels, compact headings |
| `text-preset-4 (Medium)` | `text-preset-4m` | Manrope | `14px` | `150%` | Medium `500` | `1%` in Figma, `0` in CSS | body copy, descriptions, inputs |
| `text-preset-5` | `text-preset-5` | Manrope | `12px` | `140%` | Medium `500` | `0%` | metadata and helper text |

Typography rules:

- Use preset utilities instead of ad hoc `text-*`, `font-*`, and `leading-*` combinations.
- Keep button labels on `text-preset-3`.
- Keep inputs and descriptions on `text-preset-4m`.
- Use `text-preset-1` only for top-level titles and important card titles.
- If Figma tracking must be matched for `text-preset-4m`, add the tracking token to `src/styles.css` first.

## Spacing Tokens

Figma spacing tokens map directly to Tailwind spacing tokens in `src/styles.css`.

| Figma token | Tailwind token | Value |
| --- | --- | --- |
| `spacing/0` | `0` | `0px` |
| `spacing/025` | `2` | `2px` |
| `spacing/050` | `4` | `4px` |
| `spacing/075` | `6` | `6px` |
| `spacing/100` | `8` | `8px` |
| `spacing/125` | `10` | `10px` |
| `spacing/150` | `12` | `12px` |
| `spacing/200` | `16` | `16px` |
| `spacing/250` | `20` | `20px` |
| `spacing/300` | `24` | `24px` |
| `spacing/400` | `32` | `32px` |
| `spacing/500` | `40` | `40px` |
| `spacing/600` | `48` | `48px` |
| `spacing/800` | `64` | `64px` |
| `spacing/1000` | `80` | `80px` |
| `spacing/1200` | `96` | `96px` |
| `spacing/1400` | `112` | `112px` |
| `spacing/1600` | `128` | `128px` |
| `spacing/1800` | `140` | `140px` |

Spacing rules:

- Use `gap-*` for internal component rhythm.
- Use `p-12` for compact controls.
- Use `p-16` or `p-24` for medium content blocks.
- Use `p-32` for larger cards and page content areas.
- Prefer `gap-8`, `gap-12`, `gap-16`, `gap-24`, and `gap-32`.
- Avoid arbitrary spacing values unless a layout cannot be expressed with the token scale.

## Radius Tokens

| Figma token | Tailwind token | Value | Status |
| --- | --- | --- | --- |
| `corner-radius/0` | `rounded-0` | `0px` | implemented |
| `corner-radius/2` | `rounded-2` | `2px` | Figma only; not currently in `src/styles.css` |
| `corner-radius/4` | `rounded-4` | `4px` | implemented |
| `corner-radius/6` | `rounded-6` | `6px` | implemented |
| `corner-radius/8` | `rounded-8` | `8px` | implemented |
| `corner-radius/10` | `rounded-10` | `10px` | implemented |
| `corner-radius/12` | `rounded-12` | `12px` | implemented |
| `corner-radius/16` | `rounded-16` | `16px` | implemented |
| `corner-radius/20` | `rounded-20` | `20px` | implemented |
| `corner-radius/24` | `rounded-24` | `24px` | implemented |
| `corner-radius/full` | `rounded-full` | `999px` | implemented |

Radius rules:

- Use `rounded-4` for small controls such as checkboxes.
- Use `rounded-8` for buttons, inputs, and compact interactive surfaces.
- Use `rounded-12` for cards and larger containers.
- Use `rounded-full` for avatars, circular icon buttons, and true pill shapes.
- Add `--radius-2` to `src/styles.css` before using Figma's `2px` radius token.

## Effects

| Figma style | CSS implementation | Usage |
| --- | --- | --- |
| `button-shadowXs` | `shadow-button` | inset button border treatment |
| `Focus-ring` | `focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:ring-offset-white` | light-mode keyboard focus |
| `Focus-ring (Dark)` | `dark:focus-visible:ring-neutral-dark-100 dark:focus-visible:ring-offset-neutral-dark-800` | dark-mode keyboard focus |
| `Card-shadow` | `shadow-[0_2px_4px_0_rgba(21,21,21,0.06)]` | elevated card surfaces |

Effect rules:

- Preserve focus-visible treatment on all interactive elements.
- Prefer borders and tokenized surfaces before adding new shadows.
- Use card shadow only for framed content or repeated cards.
- Do not add decorative glow effects unless they become named tokens.

## Motion

No motion variables were found in Figma. The project includes `tw-animate-css`, but motion should remain functional and restrained.

Motion rules:

- Use motion for state changes, menus, dialogs, and feedback.
- Keep animation durations and easing consistent with existing primitives.
- Do not introduce decorative animation without a product reason.

## Component Standards

### Button

Current atom: `src/components/atoms/button.tsx`.

Variants:

- `primary`: `bg-teal-700`, `hover:bg-teal-800`, `text-neutral-0`
- `secondary`: neutral surface with tokenized border and dark-mode support
- `error`: `bg-red-800`, `text-neutral-0`

Sizes:

- `default`: `px-16 py-12`
- `icon`: `min-w-32 h-32 p-0`

Rules:

- Use `primary` for the main action in a view or dialog.
- Use `secondary` for lower-emphasis actions.
- Use `error` only for destructive actions.
- Use lucide-react icons for recognizable actions.
- Icon-only buttons must have an accessible label.

### Input

Current atom: `src/components/atoms/input.tsx`.

Rules:

- Use `text-preset-4m`, `p-12`, `rounded-8`, and tokenized neutral borders.
- Use `aria-invalid` to trigger invalid styling.
- Preserve hover, disabled, and focus-visible states.
- Keep placeholder text readable and secondary.

### Card

Current atom: `src/components/atoms/card.tsx`.

Rules:

- Use cards for repeated items, dialogs, and intentionally framed content.
- Default structure is `flex flex-col gap-32 p-32 bg-neutral-0 rounded-12`.
- Use `CardTitle` for title typography and `CardDescription` for supporting copy.
- Avoid putting cards inside cards unless the inner card is a genuinely repeated item.

### Checkbox

Rules:

- Use `size-16`, `rounded-4`, and tokenized borders.
- Use `teal-700` for checked state.
- Preserve focus-visible rings and disabled states.

## Dark Mode

Dark mode is implemented through the `.dark` custom variant in `src/styles.css`.

Rules:

- Use `dark:*` classes with `neutral-dark-*` tokens.
- Use `neutral-dark-900` for deepest backgrounds.
- Use `neutral-dark-800` for elevated surfaces.
- Use `neutral-dark-600` for inputs and controls.
- Keep text contrast high with `neutral-dark-0` and `neutral-dark-100`.

## Icons and Assets

Use `lucide-react` for interface icons.

Figma favicon image tokens are app content assets and should not be treated as design-system colors.

Rules:

- Prefer `size-16`, `size-20`, and `size-24` for icons.
- Pair unfamiliar icon-only actions with accessible labels and tooltips where appropriate.
- Use favicon assets only when representing bookmark sources.

## Responsive Layout

The current Tailwind theme defines `2xl` at `1440px`.

Rules:

- Design mobile-first and scale up.
- Use flexible grid and wrapping patterns for bookmark lists and control rows.
- Give fixed-format controls stable dimensions.
- Prevent text overflow in buttons, cards, sidebars, and dialogs.

## Implementation Checklist

- Check Figma token first.
- Check `src/styles.css` token second.
- Use existing atom or molecule when available.
- Add missing tokens to `src/styles.css` before using new repeated values.
- Keep component classes tokenized and readable.
- Verify light mode, dark mode, hover, focus-visible, disabled, and error states.

