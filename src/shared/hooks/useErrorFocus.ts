import { useEffect, useRef } from 'react';
/** After a failed submit, move focus to the first field with an associated error. */
export function useErrorFocus(errors: Record<string, string> | string) {
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (typeof errors === 'string' ? !!errors : Object.keys(errors).length > 0) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [errors]);
  return formRef;
}
