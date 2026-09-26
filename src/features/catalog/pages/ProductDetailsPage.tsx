import { formatCurrency } from '@/shared/lib/format';
import Image from '@/shared/ui/Image';
import { useCart } from '@/features/cart/useCart';
import { useCatalog } from '@/features/catalog/useCatalog';
import LinkButton from '@/shared/ui/LinkButton';
import { useParams, useNavigate } from 'react-router';
import { useState } from 'react';
import Button from '@/shared/ui/Button';
import Breadcrumbs from '@/shared/ui/Breadcrumbs';
import ProductCard from '@/features/catalog/components/ProductCard';

export default function ProductDetailsPage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products } = useCatalog();
  const { productId } = useParams();
  const product = products.find((p) => p.id === productId && p.active);
  const related = products
    .filter((p) => p.id !== productId && p.category === product?.category && p.active)
    .slice(0, 4);

  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-slate-500">Product not found.</h1>
        <LinkButton className="mt-4" to={'/products'}>
          Browse Products
        </LinkButton>
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
    if (addToCart(product, qty)) navigate('/checkout');
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      <Breadcrumbs
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Products', to: '/products' },
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
        {/* Image */}
        <div className="relative bg-slate-100 rounded-2xl overflow-hidden aspect-[4/3]">
          <Image
            loading="eager"
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
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
          <p className="text-xs text-slate-500 font-mono mb-2">SKU: {product.sku}</p>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{product.name}</h1>
          <p className="text-3xl font-extrabold text-slate-900 mb-1">
            {formatCurrency(product.price)}
          </p>
          <p className="text-sm text-slate-500 mb-4">Demo shipping has no delivery charge</p>
          <p className="text-sm text-slate-600 leading-relaxed mb-5">{product.description}</p>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            {outOfStock ? (
              <span className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
                <span className="w-2 h-2 bg-red-400 rounded-full" />
                Out of stock — join waitlist
              </span>
            ) : lowStock ? (
              <span className="flex items-center gap-1.5 text-sm text-amber-700 font-medium">
                <span className="w-2 h-2 bg-amber-400 rounded-full" />
                Only {product.stock} left in stock
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm text-emerald-700 font-medium">
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
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors font-bold"
                >
                  −
                </button>
                <span className="w-12 text-center text-sm font-semibold text-slate-900">{qty}</span>
                <button
                  aria-label="Increase quantity"
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
              { icon: '🔒', text: 'Simulated checkout' },
              { icon: '📦', text: 'No real shipment' },
              { icon: '↩️', text: 'Demo refunds' },
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
                <span className="font-medium text-slate-700 w-28 sm:w-40 shrink-0">{key}</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
