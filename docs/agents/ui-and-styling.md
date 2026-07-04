# UI and Styling

- Follow the existing Atomic Design split: atoms, molecules, organisms, templates.
- Keep business/data access logic out of atoms and molecules.
- Reuse existing atoms before adding new primitives.
- Use `lucide-react` icons when icons are needed.
- shadcn/ui primitives belong in `src/components/atoms`.
- When adding or adapting shadcn/ui components, delete unused variants, exports, helpers, props, imports, and scaffolded code.
- Use Tailwind tokens from `src/styles.css`; avoid repeated raw colors.
- Prefer Tailwind utilities, but if the same class group appears multiple times, extract a named class in `src/styles.css` with `@apply`.
- Keep layouts responsive and do not introduce another design system.
