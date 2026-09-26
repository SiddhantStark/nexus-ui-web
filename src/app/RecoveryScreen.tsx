import type { ReactNode } from 'react';
import Button from '@/shared/ui/Button';

export default function RecoveryScreen({ homeLink }: { homeLink: ReactNode }) {
  return (
    <main className="max-w-xl mx-auto px-6 py-20">
      <div role="alert">
        <h1 className="text-2xl font-bold mb-3">We couldn't open this page</h1>
        <p className="text-slate-600 mb-4">Try another page, or reload if the problem continues.</p>
      </div>
      <p className="text-sm text-slate-600 mb-6">
        Reloading resets your demo session, cart, and changes.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        {homeLink}
        <Button onClick={() => window.location.reload()}>Reload application</Button>
      </div>
    </main>
  );
}
