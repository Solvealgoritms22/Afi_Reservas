import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function CustomInput({ label, className, ...props }: CustomInputProps) {
  const isDate = props.type === 'date';
  const hasValue = Boolean((props as any).value);

  return (
    <div className="grid w-full items-center gap-2">
      {label && <Label htmlFor={props.id} className="text-xs font-medium text-slate-300">{label}</Label>}
      <div className="relative">
         <input
           {...props}
           className={cn(
             'flex h-10 w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f89320a9] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
             props.type === 'date' && 'pr-0 text-base min-w-[9rem] appearance-none',
            isDate && !hasValue && 'text-transparent',
             className,
           )}
         />
        {isDate && !hasValue && props.placeholder && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-slate-400 text-sm">
            {props.placeholder}
          </span>
        )}
      </div>
    </div>
  );
}