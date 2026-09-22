import type { User } from '@/features/auth/types';

/** Only internal destinations are eligible for a post-login redirect. Guards enforce ownership. */
export function loginDestination(search: string, user: User): string {
  const fallback = user.role === 'admin' ? '/admin' : '/';
  const next = new URLSearchParams(search).get('next');
  if (
    !next ||
    !/^\/(?!\/)/.test(next) ||
    next.includes('\\') ||
    [...next].some((character) => character.charCodeAt(0) <= 32)
  )
    return fallback;
  const url = new URL(next, 'https://nexus.local');
  if (url.origin !== 'https://nexus.local' || /^\/(login|register)(\/|$)/.test(url.pathname))
    return fallback;
  if (/^\/admin(\/|$)/.test(url.pathname) && user.role !== 'admin') return fallback;
  return url.pathname + url.search + url.hash;
}
