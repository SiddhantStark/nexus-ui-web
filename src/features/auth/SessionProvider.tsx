import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import type { User, DemoAccount, LoginResult, RegistrationResult } from './types';
function useSessionState(initialAccounts: DemoAccount[], onLogout: () => void) {
  const accounts = useRef(structuredClone(initialAccounts));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  async function login(email: string, password: string): Promise<LoginResult> {
    const account = accounts.current.find((a) => a.user.email === email.trim().toLowerCase());
    if (!account || account.password !== password)
      return { success: false, error: 'Invalid email or password.' };
    setCurrentUser(account.user);
    return { success: true, user: account.user };
  }
  async function register(
    name: string,
    email: string,
    password: string,
  ): Promise<RegistrationResult> {
    const normalized = email.trim().toLowerCase();
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || password.length < 8)
      return {
        success: false,
        error: 'Enter a name, valid email, and password of at least 8 characters.',
      };
    if (accounts.current.some((a) => a.user.email === normalized))
      return { success: false, error: 'An account with this email already exists.' };
    accounts.current.push({
      user: { id: crypto.randomUUID(), name: name.trim(), email: normalized, role: 'customer' },
      password,
    });
    return { success: true };
  }

  return {
    currentUser,
    login,
    register,
    logout() {
      onLogout();
      setCurrentUser(null);
    },
  };
}
const SessionContext = createContext<ReturnType<typeof useSessionState> | null>(null);
export default function SessionProvider({
  children,
  initialAccounts,
  onLogout,
}: {
  children: ReactNode;
  initialAccounts: DemoAccount[];
  onLogout: () => void;
}) {
  const session = useSessionState(initialAccounts, onLogout);
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}
export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession requires SessionProvider');
  return session;
}
