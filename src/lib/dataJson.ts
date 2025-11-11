import { Movement } from '../types';
import { v4 as uuid } from 'uuid';

// Estructura de cada entrada en data.json
export interface RawJsonEntry {
  fecha: string;
  concepto: string;
  mov_en_cuotas: number;
  monto_en_usd: number;
  valor_cuota: number;
  rentabilidad_periodo_pct?: number;
  rentabilidad_anual_pct?: number;
  mes: string;
}

function deriveTypeFromConcept(concepto: string): Movement['type'] | 'opening_balance' | 'closing_balance' | 'other' {
  const c = (concepto || '').toLowerCase();
  if (c.includes('aporte')) return 'deposit';
  if (c.includes('rescate')) return 'withdrawal';
  if (c.includes('rendimiento')) return 'return';
  if (c.includes('saldo anterior')) return 'opening_balance';
  if (c.includes('saldo final')) return 'closing_balance';
  return 'other';
}

async function fetchDataJson(url: string = '/data.json'): Promise<RawJsonEntry[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No se pudo cargar ${url}`);
    const data = await res.json();
    return data as RawJsonEntry[];
  } catch (err) {
    // Fallback: importar el JSON estático desde el bundle
    const mod = await import('../../data.json');
    return (mod.default || mod) as RawJsonEntry[];
  }
}

// Convierte data.json directamente a movimientos del fondo
export async function convertDataJsonToMovements(
  fundId: string,
  url: string = '/data.json'
): Promise<Movement[]> {
  const entries = await fetchDataJson(url);
  const movements: Movement[] = entries.map((e) => {
    const type = deriveTypeFromConcept(e.concepto);
    return {
      id: uuid(),
      fundId,
      date: e.fecha,
      concept: e.concepto,
      shares: typeof e.mov_en_cuotas === 'number' ? e.mov_en_cuotas : 0,
      amount: typeof e.monto_en_usd === 'number' ? e.monto_en_usd : 0,
      nav: typeof e.valor_cuota === 'number' ? e.valor_cuota : 0,
      type,
      periodReturnPct:
        typeof e.rentabilidad_periodo_pct === 'number' ? e.rentabilidad_periodo_pct : undefined,
      annualReturnPct:
        typeof e.rentabilidad_anual_pct === 'number' ? e.rentabilidad_anual_pct : undefined,
    } as Movement;
  });

  return movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Obtiene resumen de períodos desde data.json
export async function getPeriodReturnsFromJson(
  url: string = '/data.json'
): Promise<
  Array<{
    period: string;
    startDate: string;
    endDate: string;
    periodReturn: number;
    annualReturn: number;
    initialQuoteValue: number;
    finalQuoteValue: number;
  }>
> {
  const entries = await fetchDataJson(url);
  const byMonth = new Map<string, RawJsonEntry[]>();
  for (const e of entries) {
    const arr = byMonth.get(e.mes) || [];
    arr.push(e);
    byMonth.set(e.mes, arr);
  }

  const result: Array<{
    period: string;
    startDate: string;
    endDate: string;
    periodReturn: number;
    annualReturn: number;
    initialQuoteValue: number;
    finalQuoteValue: number;
  }> = [];

  for (const [mes, arr] of byMonth) {
    const sorted = [...arr].sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );
    const startDate = sorted[0]?.fecha ?? `${mes}-01`;
    const endDate = sorted[sorted.length - 1]?.fecha ?? `${mes}-28`;
    const saldoAnterior = sorted.find((x) => x.concepto.toLowerCase().includes('saldo anterior'));
    const saldoFinal = sorted.find((x) => x.concepto.toLowerCase().includes('saldo final'));
    const initialQuoteValue =
      typeof saldoAnterior?.valor_cuota === 'number'
        ? saldoAnterior!.valor_cuota
        : sorted[0]?.valor_cuota ?? 0;
    const finalQuoteValue =
      typeof saldoFinal?.valor_cuota === 'number'
        ? saldoFinal!.valor_cuota
        : sorted[sorted.length - 1]?.valor_cuota ?? 0;
    const lastWithPeriod = [...sorted]
      .reverse()
      .find((x) => typeof x.rentabilidad_periodo_pct === 'number');
    const periodReturn = lastWithPeriod?.rentabilidad_periodo_pct ?? 0;
    const lastWithAnnual = [...sorted]
      .reverse()
      .find((x) => typeof x.rentabilidad_anual_pct === 'number');
    const annualReturn = lastWithAnnual?.rentabilidad_anual_pct ?? 0;

    result.push({
      period: mes,
      startDate,
      endDate,
      periodReturn,
      annualReturn,
      initialQuoteValue,
      finalQuoteValue,
    });
  }

  return result.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}

// Devuelve las entradas crudas para cálculos simples (conteos por concepto)
export async function getRawJsonEntries(url: string = '/data.json'): Promise<RawJsonEntry[]> {
  return fetchDataJson(url);
}

// --- Nuevos helpers para flujo de subida de archivo ---
// Parsea texto JSON a RawJsonEntry[] con validaciones mínimas
export function parseRawJsonEntriesFromText(text: string): RawJsonEntry[] {
  const data = JSON.parse(text);
  if (!Array.isArray(data)) throw new Error('El archivo JSON debe contener un arreglo de entradas');
  return data.map((e: any) => ({
    fecha: String(e.fecha),
    concepto: String(e.concepto),
    mov_en_cuotas: Number(e.mov_en_cuotas ?? 0),
    monto_en_usd: Number(e.monto_en_usd ?? 0),
    valor_cuota: Number(e.valor_cuota ?? 0),
    rentabilidad_periodo_pct:
      e.rentabilidad_periodo_pct !== undefined ? Number(e.rentabilidad_periodo_pct) : undefined,
    rentabilidad_anual_pct:
      e.rentabilidad_anual_pct !== undefined ? Number(e.rentabilidad_anual_pct) : undefined,
    mes: String(e.mes ?? ''),
  })) as RawJsonEntry[];
}

// Convierte entradas crudas a movimientos (sin fetch)
export function convertRawEntriesToMovements(
  fundId: string,
  entries: RawJsonEntry[]
): Movement[] {
  const movements: Movement[] = entries.map((e) => {
    const type = deriveTypeFromConcept(e.concepto);
    return {
      id: uuid(),
      fundId,
      date: e.fecha,
      concept: e.concepto,
      shares: typeof e.mov_en_cuotas === 'number' ? e.mov_en_cuotas : 0,
      amount: typeof e.monto_en_usd === 'number' ? e.monto_en_usd : 0,
      nav: typeof e.valor_cuota === 'number' ? e.valor_cuota : 0,
      type,
      periodReturnPct:
        typeof e.rentabilidad_periodo_pct === 'number' ? e.rentabilidad_periodo_pct : undefined,
      annualReturnPct:
        typeof e.rentabilidad_anual_pct === 'number' ? e.rentabilidad_anual_pct : undefined,
    } as Movement;
  });
  return movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Obtiene resumen de períodos desde entradas ya cargadas (sin fetch)
export function getPeriodReturnsFromEntries(
  entries: RawJsonEntry[]
): Array<{
  period: string;
  startDate: string;
  endDate: string;
  periodReturn: number;
  annualReturn: number;
  initialQuoteValue: number;
  finalQuoteValue: number;
}> {
  const byMonth = new Map<string, RawJsonEntry[]>();
  for (const e of entries) {
    const arr = byMonth.get(e.mes) || [];
    arr.push(e);
    byMonth.set(e.mes, arr);
  }

  const result: Array<{
    period: string;
    startDate: string;
    endDate: string;
    periodReturn: number;
    annualReturn: number;
    initialQuoteValue: number;
    finalQuoteValue: number;
  }> = [];

  for (const [mes, arr] of byMonth) {
    const sorted = [...arr].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    const startDate = sorted[0]?.fecha ?? `${mes}-01`;
    const endDate = sorted[sorted.length - 1]?.fecha ?? `${mes}-28`;
    const saldoAnterior = sorted.find((x) => (x.concepto || '').toLowerCase().includes('saldo anterior'));
    const saldoFinal = sorted.find((x) => (x.concepto || '').toLowerCase().includes('saldo final'));
    const initialQuoteValue =
      typeof saldoAnterior?.valor_cuota === 'number' ? saldoAnterior!.valor_cuota : sorted[0]?.valor_cuota ?? 0;
    const finalQuoteValue =
      typeof saldoFinal?.valor_cuota === 'number' ? saldoFinal!.valor_cuota : sorted[sorted.length - 1]?.valor_cuota ?? 0;
    const lastWithPeriod = [...sorted].reverse().find((x) => typeof x.rentabilidad_periodo_pct === 'number');
    const periodReturn = lastWithPeriod?.rentabilidad_periodo_pct ?? 0;
    const lastWithAnnual = [...sorted].reverse().find((x) => typeof x.rentabilidad_anual_pct === 'number');
    const annualReturn = lastWithAnnual?.rentabilidad_anual_pct ?? 0;

    result.push({
      period: mes,
      startDate,
      endDate,
      periodReturn,
      annualReturn,
      initialQuoteValue,
      finalQuoteValue,
    });
  }

  return result.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}