import { AccountStatement, AccountMovement, Movement } from '../types';
import { v4 as uuid } from 'uuid';

// Datos de los estados de cuenta proporcionados
export const accountStatementsData: AccountStatement[] = [
  {
    period: "01 Octubre 2025 hasta 31 Octubre 2025",
    startDate: "2025-10-01",
    endDate: "2025-10-31",
    initialQuoteValue: 1840.166013,
    finalQuoteValue: 1851.905082,
    periodReturn: 7.77,
    annualReturn: 10.16,
    adminFee: 2.00,
    movements: [
      {
        date: "2025-10-30",
        description: "Saldo anterior",
        quotesMovement: 560.877307,
        amountValue: 1032107.41,
        quotesBalance: 560.877307,
        amountBalance: 1032107.41
      },
      {
        date: "2025-10-06",
        description: "Aportes inversionistas",
        quotesMovement: 54.279102,
        amountValue: 100000.00,
        quoteValue: 1842.329668,
        quotesBalance: 615.156409,
        amountBalance: 1139211.34
      },
      {
        date: "2025-10-31",
        description: "Rendimiento Bruto",
        quotesMovement: 0,
        amountValue: 7103.93,
        quotesBalance: 615.156409,
        amountBalance: 1139211.34
      }
    ]
  },

/* --- Integración con data.json ---
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

function deriveTypeFromConcept(concepto: string): string {
  const c = (concepto || '').toLowerCase();
  if (c.includes('aporte')) return 'deposit';
  if (c.includes('rescate')) return 'withdrawal';
  if (c.includes('rendimiento')) return 'return';
  if (c.includes('saldo anterior')) return 'opening_balance';
  if (c.includes('saldo final')) return 'closing_balance';
  return 'other';
}

async function fetchDataJson(url: string = '/data.json'): Promise<RawJsonEntry[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo cargar ${url}`);
  const data = await res.json();
  return data as RawJsonEntry[];
}

// Convierte data.json directamente a movimientos del fondo
export async function convertDataJsonToMovements(
  fundId: string,
  url: string = '/data.json'
): Promise<Movement[]> {
  const entries = await fetchDataJson(url);
  const movements: Movement[] = entries.map((e) => ({
    id: uuid(),
    fundId,
    date: e.fecha,
    concept: e.concepto,
    shares: typeof e.mov_en_cuotas === 'number' ? e.mov_en_cuotas : 0,
    amount: typeof e.monto_en_usd === 'number' ? e.monto_en_usd : 0,
    nav: typeof e.valor_cuota === 'number' ? e.valor_cuota : 0,
    type: deriveTypeFromConcept(e.concepto),
    periodReturnPct: typeof e.rentabilidad_periodo_pct === 'number' ? e.rentabilidad_periodo_pct : undefined,
    annualReturnPct: typeof e.rentabilidad_anual_pct === 'number' ? e.rentabilidad_anual_pct : undefined,
  }));
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
    const sorted = [...arr].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    const startDate = sorted[0]?.fecha ?? `${mes}-01`;
    const endDate = sorted[sorted.length - 1]?.fecha ?? `${mes}-28`;
    const saldoAnterior = sorted.find((x) => x.concepto.toLowerCase().includes('saldo anterior'));
    const saldoFinal = sorted.find((x) => x.concepto.toLowerCase().includes('saldo final'));
    const initialQuoteValue = typeof saldoAnterior?.valor_cuota === 'number' ? saldoAnterior!.valor_cuota : sorted[0]?.valor_cuota ?? 0;
    const finalQuoteValue = typeof saldoFinal?.valor_cuota === 'number' ? saldoFinal!.valor_cuota : sorted[sorted.length - 1]?.valor_cuota ?? 0;
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

// Devuelve las entradas crudas para cálculos simples (conteos por concepto)
export async function getRawJsonEntries(url: string = '/data.json'): Promise<RawJsonEntry[]> {
  return fetchDataJson(url);
}
*/
  
  {
    period: "01 Septiembre 2025 hasta 30 Septiembre 2025",
    startDate: "2025-09-01",
    endDate: "2025-09-30",
    initialQuoteValue: 1827.989104,
    finalQuoteValue: 1840.166013,
    periodReturn: 8.41,
    annualReturn: 10.53,
    adminFee: 2.00,
    movements: [
      {
        date: "2025-09-01",
        description: "Saldo anterior",
        quotesMovement: 560.877307,
        amountValue: 1025277.66,
        quotesBalance: 560.877307,
        amountBalance: 1025277.66
      },
      {
        date: "2025-09-30",
        description: "Rendimiento Bruto",
        quotesMovement: 0,
        amountValue: 6829.75,
        quotesBalance: 560.877307,
        amountBalance: 1032107.41
      }
    ]
  },
  {
    period: "01 Agosto 2025 hasta 31 Agosto 2025",
    startDate: "2025-08-01",
    endDate: "2025-08-31",
    initialQuoteValue: 1813.264383,
    finalQuoteValue: 1827.989104,
    periodReturn: 9.99,
    annualReturn: 10.71,
    adminFee: 2.00,
    movements: [
      {
        date: "2025-08-01",
        description: "Saldo anterior",
        quotesMovement: 560.877307,
        amountValue: 1017018.87,
        quotesBalance: 560.877307,
        amountBalance: 1017018.87
      },
      {
        date: "2025-08-31",
        description: "Rendimiento Bruto",
        quotesMovement: 0,
        amountValue: 8258.79,
        quotesBalance: 560.877307,
        amountBalance: 1025277.66
      }
    ]
  },
  {
    period: "01 Julio 2025 hasta 31 Julio 2025",
    startDate: "2025-07-01",
    endDate: "2025-07-31",
    initialQuoteValue: 1796.051677,
    finalQuoteValue: 1813.264383,
    periodReturn: 11.89,
    annualReturn: 10.78,
    adminFee: 2.00,
    movements: [
      {
        date: "2025-07-01",
        description: "Saldo anterior",
        quotesMovement: 560.877307,
        amountValue: 1007364.63,
        quotesBalance: 560.877307,
        amountBalance: 1007364.63
      },
      {
        date: "2025-07-31",
        description: "Rendimiento Bruto",
        quotesMovement: 0,
        amountValue: 9654.24,
        quotesBalance: 560.877307,
        amountBalance: 1017018.87
      }
    ]
  },
  {
    period: "01 Junio 2025 hasta 30 Junio 2025",
    startDate: "2025-06-01",
    endDate: "2025-06-30",
    initialQuoteValue: 1779.921507,
    finalQuoteValue: 1796.051677,
    periodReturn: 11.6,
    annualReturn: 10.82,
    adminFee: 2.00,
    movements: [
      {
        date: "2025-06-01",
        description: "Saldo anterior",
        quotesMovement: 510.401828,
        amountValue: 908475.18,
        quotesBalance: 510.401828,
        amountBalance: 908475.18
      },
      {
        date: "2025-06-06",
        description: "Aportes inversionistas",
        quotesMovement: 50.475478,
        amountValue: 90000.00,
        quoteValue: 1783.044006,
        quotesBalance: 560.877306,
        amountBalance: 1007364.63
      },
      {
        date: "2025-06-30",
        description: "Rendimiento Bruto",
        quotesMovement: 0,
        amountValue: 8889.45,
        quotesBalance: 560.877307,
        amountBalance: 1007364.63
      }
    ]
  }
];

// Función para convertir AccountMovement a Movement
export function convertAccountMovementToMovement(
  accountMovement: AccountMovement,
  fundId: string,
  accountStatement: AccountStatement
): Movement | null {
  const { date, description, quotesMovement, amountValue } = accountMovement;
  
  // Determinar el tipo de movimiento basado en la descripción
  let type: Movement['type'];
  let amount = Math.abs(amountValue);
  
  if (description.toLowerCase().includes('aporte')) {
    type = 'deposit';
  } else if (description.toLowerCase().includes('rescate')) {
    type = 'withdrawal';
  } else if (description.toLowerCase().includes('rendimiento')) {
    type = 'return';
  } else if (description.toLowerCase().includes('saldo anterior')) {
    // No crear movimiento para saldo anterior
    return null;
  } else if (description.toLowerCase().includes('saldo final')) {
    // No crear movimiento para saldo final
    return null;
  } else {
    // Otros tipos de movimientos
    type = quotesMovement > 0 ? 'deposit' : 'withdrawal';
  }

  return {
    id: uuid(),
    fundId,
    date,
    type,
    amount,
    concept: `${description} - ${accountStatement.period}`,
    shares: 0, // Valor por defecto
    nav: 0 // Valor por defecto
  };
}

// Función para convertir todos los estados de cuenta a movimientos
export function convertAccountStatementsToMovements(fundId: string): Movement[] {
  const movements: Movement[] = [];
  
  for (const statement of accountStatementsData) {
    for (const accountMovement of statement.movements) {
      const movement = convertAccountMovementToMovement(accountMovement, fundId, statement);
      if (movement) {
        movements.push(movement);
      }
    }
  }
  
  // Ordenar por fecha (más recientes primero)
  return movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Función para obtener resumen de rentabilidades por período
export function getPeriodReturns(): Array<{
  period: string;
  startDate: string;
  endDate: string;
  periodReturn: number;
  annualReturn: number;
  initialQuoteValue: number;
  finalQuoteValue: number;
}> {
  return accountStatementsData.map(statement => ({
    period: statement.period,
    startDate: statement.startDate,
    endDate: statement.endDate,
    periodReturn: statement.periodReturn,
    annualReturn: statement.annualReturn,
    initialQuoteValue: statement.initialQuoteValue,
    finalQuoteValue: statement.finalQuoteValue
  }));
}