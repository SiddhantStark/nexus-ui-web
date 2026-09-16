import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <input
        className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 ${
          error ? 'border-red-400' : 'border-slate-300 hover:border-slate-400'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className = '', children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <select
        className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 ${
          error ? 'border-red-400' : 'border-slate-300 hover:border-slate-400'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <textarea
        className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 resize-none ${
          error ? 'border-red-400' : 'border-slate-300 hover:border-slate-400'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
