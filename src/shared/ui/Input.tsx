import { useId } from 'react';
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className = '', ...props }: InputProps) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : props['aria-describedby']}
        className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 ${
          error ? 'border-red-400' : 'border-slate-300 hover:border-slate-400'
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
      {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className = '', children, ...props }: SelectProps) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : props['aria-describedby']}
        className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 ${
          error ? 'border-red-400' : 'border-slate-300 hover:border-slate-400'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : props['aria-describedby']}
        className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 resize-none ${
          error ? 'border-red-400' : 'border-slate-300 hover:border-slate-400'
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
