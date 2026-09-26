# Phase 7 — Frontend resilience and scaffold cleanup

Completed on 2026-09-23. This phase covers the frontend demo only; DTOs, APIs, and real payment processing remain deferred.

## Decisions and reasons

| Change | Why it helps a maintained codebase | Implementation |
| --- | --- | --- |
| Remove Figma Make runtime support, as explicitly requested | Normal development no longer depends on generated preview/deployment scripts or editor-specific plugins. | Removed `.figma/make/`; simplified `vite.config.ts` to React, Tailwind v4, the source alias, and server settings. The historical design brief remains in `docs/design/`. |
| Use standard HTML metadata and ESM configuration | Page metadata has one obvious owner, and configuration avoids the old `__dirname` and JSON import compatibility warnings. | `index.html` owns the title, language, description, Open Graph, and noindex metadata. `public/robots.txt` retains the demo crawler policy. The alias uses `fileURLToPath(new URL(..., import.meta.url))`. |
| Load customer and admin pages on demand | Initial navigation does not need every screen's code. A visible loading state explains slower page loads. | Module-level `React.lazy` declarations in `src/app/router.tsx`, with `RouteLoading` under Suspense. Authentication remains eager. Architecture tests now inspect dynamic imports as well as static imports. |
| Add recoverable page and application boundaries | A rendering or page-module failure has an understandable recovery screen instead of a blank application. | The route boundary sits inside the providers and resets when the pathname changes. Returning to the store preserves the current demo state. An outer boundary also covers provider/application rendering failures. |
| Centralize currency and date display | Screens follow the same display policy and invalid values do not produce misleading text. | `src/shared/lib/format.ts` uses USD, `en-US`, and the viewer's local time zone. Invalid values display an em dash. |
| Calculate money using cents | Cart, checkout, payment, and refund calculations agree when prices contain decimals. | `src/shared/lib/money.ts` rounds amounts to integer cents before arithmetic. Product saves normalize prices, and demo operations validate supported amounts. UI models still expose amounts in dollars. |
| Reuse an image fallback | Missing images remain understandable without collapsing an existing image container. | `src/shared/ui/Image.tsx` preserves caller dimensions, handles empty/broken sources, and retries when the source changes. Most images load lazily; prominent product/hero images load eagerly. |
| Remove misleading demo content | The interface describes what the application actually does. | Replaced invented ratings, account/sales statistics, and real shipping/encryption claims with demo explanations. Category counts derive from active products; copyright years use the current year. |
| Correct narrow dashboard cards | Grouped currency values remain readable on small screens. | Dashboard cards use a single column at narrow widths and allow long values to wrap. |

These choices follow React's documented [lazy-loading behavior](https://react.dev/reference/react/lazy), [error boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary), and the standard [Vite configuration model](https://vite.dev/config/).

## Recovery behavior

When a page fails to render or its lazy import fails, the recovery screen offers a return to the store and a full reload. React caches a rejected lazy import, so navigating back to that same page may still require a reload after the missing file or connection is restored. Reloading resets the demo session, cart, and edits; the screen states this explicitly.

The boundaries cover rendering and lazy-import failures. Existing action-level handling still owns failures in event handlers and asynchronous demo operations.

## Development and extension conventions

- Start development with `corepack pnpm dev`; the default address is `http://127.0.0.1:8443`. Use `PORT` for another port and `DEV_SERVER_HOST` when intentionally changing the loopback bind.
- Use `PUBLIC_BASE_PATH=/shop/ corepack pnpm build` for a build under a non-root base path. Hosting must still serve assets and route fallbacks correctly; this phase does not configure deployment.
- Keep Tailwind v4's existing Vite integration. Do not restore Figma preview plugins or add legacy Tailwind configuration.
- Use the shared formatting, money, and image helpers in new screens. Keep explicit image dimensions or aspect-ratio containers.
- Treat historical fixture timestamps and IDs as stable reference data. Their 2024 dates were intentionally retained; rewriting them to appear current would change the meaning of seeded records.
- Keep currency calculations within validated, finite amounts and the safe integer range for cents. These demo helpers are not a multi-currency accounting system.

## Verification

The completed implementation passed formatting, lint, TypeScript checking, all **93 tests across 18 files**, production build, and whitespace checks. Tests cover failed/pending page loading, recovery navigation, image failures and source changes, invalid formatting values, decimal rounding, and checkout/payment/refund consistency.

The production entry JavaScript chunk changed from **434.92 KB to 284.31 KB** before compression, and from **122.79 KB to 88.52 KB** with gzip. Page code now appears in separate chunks; these figures describe the entry chunk, not all assets downloaded across every route.

Manual browser checks verified:

- Standalone development startup, login rendering, and standard page metadata.
- A direct product URL through sign-in, product display, and cart totals.
- A deliberately unavailable admin page chunk in an isolated copy of the production build: the recovery screen appeared, returning to the store preserved the session, and reloading after restoring the chunk recovered the page.
- A broken product image displayed a named fallback. Its preview stayed at **622 × 349.875 CSS pixels** before and after failure, and changing back to the valid source retried loading.
- Dashboard currency cards remained readable at **320 CSS pixels** with no horizontal page overflow in the checked screen.

A separate `/shop/` build also succeeded and emitted asset references under that base path. This checks build configuration, not a deployed subpath environment.

## Remaining work

Phase 8 adds automated browser regression coverage and CI. This phase does not replace that broader coverage or constitute a complete cross-browser/accessibility audit. Backend APIs, DTOs, durable state, and actual commerce services remain outside the frontend improvement scope.
