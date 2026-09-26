import { formatCurrency } from '@/shared/lib/format';
import Image from '@/shared/ui/Image';
import ScrollRegion from '@/shared/ui/ScrollRegion';
import { usePagination } from '@/shared/hooks/usePagination';
import StockStatusBadge from '@/features/inventory/components/StockStatusBadge';
import ProductStatusBadge from '@/features/catalog/components/ProductStatusBadge';
import { useCatalog } from '@/features/catalog/useCatalog';
import LinkButton from '@/shared/ui/LinkButton';
import { Link } from 'react-router';
import { useState } from 'react';
import Pagination from '@/shared/ui/Pagination';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';

const PER_PAGE = 8;

export default function AdminProductsPage() {
  const { products, setProductActive } = useCatalog();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deactivateTarget, setDeactivateTarget] = useState<string | null>(null);

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const { page, totalPages, setPage } = usePagination(filtered.length, PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handleDeactivate() {
    if (!deactivateTarget) return;
    const product = products.find((p) => p.id === deactivateTarget);
    if (product) {
      if (!setProductActive(product.id, !product.active)) return;
    }
    setDeactivateTarget(null);
  }

  const targetProduct = products.find((p) => p.id === deactivateTarget);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">{products.length} products total</p>
        </div>
        <LinkButton to={'/admin/products/new'}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Product
        </LinkButton>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
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
            aria-label="Search products"
            id="AdminProductsPage-search-products"
            placeholder="Search products or SKU…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          />
        </div>
        <select
          aria-label="Product category"
          id="AdminProductsPage-product-category"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === 'all' ? 'All Categories' : c}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <ScrollRegion
        label="Products table"
        className="bg-white border border-slate-100 rounded-xl  mb-4"
      >
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th
                scope="col"
                className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide"
              >
                Product
              </th>
              <th
                scope="col"
                className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide"
              >
                Category
              </th>
              <th
                scope="col"
                className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide"
              >
                Price
              </th>
              <th
                scope="col"
                className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide"
              >
                Stock
              </th>
              <th
                scope="col"
                className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide"
              >
                Status
              </th>
              <th
                scope="col"
                className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{product.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{product.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{product.category}</td>
                <td className="px-5 py-3.5 font-semibold text-slate-900">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`text-sm font-medium ${
                      product.stock === 0
                        ? 'text-red-600'
                        : product.stock <= 5
                          ? 'text-amber-700'
                          : 'text-slate-700'
                    }`}
                  >
                    {product.stock}
                  </span>
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="ml-1.5">
                      <StockStatusBadge status="low_stock" />
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="ml-1.5">
                      <StockStatusBadge status="out_of_stock" />
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <ProductStatusBadge status={product.active ? 'active' : 'inactive'} />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2 justify-end">
                    <Link
                      aria-label={`Edit ${product.name}`}
                      to={`/admin/products/${encodeURIComponent(product.id)}/edit`}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      aria-label={`${product.active ? 'Deactivate' : 'Activate'} ${product.name}`}
                      onClick={() => setDeactivateTarget(product.id)}
                      className={`text-xs font-medium px-2 py-1 rounded-lg transition-colors ${
                        product.active
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {product.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollRegion>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{filtered.length} products</p>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        open={!!deactivateTarget}
        title={targetProduct?.active ? 'Deactivate product?' : 'Activate product?'}
        message={`${targetProduct?.name} will be ${
          targetProduct?.active
            ? 'hidden from the store and unavailable for purchase'
            : 'made available in the store'
        }.`}
        confirmLabel={targetProduct?.active ? 'Deactivate' : 'Activate'}
        variant={targetProduct?.active ? 'danger' : 'primary'}
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  );
}
