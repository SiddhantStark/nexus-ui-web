# Demo commerce transitions

All changes are in-memory and reset on refresh. This is not a payment integration.

| Action | Allowed starting state | Result |
| --- | --- | --- |
| Checkout success | Signed-in user, unchanged cart, active products with sufficient stock | One confirmed/paid order and payment transaction; decrement stock and clear cart atomically |
| Checkout failure or leaving checkout | Pending attempt | No commerce changes; preserve cart |
| Cancel | Pending/confirmed order | Cancel order; restore previously reserved stock once; paid orders receive one pending refund and refund_pending payment |
| Request refund | Cancelled, paid order with no pending/processing/completed refund | One pending refund; payment becomes refund_pending |
| Approve / Mark Complete | Pending/processing refund for cancelled refund_pending order | Refund and order become completed/refunded, payment refunded; one reversal transaction; no stock change |
| Reject | Pending refund | Refund rejected; order stays cancelled, payment returns to paid; no reversal |
| Processing failure | Processing refund | Refund failed; order stays cancelled, payment returns to paid; no reversal |
| Confirm pending order | Pending order | Confirm order, preserving payment state; confirmation does not invent a successful payment |

Repeated terminal actions are rejected without writes. A rejected/failed request can be requested again. Failed attempts and rejected requests remain separate records. Seeded pending/confirmed orders are treated as already reserving stock; cancelled/refunded seed orders have already released it. Orphan refund fixtures are excluded from the live demo state because they cannot be reconciled with an order. Initial refunds normalize related order/payment states.

Checkout uses an attempt ID and captured cart version; a repeated successful attempt returns its original order without charging/decrementing again. Cart/catalog edits during processing require a fresh attempt. Leaving the screen clears its timer before any commit. Prices are rounded to minor units when computing totals.
