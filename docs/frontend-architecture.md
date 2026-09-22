# Frontend architecture after Phase 5

The frontend remains a local commerce demo. This structure separates ownership and makes behavior easier to change without defining backend APIs or DTOs prematurely.

## Directory responsibilities

```text
src/
  main.tsx
  app/
    App.tsx                  # BrowserRouter and top-level rendering
    providers.tsx            # Construct and inject demo dependencies
    router.tsx               # Routes, nested guards, and error pages
    layouts/                 # Customer/admin shells and navigation
  features/
    auth/                    # Session, registration, login, safe return destinations
    catalog/                 # Browsing, product cards, product editing, Product type
    cart/                    # Cart entries, selectors, cart hook, cart page
    checkout/                # Delivery form, checkout lifecycle, scenario type
    orders/                  # Order views/actions, historical order types
    payments/                # Transaction views and payment/transaction status types
    refunds/                 # Refund views/actions and status types
    inventory/               # Stock management and stock-status display
    dashboard/               # Read-only aggregation for the admin overview
    commerce/                # Store contract and React subscription boundary
  shared/
    ui/                      # Generic controls, styled badge, and toast rendering
    notifications/           # Messages, dismissal timers, and stable command context
    lib/                     # Generic operation result type
  mocks/
    demo-store.ts            # Coordinated in-memory business operations
    fixtures/                # Accounts, catalog, orders, payments, refunds
  styles/index.css
  test/                      # Render/setup helpers and architecture checks
docs/design/                 # Original exported design brief
```

Customer/admin screens live under their business feature. Features containing both use an `admin/` subfolder for admin screens. We have not created unused `api/`, `dto/`, `config/`, or `e2e/` directories.

## State ownership

| State | Owner | Reason |
| --- | --- | --- |
| Current user and session-only accounts | Auth `SessionProvider` | Identity changes should not be mixed with catalog/cart/notification state. Seed accounts are injected. |
| Toasts and dismissal timers | Shared `NotificationProvider` | Notifications are domain-independent. Stable commands are separate from the changing message list. |
| Products, cart entries, orders, payments, refunds | One injected `CommerceStore` | Checkout/refunds must update related records together. Splitting these writes into independent stores would weaken the existing consistency guarantee. |
| Cart display, totals, problems, commands | Cart selectors and `useCart` | The feature owns its consumer API without duplicating the underlying state. |
| Form fields, modal visibility, pending UI | The relevant page | Temporary state remains close to its users. |
| Routes and shareable catalog filters | Router/path/query parameters | Supports direct links and browser history. |

The store context exposes a stable store object, not an object containing every changing value and action. Feature hooks subscribe to the slices they need with `useSyncExternalStore`. For example, a transaction reader does not subscribe to cart changes. Cart readers also subscribe to the catalog because current product details determine the display and total. There is no general `useApp` compatibility hook.

Signing out clears the cart through an explicit callback wired in `app/providers.tsx`, then clears the session. It does not reset catalog edits, orders, or newly registered demo accounts; refreshing the application still resets the full demo.

## Dependency rules

- App code composes features, shared infrastructure, and concrete demo implementations.
- Feature code uses focused feature interfaces and shared code. It does not import app composition or concrete mock implementations.
- Shared code imports only other shared code and third-party packages. It has no commerce/session dependencies.
- `features/commerce/store.ts` is an explicit aggregate contract for coordinated local operations. It imports feature-owned types; it contains no fixtures or UI implementation.
- `mocks/demo-store.ts` implements that contract and uses feature-owned types/selectors. Only app wiring and tests select this concrete implementation.
- Feature-to-feature imports are allowed when needed, such as catalog UI invoking cart commands or orders displaying payment badges. Runtime import cycles are disallowed. Type modules remain small and do not import hooks/pages.
- Tests may compose app providers and mock fixtures to exercise the real integration.

`src/test/architecture.test.ts` checks source import boundaries and circular runtime imports. These checks cover static imports; they are not a general architectural proof or a replacement for reviewing new abstractions.

## Cart normalization

Stored cart data is now:

```ts
{ productId: 'prod-001', quantity: 2 }
```

The cart hook joins entries to the current catalog. Changing a product name, image, price, stock, or active flag updates the next cart view without synchronizing copied product objects. Totals use current catalog prices with the existing minor-unit rounding rule.

If a referenced product is missing, the entry remains visible as unavailable and can be removed. Validation prevents checkout. It must not silently disappear from the displayed cart while remaining in stored state.

Order items intentionally retain purchase-time name, image, price, and quantity. Updating the catalog later must not rewrite a completed order's historical values.

## Operation boundaries

Pages collect input, display feedback, and invoke feature commands. Feature hooks supply session identity and notifications. The demo store validates and publishes coordinated state changes.

Stock adjustment and product activation now have explicit operations by product ID. The store reads the latest product at invocation, so a delayed stock adjustment does not calculate from a product snapshot captured before the delay. Product activation also emits one success/failure message through the common operation feedback path.

Checkout, cancellation, and refunds retain the Phase 3 transition rules, including attempt replay, stock restoration once, and one reversal per completed refund. See [demo transitions](demo-transitions.md). This remains in-memory consistency, not database transactions or backend authorization.

## Extending the frontend

1. Put a screen, component, hook, or type in the feature that owns its meaning.
2. Keep reusable styling/controls in shared only when they have no business dependencies.
3. Add a feature command and store operation when an action needs validated or coordinated state changes. Do not have pages independently rewrite unrelated records.
4. Add tests for user-visible behavior and the operation's invariants. Avoid new barrels or compatibility facades that hide ownership.
5. Run formatting, lint, typecheck, the test suite, and production build. Keep direct-link and history behavior intact.

Later backend integration must design asynchronous contracts, server-side authentication/authorization, persistence, and payment coordination. The current synchronous demo store is not a preselected backend API or DTO model.

## Phase 5 regression coverage

Existing routing, registration, checkout, refund, cart, and dialog tests moved with their owners. Added coverage checks normalized cart storage, current catalog prices, historical order snapshots, inventory adjustments, invalid operations, store isolation, logout/cart behavior, missing-product recovery, and import boundaries.

No broad visual redesign, persistence layer, backend integration, or production deployment was introduced in this phase.

**Verification (2026-09-22):** 74 tests across ten files pass, including dependency-boundary checks. Formatting, lint, typecheck, production build, and Git whitespace checks pass. A production-preview browser smoke check verified customer deep-link login, add-to-cart/cart display, admin inventory access, and a stock update. The cart layout was visually inspected; full responsive/accessibility verification remains Phase 6.
