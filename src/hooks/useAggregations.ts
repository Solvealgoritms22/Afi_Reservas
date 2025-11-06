import { useMemo } from "react";
import type { Movement } from "@/types";

function monthKey(iso: string) {
  return iso?.slice(0, 7) || "";
}

function parseISO(d: string) {
  return new Date(d + (d.length === 10 ? "T00:00:00" : ""));
}

function deriveType(concept: string):
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

export function useAggregations(rows: Movement[]) {
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