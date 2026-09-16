Create a complete responsive web application design for a project called **NexusCommerce**.

NexusCommerce is a full-stack e-commerce platform. For V1, do NOT include any AI features, chatbots, microservices dashboards, Kafka monitoring, Kubernetes, or advanced infrastructure-related UI. The main purpose of V1 is to create a clean transactional commerce experience with strong order, payment, refund, and inventory flows.

Use a modern, clean, professional e-commerce design. The UI should feel production-ready, similar in quality to modern SaaS and e-commerce applications. Use a light theme, spacious layout, clear typography, subtle shadows, rounded cards, consistent spacing, and responsive behavior for desktop and mobile.

Use reusable components and create a small design system including:
- Primary and secondary buttons
- Input fields
- Search input
- Dropdowns
- Product cards
- Status badges
- Tables
- Modal dialogs
- Confirmation dialogs
- Toast notifications
- Pagination
- Loading states
- Empty states
- Error states
- Navigation bar
- Sidebar for admin pages
- Breadcrumbs

Use clear status colors and labels for:
- Pending
- Paid
- Confirmed
- Failed
- Cancelled
- Refund Pending
- Refunded
- Out of Stock

Create the following CUSTOMER screens:

1. **Landing / Home Page**
- Top navigation with NexusCommerce logo
- Search bar
- Navigation links: Home, Products, Orders
- Cart icon with item count
- User/profile menu
- Hero section promoting featured products
- Featured products section
- Product categories section
- Recommended / popular products section
- Footer

2. **Product Listing Page**
- Search products
- Category filter
- Price filter
- Sort dropdown
- Product cards showing:
  - Product image
  - Product name
  - Short description
  - Price
  - Stock availability
  - Add to Cart button
- Pagination
- Empty search result state

3. **Product Details Page**
- Large product image
- Product name
- Price
- Description
- Stock availability
- Quantity selector
- Add to Cart button
- Buy Now button
- Product specifications section
- Related products section
- Out-of-stock state

4. **Shopping Cart Page**
- List of cart items
- Product image
- Name
- Price
- Quantity selector
- Remove button
- Per-item subtotal
- Order summary card
- Subtotal
- Estimated total
- Proceed to Checkout button
- Empty cart state

5. **Checkout Page**
Create a simple checkout experience containing:
- Delivery information
- Customer name
- Email
- Phone number
- Address
- City
- State
- Postal code
- Order summary
- Products and quantities
- Total amount
- Payment method section

For V1, payment can be simulated. Display options such as:
- Card
- Simulated Payment

Include a clear "Place Order" button.

Also create:
- Loading state while order is being processed
- Payment failed state
- Insufficient inventory error state
- Successful order state

6. **Order Success Page**
Show:
- Success illustration/icon
- Order number
- Payment status
- Total amount
- Ordered products
- "View Order" button
- "Continue Shopping" button

7. **My Orders Page**
Show a list/table/cards of customer orders with:
- Order ID
- Date
- Total amount
- Order status
- Payment status
- View Details button

Include status badges such as:
- Pending
- Confirmed
- Cancelled
- Refunded

8. **Order Details Page**
Show:
- Order ID
- Creation date
- Order status
- Payment status
- Ordered items
- Quantity
- Price
- Total amount
- Transaction details
- Delivery details

Include actions depending on the state:
- Cancel Order
- Request Refund
- View Transaction

Create confirmation dialogs before cancellation or refund requests.

9. **Transaction History Page**
Show:
- Transaction ID
- Order ID
- Transaction type
- Payment or Refund
- Amount
- Status
- Date

Include clear transaction status badges.

10. **Login Page**
- Email
- Password
- Login button
- Link to registration
- Validation errors

11. **Registration Page**
- Name
- Email
- Password
- Confirm Password
- Register button
- Link to login

Create the following ADMIN screens:

12. **Admin Dashboard**
Use a sidebar navigation with:
- Dashboard
- Products
- Inventory
- Orders
- Transactions
- Refunds

Dashboard cards should show:
- Total Orders
- Total Revenue
- Successful Payments
- Failed Payments
- Pending Refunds
- Low Stock Products

Add:
- Recent orders table
- Recent transactions table
- Low inventory warning section

13. **Admin Product Management Page**
Show a table containing:
- Product image
- Product name
- Category
- Price
- Stock
- Status
- Edit action
- Deactivate action

Include:
- Add Product button
- Search
- Filters
- Pagination

14. **Add / Edit Product Page**
Form fields:
- Product name
- Description
- Category
- Price
- Image URL / upload placeholder
- SKU
- Active status

Buttons:
- Save
- Cancel

15. **Inventory Management Page**
Show:
- Product
- SKU
- Current stock
- Reserved stock if applicable
- Available stock
- Low-stock indicator
- Update Stock action

Include a modal for increasing or decreasing stock.

16. **Admin Orders Page**
Table columns:
- Order ID
- Customer
- Date
- Amount
- Order status
- Payment status
- View Details

Filters:
- Order status
- Payment status
- Date

17. **Admin Transactions Page**
Show:
- Transaction ID
- Order ID
- Customer
- Type
- Amount
- Status
- Date

Allow filtering by:
- Payment
- Refund
- Success
- Failed
- Pending

18. **Admin Refunds Page**
Show:
- Refund ID
- Order ID
- Customer
- Amount
- Refund status
- Request date

Show states:
- Pending
- Processing
- Completed
- Failed

Important UX requirements:

- All customer flows should feel connected and realistic.
- The checkout flow must clearly communicate that inventory and payment are being processed.
- Show meaningful error messages when:
  - Inventory becomes unavailable during checkout
  - Payment fails
  - Duplicate request occurs
  - Refund fails
- Use confirmation dialogs for destructive actions.
- Use toast notifications for success and errors.
- Add skeleton loaders where appropriate.
- Add responsive mobile layouts for major customer-facing screens.
- Admin pages can be desktop-first but should still adapt reasonably to tablets.

Design the application so that it can later support more advanced versions, but do not include AI or distributed-system concepts in V1.

Create a consistent visual language across all screens and ensure the design is implementation-friendly for a React + TypeScript application.