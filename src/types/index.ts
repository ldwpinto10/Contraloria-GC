export type TransactionType = 'cash_debit' | 'reimbursement' | 'vales';

export type CurrencyCode = 'USD' | 'HNL' | 'GTQ';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: { code: 'USD', symbol: '$', name: 'Dólar Estadounidense' },
  HNL: { code: 'HNL', symbol: 'L', name: 'Lempira Hondureño' },
  GTQ: { code: 'GTQ', symbol: 'Q', name: 'Quetzal Guatemalteco' },
};

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: Date;
}

export interface PettyCashFund {
  id: string;
  name: string;
  initialValue: number;
  transactions: Transaction[];
  createdAt: Date;
  currency: CurrencyCode;
}

export interface ReconciliationReport {
  id: string;
  reportName: string;
  initialFundValue: number;
  totalCashDebits: number;
  totalReimbursements: number;
  totalVales: number;
  totalExpectedExpenses: number;
  expectedCashOnHand: number;
  physicalCashCount: number;
  variance: number;
  currency: CurrencyCode;
  transactions: {
    id: string;
    type: TransactionType;
    description: string;
    amount: number;
  }[];
  timestamp: Date;
}

export interface ArqueoCardEntry {
  id: string;
  date: string;
  cierrePos: string;
  sistema: string;
}

export interface ArqueoCashEntry {
  id: string;
  date: string;
  ventaSd: string;
  entrega: string;
}

export interface KioskoEntry {
  id: string;
  date: string;
  facturado: string;
  reducciones: string;
  efectivo: string;
  tarjeta: string;
}

export type InventoryCategory = 'materia_prima' | 'quimicos';

export interface InventoryItem {
  id: string;
  category: InventoryCategory;
  product: string;
  unit: string;
  c1?: string;
  c2?: string;
  c3?: string;
  c4?: string;
  c5?: string;
  audited: string;
  system: string;
  price: string;
}

export interface InventoryDifferenceItem {
  id: string;
  product: string;
  unit: string;
  physical: string;
  entered: string;
  price: string;
  comments: string;
}

export interface DispatchOrder {
  id: string;
  orderNumber: string;
  channel: string;
  combo: string;
  quantity: string;
  time: string; // HH:MM:SS
  observations: string;
}

export interface PizzaIngredientFactor {
  name: string;
  factor: number;
  unit: string;
}

export interface PizzaEntry {
  id: string;
  product: string;
  quantity: string;
}

export interface PizzaRecipe {
  product: string;
  ingredients: PizzaIngredientFactor[];
}
