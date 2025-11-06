import React, { useState } from "react";

export function KpiTooltip({
  content,
  children,
}: {
  content: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative block w-full"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <div className="pointer-events-none absolute -top-2 left-1/2 z-30 -translate-x-1/2 -translate-y-full">
          <div className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white shadow-xl">
            {content}
          </div>
          <div className="mx-auto h-2 w-2 rotate-45 border border-l-0 border-t-0 border-slate-700 bg-slate-900"></div>
        </div>
      )}
    </div>
  );
}