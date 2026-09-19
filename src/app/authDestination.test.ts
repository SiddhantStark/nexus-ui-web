import { describe, expect, it } from 'vitest';
import type { User } from '../types';
import { loginDestination } from './authDestination';
const customer: User = { id: 'test', name: 'Test', email: 'test@example.com', role: 'customer' };
const admin: User = { ...customer, role: 'admin' };
const query = (next: string) => `?${new URLSearchParams({ next })}`;
describe('post-login destinations', () => {
  it.each([
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '/\nevil.example',
    '/login',
    '/register?next=/login',
    '/admin/products',
  ])('rejects unsafe, recursive, or unauthorized customer destination %j', (next) => {
    expect(loginDestination(query(next), customer)).toBe('/');
  });
  it('preserves internal paths, filters, and fragments', () => {
    expect(loginDestination(query('/products?category=Home+%26+Kitchen#results'), customer)).toBe(
      '/products?category=Home+%26+Kitchen#results',
    );
    expect(loginDestination(query('/admin/products'), admin)).toBe('/admin/products');
  });
  it('uses role-specific defaults', () => {
    expect(loginDestination('', customer)).toBe('/');
    expect(loginDestination('', admin)).toBe('/admin');
  });
});
