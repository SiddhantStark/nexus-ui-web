export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  sku: string;
  active: boolean;
  specs?: Record<string, string>;
}
