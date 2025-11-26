import { Client, Supplier, Transaction, InventoryItem } from "./types";

export const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Carlos "O Mestre"', phone: '(11) 99999-0001', debt: 150.50, lastPurchase: new Date().toISOString() },
  { id: '2', name: 'Dona Maria', phone: '(11) 99999-0002', debt: 0, lastPurchase: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', name: 'João da Obra', phone: '(11) 99999-0003', debt: 420.00, lastPurchase: new Date(Date.now() - 172800000).toISOString() }, 
  { id: '4', name: 'Fernanda Fitness', phone: '(11) 99999-0004', debt: 45.00, lastPurchase: new Date().toISOString() },
  { id: '5', name: 'Seu Zé (Sumido)', phone: '(11) 99999-0005', debt: 0, lastPurchase: '2023-01-15T10:00:00.000Z' }, 
];

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Distribuidora Imperial', category: 'Bebidas', totalPurchased: 15000, lastDelivery: '2023-10-25', stockStatus: 'OK' },
  { id: '2', name: 'Hortifruti Frescor', category: 'Alimentos', totalPurchased: 4500, lastDelivery: '2023-10-26', stockStatus: 'LOW' },
  { id: '3', name: 'Adega Central', category: 'Destilados', totalPurchased: 8200, lastDelivery: '2023-10-20', stockStatus: 'OK' },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Cerveja Heineken 600ml', quantity: 48, minStock: 24, unit: 'un', price: 18.00 },
  { id: '2', name: 'Cachaça 51', quantity: 5, minStock: 2, unit: 'un', price: 8.50 },
  { id: '3', name: 'Arroz Tipo 1', quantity: 10, minStock: 5, unit: 'kg', price: 5.00 },
  { id: '4', name: 'Coca-Cola 2L', quantity: 12, minStock: 12, unit: 'un', price: 12.00 },
  { id: '5', name: 'Carne Seca', quantity: 2.5, minStock: 5, unit: 'kg', price: 45.00 },
];

// Generate realistic transactions for the last 365 days (12 months)
const generateTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const now = new Date();
  
  // Generate 365 days of data
  for (let i = 0; i < 365; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString();

    // Randomize slight volatility for realism
    const volatility = Math.random() * 0.5 + 0.8; // 0.8 to 1.3 multiplier

    // Daily Income - Bar
    transactions.push({
      id: `inc-bar-${i}`,
      date: dateStr,
      type: 'INCOME',
      category: 'BAR_SALES',
      amount: (Math.floor(Math.random() * 500) + 200) * volatility,
      description: 'Vendas diárias Bar'
    });

    // Daily Income - Quentinhas (Less on weekends maybe? kept simple here)
    transactions.push({
      id: `inc-food-${i}`,
      date: dateStr,
      type: 'INCOME',
      category: 'QUENTINHAS',
      amount: (Math.floor(Math.random() * 800) + 300) * volatility,
      description: 'Vendas diárias Quentinhas'
    });

    // Random Expenses (Suppliers) - every 3-4 days
    if (i % 3 === 0) {
      transactions.push({
        id: `exp-sup-${i}`,
        date: dateStr,
        type: 'EXPENSE',
        category: 'SUPPLIER',
        amount: Math.floor(Math.random() * 800) + 200,
        description: 'Reposição Estoque',
        supplierId: '1'
      });
    }

    // Fixed Costs (Rent/Light) - once a month (approx day 5 of each month logic simulation)
    // Simple logic: if day of month is 5
    if (date.getDate() === 5) {
      transactions.push({
        id: `exp-fixed-${i}`,
        date: dateStr,
        type: 'EXPENSE',
        category: 'FIXED_COST',
        amount: 3200,
        description: 'Aluguel, Luz e Internet'
      });
    }
  }
  return transactions;
};

export const MOCK_TRANSACTIONS = generateTransactions();