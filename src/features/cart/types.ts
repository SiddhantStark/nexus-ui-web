/** Persist only identity and quantity; catalog data is derived on read. */
export interface CartEntry {
  productId: string;
  quantity: number;
}
