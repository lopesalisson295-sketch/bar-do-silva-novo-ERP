import React, { createContext, useContext, useState } from 'react';
import { Client, Supplier, Transaction, InventoryItem } from '../types';
import { MOCK_CLIENTS, MOCK_SUPPLIERS, MOCK_TRANSACTIONS, MOCK_INVENTORY } from '../constants';

interface ERPContextType {
  clients: Client[];
  suppliers: Supplier[];
  transactions: Transaction[];
  inventory: InventoryItem[];
  
  // Transactions
  addTransaction: (t: Omit<Transaction, 'id' | 'date'>) => void;
  editTransaction: (id: string, t: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;

  // Clients
  addClient: (name: string, phone: string) => void;
  editClient: (id: string, data: Partial<Client>) => void;
  removeClient: (id: string) => void;
  updateClientDebt: (clientId: string, amount: number) => void;
  payDebt: (clientId: string, amount: number) => void;

  // Inventory
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  editInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  removeInventoryItem: (id: string) => void;
  updateInventoryQuantity: (itemId: string, newQuantity: number) => void;
  
  // Suppliers
  addSupplier: (name: string, category: string) => void;
  editSupplier: (id: string, data: Partial<Supplier>) => void;
  removeSupplier: (id: string) => void;
  addSupplierOrder: (supplierId: string, amount: number, description: string) => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);

  // --- Transactions ---
  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const editTransaction = (id: string, data: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  };

  const removeTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // --- Clients ---
  const addClient = (name: string, phone: string) => {
    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      phone,
      debt: 0,
      lastPurchase: new Date().toISOString()
    };
    setClients(prev => [newClient, ...prev]);
  };

  const editClient = (id: string, data: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const removeClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const updateClientDebt = (clientId: string, amount: number) => {
    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        return { ...c, debt: c.debt + amount, lastPurchase: new Date().toISOString() };
      }
      return c;
    }));

    addTransaction({
      type: 'INCOME',
      category: 'BAR_SALES',
      amount: amount,
      description: `Fiado - ${clients.find(c => c.id === clientId)?.name}`,
      clientId
    });
  };

  const payDebt = (clientId: string, amount: number) => {
    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        return { ...c, debt: Math.max(0, c.debt - amount) };
      }
      return c;
    }));

    addTransaction({
      type: 'INCOME',
      category: 'DEBT_PAYMENT',
      amount: amount,
      description: `Pagamento Dívida - ${clients.find(c => c.id === clientId)?.name}`,
      clientId
    });
  };

  // --- Inventory ---
  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9)
    };
    setInventory(prev => [newItem, ...prev]);
  };

  const editInventoryItem = (id: string, item: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, ...item } : i));
  };

  const removeInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
  };

  const updateInventoryQuantity = (itemId: string, newQuantity: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) return { ...item, quantity: newQuantity };
      return item;
    }));
  };

  // --- Supplier Logic ---
  const addSupplier = (name: string, category: string) => {
    const newSupplier: Supplier = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      category,
      totalPurchased: 0,
      lastDelivery: new Date().toISOString(),
      stockStatus: 'OK'
    };
    setSuppliers(prev => [newSupplier, ...prev]);
  };

  const editSupplier = (id: string, data: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const removeSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const addSupplierOrder = (supplierId: string, amount: number, description: string) => {
    addTransaction({
      type: 'EXPENSE',
      category: 'SUPPLIER',
      amount,
      description,
      supplierId
    });

    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          totalPurchased: s.totalPurchased + amount,
          lastDelivery: new Date().toISOString()
        };
      }
      return s;
    }));
  };

  return (
    <ERPContext.Provider value={{ 
      clients, suppliers, transactions, inventory,
      addTransaction, editTransaction, removeTransaction,
      updateClientDebt, payDebt, addClient, editClient, removeClient,
      addInventoryItem, editInventoryItem, removeInventoryItem, updateInventoryQuantity,
      addSupplier, editSupplier, removeSupplier, addSupplierOrder
    }}>
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};