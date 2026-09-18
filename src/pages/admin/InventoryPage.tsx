import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export default function InventoryPage() {
  const { products, updateProduct, addToast } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editTarget, setEditTarget] = useState<{
    id: string;
    name: string;
    stock: number;
  } | null>(null);
  const [delta, setDelta] = useState('');
  const [mode, setMode] = useState<'add' | 'subtract'>('add');
  const [saving, setSaving] = useState(false);

  const displayed = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'low' && p.stock > 0 && p.stock <= 5) ||
      (filter === 'out' && p.stock === 0) ||
      (filter === 'ok' && p.stock > 5);
    return matchSearch && matchFilter;
  });

  async function handleUpdateStock() {
    if (!editTarget) return;
    if (!Number.isInteger(Number(delta)) || Number(delta) <= 0) {
      addToast('Enter a positive whole number.', 'error');
      return;
    }
    const product = products.find((p) => p.id === editTarget.id);
    if (!product) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    const change = Number(delta);
    const newStock = mode === 'add' ? product.stock + change : Math.max(0, product.stock - change);
    const saved = updateProduct({ ...product, stock: newStock });
    setSaving(false);
    if (!saved) return;
    setEditTarget(null);
    setDelta('');
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{products.length} products tracked</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: 'In Stock',
            value: products.filter((p) => p.stock > 5).length,
            color: 'text-emerald-700',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Low Stock',
            value: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
            color: 'text-amber-700',
            bg: 'bg-amber-50',
          },
          {
            label: 'Out of Stock',
            value: products.filter((p) => p.stock === 0).length,
            color: 'text-red-700',
            bg: 'bg-red-50',
          },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} border border-slate-100 rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-slate-600 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          />
        </div>
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'ok', label: 'In Stock' },
            { id: 'low', label: 'Low Stock' },
            { id: 'out', label: 'Out of Stock' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-2 text-xs rounded-lg border font-medium transition-colors ${
                filter === f.id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Product
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                SKU
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Current Stock
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Reserved
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Available
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Status
              </th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {displayed.map((product) => {
              const reserved = Math.min(2, product.stock);
              const available = product.stock - reserved;
              return (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-medium text-slate-900 text-sm">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-mono text-slate-500">{product.sku}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{product.stock}</td>
                  <td className="px-5 py-3.5 text-slate-500">{reserved}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-700">{available}</td>
                  <td className="px-5 py-3.5">
                    {product.stock === 0 ? (
                      <StatusBadge status="out_of_stock" />
                    ) : product.stock <= 5 ? (
                      <StatusBadge status="low_stock" />
                    ) : (
                      <StatusBadge status="active" />
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditTarget({
                          id: product.id,
                          name: product.name,
                          stock: product.stock,
                        });
                        setDelta('');
                        setMode('add');
                      }}
                    >
                      Update Stock
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Update Stock Level"
        size="sm"
      >
        {editTarget && (
          <div className="flex flex-col gap-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-sm font-semibold text-slate-900">{editTarget.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Current stock: <strong>{editTarget.stock}</strong>
              </p>
            </div>
            <div className="flex gap-2">
              {(['add', 'subtract'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 text-sm rounded-lg border font-medium transition-colors ${
                    mode === m
                      ? m === 'add'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {m === 'add' ? '+ Add Stock' : '− Remove Stock'}
                </button>
              ))}
            </div>
            <Input
              label="Quantity"
              type="number"
              min="1"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              placeholder="Enter quantity"
            />
            {delta && (
              <p className="text-xs text-slate-500 text-center">
                New stock:{' '}
                <strong>
                  {mode === 'add'
                    ? editTarget.stock + Number(delta)
                    : Math.max(0, editTarget.stock - Number(delta))}
                </strong>
              </p>
            )}
            <div className="flex gap-3">
              <Button fullWidth loading={saving} onClick={handleUpdateStock}>
                Update
              </Button>
              <Button variant="outline" fullWidth onClick={() => setEditTarget(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
