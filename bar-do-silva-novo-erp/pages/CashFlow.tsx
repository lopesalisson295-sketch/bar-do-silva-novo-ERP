import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { PlusCircle, ArrowUpRight, ArrowDownLeft, X, Calendar, Filter, ArrowUpDown, Tag, Trash2, Pencil } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { TransactionCategory, TransactionType, Transaction } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const CashFlow: React.FC = () => {
  const { transactions, addTransaction, removeTransaction, editTransaction } = useERP();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // Form State
  const [type, setType] = useState<TransactionType>('INCOME');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('OTHER_INCOME');

  // Filter State
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [filterCategory, setFilterCategory] = useState<TransactionCategory | 'ALL'>('ALL');
  const [dateFilterMode, setDateFilterMode] = useState<'ALL' | 'MONTH' | 'DAY'>('MONTH');
  
  // Sort State
  const [sortConfig, setSortConfig] = useState<{ key: 'date' | 'amount', direction: 'desc' | 'asc' }>({ key: 'date', direction: 'desc' });

  // Default to current month/day
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD

  const filteredTransactions = transactions
    .filter(t => {
      // 1. Filter by Type
      if (filterType !== 'ALL' && t.type !== filterType) return false;
      // 2. Filter by Category
      if (filterCategory !== 'ALL' && t.category !== filterCategory) return false;
      // 3. Filter by Date
      if (dateFilterMode === 'MONTH') return t.date.startsWith(selectedMonth);
      if (dateFilterMode === 'DAY') return t.date.startsWith(selectedDay);
      return true;
    })
    .sort((a, b) => {
        let comparison = 0;
        if (sortConfig.key === 'date') comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        else comparison = a.amount - b.amount;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

  const viewTotals = filteredTransactions.reduce((acc, t) => {
    if (t.type === 'INCOME') acc.income += t.amount;
    else acc.expense += t.amount;
    return acc;
  }, { income: 0, expense: 0 });

  const balance = viewTotals.income - viewTotals.expense;

  const toggleSort = (key: 'date' | 'amount') => {
      setSortConfig(current => ({
          key,
          direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
      }));
  };

  const openModal = (transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setDescription(transaction.description);
      setCategory(transaction.category);
    } else {
      setEditingTransaction(null);
      setType('INCOME');
      setAmount('');
      setDescription('');
      setCategory('OTHER_INCOME');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(amount && description) {
        if (editingTransaction) {
            editTransaction(editingTransaction.id, {
                type,
                category,
                amount: parseFloat(amount),
                description
            });
        } else {
            addTransaction({
                type,
                category,
                amount: parseFloat(amount),
                description
            });
        }
        setIsModalOpen(false);
        setAmount('');
        setDescription('');
        setEditingTransaction(null);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
        removeTransaction(id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Fluxo de Caixa</h2>
            <p className="text-gray-600 dark:text-zinc-400 text-sm font-medium">Controle detalhado de movimentações.</p>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={() => openModal()}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-amber-500/20"
            >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden md:inline">Lançar</span>
            </button>
        </div>
      </div>

      {/* Control Bar (Golden Luxury Style) */}
      <div className="bg-amber-500 p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg shadow-amber-500/20">
        
        {/* Left: Date Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="flex items-center gap-2 bg-black/10 p-1 rounded-lg">
                <button onClick={() => setDateFilterMode('ALL')} className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${dateFilterMode === 'ALL' ? 'bg-white text-black shadow-sm' : 'text-black/60 hover:text-black hover:bg-black/5'}`}>Tudo</button>
                <button onClick={() => setDateFilterMode('MONTH')} className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${dateFilterMode === 'MONTH' ? 'bg-white text-black shadow-sm' : 'text-black/60 hover:text-black hover:bg-black/5'}`}>Mês</button>
                <button onClick={() => setDateFilterMode('DAY')} className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${dateFilterMode === 'DAY' ? 'bg-white text-black shadow-sm' : 'text-black/60 hover:text-black hover:bg-black/5'}`}>Dia</button>
             </div>

             {dateFilterMode === 'MONTH' && (
                 <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-white/90 border-0 rounded-lg py-1.5 px-3 text-sm font-black text-gray-900 focus:ring-2 focus:ring-black/20 shadow-sm focus:outline-none [color-scheme:light]" />
             )}
             {dateFilterMode === 'DAY' && (
                 <input type="date" value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="bg-white/90 border-0 rounded-lg py-1.5 px-3 text-sm font-black text-gray-900 focus:ring-2 focus:ring-black/20 shadow-sm focus:outline-none [color-scheme:light]" />
             )}
        </div>

        {/* Right: Category & Sorting */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as TransactionCategory | 'ALL')}
                    className="bg-white/90 border-0 rounded-lg py-1.5 pl-8 pr-8 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-black/20 shadow-sm focus:outline-none appearance-none cursor-pointer"
                >
                    <option value="ALL">Todas Categorias</option>
                    <option value="BAR_SALES">Vendas Bar</option>
                    <option value="QUENTINHAS">Quentinhas</option>
                    <option value="SUPPLIER">Fornecedores</option>
                    <option value="FIXED_COST">Custos Fixos</option>
                    <option value="DEBT_PAYMENT">Pagto Dívida</option>
                    <option value="OTHER_INCOME">Outras Entradas</option>
                    <option value="OTHER_EXPENSE">Outras Despesas</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
            </div>

            <div className="h-6 w-px bg-black/10 hidden md:block"></div>

            <button 
                onClick={() => toggleSort('date')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${sortConfig.key === 'date' ? 'bg-white text-black shadow-sm' : 'text-black/60 hover:text-black hover:bg-black/5'}`}
            >
                <Calendar className="w-3 h-3" />
                Data
                {sortConfig.key === 'date' && <ArrowUpDown className={`w-3 h-3 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />}
            </button>

            <button 
                onClick={() => toggleSort('amount')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${sortConfig.key === 'amount' ? 'bg-white text-black shadow-sm' : 'text-black/60 hover:text-black hover:bg-black/5'}`}
            >
                <Filter className="w-3 h-3" />
                Valor
                {sortConfig.key === 'amount' && <ArrowUpDown className={`w-3 h-3 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />}
            </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm">
              <span className="text-xs text-gray-500 dark:text-zinc-400 uppercase font-bold tracking-wider">Entradas (Filtro)</span>
              <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(viewTotals.income)}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm">
              <span className="text-xs text-gray-500 dark:text-zinc-400 uppercase font-bold tracking-wider">Saídas (Filtro)</span>
              <div className="text-xl font-mono font-bold text-red-600 dark:text-red-400 mt-1">{formatCurrency(viewTotals.expense)}</div>
          </div>
          <div className={`bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm ${balance >= 0 ? 'border-b-emerald-500/50' : 'border-b-red-500/50'}`}>
              <span className="text-xs text-gray-500 dark:text-zinc-400 uppercase font-bold tracking-wider">Saldo (Filtro)</span>
              <div className={`text-xl font-mono font-bold mt-1 ${balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(balance)}</div>
          </div>
      </div>

      <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm dark:shadow-lg">
        {/* Table Filter Tabs */}
        <div className="flex border-b border-gray-200 dark:border-zinc-800">
            <button onClick={() => setFilterType('ALL')} className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${filterType === 'ALL' ? 'border-amber-500 text-amber-600 dark:text-amber-500 bg-gray-50 dark:bg-zinc-900/50' : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900/30'}`}>Todas</button>
            <button onClick={() => setFilterType('INCOME')} className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${filterType === 'INCOME' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-500 bg-gray-50 dark:bg-zinc-900/50' : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900/30'}`}>Entradas</button>
            <button onClick={() => setFilterType('EXPENSE')} className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${filterType === 'EXPENSE' ? 'border-red-500 text-red-600 dark:text-red-500 bg-gray-50 dark:bg-zinc-900/50' : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900/30'}`}>Saídas</button>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider">
                    <tr>
                        <th className="p-4">Data</th>
                        <th className="p-4">Descrição</th>
                        <th className="p-4">Categoria</th>
                        <th className="p-4 text-right">Valor</th>
                        <th className="p-4 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                    {filteredTransactions.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-zinc-400 italic font-medium">
                                Nenhuma transação encontrada para este filtro.
                            </td>
                        </tr>
                    ) : (
                        filteredTransactions.map(t => (
                        <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/30 transition-colors group">
                            <td className="p-4 text-gray-700 dark:text-zinc-300 text-sm whitespace-nowrap font-medium">
                                {new Date(t.date).toLocaleDateString('pt-BR')} <span className="text-gray-400 dark:text-zinc-500 text-xs ml-1 font-normal">{new Date(t.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                            </td>
                            <td className="p-4">
                                <span className="text-gray-900 dark:text-white font-bold">{t.description}</span>
                            </td>
                            <td className="p-4">
                                <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded text-[10px] text-gray-700 dark:text-zinc-300 font-bold uppercase border border-gray-200 dark:border-zinc-700">
                                    {t.category.replace('_', ' ')}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <span className={`font-mono font-bold flex items-center justify-end gap-1 ${t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {t.type === 'INCOME' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                                    {formatCurrency(t.amount)}
                                </span>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center justify-center gap-2">
                                    <button 
                                        onClick={() => openModal(t)}
                                        className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                        title="Editar"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(t.id)}
                                        className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Transaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
            <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-40" onClick={() => setIsModalOpen(false)} />
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 m-auto w-full max-w-md h-fit bg-white dark:bg-[#121212] border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}</h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"><X className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 dark:bg-zinc-900 rounded-lg">
                            <button type="button" onClick={() => { setType('INCOME'); setCategory('OTHER_INCOME'); }} className={`py-2 rounded-md text-sm font-bold transition-colors ${type === 'INCOME' ? 'bg-emerald-600 text-white shadow' : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'}`}>Entrada</button>
                            <button type="button" onClick={() => { setType('EXPENSE'); setCategory('OTHER_EXPENSE'); }} className={`py-2 rounded-md text-sm font-bold transition-colors ${type === 'EXPENSE' ? 'bg-red-600 text-white shadow' : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'}`}>Saída</button>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Descrição</label>
                            <input type="text" required value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-amber-500" placeholder="Ex: Venda extra..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Categoria</label>
                                <select value={category} onChange={e => setCategory(e.target.value as TransactionCategory)} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-amber-500 text-sm">
                                    {type === 'INCOME' ? (
                                        <>
                                            <option value="OTHER_INCOME">Outras Entradas</option>
                                            <option value="BAR_SALES">Vendas Bar</option>
                                            <option value="QUENTINHAS">Quentinhas</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="OTHER_EXPENSE">Outras Despesas</option>
                                            <option value="FIXED_COST">Custos Fixos</option>
                                            <option value="SUPPLIER">Fornecedor</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Valor</label>
                                <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-amber-500" placeholder="0,00" />
                            </div>
                        </div>
                        <div className="pt-4 flex gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-800 dark:text-white py-3 rounded-lg font-bold transition-colors">Cancelar</button>
                            <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-black py-3 rounded-lg font-bold transition-colors">Salvar</button>
                        </div>
                    </form>
                </motion.div>
            </>
        )}
      </AnimatePresence>
    </div>
  );
};