import type { DemoAccount } from '@/features/auth/types';
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    user: {
      id: 'usr-001',
      name: 'Alex Rivera',
      email: 'customer@nexuscommerce.com',
      role: 'customer',
    },
    password: 'password123',
  },
  {
    user: {
      id: 'usr-admin',
      name: 'Jordan Kim',
      email: 'admin@nexuscommerce.com',
      role: 'admin',
    },
    password: 'admin123',
  },
];
