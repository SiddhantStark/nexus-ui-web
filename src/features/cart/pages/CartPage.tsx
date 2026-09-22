import { useCart } from '@/features/cart/useCart';
import LinkButton from '@/shared/ui/LinkButton';
import { Link } from 'react-router';
import EmptyState from '@/shared/ui/EmptyState';
import Breadcrumbs from '@/shared/ui/Breadcrumbs';

export default function CartPage() {
  const { cart, removeFromCart, updateCartQuantity, cartTotal, cartProblems } = useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Breadcrumbs crumbs={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />
        <EmptyState
          title="Your cart is empty"
          description="Browse our products and add items to your cart to get started."
          action={{
            label: 'Start Shopping',
            to: '/products',
          }}
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-10 h-10 text-slate-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
          }
        />
      </div>
    );
  }

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      <Breadcrumbs crumbs={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Shopping Cart{' '}
        <span className="text-slate-400 font-normal text-lg">
          ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </span>
      </h1>

      {cartProblems.map((message) => (
        <p role="alert" key={message} className="text-red-600 mb-3">
          {message}
        </p>
      ))}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="bg-white border border-slate-100 rounded-xl p-4 flex items-start gap-4 hover:shadow-sm transition-shadow"
            >
              <Link
                className="w-20 h-20 rounded-lg overflow-hidden bg-slate-50 shrink-0 cursor-pointer"
                to={`/products/${encodeURIComponent(item.product.id)}`}
              >
                <img
                  src={item.product.imageUrl || undefined}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm leading-snug">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.product.category} · SKU: {item.product.sku}
                    </p>
                  </div>
                  <button
                    aria-label={`Remove ${item.product.name}`}
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-0 border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors text-sm font-bold"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-semibold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateCartQuantity(
                          item.product.id,
                          Math.min(item.product.stock, item.quantity + 1),
                        )
                      }
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">${item.product.price.toFixed(2)} each</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-white border border-slate-100 rounded-xl p-5 sticky top-24">
            <h2 className="font-bold text-slate-900 text-base mb-4">Order Summary</h2>
            <div className="flex flex-col gap-2.5 text-sm mb-4">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between text-slate-600">
                  <span className="truncate mr-2">
                    {item.product.name} ×{item.quantity}
                  </span>
                  <span className="font-medium shrink-0">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-2.5 flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="border-t border-slate-100 pt-2.5 flex justify-between font-bold text-slate-900 text-base">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>
            <LinkButton fullWidth size="lg" disabled={cartProblems.length > 0} to={'/checkout'}>
              Proceed to Checkout
            </LinkButton>
            <Link
              to={'/products'}
              className="w-full text-center text-sm text-slate-500 hover:text-indigo-600 mt-3 transition-colors"
            >
              Continue Shopping
            </Link>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              Secure, encrypted checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
