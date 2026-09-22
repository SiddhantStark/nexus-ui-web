import { useCommerceStore } from '@/features/commerce/CommerceProvider';
import { useSession } from '@/features/auth/SessionProvider';
import type { DeliveryAddress, Scenario } from './types';
export function useCheckout() {
  const store = useCommerceStore();
  const { currentUser } = useSession();
  return {
    checkout: (address: DeliveryAddress, version: number, attempt: string, scenario: Scenario) =>
      store.checkout(address, currentUser, version, attempt, scenario),
  };
}
