import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CartPage from '@/pages/customer/CartPage';
import { renderWithApp } from '@/test/renderWithApp';
import { PRODUCTS } from '@/data/mockData';
import ProductCard from './ProductCard';

const product = PRODUCTS[0];

describe('ProductCard and cart', () => {
  it('adds products to the cart and accumulates their quantity', async () => {
    const { user } = renderWithApp(
      <>
        <ProductCard product={product} />
        <CartPage />
      </>,
    );

    expect(screen.getByRole('heading', { name: 'Your cart is empty' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));
    expect(screen.getByRole('heading', { name: 'Shopping Cart (1 item)' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));
    expect(screen.getByRole('heading', { name: 'Shopping Cart (2 items)' })).toBeInTheDocument();
    expect(screen.getByText(`${product.name} ×2`)).toBeInTheDocument();
  });

  it('does not add an out-of-stock product and starts with an empty cart', async () => {
    const { user } = renderWithApp(
      <>
        <ProductCard product={{ ...product, stock: 0 }} />
        <CartPage />
      </>,
    );

    const addButton = screen.getByRole('button', { name: 'Out of Stock' });
    expect(addButton).toBeDisabled();
    await user.click(addButton);
    expect(screen.getByRole('heading', { name: 'Your cart is empty' })).toBeInTheDocument();
  });
});
