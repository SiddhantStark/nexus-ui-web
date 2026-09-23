import * as Dialog from '@radix-ui/react-dialog';
import { useId, useRef, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: ModalProps) {
  const descriptionId = useId();
  const opener = useRef<HTMLElement | null>(null);
  const content = useRef<HTMLDivElement | null>(null);
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content
          ref={content}
          aria-describedby={description ? descriptionId : undefined}
          className={`fixed left-1/2 top-1/2 z-50 w-[calc(100%_-_2rem)] max-h-[calc(100dvh_-_2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto ${sizes[size]} bg-white rounded-2xl shadow-2xl animate-fade-in`}
          onOpenAutoFocus={(event) => {
            opener.current =
              document.activeElement instanceof HTMLElement ? document.activeElement : null;
            const target =
              content.current?.querySelector<HTMLElement>('[data-dialog-initial-focus]') ??
              content.current?.querySelector<HTMLElement>(
                'input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
              );
            if (target) {
              event.preventDefault();
              target.focus();
            }
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            // Existing callers use controlled dialogs without a Radix Trigger.
            const target = opener.current;
            if (target?.isConnected && !target.matches(':disabled')) target.focus();
            else document.getElementById('main-content')?.focus();
          }}
        >
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-100">
            <Dialog.Title className="text-base font-semibold text-slate-900">{title}</Dialog.Title>
            <Dialog.Close
              aria-label="Close dialog"
              className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Dialog.Close>
          </div>
          <div className="p-4 sm:p-6">
            {description && (
              <Dialog.Description id={descriptionId} className="text-sm text-slate-600 mb-4">
                {description}
              </Dialog.Description>
            )}
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
