import { useId } from 'react';
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, Ref } from 'react';

interface FieldProps {
  label?: string;
  error?: string;
  helperText?: string;
}
interface InputProps extends InputHTMLAttributes<HTMLInputElement>, FieldProps {}
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, FieldProps {}
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldProps {
  ref?: Ref<HTMLTextAreaElement>;
}

function descriptions(id: string, external?: string, helperText?: string, error?: string) {
  return (
    [external, helperText && `${id}-help`, error && `${id}-error`].filter(Boolean).join(' ') ||
    undefined
  );
}
function FieldText({ id, helperText, error }: FieldProps & { id: string }) {
  return (
    <>
      {helperText && (
        <p id={`${id}-help`} className="text-xs text-slate-600">
          {helperText}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-700">
          {error}
        </p>
      )}
    </>
  );
}
const fieldStyles =
  'w-full min-w-0 px-3 py-2.5 text-sm border rounded-lg bg-white placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600';
export function Input({ label, error, helperText, className = '', ...props }: InputProps) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  return (
    <div className="flex min-w-0 flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        {...props}
        id={id}
        aria-invalid={error ? true : props['aria-invalid']}
        aria-describedby={descriptions(id, props['aria-describedby'], helperText, error)}
        className={`${fieldStyles} ${error ? 'border-red-600' : 'border-slate-400 hover:border-slate-500'} ${className}`}
      />
      <FieldText id={id} helperText={helperText} error={error} />
    </div>
  );
}
export function Select({
  label,
  error,
  helperText,
  className = '',
  children,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  return (
    <div className="flex min-w-0 flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        {...props}
        id={id}
        aria-invalid={error ? true : props['aria-invalid']}
        aria-describedby={descriptions(id, props['aria-describedby'], helperText, error)}
        className={`${fieldStyles} ${error ? 'border-red-600' : 'border-slate-400 hover:border-slate-500'} ${className}`}
      >
        {children}
      </select>
      <FieldText id={id} helperText={helperText} error={error} />
    </div>
  );
}
export function Textarea({ label, error, helperText, className = '', ...props }: TextareaProps) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  return (
    <div className="flex min-w-0 flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        {...props}
        id={id}
        aria-invalid={error ? true : props['aria-invalid']}
        aria-describedby={descriptions(id, props['aria-describedby'], helperText, error)}
        className={`${fieldStyles} resize-y ${error ? 'border-red-600' : 'border-slate-400 hover:border-slate-500'} ${className}`}
      />
      <FieldText id={id} helperText={helperText} error={error} />
    </div>
  );
}
