# Phase 6 — Accessibility and responsive usability

Completed: 2026-09-23. Scope: the frontend demo. APIs, DTOs, persistence, and real payment integration remain deferred.

## What changed and why

| Area | Implemented behavior | Reason for the approach |
| --- | --- | --- |
| Form controls | Shared Input, Select, and Textarea generate stable IDs, connect visible labels, merge helper/error descriptions, and expose invalid state. Explicit IDs remain supported. Search and filter controls have accessible names. | A consistent shared contract prevents each feature from inventing its own labeling and validation behavior. |
| Keyboard forms | Checkout, product editing, and stock adjustment submit through native forms. Authentication retains native form submission. Invalid submissions focus the first invalid field; refund reason errors stay inside their dialog. Shared Button defaults to a non-submit button. | Native HTML supplies expected Enter behavior and avoids accidental submission from secondary actions. Errors are discoverable without searching the page. |
| Dialogs | Modal uses Radix Dialog for semantics, focus containment, background isolation, Escape, and scroll locking. Form dialogs initially focus the first field; confirmations focus Cancel. Closing restores the opener, or the main content if that opener no longer exists. | Focus behavior is subtle. A maintained primitive centralizes it, while a small wrapper preserves the project’s visual design and controlled-dialog API. |
| Navigation and focus | Both layouts expose a skip link and focusable main content. Account/mobile disclosures expose expanded state; Escape dismisses them and restores the trigger. Account navigation also closes when focus leaves. All controls retain visible keyboard focus. | Keyboard users can bypass repeated navigation and understand where they are. Ordinary navigation links remain links, without unnecessary menu-widget keyboard rules. |
| Notifications | Success/info/warnings use polite status announcements; errors use alerts and remain until dismissed. Other messages expire after eight seconds, pausing while hovered or focused. Dismiss buttons are named. Duplicate checkout validation toasts were removed. | Users have time to read messages without repeated interruptions or an error alert persisting after the form is corrected. |
| Responsive layout | Navigation collapses below the desktop breakpoint. Admin navigation stacks above the page on smaller screens. Category cards, product forms, transaction summaries, and filter groups reflow at narrow widths. Dialogs fit the viewport and can scroll vertically. | Essential actions stay available without forcing the entire page to scroll sideways. |
| Tables | Six customer/admin table surfaces use a named, focusable ScrollRegion with horizontal overflow. Headers have column scopes. | Tab reaches the region and its actions; arrow keys and normal browser focus scrolling expose offscreen columns. Table semantics are retained. |
| Pagination | Shared usePagination clamps local result pages immediately when filters or mutations reduce the result count. Catalog query pagination keeps its existing URL normalization. Pagination has named previous/next/page buttons and exposes the current page. | A shrinking list cannot strand the user on an empty page that no longer exists. |
| Contrast and motion | Secondary text, low-stock badges, selected stock/payment controls, and dark-panel captions use stronger contrast. Focus has a consistent outline. The reduced-motion media query removes meaningful animation/transition duration and smooth scrolling. | State and controls stay readable, and motion preferences apply consistently across features. |

The dialog foundation follows [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog). Automated checks use [axe-core](https://github.com/dequelabs/axe-core) alongside Testing Library user interactions.

## Verification

All 85 tests across 15 files pass. The existing commerce, routing, and architecture coverage remains passing. New coverage checks stable field associations, invalid descriptions, dialog Tab/Shift+Tab containment, Escape and restoration, safe confirmation focus, notification announcements/timers, navigation disclosures, pagination shrinkage, keyboard checkout, stock updates, and refund-reason validation.

Representative shared controls, registration, confirmation/form dialogs, notifications, inventory validation, and the refund dialog have no violations in the configured axe WCAG 2 A/AA and WCAG 2.1 AA rules. Color contrast is disabled in jsdom because it has no rendering engine.

Manual checks used the local Vite application in the in-app browser, with 320, 768, and 1280 CSS-pixel widths:

- Customer home/navigation and catalog: checked page widths and card layouts; mobile navigation opens with Enter, closes with Escape, and restores focus. Category spacing was corrected after visual review.
- Cart and checkout: reviewed narrow layouts; checkout fits all three widths. Enter on an incomplete checkout focuses the first invalid field. After correction, Enter completes one simulated order and reaches its confirmation screen.
- Customer transaction history: summaries and filters reflow at 320 pixels; its wide table scrolls inside its container. Tablet and desktop layouts fit.
- Admin products, orders, transactions, and refunds: checked each table at all three widths. Inventory was also checked at all three widths. Mobile table containers remain within the page while table content scrolls. Transaction filter overflow was found and fixed.
- Inventory: keyboard navigation reaches the offscreen Update Stock action; the browser scrolls it into view. The dialog initially focuses Quantity, reports an inline error for blank submission, accepts Enter to update stock, closes, and restores the action’s focus.
- Dialog bounds: stock dialog fits 320, 768, and 1280 pixels. A customer cancellation dialog was checked at 320 pixels with safe initial focus, focus cycling, Escape, and focus restoration.
- Product form: Enter on an empty form focuses Product Name and its associated error. The skip link moves focus into main content.
- Contrast: reviewed rendered solid-background text colors on home and inventory, plus the source palette and screenshots for other changed surfaces. Fixed the low-stock badge found during this review. Gradient/image backgrounds were visually reviewed, not comprehensively measured. Confirmed the reduced-motion rule is present in the browser stylesheet.

Formatting, lint (zero warnings), TypeScript, production build, and Git whitespace validation pass.

These checks are a scoped verification of the Phase 6 work, not WCAG certification. Dedicated screen-reader sessions, operating-system motion-preference testing, cross-browser/device testing, and full automated browser workflows are still needed for a production accessibility audit. Phase 8 owns broader browser automation.

## Rules for future changes

1. Prefer shared labeled controls. Add a clear accessible name when a visible label is unsuitable; never rely on placeholder text alone.
2. Keep field errors connected to their control and inside the active dialog. Use a real form and a submit button for single-line Enter submission.
3. Use Modal/ConfirmDialog instead of implementing a new focus trap. Give every dialog a title, and add a description when useful.
4. Preserve the named scroll region around tables and the shrinkable layout around it. Test narrow widths with realistic long names and IDs.
5. Use bounded pagination for local filtered lists. Keep URL-backed list state in the URL.
6. Run `pnpm test` and repeat the relevant keyboard/mobile checks after changes. Use `src/test/checkAccessibility.ts` for representative semantic checks, and inspect rendered contrast separately.

## Repository boundary

Frontend implementation and this document belong to the repository rooted at `NexusCommerce/nexus-frontend`. The shared phase checklist at `../docs/frontend-improvement-plan.md` remains outside that Git repository. No files were staged or committed during Phase 6.
