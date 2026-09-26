import { formatCurrency } from '@/shared/lib/format';
import Image from '@/shared/ui/Image';
import { useCart } from '@/features/cart/useCart';
import { Link } from 'react-router';
import type { Product } from '@/features/catalog/types';
import Button from '@/shared/ui/Button';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const outOfStock = !product.active || product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStock) return;
    addToCart(product);
  };

  return (
    <div className="relative bg-white border border-slate-100 rounded-xl overflow-hidden hover:shadow-md hover:border-slate-200 transition-all duration-200 cursor-pointer group">
      <Link
        aria-label={`View ${product.name}`}
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline-2 focus-visible:outline-indigo-600"
        to={`/products/${encodeURIComponent(product.id)}`}
      />
      <div className="relative overflow-hidden bg-slate-50">
        <Image
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {outOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-slate-800 text-white text-xs font-medium px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
        {lowStock && !outOfStock && (
          <div className="absolute top-2 right-2">
            <span className="bg-amber-700 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              Only {product.stock} left
            </span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="bg-white/90 text-slate-600 text-xs px-2 py-0.5 rounded-full border border-slate-200">
            {product.category}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-1 mb-1">
          {product.name}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
          {product.description}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-bold text-slate-900">
            {formatCurrency(product.price)}
          </span>
          <Button
            size="sm"
            variant={outOfStock ? 'secondary' : 'primary'}
            disabled={outOfStock}
            onClick={handleAddToCart}
            className="relative z-20 text-xs"
          >
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}
