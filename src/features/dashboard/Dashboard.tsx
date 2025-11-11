import React, { useEffect } from "react";
import type { Movement } from "@/types";
import { KPI } from "./KPI";
import { useAggregations } from "@/hooks/useAggregations";
import { formatMoney, formatMoneyFull } from "@/lib/format";
import { MagicCard } from "@/components/ui/magic-card";
import { CardContent } from "@/components/ui/card";
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
import { LineChart, BarChart3 } from "lucide-react";

export default function Dashboard({ rows, shouldAnimate = false, onAnimated }: { rows: Movement[]; shouldAnimate?: boolean; onAnimated?: () => void }) {
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

  const avgDailyMoney = capitalInvertido * avgDaily;
  const lastMonth = mensual[mensual.length - 1];
  const pctMensualMoney = lastMonth ? lastMonth.saldoInicial * pctMensual : 0;
  const pctAnualMoney = capitalInvertido * pctAnual;

  useEffect(() => {
    if (shouldAnimate) onAnimated?.();
  }, [shouldAnimate, onAnimated]);

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