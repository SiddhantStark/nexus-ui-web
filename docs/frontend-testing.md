# Phase 8 — Browser regression testing and CI

Implemented on 2026-09-26 in the standalone `nexus-frontend` repository (`nexus-ui-web` on GitHub). No frontend behavior, APIs, or DTOs changed in this phase.

## Why these changes matter

Unit/component tests check focused behavior quickly. Browser tests exercise the built application, routing, lazy page loading, forms, dialogs, and state transitions together. Running both in CI gives reviewers repeatable checks instead of relying on a developer remembering each manual scenario.

Playwright is pinned in the development dependencies and pnpm lockfile. `playwright.config.ts` builds the production app with demo outcome controls disabled, then owns a loopback preview on port 8458. An occupied port fails the run instead of silently testing an old server. The test setup follows Playwright's [web server configuration](https://playwright.dev/docs/test-webserver) and [isolated test fixtures](https://playwright.dev/docs/test-fixtures).

## Coverage

| Area | Browser assertions |
| --- | --- |
| Registration and session lifetime | Register a customer, sign in, reload, and verify the session and newly registered account are gone. |
| Catalog and cart | Search and filter products, open a product, add it, increase/decrease quantity, verify the total, and remove the last item. |
| Checkout and order details | Required delivery validation, successful simulated payment, confirmation, order details, and paid status. |
| Cancellation and refund completion | Cancel the new paid order, verify pending refund, switch roles without reloading, approve the matching refund, and verify refunded order status. |
| Admin products and inventory | Edit a product name/price, verify the saved row, add stock, and verify the new quantity. |
| Admin refund decisions | Approve and reject independently seeded pending refunds; verify terminal status and removal of decision buttons. Rejection returns the order's payment to paid. |
| Customer access denial | Reject an admin return destination after customer sign-in and exercise the mounted admin route guard. |
| Narrow layout | Open a product and use the cart at 320 CSS pixels with touch emulation; verify the cart does not overflow the viewport. |

There are eight test cases, producing nine runs: all eight in desktop Chromium plus the viewport scenario in mobile Chromium. The mobile run is emulation, not a physical device test.

## Isolation and reliable failures

- Each test gets a new browser context and page. Mounting the app recreates its in-memory demo store, so tests do not depend on execution order or share mutations.
- Authentication happens through the visible sign-in form. Tests use links within an ongoing flow because a full document reload resets demo data.
- The access-denial test uses browser history and a navigation event to exercise the route guard while preserving the session; it does not alter application state or add a production test hook.
- External photo/font requests are blocked. This removes third-party availability from commerce checks and exercises existing image fallbacks; it does not test remote image availability.
- Tests assert visible results and wait for conditions rather than sleeping. Uncaught page errors fail a test. Retries are disabled so a failing run remains visible.
- Failure screenshots and traces are retained locally under `test-results/`; the HTML report is under `playwright-report/`. Both directories are ignored by Git.

## Local commands

Use Node 22.12+ on the 22.x line or Node 24.x and pnpm 10.34.3, as documented in the README. Run from the frontend repository root. Prefix commands with `corepack` if pnpm is not on your PATH.

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

On Linux, use `pnpm exec playwright install --with-deps chromium` to install browser system dependencies too. The browser test command builds its own bundle even if a previous build exists.

For debugging, use `pnpm test:e2e:ui`, `pnpm test:e2e --project=chromium`, or `pnpm exec playwright show-report`. View a failed trace with `pnpm exec playwright show-trace <trace.zip>`.

## CI

`.github/workflows/frontend.yml` runs on pushes, pull requests, and manual dispatch. It uses Node 22, the package manager version from `package.json`, a frozen-lockfile install, all frontend checks, and Chromium browser tests. CI runs two browser workers and rejects focused tests. Reports and failure traces are uploaded for seven days, following Playwright's [CI guidance](https://playwright.dev/docs/ci).

The workflow has read-only repository permissions, does not retain checkout credentials, and has a 20-minute job limit. A newer run for the same Git reference cancels the older run. It operates at this repository's root; it does not assume the parent NexusCommerce workspace is checked out.

The workflow is configured locally. Its first GitHub-hosted run happens after the changes are committed and pushed. Making its check mandatory for merging is a separate repository branch-protection setting.

## Verification and limits

Local verification passed the frozen-lockfile install, formatting, lint, type checks, all 93 unit/component tests across 18 files, the production build, and all nine browser runs. Browser runs used the Playwright-managed Chromium build on macOS. The GitHub-hosted Linux workflow has not been executed from this task.

The suite covers the main demo flows, not every screen combination or browser engine. Firefox, WebKit, real devices, visual snapshots, and a complete accessibility audit remain outside this phase. Failure outcomes and atomic commerce invariants retain their existing unit/component coverage; the production browser suite tests the normal checkout outcome.

## What remains simulated and deferred

- Accounts, session, catalog edits, inventory, cart, orders, payments, and refunds are held in memory and reset on refresh. Registration creates a temporary demo account.
- Payment, refund, delivery, and notification behavior is simulated. There are no real charges, shipments, emails, or durable records.
- Frontend role/ownership guards demonstrate UI access rules; backend authorization remains integration work.
- DTO definitions, API contracts/clients, persistent authentication, database persistence, server validation, transaction guarantees, payment providers, and deployment configuration need their own later plan.
