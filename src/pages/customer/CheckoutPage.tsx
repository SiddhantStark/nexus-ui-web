import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import type { Order, Transaction } from '../../types';

type CheckoutStep = 'form' | 'processing' | 'success' | 'payment-failed' | 'inventory-error';
type PaymentMethod = 'credit-card' | 'simulated';
type TestScenario = 'success' | 'payment-failed' | 'inventory-error';

function genId(prefix: string) {
  return `${prefix}-${Math.floor(Math.random() * 9000) + 1000}`;
}

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, currentUser, addOrder, addTransaction, navigate, addToast } =
    useApp();
  const [step, setStep] = useState<CheckoutStep>('form');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit-card');
  const [testScenario, setTestScenario] = useState<TestScenario>('success');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const [form, setForm] = useState({
    name: currentUser?.name ?? '',
    email: currentUser?.email ?? '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
  });
  const [cardForm, setCardForm] = useState({
    number: '4242 4242 4242 4242',
    expiry: '12/26',
    cvv: '123',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Full name is required.';
    if (!form.email.includes('@')) errs.email = 'Valid email required.';
    if (!form.phone.trim()) errs.phone = 'Phone number is required.';
    if (!form.address.trim()) errs.address = 'Address is required.';
    if (!form.city.trim()) errs.city = 'City is required.';
    if (!form.state.trim()) errs.state = 'State is required.';
    if (!form.postalCode.trim()) errs.postalCode = 'Postal code is required.';
    return errs;
  }

  async function handlePlaceOrder() {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    setStep('processing');
    await new Promise((r) => setTimeout(r, 2200));

    if (testScenario === 'inventory-error') {
      setStep('inventory-error');
      return;
    }
    if (testScenario === 'payment-failed') {
      setStep('payment-failed');
      return;
    }

    // Success
    const orderId = genId('ORD-2024');
    const txnId = genId('TXN-2024');

    const newOrder: Order = {
      id: orderId,
      customerId: currentUser?.id ?? 'usr-001',
      customerName: form.name,
      customerEmail: form.email,
      items: cart.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        imageUrl: i.product.imageUrl,
        quantity: i.quantity,
        price: i.product.price,
      })),
      total: cartTotal,
      orderStatus: 'confirmed',
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
      deliveryAddress: { ...form },
      transactionId: txnId,
      paymentMethod: paymentMethod === 'credit-card' ? 'Credit Card' : 'Simulated Payment',
    };

    const newTx: Transaction = {
      id: txnId,
      orderId,
      customerId: currentUser?.id ?? 'usr-001',
      customerName: form.name,
      type: 'payment',
      amount: cartTotal,
      status: 'success',
      createdAt: new Date().toISOString(),
      method: paymentMethod === 'credit-card' ? 'Credit Card' : 'Simulated Payment',
    };

    addOrder(newOrder);
    addTransaction(newTx);
    setPlacedOrder(newOrder);
    clearCart();
    setStep('success');
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
    error: errors[key],
  });

  if (cart.length === 0 && step === 'form') {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-slate-500 mb-4">Your cart is empty.</p>
        <Button onClick={() => navigate('products')}>Browse Products</Button>
      </div>
    );
  }

  // Processing state
  if (step === 'processing') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-6">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Processing your order</h2>
          <p className="text-sm text-slate-500">Verifying inventory and processing payment…</p>
        </div>
        <div className="flex flex-col gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full" />
            Checking inventory availability
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            Processing payment securely
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-slate-300 rounded-full" />
            Confirming order
          </div>
        </div>
      </div>
    );
  }

  // Inventory error
  if (step === 'inventory-error') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-8 h-8 text-amber-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Inventory Unavailable</h2>
          <p className="text-sm text-slate-600 mb-2">
            One or more items in your order are no longer available in the requested quantity.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-6 text-sm text-amber-700 text-left">
            <p className="font-medium mb-1">Affected item(s):</p>
            {cart.map((i) => (
              <p key={i.product.id} className="text-xs">
                · {i.product.name} — requested {i.quantity}, available 0
              </p>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Button fullWidth onClick={() => navigate('cart')}>
              Update Cart
            </Button>
            <Button variant="outline" fullWidth onClick={() => navigate('products')}>
              Browse Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Payment failed
  if (step === 'payment-failed') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-8 h-8 text-red-500"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Payment Failed</h2>
          <p className="text-sm text-slate-600 mb-2">
            We were unable to process your payment. Your card was not charged.
          </p>
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-6 text-sm text-red-700 text-left">
            <p className="font-medium mb-1">Possible reasons:</p>
            <ul className="text-xs space-y-0.5">
              <li>· Card declined by issuing bank</li>
              <li>· Insufficient funds</li>
              <li>· Incorrect card details</li>
              <li>· Card blocked for online transactions</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <Button fullWidth onClick={() => setStep('form')}>
              Try Again
            </Button>
            <Button variant="outline" fullWidth onClick={() => navigate('home')}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success — redirect to order success
  if (step === 'success' && placedOrder) {
    navigate('order-success', { order: placedOrder });
    return null;
  }

  // Main checkout form
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      <Breadcrumbs
        crumbs={[
          { label: 'Home', page: 'home' },
          { label: 'Cart', page: 'cart' },
          { label: 'Checkout' },
        ]}
      />
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Delivery + Payment */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Delivery info */}
          <div className="bg-white border border-slate-100 rounded-xl p-6">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                1
              </span>
              Delivery Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name *" placeholder="Alex Rivera" {...field('name')} />
              <Input
                label="Email Address *"
                type="email"
                placeholder="alex@example.com"
                {...field('email')}
              />
              <Input
                label="Phone Number *"
                type="tel"
                placeholder="+1 (555) 000-0000"
                {...field('phone')}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Street Address *"
                  placeholder="742 Evergreen Terrace"
                  {...field('address')}
                />
              </div>
              <Input label="City *" placeholder="Springfield" {...field('city')} />
              <Input label="State *" placeholder="IL" {...field('state')} />
              <Input label="Postal Code *" placeholder="62701" {...field('postalCode')} />
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white border border-slate-100 rounded-xl p-6">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                2
              </span>
              Payment Method
            </h2>
            <div className="flex flex-col gap-3 mb-4">
              {(
                [
                  {
                    id: 'credit-card',
                    label: 'Credit / Debit Card',
                    icon: '💳',
                    desc: 'Visa, Mastercard, Amex',
                  },
                  {
                    id: 'simulated',
                    label: 'Simulated Payment',
                    icon: '⚡',
                    desc: 'Demo payment — no real charge',
                  },
                ] as {
                  id: PaymentMethod;
                  label: string;
                  icon: string;
                  desc: string;
                }[]
              ).map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    paymentMethod === opt.id
                      ? 'border-indigo-500 bg-indigo-50/60'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={opt.id}
                    checked={paymentMethod === opt.id}
                    onChange={() => setPaymentMethod(opt.id)}
                    className="accent-indigo-600"
                  />
                  <span className="text-xl">{opt.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{opt.label}</p>
                    <p className="text-xs text-slate-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {paymentMethod === 'credit-card' && (
              <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-3">
                <Input
                  label="Card Number"
                  value={cardForm.number}
                  onChange={(e) => setCardForm((p) => ({ ...p, number: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Expiry (MM/YY)"
                    value={cardForm.expiry}
                    onChange={(e) => setCardForm((p) => ({ ...p, expiry: e.target.value }))}
                  />
                  <Input
                    label="CVV"
                    value={cardForm.cvv}
                    onChange={(e) => setCardForm((p) => ({ ...p, cvv: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Test scenario selector */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-700 mb-2">
              🧪 Demo: Choose checkout outcome
            </p>
            <div className="flex gap-2 flex-wrap">
              {(
                [
                  { id: 'success', label: '✓ Success' },
                  { id: 'payment-failed', label: '✗ Payment Failed' },
                  { id: 'inventory-error', label: '⚠ Inventory Error' },
                ] as { id: TestScenario; label: string }[]
              ).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setTestScenario(s.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                    testScenario === s.id
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white border border-slate-100 rounded-xl p-5 sticky top-24">
            <h2 className="font-bold text-slate-900 text-base mb-4">Order Summary</h2>
            <div className="flex flex-col gap-3 mb-4">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-50 shrink-0">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-slate-500">×{item.quantity}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-900 shrink-0">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2 text-sm mb-4">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-base border-t border-slate-100 pt-2">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>
            <Button fullWidth size="lg" onClick={handlePlaceOrder}>
              Place Order · ${cartTotal.toFixed(2)}
            </Button>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
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
              256-bit SSL encryption
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
