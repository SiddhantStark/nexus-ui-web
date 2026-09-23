import type { ReactNode } from 'react';

/** A named, keyboard-scrollable container for content wider than the viewport. */
export default function ScrollRegion({
  label,
  children,
  className = '',
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    // Keyboard users need to focus the overflow region to scroll with arrow keys.
    <div
      role="region"
      aria-label={label}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      className={`max-w-full overflow-x-auto ${className}`}
    >
      {children}
    </div>
  );
}
