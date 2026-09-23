import { useCatalog } from '@/features/catalog/useCatalog';
import { useSearchParams } from 'react-router';
import { useEffect, useMemo } from 'react';
import ProductCard from '@/features/catalog/components/ProductCard';
import { Select } from '@/shared/ui/Input';
import Pagination from '@/shared/ui/Pagination';
import EmptyState from '@/shared/ui/EmptyState';

const CATEGORIES = [
  'All',
  'Electronics',
  'Accessories',
  'Footwear',
  'Home & Kitchen',
  'Sports',
  'Books',
];
const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];
const PER_PAGE = 8;

export default function ProductListingPage() {
  const { products } = useCatalog();
  const [params, setParams] = useSearchParams();
  const search = params.get('q') ?? '';
  const category = CATEGORIES.includes(params.get('category') ?? '')
    ? params.get('category')!
    : 'All';
  const sort = SORT_OPTIONS.some((option) => option.value === params.get('sort'))
    ? params.get('sort')!
    : 'name-asc';
  const rawPrice = params.get('maxPrice') ?? '';
  const priceMax =
    rawPrice !== '' && Number.isFinite(Number(rawPrice)) && Number(rawPrice) >= 0 ? rawPrice : '';
  const requestedPage = Number(params.get('page') ?? 1);
  function updateQuery(key: string, value: string, replace = false) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace });
  }
  const setSearch = (value: string) => updateQuery('q', value, true);
  const setCategory = (value: string) => updateQuery('category', value === 'All' ? '' : value);
  const setPriceMax = (value: string) => updateQuery('maxPrice', value, true);
  const setSort = (value: string) => updateQuery('sort', value === 'name-asc' ? '' : value);
  const setPage = (value: number) => updateQuery('page', value === 1 ? '' : String(value));

  const filtered = useMemo(() => {
    let result = products.filter((p) => p.active);
    if (search)
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase()),
      );
    if (category !== 'All') result = result.filter((p) => p.category === category);
    if (priceMax) result = result.filter((p) => p.price <= Number(priceMax));
    result = [...result].sort((a, b) => {
      if (sort === 'name-asc') return a.name.localeCompare(b.name);
      if (sort === 'name-desc') return b.name.localeCompare(a.name);
      if (sort === 'price-asc') return a.price - b.price;
      return b.price - a.price;
    });
    return result;
  }, [products, search, category, priceMax, sort]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const page = Math.min(
    Math.max(1, totalPages),
    Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
  );
  useEffect(() => {
    const normalized = new URLSearchParams(params);
    for (const [key, value] of Object.entries({
      category: category === 'All' ? '' : category,
      sort: sort === 'name-asc' ? '' : sort,
      maxPrice: priceMax,
      page: page === 1 ? '' : String(page),
    })) {
      if (value) normalized.set(key, value);
      else normalized.delete(key);
    }
    if (normalized.toString() !== params.toString()) setParams(normalized, { replace: true });
  }, [category, sort, priceMax, page, params, setParams]);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function resetFilters() {
    setParams({});
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">All Products</h1>
        <p className="text-sm text-slate-500 mt-1">{filtered.length} products found</p>
      </div>

      {/* Filters bar */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            aria-label="Search products"
            placeholder="Search products…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          />
        </div>

        {/* Category */}
        <select
          aria-label="Category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
          }}
          className="px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-white"
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        {/* Price */}
        <input
          type="number"
          aria-label="Maximum price"
          placeholder="Max price $"
          value={priceMax}
          onChange={(e) => {
            setPriceMax(e.target.value);
          }}
          className="w-32 px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
        />

        {/* Sort */}
        <Select
          aria-label="Sort products"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="min-w-40"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        {(search || category !== 'All' || priceMax) && (
          <button
            onClick={resetFilters}
            className="text-sm text-slate-500 hover:text-red-600 whitespace-nowrap transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCategory(c);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              category === c
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {paginated.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try adjusting your search or filters."
          action={{ label: 'Reset filters', onClick: resetFilters }}
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
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {paginated.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of{' '}
              {filtered.length}
            </p>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
