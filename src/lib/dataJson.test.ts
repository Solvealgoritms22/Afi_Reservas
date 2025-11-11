import { describe, it, expect, vi, afterEach } from "vitest";
import {
  convertDataJsonToMovements,
  getPeriodReturnsFromJson,
  getRawJsonEntries,
  type RawJsonEntry,
} from "./dataJson";

const sample: RawJsonEntry[] = [
  {
    fecha: "2024-01-01",
    concepto: "Saldo Anterior",
    mov_en_cuotas: 0,
    monto_en_usd: 1000,
    valor_cuota: 10,
    mes: "2024-01",
  },
  {
    fecha: "2024-01-10",
    concepto: "Aporte",
    mov_en_cuotas: 50,
    monto_en_usd: 500,
    valor_cuota: 10,
    mes: "2024-01",
  },
  {
    fecha: "2024-01-20",
    concepto: "Rendimiento",
    mov_en_cuotas: 0,
    monto_en_usd: 80,
    valor_cuota: 10.5,
    rentabilidad_periodo_pct: 0.8,
    rentabilidad_anual_pct: 12.0,
    mes: "2024-01",
  },
  {
    fecha: "2024-01-31",
    concepto: "Saldo Final",
    mov_en_cuotas: 0,
    monto_en_usd: 1580,
    valor_cuota: 10.5,
    mes: "2024-01",
  },
  {
    fecha: "2024-02-01",
    concepto: "Saldo Anterior",
    mov_en_cuotas: 0,
    monto_en_usd: 1580,
    valor_cuota: 10.5,
    mes: "2024-02",
  },
  {
    fecha: "2024-02-15",
    concepto: "Rescate",
    mov_en_cuotas: 0,
    monto_en_usd: 100,
    valor_cuota: 10.6,
    mes: "2024-02",
  },
  {
    fecha: "2024-02-28",
    concepto: "Rendimiento",
    mov_en_cuotas: 0,
    monto_en_usd: 20,
    valor_cuota: 10.7,
    rentabilidad_periodo_pct: 0.2,
    rentabilidad_anual_pct: 9.0,
    mes: "2024-02",
  },
];

function mockFetchOk(data: RawJsonEntry[]) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => data,
  } as any);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("dataJson conversions", () => {
  it("convertDataJsonToMovements maps fields and sorts desc by date", async () => {
    mockFetchOk(sample);
    const fundId = "fund-1";
    const movements = await convertDataJsonToMovements(fundId);
    expect(movements.length).toBe(sample.length);
    // sorted desc
    for (let i = 1; i < movements.length; i++) {
      expect(new Date(movements[i - 1].date).getTime()).toBeGreaterThanOrEqual(
        new Date(movements[i].date).getTime(),
      );
    }
    // type mapping spot-check
    const aporte = movements.find((m) => m.concept.toLowerCase().includes("aporte"));
    const rescate = movements.find((m) => m.concept.toLowerCase().includes("rescate"));
    const rendimiento = movements.find((m) => m.concept.toLowerCase().includes("rendimiento"));
    expect(aporte?.type).toBe("deposit");
    expect(rescate?.type).toBe("withdrawal");
    expect(rendimiento?.type).toBe("return");
  });

  it("getPeriodReturnsFromJson groups by month and derives values", async () => {
    mockFetchOk(sample);
    const periods = await getPeriodReturnsFromJson();
    expect(periods.length).toBe(2);
    const jan = periods.find((p) => p.period === "2024-01")!;
    const feb = periods.find((p) => p.period === "2024-02")!;
    expect(jan.initialQuoteValue).toBe(10);
    expect(jan.finalQuoteValue).toBe(10.5);
    expect(jan.periodReturn).toBe(0.8);
    expect(jan.annualReturn).toBe(12.0);
    expect(feb.initialQuoteValue).toBe(10.5);
    expect(feb.finalQuoteValue).toBe(10.7);
    expect(feb.periodReturn).toBe(0.2);
    expect(feb.annualReturn).toBe(9.0);
  });

  it("getRawJsonEntries returns raw entries via fetch", async () => {
    mockFetchOk(sample);
    const rows = await getRawJsonEntries();
    expect(rows).toEqual(sample);
  });
});