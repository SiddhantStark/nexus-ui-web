import { useCatalog } from '@/features/catalog/useCatalog';
import { Link } from 'react-router';
import ProductCard from '@/features/catalog/components/ProductCard';

const CATEGORIES = [
  {
    name: 'Electronics',
    emoji: '💻',
    count: 6,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  },
  {
    name: 'Accessories',
    emoji: '⌚',
    count: 4,
    color: 'bg-violet-50 text-violet-700 border-violet-100',
  },
  {
    name: 'Footwear',
    emoji: '👟',
    count: 2,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  {
    name: 'Home & Kitchen',
    emoji: '🏠',
    count: 3,
    color: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  {
    name: 'Sports',
    emoji: '🏋️',
    count: 2,
    color: 'bg-rose-50 text-rose-700 border-rose-100',
  },
  {
    name: 'Books',
    emoji: '📚',
    count: 1,
    color: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  },
];

export default function HomePage() {
  const { products } = useCatalog();
  const featured = products.filter((p) => p.active).slice(0, 4);
  const popular = products.filter((p) => p.active && p.stock > 0).slice(4, 8);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&h=700&fit=crop&auto=format"
            alt="Shopping"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              New arrivals weekly
            </div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Everything you need,
              <br />
              <span className="text-indigo-300">delivered with care.</span>
            </h1>
            <p className="text-indigo-200 text-lg leading-relaxed mb-8 max-w-xl">
              Shop thousands of products with transparent pricing, real-time order tracking, and
              hassle-free returns.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link
                to={'/products'}
                className="bg-white text-indigo-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
              >
                Shop Now
              </Link>
              <Link
                to={'/orders'}
                className="border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                Track Orders
              </Link>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-3 shrink-0">
            {products
              .filter((p) => p.stock > 0)
              .slice(0, 4)
              .map((p) => (
                <Link
                  key={p.id}
                  className="w-36 h-36 rounded-2xl overflow-hidden shadow-xl border-2 border-white/20 hover:scale-105 transition-transform cursor-pointer"
                  to={`/products/${encodeURIComponent(p.id)}`}
                >
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                </Link>
              ))}
          </div>
        </div>
        {/* Stats strip */}
        <div className="relative border-t border-white/10 bg-black/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center gap-8 md:gap-16 flex-wrap">
            {[
              { value: 'Free shipping', note: 'on orders over $50' },
              { value: '30-day returns', note: 'easy and free' },
              { value: '24/7 support', note: 'always here for you' },
              { value: 'Secure payments', note: 'PCI compliant' },
            ].map(({ value, note }) => (
              <div key={value} className="text-center">
                <p className="text-sm font-semibold text-white">{value}</p>
                <p className="text-xs text-indigo-300">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        {/* Categories */}
        <section className="py-12">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Browse Categories</h2>
            <Link to={'/products'} className="text-sm text-indigo-600 font-medium hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIES.map(({ name, emoji, count, color }) => (
              <Link
                key={name}
                to={`/products?${new URLSearchParams({ category: name })}`}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border font-medium text-sm transition-all hover:shadow-md hover:scale-105 ${color}`}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="leading-none">{name}</span>
                <span className="text-xs">{count} items</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="pb-12">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
              <p className="text-sm text-slate-500 mt-0.5">Handpicked for you this week</p>
            </div>
            <Link to={'/products'} className="text-sm text-indigo-600 font-medium hover:underline">
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* Popular Products */}
        <section className="pb-16">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-indigo-400 text-sm font-medium mb-1">Most Popular</p>
                <h2 className="text-2xl font-bold text-white">{"Customers' favorites"}</h2>
                <p className="text-slate-300 text-sm mt-1">
                  Top-rated products across all categories
                </p>
              </div>
              <Link
                to={'/products'}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-500 transition-colors shrink-0"
              >
                Explore All
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popular.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
