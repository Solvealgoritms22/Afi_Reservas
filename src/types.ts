export type Fund = {
  id: string;
  name: string;
  adminFeePct: number;
  logoDataUrl?: string;
};

export type Movement = {
  id: string;
  fundId: string;
  date: string;
  concept: string;
  shares: number;
  amount: number;
  nav: number;
  type?: string; // Tipo de movimiento: 'deposit', 'withdrawal', 'return', etc.
  periodReturnPct?: number;
  annualReturnPct?: number;
};

export type DBShape = { 
  funds: Fund[]; 
  movements: Movement[]; 
};

// Tipos para importación de estados de cuenta
export interface AccountStatement {
  period: string; // "01 Octubre 2025 hasta 31 Octubre 2025"
  startDate: string; // "2025-10-01"
  endDate: string; // "2025-10-31"
  initialQuoteValue: number;
  finalQuoteValue: number;
  periodReturn: number; // Rentabilidad del período
  annualReturn: number; // Rentabilidad anual
  adminFee: number; // Comisión por administración
  movements: AccountMovement[];
}

export interface AccountMovement {
  date: string; // "2025-10-30"
  description: string; // "Saldo anterior", "Aportes inversionistas", etc.
  quotesMovement: number; // Movimiento en cuotas
  amountValue: number; // Valor en $
  quoteValue?: number; // Valor de cuota (si aplica)
  quotesBalance: number; // Saldo en cuotas
  amountBalance: number; // Saldo en $
}