# Why we changed the NexusCommerce frontend: Phases 1–4

**Purpose:** A walkthrough for explaining the completed changes to teammates, reviewers, or interviewers.  
**Scope:** The React frontend exported from Figma Make, through Phase 4.  
**Implementation checkpoint:** 19 September 2026.

## 1. The explanation in one minute

> Figma Make gave us the initial screens and interactions. We then worked on making the frontend easier to develop, verify, and maintain as a team. Phase 1 made setup and code checks repeatable. Phase 2 added tests so we could detect regressions. Phase 3 corrected registration, cart, checkout, cancellation, and refund behavior so related records stay consistent. Phase 4 gave screens real URLs, browser history, and explicit access rules. These are foundations for a maintainable application. The project still uses in-memory demo data; APIs, DTOs, persistent authentication, and real payments are future work.

There is no single mandatory “industry-standard” React folder structure or toolchain. Different teams choose different tools. The practices behind our choices are what matter: reproducible builds, clear responsibilities, explicit business rules, automated verification, predictable navigation, and honest documentation of limitations.

## 2. Why we used this order

| Phase | Question it answers | Why it came at this point |
| --- | --- | --- |
| 1. Repeatable baseline | Can another developer install, run, and check this project? | Changes are hard to evaluate without a known starting point and consistent tools. |
| 2. Regression-test foundation | How will we know if a change breaks existing behavior? | Tests establish feedback before larger behavior changes. |
| 3. Correct demo behavior | Do user actions produce the promised, consistent results? | Moving unreliable behavior into new folders would preserve the underlying problems. |
| 4. URL-based routing | Can screens be addressed, revisited, and guarded consistently? | Navigation becomes an explicit application responsibility before the broader feature reorganization. |

The feature-based folder migration belongs to **Phase 5**. We have introduced useful boundaries already, especially the router and demo commerce operations, but have not finished reorganizing the entire application.

## 3. Phase 1 — Establish a repeatable baseline

### Record the screens before restructuring

**Change:** Recorded customer/admin screens and their expected interactions.

**Reason:** Refactoring should preserve intended behavior. A screen baseline gives reviewers something concrete to compare against and makes accidental omissions easier to spot.

**Team benefit:** Developers can distinguish a deliberate behavior fix from an unintended design change. A baseline supports review, but it is not itself proof that every screen works.

### Standardize dependency installation

**Change:** Selected pnpm, retained one lockfile, documented supported Node versions, and pinned the package-manager version. Validated a clean installation using the frozen lockfile.

**Reason:** Multiple package managers and lockfiles can resolve different dependency trees. A developer may otherwise build against different packages from a teammate or a build runner.

**Team benefit:** One installation contract reduces environment-related failures and makes dependency changes reviewable. `pnpm install --frozen-lockfile` fails when the manifest and lockfile disagree instead of silently rewriting the dependency resolution.

**Tradeoff:** This does not mean pnpm is universally better than npm or Yarn. Consistency is the important decision. Runtime/platform differences still matter; the recorded verification used Node 24, not every supported Node version.

### Separate formatting, linting, types, and building

**Change:** Added explicit typecheck, lint, lint-fix, and formatting-check commands. Configured TypeScript, React Hooks, and JSX accessibility lint rules. Made the production build typecheck before bundling.

| Check | What it contributes | What it cannot prove |
| --- | --- | --- |
| Formatter | Consistent source layout and smaller style debates in reviews | Correct business behavior |
| Linter | Detection of configured code-pattern, Hooks, and accessibility issues | Complete accessibility or runtime correctness |
| TypeScript | Detection of incompatible values and interfaces at compile time | Whether an order should be refunded |
| Build | Verification that the application can be bundled for production | Whether users can complete its workflows |

**Example:** A checkout handler can be perfectly typed while decrementing stock twice. It needs a behavioral test as well as static checks.

**Team benefit:** Reviewers spend more time on design and behavior because mechanical checks handle repeatable concerns. The commands can later run in CI; adding commands alone does not mean CI has been implemented.

**Implementation judgment:** We fixed reported issues rather than broadly disabling lint rules. We also corrected an observed formatter problem and retained a compatible lint-tool combination. Controlled, validated tool changes are preferable to upgrading every dependency during an unrelated refactor.

### Make the project understandable outside Figma

**Change:** Renamed the package to `nexus-frontend`, wrote setup/run/test instructions, documented demo credentials and reset behavior, and corrected instructions that assumed a Figma development server was already running.

**Reason:** A codebase needs an operating guide, not just source files. Clear names also make logs and package metadata easier to identify.

**Team benefit:** A new developer can start work without relying on the original author's memory. Figma preview support was retained because removing it without deciding the ongoing workflow would create unnecessary risk.

### Confirm the Git boundary

**Change:** Verified that `nexus-frontend` has its own repository. The parent workspace and shared parent `docs/` directory are outside that repository.

**Reason:** The initial workspace resolved to the Desktop repository. Staging from the wrong location could include unrelated work or produce an unexpectedly large change.

**Team benefit:** A known repository boundary keeps reviews, history, and ownership scoped to the intended project. Documentation needed by a standalone frontend clone should live inside the frontend repository, as this document does.

**How to explain Phase 1:** “We made the development environment repeatable and gave the team a shared definition of the basic checks a change must pass.”

## 4. Phase 2 — Add a focused regression-test foundation

### Test behavior through realistic interactions

**Change:** Added Vitest, React Testing Library, user-event, and a jsdom environment. Initial tests covered product-card/cart integration, out-of-stock handling, and confirmation/cancellation interactions.

**Reason:** A successful build cannot tell us whether clicking Add to Cart changes the cart correctly. Tests exercise the outcomes users depend on.

**Example:** A useful test clicks Add to Cart and checks the resulting cart behavior. A test that only checks a CSS class or internal state variable can pass even when the user flow is broken, and can fail after a harmless refactor.

**Team benefit:** Behavior-focused tests give developers freedom to change implementation details while preserving the application's contract.

### Keep tests independent and easy to run

**Change:** Added shared setup, fresh provider state, DOM cleanup, timer/mock restoration, and a small render helper. Added single-run and watch commands. Kept Vitest configuration separate from Figma preview plugins.

**Reason:** State or timers leaking between tests can make results depend on execution order. Unrelated preview tooling makes the test environment harder to understand.

**Team benefit:** Predictable tests are more useful for debugging and automated checks. The single-run command produces an exit code suitable for automation; watch mode supports short local feedback loops.

### Grow coverage with real risks

**Change:** Established colocated tests and added regression cases alongside the fixes in later phases. We did not target an arbitrary coverage percentage.

**Reason:** Repeated checkout, invalid stock, and unauthorized record access matter more than testing every trivial line equally.

**Limit:** jsdom tests do not provide a real layout engine. They do not replace browser workflow tests, responsive checks, or a keyboard/accessibility audit.

**How to explain Phase 2:** “We created a safety net that checks user-visible outcomes, so future changes can be evaluated with evidence rather than just manual confidence.”

## 5. Phase 3 — Make demo behavior internally consistent

### Registration must do what its success message promises

**Change:** Made registration reachable while signed out and implemented session-only demo accounts that can actually sign in. Normalized emails, rejected duplicates, and added validation tests. Mounted one toast container above the layouts.

**Reason:** Reporting successful registration without a usable account is misleading. Duplicate notification hosts can show the same message twice or leave auth screens without notifications.

**Example:** `Customer@NexusCommerce.com` and `customer@nexuscommerce.com` resolve to the same normalized demo identity and cannot create separate duplicate accounts.

**Team benefit:** Shared identity rules reduce inconsistent behavior between screens. One notification host gives messages a single rendering location.

**Limit:** This is a local simulation. New accounts disappear on refresh, passwords are not persisted to browser storage, and it is not a production authentication implementation.

### Validate cart rules where state changes

**Change:** Centralized quantity/availability checks in demo commerce operations. Additions require positive whole-number quantities and account for existing cart quantity. Quantity updates allow zero as removal. Checkout rejects items that become unavailable or exceed current stock.

**Before/after example:** With stock of 2, three separate Add to Cart clicks must not produce quantity 3. The operation checks the combined quantity, not only the latest click.

**Reason:** Disabling a button is helpful feedback, but it does not enforce the rule for every caller. Product cards, detail pages, and quantity controls all need the same behavior.

**Team benefit:** A shared mutation boundary gives a rule one implementation and makes it independently testable. An *invariant* is a condition that must remain true after every permitted change—for example, a cart quantity cannot exceed currently available stock.

**Limit:** These checks protect the local demo's consistency. A real service must independently validate stock and quantities under concurrent requests.

### Treat checkout as one coordinated operation

**Change:** Moved checkout completion/navigation into the submit flow. Revalidated current cart/catalog state before success. A successful operation publishes orders, transactions, inventory, and cart as one coherent snapshot. Added collision-resistant IDs and consistent minor-unit rounding when calculating totals.

**Reason:** Separate page-level updates can leave contradictory state: an order exists but the cart remains full, or inventory changes without a corresponding transaction. Render-time navigation is also unsafe because rendering may run more than once.

**Example:** A successful attempt creates one paid order and its payment record, reduces stock, and clears the cart. A failed attempt preserves the cart and does not partially apply these changes.

**Team benefit:** The operation expresses one business action and its consequences. Pages mainly initiate the action and display its result; tests can verify the operation without recreating every screen.

**Limit:** “Atomic” here means one in-memory state publication within this app instance. It does not provide database transactions, cross-tab coordination, or distributed payment guarantees. Rounding demo totals is also not a complete production money model.

### Make repeated and delayed actions predictable

**Change:** Prevented repeated submissions during processing, tracked checkout attempt IDs, and returned the original result for an already successful attempt. Captured a cart version so cart/catalog changes during processing require a new attempt. Cleared pending checkout work when the screen unmounts.

**Reason:** Disabling the submit button alone does not define what a repeated operation should do. Delayed work can also finish after the user has left the screen.

**Example:** A double-click cannot create two orders or deduct stock twice. Leaving checkout during processing cannot later navigate the user back to a confirmation screen.

**Team benefit:** This applies *idempotency*: repeating the same successful attempt does not repeat its effects. Explicit cancellation and stale-state checks make asynchronous flows easier to reason about.

**Limit:** Local attempt tracking resets with the app. A real payment service needs durable server-side idempotency and authoritative inventory coordination.

### Make the simulation explicit

**Change:** Removed editable card-number/CVV fields, labeled checkout as simulated, corrected misleading confirmation claims, and restricted scenario controls to development or explicit demo mode.

**Reason:** UI should describe what the application actually does. A prototype should not invite real card details or suggest that an actual payment/email was processed.

**Team benefit:** Product reviewers and developers can exercise predictable failure scenarios without mistaking the demonstration for an integrated payment flow. Hiding scenario controls in a production build does not turn the underlying demo into real commerce.

### Define cancellation and refunds as state transitions

**Change:** Documented supported transitions and implemented common operations for cancellation, refund requests, rejection/failure, and completion. Both admin completion paths call the same completion operation. Repeated terminal actions do not write duplicate changes.

| Scenario | Result and reason |
| --- | --- |
| Cancel a paid order | Cancel it, restore reserved stock once, and create one pending refund. Payment is awaiting refund, not already refunded. |
| Complete a refund | Update refund, order, and payment status; create one reversal transaction. Do not restore stock again. |
| Reject a request | Keep the order cancelled, mark the request rejected, and return payment to paid. No reversal was completed. |
| Processing fails | Record failure separately from rejection; leave payment paid so a new request can be made. |
| Repeat completion | Reject the repeated terminal action without another reversal or stock change. |

**Reason:** Order status, payment status, and refund status describe different facts. Updating only the displayed badge can leave related records contradictory.

**Team benefit:** An explicit transition table gives developers, testers, and reviewers a shared business specification. Shared operations keep different UI paths from implementing different rules.

**Fixture cleanup:** Documented which seeded orders already reserve/release stock, reconciled relevant initial states, and excluded orphan refund fixtures. Demo data must satisfy the same assumptions as the operations being tested.

**Tradeoff:** The rules are intentionally limited to this demo. Partial refunds, fulfillment, real settlement, and cross-service reconciliation require additional product and backend decisions.

**How to explain Phase 3:** “We moved important rules into explicit, tested operations so one user action produces consistent results across the cart, inventory, orders, payments, and refunds.”

## 6. Phase 4 — Make navigation part of the application architecture

### Replace in-memory page switching with routes

**Change:** Replaced page-name conditionals and navigation objects with React Router, a route tree, and nested customer/admin layouts. `App.tsx` composes the router, provider, and notification host.

**Reason:** A screen selected only by React state has no reliable browser address. Bookmarks, direct links, and Back/Forward cannot naturally identify it.

**Example:** `/products/prod-001` identifies a product screen. `/admin/products/prod-001/edit` identifies its admin edit screen.

**Team benefit:** The route tree provides one place to understand application entry points and layout/access rules. React Router handles browser navigation mechanics that would otherwise require custom code.

### Put identity in the URL and resolve current data

**Change:** Detail URLs contain product/order IDs instead of entire record objects. Pages resolve those IDs from current demo state. Missing or inaccessible records display a useful error and recovery link. An unknown edit ID does not silently open a create form.

**Reason:** A passed object can become stale and does not exist when a link is opened directly. The ID identifies the resource; current application state supplies its data.

**Team benefit:** Pages behave consistently regardless of the previous screen. This also creates a natural future integration point for loading records by ID, without inventing API contracts now.

**Limit:** URLs do not persist demo records. Refresh resets the session/data; seed records can be revisited after login, while session-created records disappear.

### Separate sign-in, role, and ownership checks

**Change:** Login/register remain public. Shopping routes require sign-in. Admin routes require the admin role. Customer order-detail and confirmation pages only resolve the current customer's orders. Added forbidden and not-found screens.

**Reason:** These are three different questions: Is there a session? Is this role allowed on this screen? Does this record belong to this customer?

**Example:** A signed-in customer cannot render admin pages through normal navigation. Changing an order ID in the address bar does not display another customer's order in the customer interface.

**Team benefit:** Explicit guards make access behavior consistent and testable rather than relying on whether a menu happens to show a link.

**Limit:** Frontend guards control UI behavior; they are not a security boundary. The demo data is shipped to the browser. Production authentication, authorization, and ownership enforcement must happen on the server as well.

### Preserve a permitted destination through sign-in

**Change:** Protected visits carry a `next` destination through login and registration. The redirect helper rejects external destinations, malformed values, authentication loops, and admin destinations for customer users.

**Reason:** After opening a product link, users expect to reach that product after signing in. Blindly trusting a return URL would introduce unwanted redirects or loops.

**Team benefit:** Redirect policy has a clear implementation and focused tests. The convenience of remembering user intent does not remove route guards.

### Store shareable catalog state in query parameters

**Change:** Added `q`, `category`, `maxPrice`, `sort`, and `page` to catalog URLs. Invalid values fall back to defaults; out-of-range pages are clamped. Filter changes reset pagination.

**Example:** `/products?category=Electronics&sort=price-desc` describes a reproducible catalog view. Opening a product and pressing Back restores that view.

**Reason:** Search/filter state affects what the page means. Keeping it only in component memory loses it when navigating away and makes a copied link incomplete.

**Team benefit:** URLs support sharing, debugging, and browser history. Category/sort/page changes create history entries; typing search/price replaces the current entry so Back does not traverse every keystroke.

**Tradeoff:** Only state useful to restore/share belongs in the URL. Temporary modal state, secrets, and sensitive form values should not be added indiscriminately.

### Use native navigation semantics

**Change:** Navigation uses links; state-changing actions use buttons. Shared link/button styles preserve appearance without making their semantics identical. Footer entries link to working destinations; unavailable placeholders were removed.

**Reason:** Links provide browser behavior such as copying an address, opening another tab, and keyboard activation. Buttons communicate actions such as adding an item or submitting a form.

**Team benefit:** Native HTML behavior reduces custom event handling and makes the interface more predictable for users and assistive technologies. This is a useful accessibility improvement, not completion of the later accessibility phase.

**Deployment implication:** BrowserRouter uses real paths. Production hosting must return the application shell for application routes while still serving assets normally. That rewrite configuration is deferred to deployment; local Vite fallback was used for verification.

**How to explain Phase 4:** “We gave every screen a meaningful address, made browser navigation work naturally, and centralized the rules for reaching protected screens and records.”

## 7. Where to show the implementation during a walkthrough

This is a historical explanation of Phases 1–4. Walkthrough links were refreshed after Phase 5 moved the files and split AppContext. Paths below are relative to the frontend repository. Follow the links to inspect the actual code.

| Topic | Main evidence |
| --- | --- |
| Development contract | [README](../README.md), [package scripts](../package.json), [ESLint configuration](../eslint.config.js) |
| Test isolation and rendering | [Vitest configuration](../vitest.config.ts), [test setup](../src/test/setup.ts), [render helper](../src/test/renderWithApp.tsx) |
| Shared demo rules | [Commerce operations](../src/mocks/demo-store.ts), [operation tests](../src/mocks/demo-store.test.ts), [transition table](demo-transitions.md) |
| Session and notifications | [Session provider](../src/features/auth/SessionProvider.tsx), [notification provider](../src/shared/notifications/NotificationProvider.tsx), [application composition](../src/app/App.tsx) |
| Checkout behavior | [Checkout page](../src/features/checkout/pages/CheckoutPage.tsx), [checkout tests](../src/features/checkout/pages/CheckoutPage.test.tsx) |
| Routes and access | [Route tree](../src/app/router.tsx), [routing tests](../src/app/router.test.tsx), [route guide](routing.md) |
| Safe return destinations | [Redirect helper](../src/features/auth/authDestination.ts), [redirect tests](../src/features/auth/authDestination.test.ts) |
| Shareable catalog view | [Product listing](../src/features/catalog/pages/ProductListingPage.tsx) |

## 8. What verification establishes

At the Phase 4 completion checkpoint:

- Phase 2 established 4 tests across 2 files.
- Phase 3 brought the suite to 40 tests across 6 files.
- Phase 4 brought it to 64 tests across 8 files, including 24 new routing/redirect cases.
- Formatting, zero-warning lint, TypeScript checks, production build, and Git whitespace checks passed.
- Browser smoke checks verified signed-out deep links, return after demo login, product navigation, and Back restoring the catalog category URL.

These are recorded results from the completed phases, not a new test run performed to write this document. Test counts show the suite's growth; the behaviors covered are the more useful evidence. Passing checks do not establish complete accessibility, production security, or correctness of a future backend integration.

## 9. What we can and cannot claim yet

**We can say:** “The frontend now has repeatable tooling, behavioral regression coverage, consistent demo operations, and explicit URL navigation/access behavior.”

**We should not say:** “The application is production-ready” or “the industry-standard structure is finished.”

Still planned or deferred:

- Feature-based folders, focused state responsibilities, and feature-owned types: Phase 5.
- Comprehensive accessibility and responsive verification: Phase 6.
- Further scaffold cleanup, route loading, and resilience: Phase 7.
- Broader end-to-end tests and CI: Phase 8.
- DTOs, APIs, persistent data, real authentication/authorization, payments, and deployment: separate integration work.

## 10. Questions you may be asked

**Why not just reorganize the folders first?**  
Folder organization helps ownership and navigation, but cannot correct checkout or refund behavior. Establishing checks and repairing behavior first gives the later moves a reliable safety net.

**Why use a shared commerce operation instead of several setters in each page?**  
One action changes related records. A common operation keeps the rules together and makes the whole result testable, regardless of which screen initiates it.

**Why test if TypeScript already passes?**  
TypeScript checks shapes and allowed values. It does not establish that stock changes exactly once, registration creates a usable account, or another customer's order is hidden.

**Why add route guards if the backend must enforce access later?**  
The frontend still needs coherent navigation and access feedback. Later, the backend will independently enforce authorization over actual data and operations.

**Why not persist everything in localStorage now?**  
Persistence introduces its own lifecycle, migration, and security decisions. We deliberately kept session-only demo behavior explicit instead of implying a real account system or persisting demo passwords.

**Why is this suitable for a professional codebase?**  
The decisions reduce specific maintenance risks: dependency drift, unrepeatable bugs, duplicated business rules, inconsistent state, and fragile navigation. They are valuable because of those outcomes, not because a particular library or folder name is universally required.
