import { useCommerceSlice } from '@/features/commerce/CommerceProvider';
import { useSession } from '@/features/auth/SessionProvider';
export function usePayments() {
  return { transactions: useCommerceSlice('transactions') };
}
export function useMyTransactions() {
  const transactions = useCommerceSlice('transactions');
  const { currentUser } = useSession();
  return transactions.filter((transaction) => transaction.customerId === currentUser?.id);
}
