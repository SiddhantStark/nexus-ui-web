# NexusCommerce frontend

React + TypeScript + Vite + Tailwind CSS frontend exported from Figma Make; supports standalone local development.

## Development Server

Do not assume a server is running. Start `pnpm dev` when needed; `$PORT` defaults to 8443. Use `corepack pnpm` if pnpm is not on PATH.

- Local URL: `http://localhost:8443`; Figma-hosted sessions may provide a preview panel.
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
- `vite.config.ts` - Vite configuration with React, Tailwind CSS v4, and Figma Make plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm

## Dependencies

- Runtime: React 19, React DOM 19, and React Router 7
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/styles/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/styles/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/styles/index.css`, so global font wiring belongs in `src/styles/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

## Commands

Use pnpm 10.34.3 and the single pnpm lockfile. Install with `pnpm install --frozen-lockfile`. Run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before completing code changes. `pnpm build` checks TypeScript before bundling. Formatting targets source and JS/TS config; Figma-managed files are excluded. See README.md for runtime prerequisites and demo limitations.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.

## Testing

Vitest uses a separate `vitest.config.ts` with jsdom and `src/test/setup.ts`. Colocate `*.test.ts(x)` with the tested feature. Use `src/test/renderWithApp.tsx` when the real demo provider is required; each render starts fresh. Import Vitest APIs explicitly and assert user-visible behavior. Run `pnpm test` for a single pass or `pnpm test:watch` while developing. Add regression coverage with the later behavior fixes rather than encoding known bugs as expected behavior.

## Dependency rules

Use `@/` imports for cross-directory source references. App code composes features and injects mock implementations. Feature production code must not import `app/`, `mocks/`, or test helpers. Shared production code must not import app, features, or mocks. Features may use other features through focused hooks/components or type-only contracts; avoid circular runtime imports. The commerce contract is an intentional coordination boundary for atomic checkout/refund/inventory operations, not a general catch-all context. Keep new frontend types with their owner, and do not recreate a `types/index.ts` barrel or `useApp` facade. Shared badges accept labels/styles; feature badges own status meaning.

Run `src/test/architecture.test.ts` with the regular test suite. Test files may use app providers and mock fixtures. Add cart display fields through selectors from the current catalog, not by duplicating products in stored cart entries. Preserve historical order snapshots.
