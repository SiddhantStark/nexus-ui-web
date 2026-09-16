import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Input, Select, Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Breadcrumbs from '../../components/ui/Breadcrumbs';

const CATEGORIES = ['Electronics', 'Accessories', 'Footwear', 'Home & Kitchen', 'Sports', 'Books'];

export default function AddEditProductPage() {
  const { navigate, products, addProduct, updateProduct, addToast, navigation } = useApp();
  const productId = navigation.params?.productId;
  const existing = products.find((p) => p.id === productId);
  const isEdit = !!existing;

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    description: existing?.description ?? '',
    category: existing?.category ?? 'Electronics',
    price: existing?.price.toString() ?? '',
    stock: existing?.stock.toString() ?? '',
    imageUrl: existing?.imageUrl ?? '',
    sku: existing?.sku ?? '',
    active: existing?.active ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.description.trim()) errs.description = 'Description is required.';
    if (!form.sku.trim()) errs.sku = 'SKU is required.';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      errs.price = 'Valid price required.';
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      errs.stock = 'Valid stock required.';
    return errs;
  }

  async function handleSave() {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    if (isEdit && existing) {
      updateProduct({
        ...existing,
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      });
      addToast('Product updated successfully', 'success');
    } else {
      addProduct({
        id: `prod-${Date.now()}`,
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        specs: {},
      });
      addToast('Product added successfully', 'success');
    }
    setSaving(false);
    navigate('admin-products');
  }

  const field = (key: keyof typeof form) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
    error: errors[key],
  });

  return (
    <div className="max-w-2xl animate-fade-in">
      <Breadcrumbs
        crumbs={[
          { label: 'Products', page: 'admin-products' },
          { label: isEdit ? 'Edit Product' : 'Add Product' },
        ]}
      />
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        {isEdit ? 'Edit Product' : 'Add New Product'}
      </h1>

      <div className="bg-white border border-slate-100 rounded-xl p-6 flex flex-col gap-4">
        {/* Preview */}
        {form.imageUrl && (
          <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden mb-2">
            <img
              src={form.imageUrl}
              alt="Product preview"
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        )}
        <Input
          label="Image URL"
          placeholder="https://images.unsplash.com/…"
          {...field('imageUrl')}
        />
        <Input label="Product Name *" placeholder="ProBook Air 15" {...field('name')} />
        <Textarea
          label="Description *"
          placeholder="Describe the product in detail…"
          rows={3}
          {...field('description')}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category *"
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <Input label="SKU *" placeholder="ELEC-PBA15-001" {...field('sku')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price ($) *"
            type="number"
            step="0.01"
            min="0"
            placeholder="99.99"
            {...field('price')}
          />
          <Input
            label="Stock Quantity *"
            type="number"
            min="0"
            placeholder="50"
            {...field('stock')}
          />
        </div>
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
          <input
            type="checkbox"
            id="active"
            checked={form.active}
            onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
            className="w-4 h-4 accent-indigo-600 rounded"
          />
          <label htmlFor="active" className="text-sm font-medium text-slate-700">
            Active — product is visible and available for purchase
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button loading={saving} onClick={handleSave}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
          </Button>
          <Button variant="outline" onClick={() => navigate('admin-products')}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
