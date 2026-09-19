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

Run formatting, lint, typecheck, tests, and build before submitting changes. The formatter covers source, project configuration, and frontend setup documentation. It excludes generated output, Figma-managed files, and the imported design brief. oxfmt was updated from 0.2.0 after that version was verified to remove required separators in inline TypeScript types.

ESLint 9 is temporarily retained because eslint-plugin-jsx-a11y 6.10.2 declares peer support only through ESLint 9. npm marks ESLint 9 deprecated; upgrade to a supported ESLint major when the accessibility plugin supports it. No rules are disabled globally.

## Tests

- `pnpm test`: run all component/unit tests once; failures return a nonzero exit code.
- `pnpm test:watch`: rerun affected tests while developing; press `q` to quit.
- `pnpm test src/components/ui/ProductCard.test.tsx`: run one test file.

Vitest uses its own `vitest.config.ts`, React transforms, the `@` alias, and jsdom. It does not load the Figma preview plugins. jsdom 26 retains compatibility with the documented Node range; newer jsdom releases require higher Node patch versions.

Place `*.test.ts` or `*.test.tsx` beside the component/feature being tested. Import `describe`, `it`, `expect`, and `vi` explicitly from Vitest. `src/test/setup.ts` installs jest-dom assertions, cleans up mounted components after each test, restores real timers, and stubs the scrolling API missing from jsdom. Vitest clears/restores mocks between tests.

Use `renderWithApp` from `src/test/renderWithApp.tsx` for components requiring the existing AppProvider. It creates a fresh provider inside MemoryRouter under StrictMode and returns a user-event session alongside Testing Library's render result. Use plain Testing Library `render` for provider-independent controls. Avoid shared mutable fixtures, snapshots of whole pages, and assertions on CSS classes/internal state. Await user interactions and assert visible outcomes.

Initial coverage checks product-card/cart integration, out-of-stock behavior, and confirmation/cancellation actions. Regression tests cover registration, checkout failures/unmounts, stock limits, cancellation, refund rejection/completion, and repeated actions. These DOM tests do not verify real-browser layout, keyboard focus trapping, or complete commerce workflows; browser coverage remains later work. Testing setup follows [Vitest configuration](https://vitest.dev/guide/index.html) and [Testing Library setup](https://testing-library.com/docs/react-testing-library/setup/).

## Demo accounts and limitations

| Role     | Email                      | Password    |
| -------- | -------------------------- | ----------- |
| Customer | customer@nexuscommerce.com | password123 |
| Admin    | admin@nexuscommerce.com    | admin123    |

These are public demo credentials, not real accounts. Refresh resets the session, cart, product edits, orders, transactions, and refunds. Registration creates a customer account for the current mounted app session only. Emails are normalized and duplicates rejected. New accounts disappear on refresh; passwords are never written to browser storage. Checkout/payment/refund outcomes are simulated. Do not enter real card information. Routes enforce demo sign-in, admin roles, and customer order ownership. These frontend checks are not a backend security boundary.

## Demo commerce behavior

Cart additions and quantity changes validate current catalog availability and whole-number quantities. If inventory is reduced or a product is disabled, affected cart items show an error and checkout is blocked until corrected or removed.

Checkout is explicitly simulated: it collects delivery information but no card details. A successful attempt updates inventory, orders, payment transactions, and cart together. Repeated submissions cannot duplicate that attempt. Leaving the checkout screen during processing cancels it. Editing the cart/catalog during processing requires a new attempt.

Outcome selectors are shown in Vite development mode, or when explicitly building with `VITE_DEMO_MODE=true`. A normal production build hides them but remains a demo; it does not become a real payment application. Example: `VITE_DEMO_MODE=true pnpm build`. Do not put secrets in Vite environment variables.

Paid cancellations restore stock once and create a pending refund. Admin approval and completion share one operation that updates the refund, order, and reversal transaction. Rejection/failure returns payment to paid without creating a reversal; a fresh request may then be made. See [demo transition table](docs/demo-transitions.md) for the rules and fixture assumptions. Demo operations and routes enforce their role/ownership checks.

## URL routing

See [route behavior and verification](docs/routing.md) for the route map and manual checks. Login and registration are public. Store pages require sign-in; `/admin/*` additionally requires the admin role. Product/order URLs contain record IDs. Missing records and other customers' orders show a not-found message.

Sign-in preserves a permitted internal destination in `next`; registration links retain it. Catalog URLs support `q`, `category`, `maxPrice`, `sort`, and `page`. Category, sort, and page changes create history entries; typing search/price replaces the current entry. Invalid filters fall back to defaults and page numbers are clamped to available results.

A refresh or new tab resets the in-memory demo session/data and prompts for sign-in before returning to the requested URL. Newly created records disappear on refresh. Production hosting must serve `index.html` for application paths; hosting rewrite configuration is deferred to deployment. Vite development/preview supports SPA fallback. The router derives its base pathname from Vite's base URL, including Figma preview URLs.

Routing regression tests cover direct links, registration redirects, ownership, role guards, sign-out, browser history, missing records, query normalization, and safe post-login destinations. Layout and full browser workflow coverage remain separate from DOM tests.

## Structure and baseline

- `src/App.tsx`: BrowserRouter, demo provider, and toast composition.
- `src/app/router.tsx`: nested route tree, sign-in/admin guards, and route error screens.
- `src/pages/{auth,customer,admin}`: application screens.
- `src/components/{layout,ui}`: layouts and shared controls.
- `src/context/AppContext.tsx`: current shared demo state.
- `src/data/mockData.ts` and `src/types/index.ts`: fixtures and frontend types.
- `src/index.css`: global styles and Tailwind entrypoint.

See [screen baseline](../docs/frontend-screen-baseline.md) and the [step-by-step improvement plan](../docs/frontend-improvement-plan.md). Feature folder reorganization is Phase 5; APIs and DTOs remain deferred.

## Repository boundary

Verified on 2026-09-16: the frontend has its own repository rooted at `NexusCommerce/nexus-frontend`, with initial commit `6efb43c` (`first commit`). Run Git commands from this directory and verify the root with `git rev-parse --show-toplevel` before staging.

The parent `NexusCommerce` folder, sibling backend, and shared `../docs/` files are outside this repository and still resolve to the Desktop repository. The documentation links above work in the current workspace, but those shared documents are not included in a standalone frontend clone. No parent-repository changes are needed for frontend commits.
