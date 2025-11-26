import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Card } from '../components/ui/Card';
import { Package, Truck, Clock, AlertOctagon, ChevronDown, ChevronUp, Search, PlusCircle, Trash2, X, ShoppingBag, Pencil } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { motion, AnimatePresence } from 'framer-motion';
import { Supplier } from '../types';

export const Suppliers: React.FC = () => {
  const { suppliers, transactions, addSupplier, removeSupplier, addSupplierOrder, editSupplier } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSupplierId, setExpandedSupplierId] = useState<string | null>(null);

  // Modals State
  const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [activeOrderSupplier, setActiveOrderSupplier] = useState<{id: string, name: string} | null>(null);

  // Form State - New/Edit Supplier
  const [supName, setSupName] = useState('');
  const [supCategory, setSupCategory] = useState('');

  // Form State - New Order
  const [orderAmount, setOrderAmount] = useState('');
  const [orderDesc, setOrderDesc] = useState('');

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSupplierHistory = (supplierId: string) => {
    return transactions
      .filter(t => t.supplierId === supplierId && t.type === 'EXPENSE')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const openSupplierModal = (supplier?: Supplier) => {
    if (supplier) {
        setEditingSupplier(supplier);
        setSupName(supplier.name);
        setSupCategory(supplier.category);
    } else {
        setEditingSupplier(null);
        setSupName('');
        setSupCategory('');
    }
    setIsNewSupplierModalOpen(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (supName && supCategory) {
        if (editingSupplier) {
            editSupplier(editingSupplier.id, { name: supName, category: supCategory });
        } else {
            addSupplier(supName, supCategory);
        }
        setSupName('');
        setSupCategory('');
        setEditingSupplier(null);
        setIsNewSupplierModalOpen(false);
    }
  };

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeOrderSupplier && orderAmount && orderDesc) {
        addSupplierOrder(activeOrderSupplier.id, parseFloat(orderAmount), orderDesc);
        setOrderAmount('');
        setOrderDesc('');
        setActiveOrderSupplier(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Fornecedores & Pedidos</h2>
            <p className="text-gray-600 dark:text-zinc-400 text-sm font-medium">Gerenciamento de parceiros e insumos.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-zinc-400 w-4 h-4" />
            <input 
                type="text"
                placeholder="Buscar fornecedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-[#121212] border border-gray-200 dark:border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm"
            />
            </div>
            <button 
                onClick={() => openSupplierModal()}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-full font-bold text-sm transition-colors shadow-lg shadow-amber-500/20 whitespace-nowrap"
            >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden md:inline">Novo Fornecedor</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredSuppliers.map((supplier) => {
          const isExpanded = expandedSupplierId === supplier.id;
          const history = getSupplierHistory(supplier.id);

          return (
          <Card key={supplier.id} className="group hover:border-gray-300 dark:hover:border-zinc-600 transition-colors relative overflow-visible">
             {/* Low Stock Badge */}
             {supplier.stockStatus === 'LOW' && (
                <div className="absolute -top-2 -right-2 z-10">
                    <span className="relative flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                    </span>
                </div>
            )}

            <div 
                className="cursor-pointer"
                onClick={() => setExpandedSupplierId(isExpanded ? null : supplier.id)}
            >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all shrink-0
                        ${supplier.stockStatus === 'LOW' 
                            ? 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-500/50 text-red-500' 
                            : 'bg-gray-100 dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-400 dark:text-zinc-400 group-hover:text-amber-600 dark:group-hover:text-white group-hover:border-amber-500'
                        }`}>
                    {supplier.stockStatus === 'LOW' ? <AlertOctagon className="w-6 h-6" /> : <Truck className="w-6 h-6" />}
                    </div>
                    <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        {supplier.name}
                        {supplier.stockStatus === 'LOW' && (
                            <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                Estoque Baixo
                            </span>
                        )}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-500">
                        <Package className="w-3 h-3" />
                        <span>{supplier.category}</span>
                    </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right hidden lg:block">
                        <p className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase">Total Comprado</p>
                        <p className="font-mono font-bold text-gray-900 dark:text-white">{formatCurrency(supplier.totalPurchased)}</p>
                    </div>
                    
                    <div className="text-right border-l border-gray-200 dark:border-zinc-800 pl-6 hidden lg:block">
                        <div className="flex items-center gap-1 justify-end text-gray-500 dark:text-zinc-400 text-xs font-bold mb-1">
                            <Clock className="w-3 h-3" />
                            <span>Última Entrega</span>
                        </div>
                        <p className="text-gray-900 dark:text-white text-sm font-medium">
                            {new Date(supplier.lastDelivery).toLocaleDateString('pt-BR')}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                         <button 
                            className="bg-gray-100 dark:bg-zinc-100 hover:bg-gray-200 dark:hover:bg-white text-black text-sm font-bold px-4 py-2 rounded-lg transition-colors z-20 flex items-center gap-2 shadow-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveOrderSupplier({ id: supplier.id, name: supplier.name });
                                setOrderDesc(`Pedido ref. ${new Date().toLocaleDateString('pt-BR')}`);
                            }}
                         >
                            <ShoppingBag className="w-4 h-4" />
                            Novo Pedido
                        </button>
                        
                        <button 
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors z-20"
                            title="Editar Fornecedor"
                            onClick={(e) => {
                                e.stopPropagation();
                                openSupplierModal(supplier);
                            }}
                        >
                            <Pencil className="w-5 h-5" />
                        </button>

                        <button 
                            className="p-2 text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors z-20"
                            title="Excluir Fornecedor"
                            onClick={(e) => {
                                e.stopPropagation();
                                if(window.confirm(`Tem certeza que deseja remover ${supplier.name}?`)) {
                                    removeSupplier(supplier.id);
                                }
                            }}
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>

                        <div className="p-2 text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                    </div>
                </div>
                </div>
            </div>

            {/* History Expansion */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 mt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-gray-500 dark:text-zinc-300 uppercase tracking-widest">Histórico de Pedidos</h4>
                                <span className="text-xs font-medium text-gray-400 dark:text-zinc-500">{history.length} registros encontrados</span>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-700 dark:text-zinc-300">
                                    <thead className="bg-gray-50 dark:bg-zinc-900/50 uppercase text-[10px] font-bold tracking-wider text-gray-500 dark:text-zinc-500">
                                        <tr>
                                            <th className="p-3 rounded-l-lg">Data</th>
                                            <th className="p-3">Descrição</th>
                                            <th className="p-3 text-right rounded-r-lg">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                        {history.length === 0 ? (
                                             <tr>
                                                <td colSpan={3} className="p-4 text-center text-gray-500 dark:text-zinc-500 italic font-medium">
                                                    Nenhuma compra registrada neste período.
                                                </td>
                                             </tr>
                                        ) : (
                                            history.map(t => (
                                                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/30 transition-colors">
                                                    <td className="p-3 text-gray-900 dark:text-zinc-200 font-bold">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                                                    <td className="p-3 font-medium">{t.description}</td>
                                                    <td className="p-3 text-right font-mono text-red-600 dark:text-red-400 font-bold">
                                                        {formatCurrency(t.amount)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
          </Card>
        )})}
      </div>

       {/* Supplier Modal */}
       <AnimatePresence>
        {isNewSupplierModalOpen && (
            <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-40" onClick={() => setIsNewSupplierModalOpen(false)} />
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 m-auto w-full max-w-md h-fit bg-white dark:bg-[#121212] border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingSupplier ? 'Editar Fornecedor' : 'Cadastrar Fornecedor'}</h3>
                        <button onClick={() => setIsNewSupplierModalOpen(false)} className="text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"><X className="w-5 h-5" /></button>
                    </div>
                    
                    <form onSubmit={handleSaveSupplier} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Nome da Empresa</label>
                            <input type="text" required value={supName} onChange={e => setSupName(e.target.value)} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-amber-500" placeholder="Ex: Distribuidora Silva" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Categoria</label>
                            <input type="text" required value={supCategory} onChange={e => setSupCategory(e.target.value)} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-amber-500" placeholder="Ex: Bebidas, Descartáveis..." />
                        </div>
                        <div className="pt-4 flex gap-3">
                            <button type="button" onClick={() => setIsNewSupplierModalOpen(false)} className="flex-1 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-800 dark:text-white py-3 rounded-lg font-bold transition-colors">Cancelar</button>
                            <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-black py-3 rounded-lg font-bold transition-colors">Salvar</button>
                        </div>
                    </form>
                </motion.div>
            </>
        )}
      </AnimatePresence>

      {/* New Order Modal */}
      <AnimatePresence>
        {activeOrderSupplier && (
            <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-40" onClick={() => setActiveOrderSupplier(null)} />
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 m-auto w-full max-w-md h-fit bg-white dark:bg-[#121212] border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Novo Pedido</h3>
                            <p className="text-amber-600 dark:text-amber-500 text-sm font-bold">{activeOrderSupplier.name}</p>
                        </div>
                        <button onClick={() => setActiveOrderSupplier(null)} className="text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"><X className="w-5 h-5" /></button>
                    </div>
                    
                    <form onSubmit={handleAddOrder} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Valor Total (R$)</label>
                            <input type="number" step="0.01" required value={orderAmount} onChange={e => setOrderAmount(e.target.value)} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 text-lg font-mono font-bold" placeholder="0,00" autoFocus />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Descrição / Itens</label>
                            <input type="text" required value={orderDesc} onChange={e => setOrderDesc(e.target.value)} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-amber-500" placeholder="Ex: 5cx Cerveja, 2kg Carne..." />
                        </div>
                        <div className="pt-4 flex gap-3">
                            <button type="button" onClick={() => setActiveOrderSupplier(null)} className="flex-1 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-800 dark:text-white py-3 rounded-lg font-bold transition-colors">Cancelar</button>
                            <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-black py-3 rounded-lg font-bold transition-colors">Confirmar Pedido</button>
                        </div>
                    </form>
                </motion.div>
            </>
        )}
      </AnimatePresence>
    </div>
  );
};