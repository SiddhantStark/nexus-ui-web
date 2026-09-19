# Frontend routing

Phase 4 introduces React Router 7 declarative routing. `App.tsx` composes BrowserRouter and the demo provider; `src/app/router.tsx` owns routes and nested layout guards. Navigation uses links; mutations use buttons and redirect only after success. Navigation state no longer lives in AppContext.

| Routes | Access / behavior |
| --- | --- |
| `/login`, `/register` | Public demo authentication |
| `/` | Signed-in storefront |
| `/products`, `/products/:productId` | Signed-in catalog and active product details |
| `/cart`, `/checkout` | Signed-in cart and simulated checkout |
| `/orders`, `/orders/:orderId`, `/orders/:orderId/success` | Signed-in current customer's orders only |
| `/transactions` | Signed-in current customer's transaction history |
| `/admin` | Admin dashboard |
| `/admin/products`, `/admin/products/new`, `/admin/products/:productId/edit` | Admin catalog management |
| `/admin/inventory`, `/admin/orders`, `/admin/transactions`, `/admin/refunds` | Admin management screens |
| `/forbidden` | Signed-in access-denied screen |
| Unknown paths or record IDs | Not-found screen with a recovery link; protected paths require sign-in first |

## Query and history behavior

Catalog query parameters: `q` (search text), `category` (known category), `maxPrice` (finite nonnegative number), `sort` (`name-asc`, `name-desc`, `price-asc`, `price-desc`), and `page` (positive integer). Default parameters are omitted; invalid values fall back to defaults. Pages beyond available results clamp to the last page. Filter changes reset pagination. Text/price edits replace the current history entry to avoid an entry per keystroke; category, sort, pagination, and screen links push entries. Back/forward restores the URL's filters.

Signed-out route visits redirect to `/login?next=...`. Login and registration preserve this destination. Only same-origin internal destinations are accepted, auth-page loops are rejected, and customer sign-in cannot redirect to admin routes. Frontend role guards still check every rendered admin route. Frontend checks provide demo UI behavior, not server-side authorization.

## Refresh and deployment

No session or commerce data is persisted. Reloading or opening a link in another tab requires sign-in again. Seed records can still be opened by ID after login; session-created records show not found after reload. Production hosting needs SPA rewrites to `index.html` for application paths; configure these in the deployment phase. Vite handles local fallback. Asset requests must continue to resolve normally.

## Verification

Automated route tests live in `src/app/router.test.tsx` and `authDestination.test.ts`. Existing registration and checkout tests also exercise the updated navigation.

Manual browser smoke checks:

1. Open `/products/prod-001` signed out, sign in as customer, and verify the product appears. Reload and repeat.
2. Open `/products?category=Electronics&sort=price-desc&page=2`, change filters, and use Back/Forward. Open a product and return; filters should remain.
3. Open an owned order and its `/success` URL. Open `/orders/ORD-2024-8835` as the demo customer; expect not found, including its success URL.
4. Open `/admin/products` as customer; expect access denied. Sign in as admin and open it directly; expect the management screen.
5. Open unknown product, order, edit-product, and arbitrary paths; check recovery links.
6. Sign out from a protected page and use Back; protected content must remain hidden.
7. Tab to navigation links and activate with Enter. Verify product/cart actions remain separate from links and normal browser link opening is available.

Verified 2026-09-19: all 64 tests pass; formatting, lint, typecheck, production build, and Git whitespace checks pass. Browser smoke checks confirmed deep-link login redirects, product navigation, and Back restoring the catalog category. This was a functional smoke check, not a full visual/accessibility audit.
