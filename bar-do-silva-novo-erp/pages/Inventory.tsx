import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Plus, Minus, Search, PackagePlus, X, Trash2, Pencil, ArrowUpDown, Filter, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { InventoryItem } from '../types';

export const Inventory: React.FC = () => {
  const { inventory, updateInventoryQuantity, addInventoryItem, removeInventoryItem, editInventoryItem } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Advanced Filters & Sort State
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'LOW' | 'OK'>('ALL');
  const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'quantity' | 'minStock', direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });

  // Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('un');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemMin, setNewItemMin] = useState('');

  const filteredInventory = inventory
    .filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const isLow = item.quantity <= item.minStock;
        
        if (!matchesSearch) return false;
        if (filterStatus === 'LOW' && !isLow) return false;
        if (filterStatus === 'OK' && isLow) return false;
        
        return true;
    })
    .sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = (valB as string).toLowerCase();
        }
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

  const toggleSort = (key: 'name' | 'quantity' | 'minStock') => {
    setSortConfig(current => ({
        key,
        direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const openModal = (item?: InventoryItem) => {
    if (item) {
        setEditingItem(item);
        setNewItemName(item.name);
        setNewItemUnit(item.unit);
        setNewItemQty(item.quantity.toString());
        setNewItemMin(item.minStock.toString());
    } else {
        setEditingItem(null);
        setNewItemName('');
        setNewItemUnit('un');
        setNewItemQty('');
        setNewItemMin('');
    }
    setIsModalOpen(true);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if(newItemName && newItemQty && newItemMin) {
        if (editingItem) {
            editInventoryItem(editingItem.id, {
                name: newItemName,
                quantity: Number(newItemQty),
                minStock: Number(newItemMin),
                unit: newItemUnit
            });
        } else {
            addInventoryItem({
                name: newItemName,
                quantity: Number(newItemQty),
                minStock: Number(newItemMin),
                unit: newItemUnit,
                price: 0 
            });
        }
        setIsModalOpen(false);
        setNewItemName('');
        setNewItemQty('');
        setNewItemMin('');
        setEditingItem(null);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir este item do estoque?')) {
        removeInventoryItem(id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Controle de Estoque</h2>
            <p className="text-gray-600 dark:text-zinc-400 text-sm font-medium">Gerencie seus insumos e produtos.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
                onClick={() => openModal()}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-full font-bold text-sm transition-colors shadow-lg shadow-amber-500/20"
            >
                <PackagePlus className="w-4 h-4" />
                <span className="hidden md:inline">Novo Item</span>
            </button>
        </div>
      </div>

       {/* Control Bar (Golden Luxury Style - Advanced Filters) */}
       <div className="bg-amber-500 p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg shadow-amber-500/20">
        
        {/* Left: Search */}
        <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input 
                type="text"
                placeholder="Buscar item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/90 border-0 rounded-lg py-2 pl-10 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-black/20 focus:outline-none placeholder-gray-500"
            />
        </div>

        {/* Right: Filters & Sort */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Status Filter */}
            <div className="flex items-center gap-2 bg-black/10 p-1 rounded-lg">
                <button onClick={() => setFilterStatus('ALL')} className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${filterStatus === 'ALL' ? 'bg-white text-black shadow-sm' : 'text-black/60 hover:text-black hover:bg-black/5'}`}>Todos</button>
                <button onClick={() => setFilterStatus('LOW')} className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded transition-colors ${filterStatus === 'LOW' ? 'bg-white text-red-600 shadow-sm' : 'text-black/60 hover:text-black hover:bg-black/5'}`}>
                   Baixo
                </button>
                <button onClick={() => setFilterStatus('OK')} className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${filterStatus === 'OK' ? 'bg-white text-emerald-600 shadow-sm' : 'text-black/60 hover:text-black hover:bg-black/5'}`}>OK</button>
            </div>

            <div className="h-6 w-px bg-black/10 hidden md:block"></div>

            {/* Sort Buttons */}
            <button 
                onClick={() => toggleSort('name')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${sortConfig.key === 'name' ? 'bg-white text-black shadow-sm' : 'text-black/60 hover:text-black hover:bg-black/5'}`}
            >
                Nome
                {sortConfig.key === 'name' && <ArrowUpDown className="w-3 h-3" />}
            </button>

            <button 
                onClick={() => toggleSort('quantity')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${sortConfig.key === 'quantity' ? 'bg-white text-black shadow-sm' : 'text-black/60 hover:text-black hover:bg-black/5'}`}
            >
                Qtd
                {sortConfig.key === 'quantity' && <ArrowUpDown className="w-3 h-3" />}
            </button>
        </div>
      </div>

      {/* Inventory Table/Cards */}
      <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm dark:shadow-lg">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider">
                    <tr>
                        <th className="p-4 cursor-pointer hover:text-amber-600 transition-colors" onClick={() => toggleSort('name')}>Item</th>
                        <th className="p-4 text-center">Unidade</th>
                        <th className="p-4 text-center cursor-pointer hover:text-amber-600 transition-colors" onClick={() => toggleSort('minStock')}>Mínimo</th>
                        <th className="p-4 text-center cursor-pointer hover:text-amber-600 transition-colors" onClick={() => toggleSort('quantity')}>Quantidade</th>
                        <th className="p-4 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {filteredInventory.map(item => {
                        const isLowStock = item.quantity <= item.minStock;
                        return (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${isLowStock ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{item.name}</p>
                                            {isLowStock && <span className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase">Repor Estoque</span>}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-center text-gray-600 dark:text-zinc-400 text-sm font-medium">{item.unit}</td>
                                <td className="p-4 text-center text-gray-700 dark:text-zinc-300 text-sm font-mono font-bold">{item.minStock}</td>
                                <td className="p-4 text-center">
                                    <div className="flex items-center justify-center gap-3">
                                         <button 
                                            onClick={() => updateInventoryQuantity(item.id, Math.max(0, item.quantity - 1))}
                                            className="p-1 rounded bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-800 dark:text-white transition-colors"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold border min-w-[3rem] ${isLowStock ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-white'}`}>
                                            {item.quantity}
                                        </span>
                                        <button 
                                            onClick={() => updateInventoryQuantity(item.id, item.quantity + 1)}
                                            className="p-1 rounded bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-800 dark:text-white transition-colors"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => openModal(item)}
                                            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                            title="Editar"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {filteredInventory.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-zinc-500 italic font-medium">
                    {filterStatus !== 'ALL' ? 'Nenhum item com este status.' : 'Nenhum item encontrado.'}
                </div>
            )}
        </div>
      </div>

       {/* Item Modal */}
       <AnimatePresence>
        {isModalOpen && (
            <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-40" onClick={() => setIsModalOpen(false)} />
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 m-auto w-full max-w-md h-fit bg-white dark:bg-[#121212] border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingItem ? 'Editar Item' : 'Cadastrar Item'}</h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"><X className="w-5 h-5" /></button>
                    </div>
                    
                    <form onSubmit={handleAddItem} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Nome do Produto</label>
                            <input type="text" required value={newItemName} onChange={e => setNewItemName(e.target.value)} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-amber-500" placeholder="Ex: Cerveja Brahma" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Unidade</label>
                                <select value={newItemUnit} onChange={e => setNewItemUnit(e.target.value)} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-amber-500">
                                    <option value="un">Unidade (un)</option>
                                    <option value="cx">Caixa (cx)</option>
                                    <option value="kg">Quilo (kg)</option>
                                    <option value="l">Litro (l)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Qtd Inicial</label>
                                <input type="number" required value={newItemQty} onChange={e => setNewItemQty(e.target.value)} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-amber-500" />
                            </div>
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Estoque Mínimo (Alerta)</label>
                            <input type="number" required value={newItemMin} onChange={e => setNewItemMin(e.target.value)} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-amber-500" />
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