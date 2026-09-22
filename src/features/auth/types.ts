export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

export interface DemoAccount {
  user: User;
  password: string;
}
export type LoginResult = { success: true; user: User } | { success: false; error: string };
export type RegistrationResult = { success: true } | { success: false; error: string };
