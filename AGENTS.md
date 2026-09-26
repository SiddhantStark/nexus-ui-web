# NexusCommerce frontend

React + TypeScript + Vite + Tailwind CSS frontend exported from Figma Make; supports standalone local development.

## Development Server

Do not assume a server is running. Start `pnpm dev` when needed; `$PORT` defaults to 8443. Use `corepack pnpm` if pnpm is not on PATH.

- Local URL: `http://127.0.0.1:8443`; use `PORT` for a different port. Figma Make support has been removed.
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; imports `src/styles/index.css` and mounts `src/app/App.tsx` into the `#root` element
- `src/app/App.tsx` - BrowserRouter, demo provider, and toast composition
- `src/app/router.tsx` - Nested routes, session/admin guards, and fallback screens
- `src/app/providers.tsx` - Composition root; creates the demo store and injects it into feature providers
- `src/app/layouts/` - Customer/admin layout shells and navigation
- `src/features/` - Business features owning pages, hooks, components, frontend types, and colocated tests
- `src/features/commerce/store.ts` - Explicit cross-feature commerce contract; implementation lives in `src/mocks/demo-store.ts`
- `src/mocks/fixtures/` - Demo accounts and domain fixture collections
- `src/shared/ui/` and `src/shared/notifications/` - Domain-independent controls and notification infrastructure
- `docs/frontend-architecture.md` - State ownership and dependency rules
- `docs/design/nexuscommerce-design.md` - Original Figma design brief
- `src/styles/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Standalone Vite configuration with React, Tailwind CSS v4, and the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm

## Dependencies

- Runtime: React 19, React DOM 19, React Router 7, and Radix Dialog
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/styles/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/styles/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/styles/index.css`, so global font wiring belongs in `src/styles/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

## Commands

Use pnpm 10.34.3 and the single pnpm lockfile. Install with `pnpm install --frozen-lockfile`. Run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before completing code changes. `pnpm build` checks TypeScript before bundling. Formatting targets source, JS/TS config, README, and this guide. See README.md for runtime prerequisites and demo limitations.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.

## Testing

Vitest uses a separate `vitest.config.ts` with jsdom and `src/test/setup.ts`. Colocate `*.test.ts(x)` with the tested feature. Use `src/test/renderWithApp.tsx` when the real demo provider is required; each render starts fresh. Import Vitest APIs explicitly and assert user-visible behavior. Run `pnpm test` for a single pass or `pnpm test:watch` while developing. Add regression coverage with the later behavior fixes rather than encoding known bugs as expected behavior.

## Dependency rules

Use `@/` imports for cross-directory source references. App code composes features and injects mock implementations. Feature production code must not import `app/`, `mocks/`, or test helpers. Shared production code must not import app, features, or mocks. Features may use other features through focused hooks/components or type-only contracts; avoid circular runtime imports. The commerce contract is an intentional coordination boundary for atomic checkout/refund/inventory operations, not a general catch-all context. Keep new frontend types with their owner, and do not recreate a `types/index.ts` barrel or `useApp` facade. Shared badges accept labels/styles; feature badges own status meaning.

Run `src/test/architecture.test.ts` with the regular test suite. Test files may use app providers and mock fixtures. Add cart display fields through selectors from the current catalog, not by duplicating products in stored cart entries. Preserve historical order snapshots.

## Accessibility and responsive behavior

Use the shared Input/Select/Textarea for visible labels and associated helper/errors. Use native form submission and explicitly mark submit buttons; shared Button defaults to `type="button"`. Give icon controls meaningful accessible names. Use shared Modal/ConfirmDialog (Radix Dialog) for focus containment, Escape, initial focus, and restoration. ConfirmDialog starts focus on Cancel; form dialogs focus their first field. Keep required validation inside the dialog.

Wrap wide tables in shared ScrollRegion with a meaningful label and column header scopes. Keep the surrounding flex/grid children shrinkable; fix page overflow rather than hiding it on the body. Use usePagination for local lists that can shrink; shareable catalog pagination remains in the URL. Preserve visible focus styles and the reduced-motion override. See docs/accessibility.md for the manual checks to repeat.

Use `src/test/checkAccessibility.ts` for representative axe-core checks. Its jsdom run deliberately excludes color contrast; inspect actual rendered colors and responsive layouts in a browser. Automated rules do not establish complete accessibility compliance. The two targeted lint exceptions cover a keyboard-scrollable region and a bubbling Escape handler on the header; do not disable accessibility rules globally.

## Resilience conventions

Figma Make round-tripping was explicitly removed in Phase 7. Keep metadata in index.html and the demo crawler policy in public/robots.txt; do not restore the exported preview plugins. Use PUBLIC_BASE_PATH for non-root builds and DEV_SERVER_HOST only when intentionally changing the loopback bind.

Declare React.lazy pages at module scope in app/router.tsx. Preserve the loading screen and route/application error boundaries. Rejected lazy imports need a full reload to retry; explain the demo reset rather than repeatedly retrying a cached rejection. Keep async operation failures in their existing explicit Outcome/notification path.

Use shared/lib/format.ts for USD and en-US date/time display (viewer-local time zone), shared/lib/money.ts for cents arithmetic, and shared/ui/Image for image fallbacks. Preserve image container dimensions. Historical fixture IDs/timestamps are deliberate reference data, not current activity. Architecture checks include dynamic imports. See docs/frontend-resilience.md for Phase 7 decisions and verification.
