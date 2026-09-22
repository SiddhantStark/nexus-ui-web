export type Outcome<T = undefined> =
  | { success: true; value: T }
  | { success: false; error: string };
