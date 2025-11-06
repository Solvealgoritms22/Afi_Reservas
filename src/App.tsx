import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  BarChart3,
  LineChart,
  Check,
  Info,
  User,
  LogOut,
  ChevronDown,
  Facebook,
  Instagram,
  X,
  Linkedin,
  Youtube,
  Table,
  Upload,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart as RBarChart,
  Bar,
} from "recharts";
import { ShineBorder } from "@/components/ui/shine-border";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { MagicCard } from "@/components/ui/magic-card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import type { Fund, Movement } from "./types";
import { useDatabase } from "./hooks/useDatabase";
import { ImportAccountStatements } from "./components/ImportAccountStatements";
import { Toaster, toast } from "sonner";
import { CustomSelect } from "./components/CustomSelect";
import { CustomInput } from "./components/CustomInput";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { InfoButton } from "./components/InfoButton";
import {
  FUND_PRESETS,
  getFundPresetKeyFromFund,
  resolveFundIconSrc,
} from "./fundPresets";
import { FundIcon } from "./components/FundIcon";
import { FundInfoDialog } from "./components/FundInfoDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";

const uuid = () =>
  typeof crypto !== "undefined" && (crypto as any).randomUUID
    ? (crypto as any).randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

function formatMoney(n: number) {
  if (!Number.isFinite(n)) return "-";

  // Para numeros muy grandes, usar formato compacto
  if (Math.abs(n) >= 1000000) {
    return n.toLocaleString(undefined, {
      style: "currency",
      currency: "DOP",
      maximumFractionDigits: 0,
      notation: "compact",
      compactDisplay: "short",
    });
  }

  // Para numeros normales, usar formato estandar
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 2,
  });
}

// Formato completo (sin notaciÃ³n compacta), siempre con 2 decimales
function formatMoneyFull(n: number) {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 2,
  });
}

// Tooltip personalizado ligero para KPI (evitar conflicto con recharts.Tooltip)
function KpiTooltip({
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

function monthKey(iso: string) {
  return iso?.slice(0, 7) || "";
}

function parseISO(d: string) {
  return new Date(d + (d.length === 10 ? "T00:00:00" : ""));
}

// Formatea la duraciÃ³n desde una fecha inicial hasta hoy (años y meses)
function formatDurationSince(startISO: string): string {
  const start = parseISO(startISO);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  const days = now.getDate() - start.getDate();
  if (days < 0) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const yText = years > 0 ? `${years} año${years > 1 ? "s" : ""}` : "";
  const mText =
    months > 0
      ? `${months} mes${months > 1 ? "es" : ""}`
      : years === 0
        ? "menos de 1 mes"
        : "";
  const parts = [yText, mText].filter(Boolean);
  if (parts.length === 2) return `${parts[0]} y ${parts[1]}`;
  return parts[0] || "";
}

function deriveType(
  concept: string,
):
  | "Aporte"
  | "Rescate"
  | "Rendimiento"
  | "Saldo Anterior"
  | "Saldo Final"
  | "Otro" {
  const c = (concept || "").toLowerCase();
  if (c.includes("aporte")) return "Aporte";
  if (c.includes("rescate")) return "Rescate";
  if (c.includes("rendimiento")) return "Rendimiento";
  if (c.includes("saldo anterior")) return "Saldo Anterior";
  if (c.includes("saldo final")) return "Saldo Final";
  return "Otro";
}

function useAggregations(rows: Movement[]) {
  const sorted = useMemo(
    () =>
      [...rows].sort(
        (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime(),
      ),
    [rows],
  );
  const months = useMemo(
    () =>
      Array.from(
        new Set(sorted.map((r) => monthKey(r.date)).filter(Boolean)),
      ).sort(),
    [sorted],
  );

  type MonthAgg = {
    saldoInicial: number;
    aportes: number;
    rescates: number;
    rendimientos: number;
    comision: number;
    saldoFinalBruto: number;
    saldoFinalNeto: number;
  };

  const byMonth = useMemo(() => {
    const map: Record<string, MonthAgg> = {};
    months.forEach(
      (m) =>
        (map[m] = {
          saldoInicial: 0,
          aportes: 0,
          rescates: 0,
          rendimientos: 0,
          comision: 0,
          saldoFinalBruto: 0,
          saldoFinalNeto: 0,
        }),
    );

    for (const r of sorted) {
      const m = monthKey(r.date);
      if (!m) continue;
      const t = deriveType(r.concept);
      if (t === "Saldo Anterior") map[m].saldoInicial += r.amount || 0;
      else if (t === "Aporte") map[m].aportes += r.amount || 0;
      else if (t === "Rescate") map[m].rescates += r.amount || 0;
      else if (t === "Rendimiento") map[m].rendimientos += r.amount || 0;
      else if (t === "Saldo Final") map[m].saldoFinalBruto += r.amount || 0;
    }

    let prevClose = 0;
    for (const m of months) {
      const o = map[m];
      // Si no hay "Saldo anterior" en el mes, usar el cierre del mes previo
      const base = o.saldoInicial > 0 ? o.saldoInicial : prevClose;
      if (!o.saldoInicial) o.saldoInicial = prevClose;
      o.saldoFinalBruto =
        o.saldoFinalBruto || base + o.aportes - o.rescates + o.rendimientos;
      o.comision = 0;
      o.saldoFinalNeto = o.saldoFinalBruto;
      prevClose = o.saldoFinalBruto;
    }
    return map;
  }, [sorted, months]);

  const lastMonth = months[months.length - 1];
  const capitalActual = lastMonth ? byMonth[lastMonth].saldoFinalNeto : 0;
  const saldoFinal = lastMonth ? byMonth[lastMonth].saldoFinalBruto : 0;

  // Calcular el capital invertido (suma total de aportes)
  const capitalInvertido = useMemo(
    () => Object.values(byMonth).reduce((a, m) => a + m.aportes, 0),
    [byMonth],
  );

  const ultimoAporte = useMemo(() => {
    const aportes = sorted.filter((r) => deriveType(r.concept) === "Aporte");
    return aportes.length
      ? {
          date: aportes[aportes.length - 1].date,
          amount: aportes[aportes.length - 1].amount,
        }
      : undefined;
  }, [sorted]);

  const rendimientoUltMes = lastMonth ? byMonth[lastMonth].rendimientos : 0;
  const rendimientoTotalAcum = useMemo(
    () => Object.values(byMonth).reduce((a, m) => a + m.rendimientos, 0),
    [byMonth],
  );

  const { avgDaily, annualPct } = useMemo(() => {
    if (sorted.length < 2) return { avgDaily: 0, annualPct: 0 };
    let totalDays = 0;
    let logSum = 0;
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1],
        cur = sorted[i];
      const days = Math.max(
        1,
        Math.round(
          (parseISO(cur.date).getTime() - parseISO(prev.date).getTime()) /
            86400000,
        ),
      );
      const navPrev = Math.max(1e-9, prev.nav || 0);
      const navCur = Math.max(1e-9, cur.nav || 0);
      const r = navPrev > 0 ? navCur / navPrev - 1 : 0;
      logSum += Math.log(Math.max(1e-6, 1 + r));
      totalDays += days;
    }
    const dailyLog = totalDays > 0 ? logSum / totalDays : 0;
    const avgDaily = Math.exp(dailyLog) - 1;
    const annualPct = Math.pow(1 + avgDaily, 365) - 1;
    return { avgDaily, annualPct };
  }, [sorted]);

  const pctMensual = useMemo(() => {
    if (!lastMonth) return 0;
    const m = byMonth[lastMonth];
    const base = Math.max(1e-9, m.saldoInicial || 0);
    return base > 0 ? m.rendimientos / base : 0;
  }, [byMonth, lastMonth]);

  const mensual = months.map((m) => ({ mes: m, ...byMonth[m] }));

  return {
    mensual,
    capitalActual,
    capitalInvertido,
    ultimoAporte,
    rendimientoUltMes,
    rendimientoTotalAcum,
    saldoFinal,
    avgDaily,
    pctMensual,
    pctAnual: annualPct,
  };
}

function KPI({
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
    // Reanimar cuando cambie el valor objetivo o el formateador
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

function Dashboard({ rows, shouldAnimate = false, onAnimated }: { rows: Movement[]; shouldAnimate?: boolean; onAnimated?: () => void }) {
  const {
    mensual,
    capitalActual,
    capitalInvertido,
    ultimoAporte,
    rendimientoUltMes,
    rendimientoTotalAcum,
    saldoFinal,
    avgDaily,
    pctMensual,
    pctAnual,
  } = useAggregations(rows);

  // Calcular valores en dinero para los porcentajes
  const avgDailyMoney = capitalInvertido * avgDaily;

  // Para el porcentaje mensual, necesitamos el saldo inicial del último mes
  const lastMonth = mensual[mensual.length - 1];
  const pctMensualMoney = lastMonth ? lastMonth.saldoInicial * pctMensual : 0;

  // Para el porcentaje anual, usamos el capital invertido
  const pctAnualMoney = capitalInvertido * pctAnual;

  // Marcar que ya se animó en este ciclo de vida (solo en primer render)
  useEffect(() => {
    if (shouldAnimate) onAnimated?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kpis = [
    {
      title: "Capital invertido",
      value: formatMoney(capitalInvertido),
      subtitle: formatMoneyFull(capitalInvertido),
      logic: "Suma de todos los aportes realizados.",
      animateValue: capitalInvertido,
      format: (n: number) => formatMoney(n),
    },
    {
      title: "Último aporte",
      value: ultimoAporte ? formatMoney(ultimoAporte.amount) : "-",
      subtitle: ultimoAporte
        ? new Date(ultimoAporte.date).toLocaleDateString()
        : undefined,
      logic: "Monto y fecha del último aporte registrado.",
      animateValue: ultimoAporte ? ultimoAporte.amount : undefined,
      format: (n: number) => formatMoney(n),
    },
    {
      title: "Rendimiento (Últ. mes)",
      value: formatMoney(rendimientoUltMes),
      logic: "Rendimiento generado en el último mes calendario.",
      animateValue: rendimientoUltMes,
      format: (n: number) => formatMoney(n),
    },
    {
      title: "Rendimiento total acum.",
      value: formatMoney(rendimientoTotalAcum),
      logic: "Suma de todos los rendimientos generados hasta la fecha.",
      animateValue: rendimientoTotalAcum,
      format: (n: number) => formatMoney(n),
    },
    {
      title: "Saldo final (bruto)",
      value: formatMoney(saldoFinal),
      subtitle: formatMoneyFull(saldoFinal),
      logic: "Saldo final antes de impuestos y comisiones.",
      animateValue: saldoFinal,
      format: (n: number) => formatMoney(n),
    },
    {
      title: "Prom. rentab. diaria",
      value: (avgDaily * 100).toFixed(3) + "%",
      subtitle: formatMoney(avgDailyMoney),
      logic: "Promedio de la rentabilidad diaria históricaa.",
      animateValue: avgDaily * 100,
      format: (n: number) => n.toFixed(3) + "%",
    },
    {
      title: "Prom. rentab. mensual",
      value: (pctMensual * 100).toFixed(2) + "%",
      subtitle: formatMoney(pctMensualMoney),
      logic: "Promedio de la rentabilidad mensual histórica.",
      animateValue: pctMensual * 100,
      format: (n: number) => n.toFixed(2) + "%",
    },
    {
      title: "Prom. rentab. anual",
      value: (pctAnual * 100).toFixed(2) + "%",
      subtitle: formatMoney(pctAnualMoney),
      logic: "Promedio de la rentabilidad anual histórica.",
      animateValue: pctAnual * 100,
      format: (n: number) => n.toFixed(2) + "%",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <KPI
            key={i}
            title={k.title}
            value={k.value}
            subtitle={k.subtitle}
            tooltipValue={(k as any).tooltipValue}
            logic={(k as any).logic}
            animateValue={shouldAnimate ? (k as any).animateValue : undefined}
            format={(k as any).format}
            durationMs={4000}
          />
        ))}
      </div>

      <MagicCard
        className="rounded-2xl"
        gradientColor="#f89320a9"
        gradientOpacity={0.6}
      >
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <LineChart className="h-4 w-4 text-yellow-400" />
            <h3 className="font-semibold text-white">Evolución del Saldo</h3>
          </div>
          <div className="h-72">
            {mensual.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400">
                <p className="text-lg font-medium">No hay datos</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RLineChart data={mensual}>
                  <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 12, fill: "#e2e8f0" }}
                  />
                  <YAxis
                    tickFormatter={(v) => (v as number).toLocaleString()}
                    width={80}
                    tick={{ fill: "#e2e8f0" }}
                  />
                  <Tooltip
                    formatter={(v: number) => formatMoney(v as number)}
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="saldoFinalNeto"
                    name="Saldo Final Neto"
                    dot={false}
                    stroke="#f89420"
                    strokeWidth={2}
                  />
                </RLineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </MagicCard>

      <MagicCard
        className="rounded-2xl"
        gradientColor="#264e72"
        gradientOpacity={0.6}
      >
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            <h3 className="font-semibold text-white">
              Aportes vs Rendimientos
            </h3>
          </div>
          <div className="h-72">
            {mensual.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400">
                <p className="text-lg font-medium">No hay datos</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RBarChart data={mensual}>
                  <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 12, fill: "#e2e8f0" }}
                  />
                  <YAxis
                    tickFormatter={(v) => (v as number).toLocaleString()}
                    width={80}
                    tick={{ fill: "#e2e8f0" }}
                  />
                  <Tooltip
                    formatter={(v: number) => formatMoney(v as number)}
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Legend />
                  <Bar dataKey="aportes" name="Aportes" fill="#f89420" />
                  <Bar
                    dataKey="rendimientos"
                    name="Rendimientos (interés)"
                    fill="#3677afff"
                  />
                </RBarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </MagicCard>
    </div>
  );
}

function RowEditor({
  row,
  onChange,
  onDelete,
  funds,
}: {
  row: Movement;
  onChange: (r: Movement) => void;
  onDelete: () => void;
  funds: Fund[];
}) {
  const fundOptions = funds.map((f) => ({
    value: f.id,
    label: f.name,
    iconSrc: resolveFundIconSrc(f),
  }));
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleDelete = () => {
    onDelete();
    setIsConfirmOpen(false);
  };

  return (
    <tr className="mb-4 block overflow-hidden rounded-lg border-b border-slate-700 bg-slate-800/20 md:mb-0 md:table-row md:rounded-none md:bg-transparent">
      <td className="flex items-center justify-between gap-2 p-2 md:table-cell">
        <span className="w-32 text-sm font-bold text-slate-400 md:hidden">
          Fecha
        </span>
        <CustomInput
            type="date"
            value={row.date}
            onChange={(e) => onChange({ ...row, date: e.target.value })}
            className="flex-1 min-w-[8rem]"
            placeholder="yyyy-mm-dd"
          />
      </td>
      <td className="flex items-center justify-between gap-2 p-2 md:table-cell">
        <span className="w-32 text-sm font-bold text-slate-400 md:hidden">
          Concepto
        </span>
        <CustomInput
          value={row.concept}
          onChange={(e) => onChange({ ...row, concept: e.target.value })}
          placeholder="Concepto"
          className="flex-1"
        />
      </td>
      <td className="flex items-center justify-between gap-2 p-2 md:table-cell">
        <span className="w-32 text-sm font-bold text-slate-400 md:hidden">
          Mov. en Cuotas
        </span>
        <CustomInput
          type="number"
          step="0.000001"
          value={row.shares}
          onChange={(e) => onChange({ ...row, shares: Number(e.target.value) })}
          className="flex-1"
        />
      </td>
      <td className="flex items-center justify-between gap-2 p-2 md:table-cell">
        <span className="w-32 text-sm font-bold text-slate-400 md:hidden">
          Mov. en $
        </span>
        <CustomInput
          type="number"
          step="0.01"
          value={row.amount}
          onChange={(e) => onChange({ ...row, amount: Number(e.target.value) })}
          className="flex-1"
          min="-999999999"
        />
      </td>
      <td className="flex items-center justify-between gap-2 p-2 md:table-cell">
        <span className="w-32 text-sm font-bold text-slate-400 md:hidden">
          Valor de Cuota
        </span>
        <CustomInput
          type="number"
          step="0.000001"
          value={row.nav}
          onChange={(e) => onChange({ ...row, nav: Number(e.target.value) })}
          className="flex-1"
        />
      </td>
      <td className="flex items-center justify-between gap-2 p-2 md:table-cell">
        <span className="w-32 text-sm font-bold text-slate-400 md:hidden">
          Rentab. período (%)
        </span>
        <CustomInput
          type="number"
          step="0.01"
          value={row.periodReturnPct ?? 0}
          onChange={(e) =>
            onChange({ ...row, periodReturnPct: Number(e.target.value) })
          }
          className="flex-1"
        />
      </td>
      <td className="flex items-center justify-between gap-2 p-2 md:table-cell">
        <span className="w-32 text-sm font-bold text-slate-400 md:hidden">
          Rentab. anual (%)
        </span>
        <CustomInput
          type="number"
          step="0.01"
          value={row.annualReturnPct ?? 0}
          onChange={(e) =>
            onChange({ ...row, annualReturnPct: Number(e.target.value) })
          }
          className="flex-1"
        />
      </td>
      <td className="flex items-center justify-between gap-2 p-2 md:table-cell">
        <span className="w-[5.4rem] text-sm font-bold text-slate-400 md:hidden">
          Fondo
        </span>
        <CustomSelect
          value={row.fundId}
          options={fundOptions}
          onValueChange={(v) => onChange({ ...row, fundId: v })}
          className="flex-1"
        />
      </td>
      <td className="flex justify-end p-2 md:table-cell">
        <ConfirmDialog
          open={isConfirmOpen}
          onOpenChange={setIsConfirmOpen}
          onConfirm={handleDelete}
          title="¿Estas seguro?"
          description="Esta acción no se puede deshacer. Esto se eliminará permanentemente el movimiento."
        >
          <button
            onClick={() => setIsConfirmOpen(true)}
            className="flex flex-shrink-0 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </ConfirmDialog>
      </td>
    </tr>
  );
}

function DataPage({
  rows,
  currentFundId,
  funds,
  onAddRow,
  onUpdateRow,
  onDeleteRow,
}: {
  rows: Movement[];
  currentFundId: string;
  funds: Fund[];
  onAddRow: (m: Movement) => void;
  onUpdateRow: (m: Movement) => void;
  onDeleteRow: (id: string) => void;
}) {
  // Filtros
  const [fundFilter, setFundFilter] = useState<string>(currentFundId || "all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const passesFund = fundFilter === "all" || r.fundId === fundFilter;
      const t = deriveType(r.concept);
      const passesType = typeFilter === "all" || t === typeFilter;
      const s = search.trim().toLowerCase();
      const passesSearch = !s || (r.concept || "").toLowerCase().includes(s);
      const d = parseISO(r.date);
      const passesFrom = !dateFrom || parseISO(dateFrom) <= d;
      const passesTo = !dateTo || d <= parseISO(dateTo);
      return passesFund && passesType && passesSearch && passesFrom && passesTo;
    });
  }, [rows, fundFilter, typeFilter, search, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const fundOptions = [
    { value: "all", label: "Todos" },
    ...funds.map((f) => ({
      value: f.id,
      label: f.name,
      iconSrc: resolveFundIconSrc(f),
    })),
  ];

  const typeOptions = [
    { value: "all", label: "Todos" },
    { value: "Aporte", label: "Aporte" },
    { value: "Rescate", label: "Rescate" },
    { value: "Rendimiento", label: "Rendimiento" },
    { value: "Saldo Anterior", label: "Saldo Anterior" },
    { value: "Saldo Final", label: "Saldo Final" },
    { value: "Otro", label: "Otro" },
  ];

  const addRow = () => {
    const targetFundId = fundFilter === "all" ? currentFundId : fundFilter;
    const newRow: Movement = {
      id: uuid(),
      fundId: targetFundId,
      date: new Date().toISOString().slice(0, 10),
      concept: "",
      shares: 0,
      amount: 0,
      nav: 0,
      periodReturnPct: undefined,
      annualReturnPct: undefined,
    };
    onAddRow(newRow);
  };
  const updateRow = (id: string, next: Movement) => onUpdateRow(next);
  const deleteRow = (id: string) => onDeleteRow(id);

  return (
    <div className="space-y-4">
      {/* Barra de filtros */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1">
            <CustomSelect
              label="Fondo"
              value={fundFilter}
              options={fundOptions}
              onValueChange={setFundFilter}
            />
          </div>
          <div className="space-y-1">
            <CustomSelect
              label="Tipo"
              value={typeFilter}
              options={typeOptions}
              onValueChange={setTypeFilter}
            />
          </div>
          <div className="space-y-1">
            <CustomInput
              label="Desde"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full min-w-[8rem]"
              placeholder="yyyy-mm-dd"
            />
          </div>
          <div className="space-y-1">
            <CustomInput
              label="Hasta"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full min-w-[8rem]"
              placeholder="yyyy-mm-dd"
            />
          </div>
          <div className="space-y-1">
            <CustomInput
              label="Buscar"
              placeholder="Concepto"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="custom-scrollbar max-h-96 overflow-y-auto rounded-lg border border-slate-700 bg-slate-900/50 p-4">
        <table className="w-full">
          <thead>
            <tr className="hidden md:table-row">
              <th className="p-2 text-left text-slate-300">Fecha</th>
              <th className="p-2 text-left text-slate-300">Concepto</th>
              <th className="p-2 text-left text-slate-300">Mov. en Cuotas</th>
              <th className="p-2 text-left text-slate-300">Mov. en $</th>
              <th className="p-2 text-left text-slate-300">Valor de Cuota</th>
              <th className="p-2 text-left text-slate-300">
                Rentab. período (%)
              </th>
              <th className="p-2 text-left text-slate-300">
                Rentab. anual (%)
              </th>
              <th className="p-2 text-left text-slate-300">Fondo</th>
              <th className="p-2 text-left text-slate-300"></th>
            </tr>
          </thead>
          <tbody className="block space-y-4 md:table-row-group md:space-y-0">
            {paginatedRows.length === 0 ? (
              <tr className="block md:table-row">
                <td
                  colSpan={9}
                  className="flex h-32 items-center justify-center text-slate-400"
                >
                  <p className="text-lg font-medium">No hay datos</p>
                </td>
              </tr>
            ) : (
              paginatedRows.map((r) => (
                <RowEditor
                  key={r.id}
                  row={r}
                  onChange={(nr) => updateRow(r.id, nr)}
                  onDelete={() => deleteRow(r.id)}
                  funds={funds}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="rounded-full bg-slate-700 px-4 py-2 font-medium text-slate-200 shadow-md transition-colors duration-200 hover:bg-slate-600 disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="rounded-full bg-slate-800 px-4 py-2 font-medium text-slate-300">
          {currentPage} / {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="rounded-full bg-slate-700 px-4 py-2 font-medium text-slate-200 shadow-md transition-colors duration-200 hover:bg-slate-600 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
      <div className="flex justify-center pt-2 md:justify-start">
        <button
          onClick={addRow}
          className="flex items-center gap-2 rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-800 transition-colors duration-200 hover:bg-slate-300"
        >
          <Plus className="h-4 w-4" />
          <span>Agregar reporte al fondo actual</span>
        </button>
      </div>
    </div>
  );
}

// Eliminado: ConfiguraciÃ³n del fondo (ya no se usa)

export default function App() {
  const {
    funds,
    movements,
    loading,
    error,
    createFund,
    deleteFund,
    createMovement,
    updateMovement,
    deleteMovement,
    clearError,
    reload,
  } = useDatabase();

  const [currentFundId, setCurrentFundId] = useState<string>("");
  const [showAddFundDialog, setShowAddFundDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Fund | null>(null);
  const [infoTarget, setInfoTarget] = useState<Fund | null>(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const userName = useMemo(
    () => localStorage.getItem("userName") || "Fajardo",
    [],
  );
  const userAvatarUrl = useMemo(() => {
    const custom = localStorage.getItem("userAvatarUrl");
    if (custom && custom.trim()) return custom;
    // Fallback avatar local
    return "/avatars/fajardo.jpeg";
  }, [userName]);
  // Splash mínimo para que el loading permanezca visible unos segundos
  const [splashDone, setSplashDone] = useState(false);
  const [hasAnimatedOnce, setHasAnimatedOnce] = useState(false);
  const [startKpiAnimation, setStartKpiAnimation] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 2200); // ~2.2s
    return () => clearTimeout(t);
  }, []);

  // Iniciar animación de KPIs justo después de finalizar el loading y el splash
  useEffect(() => {
    if (!loading && splashDone) {
      const t = setTimeout(() => setStartKpiAnimation(true), 200);
      return () => clearTimeout(t);
    } else {
      setStartKpiAnimation(false);
    }
  }, [loading, splashDone]);

  // Establecer el fondo actual cuando se cargan los datos
  useEffect(() => {
    if (funds.length > 0 && !currentFundId) {
      setCurrentFundId(funds[0].id);
    }
  }, [funds, currentFundId]);

  const currentFund = funds.find((f) => f.id === currentFundId) || funds[0];
  const rowsOfFund = movements.filter((m) => m.fundId === currentFund?.id);

  // DuraciÃ³n del fondo (desde el primer movimiento registrado hasta hoy)
  const fundStartISO = rowsOfFund.length
    ? rowsOfFund.reduce(
        (min, m) => (m.date < min ? m.date : min),
        rowsOfFund[0].date,
      )
    : undefined;
  const fundDurationText = fundStartISO
    ? formatDurationSince(fundStartISO)
    : "Sin datos";

  // Persistimos directamente en base de datos vÃ­a useDatabase

  // Abrir selector de presets para crear fondo
  const addFund = () => {
    setShowAddFundDialog(true);
  };

  // Utilidad para obtener la key de preset (reutiliza util compartido)
  const getPresetKeyFromFund = (f: Fund): string | undefined =>
    getFundPresetKeyFromFund(f);

  const createFundFromPreset = async (key: string) => {
    const preset = FUND_PRESETS.find((p) => p.key === key);
    if (!preset) return;
    const nf: Fund = {
      id: uuid(),
      name: preset.name,
      adminFeePct: preset.adminFeePct,
      logoDataUrl: `icon:${preset.icon}|preset:${preset.key}`,
    };
    await createFund(nf);
    setCurrentFundId(nf.id);
    setShowAddFundDialog(false);
  };

  const handleDeleteFund = async (fund: Fund) => {
    if (!fund) return;
    if (funds.length === 1) {
      alert("Debe existir al menos un fondo");
      setDeleteTarget(null);
      return;
    }
    const remaining = funds.filter((f) => f.id !== fund.id);
    await deleteFund(fund.id);
    if (currentFundId === fund.id) {
      setCurrentFundId(remaining[0]?.id || "");
    }
    setDeleteTarget(null);
  };

  const handleLogout = () => {
    // SimulaciÃ³n de logout: no borra datos ni recarga
    setLogoutConfirmOpen(false);
    try {
      // Marca opcional para UI
      localStorage.setItem("lastLogoutAt", new Date().toISOString());
    } catch {}
    toast.success("Sesion cerrada (simulacion)");
  };

  // Eliminadas funciones de actualizacion/eliminacion del fondo (la seccion de configuracion fue removida)

  if (loading || !splashDone) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        <div className="flex flex-col items-center gap-6">
          <img
            src="/afi-reservas.png"
            alt="AFI Reservas"
            className="h-16 w-auto animate-pulse object-contain md:h-20"
          />
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3677afff] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        <div className="text-xl text-red-400">Error: {error}</div>
        <button
          onClick={clearError}
          className="ml-4 rounded bg-red-600 px-4 py-2 text-white"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Header fijo siempre visible */}
      <header className="fixed inset-x-0 top-0 z-40  bg-slate-900/70 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 h-20 md:h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/afi-reservas.png"
              alt="AFI Reservas"
              className="h-14 w-auto object-contain md:h-20"
            />
          </div>
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-slate-200 hover:bg-slate-700">
                  {avatarError ? (
                    <User className="w-7 h-7 rounded-full bg-slate-600 p-1" />
                  ) : (
                    <img
                      src={userAvatarUrl}
                      alt={userName}
                      className="w-7 h-7 rounded-full object-fill border border-slate-600"
                      onError={() => setAvatarError(true)}
                    />
                  )}
                  <span className="hidden md:inline max-w-[160px] truncate">{userName}</span>
                  <ChevronDown className="w-4 h-4 opacity-70" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="bottom"
                align="end"
                className="w-56 border-slate-700 bg-slate-900 p-1"
              >
                <button
                  onClick={() => setShowUserInfo(true)}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-slate-200 hover:bg-slate-800"
                >
                  <Info className="h-4 w-4" />
                  <span>Info</span>
                </button>
                <ConfirmDialog
                  open={logoutConfirmOpen}
                  onOpenChange={setLogoutConfirmOpen}
                  onConfirm={handleLogout}
                  title="Cerrar sesión"
                  description="Es una simulación de cierre de sesión."
                  confirmText="Cerrar sesión"
                >
                  <button
                    onClick={() => setLogoutConfirmOpen(true)}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-red-500 hover:bg-slate-800"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar sesion</span>
                  </button>
                </ConfirmDialog>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>
      <div className="mx-auto min-h-screen max-w-7xl space-y-6 p-6 pt-24 md:pt-28 justify-between flex flex-col flex-1">
        <div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between space-y-6 py-6">
            <div className="grid items-center gap-2">
              <CustomSelect
                label="Fondo activo:"
                value={currentFund?.id}
                options={funds.map((f) => ({
                  value: f.id,
                  label: f.name,
                  iconSrc: resolveFundIconSrc(f),
                }))}
                onValueChange={setCurrentFundId}
              />
            </div>
            <div className="text-sm text-slate-400">
              Comisión anual:{" "}
              <span className="font-medium text-[#3c84c2ff]">
                {currentFund?.adminFeePct ?? 0}%
              </span>
              <div className="mt-1 text-xs text-slate-500">
                Tiempo del fondo: {fundDurationText}
              </div>
            </div>
          </div>
        

          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="border-slate-600 bg-slate-800">
              <TabsTrigger value="dashboard">
                <span className="flex items-center gap-2">
                  <LineChart className="h-4 w-4" />
                  <span>Dashboard</span>
                </span>
              </TabsTrigger>
              <TabsTrigger value="data">
                <span className="flex items-center gap-2">
                  <Table className="h-4 w-4" />
                  <span>Datos</span>
                </span>
              </TabsTrigger>
              <TabsTrigger value="import">
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Importar</span>
                </span>
              </TabsTrigger>
              <TabsTrigger value="settings">
                <span className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <span>Fondos</span>
                </span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard" className="mt-4">
              <Dashboard rows={rowsOfFund} shouldAnimate={startKpiAnimation && !hasAnimatedOnce} onAnimated={() => setHasAnimatedOnce(true)} />
            </TabsContent>
            <TabsContent value="data" className="mt-4">
              <DataPage
                rows={movements}
                currentFundId={currentFund?.id || ""}
                funds={funds}
                onAddRow={createMovement}
                onUpdateRow={updateMovement}
                onDeleteRow={deleteMovement}
              />
            </TabsContent>
            <TabsContent value="import" className="mt-4">
              {currentFund && (
                <ImportAccountStatements
                  currentFund={currentFund}
                  onImportComplete={() => reload()}
                />
              )}
            </TabsContent>
            <TabsContent value="settings" className="mt-4">
              <div className="mb-4 rounded-xl border border-slate-700 bg-slate-800/40">
                <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
                  <h3 className="font-semibold text-slate-200">
                    Mis Fondos de inversión
                  </h3>
                  <button
                    onClick={addFund}
                    className="rounded-md bg-slate-200 px-3 py-1.5 text-sm text-slate-900 hover:bg-white"
                  >
                    Agregar fondo
                  </button>
                </div>
                <ul className="divide-y divide-slate-700">
                  {funds.map((f) => {
                    const iconSrc = resolveFundIconSrc(f);
                    const isActive = f.id === currentFundId;
                    return (
                      <li
                        key={f.id}
                        className={`flex items-center justify-between px-4 py-3 ${isActive ? "bg-slate-800/60" : ""}`}
                      >
                        <button
                          onClick={() => setCurrentFundId(f.id)}
                          className="flex items-center gap-3 text-left"
                        >
                          <div className="rounded-md border border-slate-700 bg-slate-900/60 p-2 text-[#3677afff]">
                            <FundIcon src={iconSrc} size={22} />
                          </div>
                          <div>
                            <div className="font-medium text-slate-100">
                              {f.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              Comisión anual {f.adminFeePct}%
                            </div>
                          </div>
                        </button>
                        <div className="flex items-center gap-2">
                          {isActive && (
                            <span
                              title="Activo"
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-green-300"
                            >
                              <Check className="h-4 w-4" />
                            </span>
                          )}
                          <button
                            title="Información del fondo"
                            onClick={() => setInfoTarget(f)}
                            className="flex items-center justify-center rounded-lg p-2 text-[#3c84c2ff] transition-all duration-200 hover:text-sky-200"
                          >
                            <Info className="h-4 w-4" />
                          </button>
                          <ConfirmDialog
                            open={deleteTarget?.id === f.id}
                            onOpenChange={(open) =>
                              setDeleteTarget(open ? f : null)
                            }
                            onConfirm={() => handleDeleteFund(f)}
                            title="Eliminar fondo"
                            description={`¿Seguro que deseas eliminar "${f.name}"? Esta acción no se puede deshacer.`}
                          >
                            <button
                              title="Eliminar fondo"
                              className="flex items-center justify-center rounded-lg p-2 text-red-500 transition-all duration-200 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </ConfirmDialog>
                        </div>
                      </li>
                    );
                  })}
                  {funds.length === 0 && (
                    <li className="px-4 py-6 text-center text-slate-400">
                      Aún no tienes fondos. Agrega uno para comenzar.
                    </li>
                  )}
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Footer corporativo */}
        <footer className="mt-10">
          <div className="mx-6 border-t border-slate-600"></div>
          <div className="mt-[1px] rounded-t-[2px] px-6 py-6 text-slate-200">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src="/afi-reservas.png"
                  alt="AFI Reservas"
                  className="h-14 w-auto object-contain"
                />
                <a
                  href="https://certificaciones.uaf.gob.do/certificaciones_so_view.php?editid1=262"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/certification/certification.png"
                    alt="Certificación"
                    className="h-14 w-auto object-contain hidden"
                  />
                </a>
              </div>
              <div className="flex flex-col items-start gap-2 md:items-end">
                <div className="flex items-center gap-4 text-sm">
                  <a
                    href="https://cdneafireservaspeastus.azureedge.net/afireservas/media/35fi0rgd/pol%C3%ADtica-de-privacidadpagina-web.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Política de Privacidad
                  </a>
                  <span className="opacity-50">|</span>
                  <a
                    href="https://cdneafireservaspeastus.azureedge.net/afireservas/media/iwihcsvf/t%C3%A9rminos-y-condiciones-pagina-web.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Términos y Condiciones
                  </a>
                </div>
                <div className="text-xs opacity-90">
                  Copyright {new Date().getFullYear()} AFI Reservas. Todos los
                  derechos reservados.
                </div>
                <div className="mt-1 flex items-center gap-3">
                  <a
                    href="https://www.facebook.com/AFIReservas/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-slate-600 bg-slate-800/40 p-1.5 hover:bg-slate-700"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                  <a
                    href="http://www.instagram.com/AfiReservas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-slate-600 bg-slate-800/40 p-1.5 hover:bg-slate-700"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                  <a
                    href="https://twitter.com/i/flow/login?redirect_after_login=%2FAfiReservas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-slate-600 bg-slate-800/40 p-1.5 hover:bg-slate-700"
                  >
                    <img
                      src="/iconos/x.svg"
                      alt="X"
                      className="h-4 w-4 text-white"
                    />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/afireservas/posts/?feedView=all"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-slate-600 bg-slate-800/40 p-1.5 hover:bg-slate-700"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a
                    href="https://www.youtube.com/@AFIReservas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-slate-600 bg-slate-800/40 p-1.5 hover:bg-slate-700"
                  >
                    <Youtube className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* User Info Dialog */}
      {showUserInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 backdrop-blur-sm md:backdrop-blur-md"
            onClick={() => setShowUserInfo(false)}
          ></div>
          <div className="relative z-10 mx-4 w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-4">
            <div className="mb-3 flex items-center gap-3">
              <img
                src={userAvatarUrl}
                alt={userName}
                className="h-12 w-12 rounded-full border border-slate-700 object-cover"
              />
              <div>
                <div className="font-semibold text-slate-100">{userName}</div>
                <div className="text-xs text-slate-400">Perfil de usuario</div>
              </div>
            </div>
            <p className="text-sm text-slate-300">
              Este es un perfil de demostración. Puedes personalizarlo poniéndote
              en contacto con el desarrollador darlingf1998@gmail.com.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                className="rounded bg-slate-200 px-3 py-1.5 text-slate-900 hover:bg-white"
                onClick={() => setShowUserInfo(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DiÃ¡logo para seleccionar fondo predefinido */}
      {showAddFundDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 backdrop-blur-sm md:backdrop-blur-md"
            onClick={() => setShowAddFundDialog(false)}
          ></div>
          <div className="relative z-10 mx-4 w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-100">
                Selecciona un prodcuto
              </h3>
              <button
                className="text-slate-400 hover:text-white"
                onClick={() => setShowAddFundDialog(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-slate-400">
              Elige entre los fondos de inversiones disponibles.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 overflow-auto max-h-[70vh]">
              {FUND_PRESETS.filter(
                (p) =>
                  !funds.some((f) => getFundPresetKeyFromFund(f) === p.key),
              ).map((p) => (
                <button
                  key={p.key}
                  onClick={() => createFundFromPreset(p.key)}
                  className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-left hover:bg-slate-800"
                >
                  <div className="rounded-md border border-slate-700 bg-slate-900/60 p-2 text-[#3677afff]">
                    <FundIcon src={p.icon} size={22} />
                  </div>
                  <div>
                    <div className="font-medium text-slate-100">{p.name}</div>
                    <div className="text-xs text-slate-400">
                      Comisión anual {p.adminFeePct}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {FUND_PRESETS.filter(
              (p) => !funds.some((f) => getFundPresetKeyFromFund(f) === p.key),
            ).length === 0 && (
              <div className="py-6 text-center text-slate-400">
                Ya agregaste todos los fondos predefinidos.
              </div>
            )}
          </div>
        </div>
      )}
      {/* Info del fondo */}
      <FundInfoDialog
        fund={infoTarget}
        open={!!infoTarget}
        onOpenChange={(o) => (!o ? setInfoTarget(null) : undefined)}
      />
    </div>
  );
}
