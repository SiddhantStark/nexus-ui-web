import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';
import type { CommerceState, CommerceStore } from './store';
const CommerceContext = createContext<CommerceStore | null>(null);
export default function CommerceProvider({
  store,
  children,
}: {
  store: CommerceStore;
  children: ReactNode;
}) {
  return <CommerceContext.Provider value={store}>{children}</CommerceContext.Provider>;
}
export function useCommerceStore(): CommerceStore {
  const store = useContext(CommerceContext);
  if (!store) throw new Error('Commerce hooks require CommerceProvider');
  return store;
}
/** Subscribe to a stable slice, so unrelated commerce updates do not rerender its readers. */
export function useCommerceSlice<K extends keyof CommerceState>(key: K): CommerceState[K] {
  const store = useCommerceStore();
  return useSyncExternalStore(store.subscribe, () => store.getSnapshot()[key]);
}
