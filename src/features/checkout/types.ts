export interface DeliveryAddress {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

export type Scenario = 'success' | 'payment-failed' | 'inventory-error';
