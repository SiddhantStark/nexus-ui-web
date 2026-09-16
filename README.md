# NexusCommerce frontend

React 19, TypeScript, Vite 8, and Tailwind CSS v4 frontend exported from Figma Make. The current application uses in-memory demo data; it does not call commerce APIs.

## Setup

Use Node.js 22.12+ on the 22.x line, or Node.js 24.x, and **pnpm 10.34.3**. `.mise.toml` configures Node 22 and pnpm for mise users. `package.json` pins the package manager for Corepack users.

From this directory:

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

If Corepack is unavailable, install the pinned pnpm version using your normal Node toolchain and run `pnpm` directly. Do not use npm install or generate a second lockfile.

The development URL defaults to `http://localhost:8443`. The server is not automatically started outside Figma Make. `PORT` overrides the port; strict port mode reports an error if it is already occupied. `FIGMA_DEV_SERVER_HOST=127.0.0.1` can restrict the default all-interface bind to localhost.

Keep `.figma/make/site.json`: the Vite configuration uses it for HTML metadata. Figma preview plugins are retained during this tooling phase. No `.env` file or API credentials are required for the demo.

## Commands

Use `pnpm` below, or `corepack pnpm` if pnpm is not on your PATH.

| Command             | Purpose                                                  |
| ------------------- | -------------------------------------------------------- |
| `pnpm dev`          | Start the development server                             |
| `pnpm typecheck`    | Check TypeScript without emitting files                  |
| `pnpm lint`         | Check source/configuration; fail on warnings             |
| `pnpm lint:fix`     | Apply supported lint fixes, then report remaining issues |
| `pnpm format`       | Format source and JS/TS configuration with oxfmt         |
| `pnpm format:check` | Check those files without writing                        |
| `pnpm build`        | Typecheck, then create the production bundle in `dist/`  |
| `pnpm preview`      | Serve an existing production build on port 8443          |

Run formatting, lint, typecheck, and build before submitting changes. Tests will be introduced in Phase 2 of the improvement plan. The formatter covers source, project configuration, and frontend setup documentation. It excludes generated output, Figma-managed files, and the imported design brief. oxfmt was updated from 0.2.0 after that version was verified to remove required separators in inline TypeScript types.

ESLint 9 is temporarily retained because eslint-plugin-jsx-a11y 6.10.2 declares peer support only through ESLint 9. npm marks ESLint 9 deprecated; upgrade to a supported ESLint major when the accessibility plugin supports it. One line-level React purity suppression documents a false positive: the refund timestamp is generated only in a confirmation-button handler, not during render. No rules are disabled globally.

## Demo accounts and limitations

| Role     | Email                      | Password    |
| -------- | -------------------------- | ----------- |
| Customer | customer@nexuscommerce.com | password123 |
| Admin    | admin@nexuscommerce.com    | admin123    |

These are public demo credentials, not real accounts. Refresh resets the session, cart, product edits, orders, transactions, and refunds. Registration currently does not create a user and its signed-out route is broken. Checkout/payment/refund outcomes are simulated. Do not enter real card information. Frontend role/ownership enforcement remains scheduled work.

## Structure and baseline

- `src/App.tsx`: current in-memory page switch.
- `src/pages/{auth,customer,admin}`: application screens.
- `src/components/{layout,ui}`: layouts and shared controls.
- `src/context/AppContext.tsx`: current shared demo state.
- `src/data/mockData.ts` and `src/types/index.ts`: fixtures and frontend types.
- `src/index.css`: global styles and Tailwind entrypoint.

See [screen baseline](../docs/frontend-screen-baseline.md) and the [step-by-step improvement plan](../docs/frontend-improvement-plan.md). Folder moves, URL routing, and API integration are not part of Phase 1.

## Repository boundary

During setup, `git rev-parse --show-toplevel` resolved to `/Users/siddhantprasad/Desktop`, not NexusCommerce. Check this before staging changes. Select an intentional project repository root before making commits; avoid staging unrelated Desktop files. No repository was initialized or changed by the frontend tooling work.
