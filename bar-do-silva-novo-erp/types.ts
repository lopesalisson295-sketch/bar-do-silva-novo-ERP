export type TransactionType = 'INCOME' | 'EXPENSE';

export type TransactionCategory = 
  | 'BAR_SALES' 
  | 'QUENTINHAS' 
  | 'SUPPLIER' 
  | 'FIXED_COST' 
  | 'DEBT_PAYMENT'
  | 'OTHER_INCOME'
  | 'OTHER_EXPENSE';

export interface Transaction {
  id: string;
  date: string; // ISO String
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  clientId?: string; // If related to a specific client debt
  supplierId?: string; // If related to a supplier
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  debt: number; // Positive number means they owe money
  lastPurchase: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  totalPurchased: number;
  lastDelivery: string;
  stockStatus: 'OK' | 'LOW'; // New field for stock alert
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minStock: number;
  unit: string; // 'un', 'cx', 'kg', 'l'
  price: number;
}

export interface KPIData {
  revenueToday: number;
  avgTicket: number;
  totalReceivable: number;
  netProfit: number;
}

export type ViewState = 'DASHBOARD' | 'CLIENTS' | 'SUPPLIERS' | 'INVENTORY' | 'CASHFLOW';