import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShineBorder } from "@/components/ui/shine-border";
import { InfoButton } from "@/components/InfoButton";
import { KpiTooltip } from "@/components/KpiTooltip";

export function KPI({
  title,
  value,
  subtitle,
  tooltipValue,
  logic,
  animateValue,
  format,
  durationMs = 1000,
}: {
  title: string;
  value: string;
  subtitle?: string;
  tooltipValue?: string;
  logic?: string;
  animateValue?: number;
  format?: (n: number) => string;
  durationMs?: number;
}) {
  const [display, setDisplay] = useState<string>(value);
  useEffect(() => {
    if (typeof animateValue !== "number" || !Number.isFinite(animateValue)) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const from = 0;
    const to = animateValue;
    const dur = Math.max(300, durationMs);
    let raf = 0 as any;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = easeOutCubic(t);
      const curr = from + (to - from) * eased;
      const text = format ? format(curr) : curr.toFixed(0);
      setDisplay(text);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [animateValue, format, durationMs, value]);

  const card = (
    <div className="group relative rounded-2xl bg-slate-800">
      {logic && (
        <div className="opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100">
          <InfoButton logic={logic} />
        </div>
      )}
      <ShineBorder shineColor="#3c84c2ff" duration={12} />
      <Card className="rounded-2xl border border-slate-800 shadow-sm">
        <div className="h-full min-h-[140px]">
          <CardContent className="flex h-full flex-col justify-between p-6">
            <div className="mb-3 text-xs uppercase tracking-wide text-slate-500">
              {title}
            </div>
            <div className="break-words text-3xl font-bold leading-tight text-slate-300">
              {display}
            </div>
            {subtitle && (
              <div className="mt-2 text-xs text-slate-500">{subtitle}</div>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );

  return tooltipValue ? (
    <KpiTooltip content={tooltipValue}>{card}</KpiTooltip>
  ) : (
    card
  );
}