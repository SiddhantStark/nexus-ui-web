import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Button from '../../components/ui/Button';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import ProductCard from '../../components/ui/ProductCard';

export default function ProductDetailsPage() {
  const { navigate, products, addToCart, navigation } = useApp();
  const productId = navigation.params?.productId;
  const product = products.find((p) => p.id === productId);
  const related = products
    .filter((p) => p.id !== productId && p.category === product?.category && p.active)
    .slice(0, 4);

  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-slate-500">Product not found.</p>
        <Button className="mt-4" onClick={() => navigate('products')}>
          Browse Products
        </Button>
      </div>
    );
  }

  const outOfStock = !product.active || product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;

  function handleAddToCart() {
    if (!product) return;
    addToCart(product, qty);
  }

  function handleBuyNow() {
    if (!product) return;
    if (addToCart(product, qty)) navigate('checkout');
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      <Breadcrumbs
        crumbs={[
          { label: 'Home', page: 'home' },
          { label: 'Products', page: 'products' },
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
        {/* Image */}
        <div className="relative bg-slate-100 rounded-2xl overflow-hidden aspect-[4/3]">
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          {outOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <div className="bg-slate-800 text-white text-sm font-semibold px-5 py-2.5 rounded-full">
                Out of Stock
              </div>
            </div>
          )}
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 text-slate-600 text-xs px-3 py-1 rounded-full border border-slate-200 font-medium">
              {product.category}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-xs text-slate-400 font-mono mb-2">SKU: {product.sku}</p>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-amber-400">
              {'★★★★'.split('').map((_, i) => (
                <span key={i}>★</span>
              ))}
              <span className="text-slate-300">★</span>
            </div>
            <span className="text-sm text-slate-500">4.3 (128 reviews)</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mb-1">${product.price.toFixed(2)}</p>
          <p className="text-sm text-slate-500 mb-4">Free shipping on this order</p>
          <p className="text-sm text-slate-600 leading-relaxed mb-5">{product.description}</p>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            {outOfStock ? (
              <span className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
                <span className="w-2 h-2 bg-red-400 rounded-full" />
                Out of stock — join waitlist
              </span>
            ) : lowStock ? (
              <span className="flex items-center gap-1.5 text-sm text-amber-600 font-medium">
                <span className="w-2 h-2 bg-amber-400 rounded-full" />
                Only {product.stock} left in stock
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                In stock ({product.stock} available)
              </span>
            )}
          </div>

          {/* Quantity */}
          {!outOfStock && (
            <div className="flex items-center gap-3 mb-5">
              <span className="text-sm font-medium text-slate-700">Quantity</span>
              <div className="flex items-center gap-0 border border-slate-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors font-bold"
                >
                  −
                </button>
                <span className="w-12 text-center text-sm font-semibold text-slate-900">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors font-bold"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            {outOfStock ? (
              <Button variant="outline" fullWidth disabled>
                Out of Stock
              </Button>
            ) : (
              <>
                <Button variant="outline" fullWidth onClick={handleAddToCart}>
                  Add to Cart
                </Button>
                <Button fullWidth onClick={handleBuyNow}>
                  Buy Now
                </Button>
              </>
            )}
          </div>

          {/* Trust */}
          <div className="flex gap-6 text-xs text-slate-500 border-t border-slate-100 pt-5">
            {[
              { icon: '🔒', text: 'Secure checkout' },
              { icon: '📦', text: 'Free 2-day shipping' },
              { icon: '↩️', text: '30-day returns' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                {icon}
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Specs */}
      {product.specs && (
        <div className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Specifications</h2>
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
            {Object.entries(product.specs).map(([key, val], i) => (
              <div
                key={key}
                className={`flex items-center px-5 py-3.5 text-sm ${
                  i % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                }`}
              >
                <span className="font-medium text-slate-700 w-40 shrink-0">{key}</span>
                <span className="text-slate-600">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-5">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
