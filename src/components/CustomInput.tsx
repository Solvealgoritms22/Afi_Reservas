import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function CustomInput({ label, className, ...props }: CustomInputProps) {
  return (
    <div className="grid w-full items-center gap-3 ">
      {label && <Label htmlFor={props.id} className="text-xs font-medium text-slate-300">{label}</Label>}
      <input
        {...props}
        className={cn(
          'flex h-10 w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f89320a9] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
      />
    </div>
  );
}