import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Card } from '../components/ui/Card';
import { Search, AlertTriangle, PlusCircle, CheckCircle, UserPlus, X, Clock, ChevronDown, ChevronUp, Moon, Save, CornerDownLeft, Pencil, Trash2, Receipt } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { motion, AnimatePresence } from 'framer-motion';
import { Client } from '../types';

export const Clients: React.FC = () => {
  const { clients, updateClientDebt, payDebt, addClient, transactions, removeClient, editClient } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // State for adding/editing client
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<{clientId: string, type: 'PAY' | 'DEBT'} | null>(null);
  const [actionAmount, setActionAmount] = useState<string>('');

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (client?: Client) => {
    if (client) {
        setEditingClient(client);
        setClientName(client.name);
        setClientPhone(client.phone);
    } else {
        setEditingClient(null);
        setClientName('');
        setClientPhone('');
    }
    setIsModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientName && clientPhone) {
      if (editingClient) {
        editClient(editingClient.id, { name: clientName, phone: clientPhone });
      } else {
        addClient(clientName, clientPhone);
      }
      setClientName('');
      setClientPhone('');
      setEditingClient(null);
      setIsModalOpen(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja remover o cliente ${name}?`)) {
        removeClient(id);
    }
  };

  const handleActionSubmit = (clientId: string) => {
    if (!activeAction || !actionAmount) return;
    const amount = parseFloat(actionAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;

    if (activeAction.type === 'PAY') {
        payDebt(clientId, amount);
    } else {
        updateClientDebt(clientId, amount);
    }
    setActiveAction(null);
    setActionAmount('');
  };

  const isInactive = (dateStr: string) => {
    const last = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diffDays = (now - last) / (1000 * 3600 * 24);
    return diffDays > 30;
  };

  const getClientHistory = (clientId: string) => {
    return transactions
      .filter(t => t.clientId === clientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Carteira de Clientes</h2>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-zinc-400 w-4 h-4" />
            <input 
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-[#121212] border border-gray-200 dark:border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm"
            />
            </div>
            <button 
                onClick={() => openModal()}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-full font-bold text-sm transition-colors shadow-lg shadow-amber-500/20"
            >
                <UserPlus className="w-4 h-4" />
                <span className="hidden md:inline">Novo</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
            const inactive = isInactive(client.lastPurchase);
            const history = getClientHistory(client.id);
            // Filtra apenas as transações que aumentaram a dívida (que não são pagamentos)
            const debtHistory = history.filter(t => t.category !== 'DEBT_PAYMENT');
            
            const isExpanded = expandedClientId === client.id;
            const isActionActive = activeAction?.clientId === client.id;

            return (
          <motion.div key={client.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className={`relative border-t-4 transition-colors duration-300 ${
                inactive 
                  ? 'border-t-gray-400 dark:border-t-zinc-600 opacity-80' 
                  : client.debt > 100 
                    ? 'border-t-red-500' 
                    : 'border-t-gray-400 dark:border-t-zinc-600'
                }`}>
              
              <div 
                className="cursor-pointer"
                onClick={() => setExpandedClientId(isExpanded ? null : client.id)}
              >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 pr-8">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {client.name}
                          {inactive && <Moon className="w-4 h-4 text-gray-400 dark:text-zinc-500" title="Inativo > 30 dias" />}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-zinc-400 font-medium">{client.phone}</p>
                    </div>
                    {/* Action Buttons Top Right */}
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => openModal(client)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(client.id, client.name)} className="text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </div>

                  <div className="mb-4 p-4 bg-gray-100 dark:bg-black/40 rounded-lg border border-gray-200 dark:border-zinc-800/50">
                    <div className="flex justify-between items-center">
                        <p className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wide">Saldo Devedor</p>
                        {client.debt > 0 && (
                            <span className="flex items-center gap-1 bg-red-100 dark:bg-red-500/10 px-2 py-0.5 rounded text-red-600 dark:text-red-400 text-[10px] font-bold uppercase border border-red-200 dark:border-red-500/20">
                                <AlertTriangle className="w-3 h-3" /> Devedor
                            </span>
                        )}
                    </div>
                    <p className={`text-2xl font-mono font-bold mt-1 ${client.debt > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-500'}`}>
                      {formatCurrency(client.debt)}
                    </p>
                    <p className="text-[10px] font-medium text-gray-500 dark:text-zinc-500 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Última compra: {new Date(client.lastPurchase).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
              </div>

              {/* Actions Area */}
              <div className="h-14 mb-2">
                <AnimatePresence mode="wait">
                    {!isActionActive ? (
                        <motion.div 
                            key="buttons"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-2 gap-3 h-full"
                        >
                            <button 
                                onClick={(e) => { e.stopPropagation(); setActiveAction({ clientId: client.id, type: 'PAY' }); }} 
                                className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-emerald-500/50 text-gray-900 dark:text-white text-xs py-2 px-3 rounded-lg transition-all"
                            >
                                <CheckCircle className="w-3 h-3 text-emerald-500" />
                                <div className="flex flex-col items-start leading-tight">
                                    <span className="font-bold">Abater</span>
                                    <span className="text-[9px] text-gray-500 dark:text-zinc-500 font-medium">Registrar Pagto</span>
                                </div>
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setActiveAction({ clientId: client.id, type: 'DEBT' }); }} 
                                className="flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-600/10 hover:bg-amber-100 dark:hover:bg-amber-600/20 border border-amber-200 dark:border-amber-600/30 hover:border-amber-500 text-amber-700 dark:text-amber-500 text-xs py-2 px-3 rounded-lg transition-all"
                            >
                                <PlusCircle className="w-3 h-3" />
                                <div className="flex flex-col items-start leading-tight">
                                    <span className="font-bold">+ Fiado</span>
                                    <span className="text-[9px] text-amber-700/70 dark:text-amber-500/70 font-medium">Novo Consumo</span>
                                </div>
                            </button>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="input"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2 h-full"
                            onSubmit={(e) => { e.preventDefault(); handleActionSubmit(client.id); }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-400 text-xs font-bold">R$</span>
                                <input 
                                    autoFocus
                                    type="number" 
                                    step="0.01"
                                    placeholder="0,00"
                                    className={`w-full bg-white dark:bg-black border rounded-lg py-2 pl-8 pr-2 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-1 ${activeAction.type === 'PAY' ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500' : 'border-amber-500/50 focus:border-amber-500 focus:ring-amber-500'}`}
                                    value={actionAmount}
                                    onChange={(e) => setActionAmount(e.target.value)}
                                />
                            </div>
                            <button 
                                type="submit"
                                className={`h-full aspect-square flex items-center justify-center rounded-lg ${activeAction.type === 'PAY' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
                            >
                                <Save className="w-4 h-4" />
                            </button>
                             <button 
                                type="button"
                                onClick={() => { setActiveAction(null); setActionAmount(''); }}
                                className="h-full aspect-square flex items-center justify-center rounded-lg bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-400"
                            >
                                <CornerDownLeft className="w-4 h-4" />
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
              </div>

              {/* Expand Toggle */}
              <div 
                onClick={() => setExpandedClientId(isExpanded ? null : client.id)}
                className="flex items-center justify-center pt-2 border-t border-gray-100 dark:border-zinc-800/50 cursor-pointer text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                 {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
                        {/* Seção 1: Detalhamento do Fiado (Somente Débitos) */}
                         <div className="pt-4 mt-2">
                             <div className="flex items-center gap-2 mb-2">
                                <Receipt className="w-3 h-3 text-amber-600 dark:text-amber-500" />
                                <h4 className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">Detalhamento do Fiado</h4>
                             </div>
                            
                            {debtHistory.length === 0 ? (
                                <p className="text-gray-500 dark:text-zinc-500 text-xs italic font-medium px-2">Sem registros de dívida.</p>
                            ) : (
                                <div className="space-y-1 max-h-32 overflow-y-auto pr-1 mb-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg p-2 border border-amber-100 dark:border-amber-900/20">
                                    {debtHistory.map(t => (
                                        <div key={t.id} className="flex justify-between items-center text-xs pb-1 last:pb-0 border-b last:border-0 border-amber-200/50 dark:border-amber-800/30">
                                            <span className="text-gray-700 dark:text-zinc-300 font-medium">
                                                {new Date(t.date).toLocaleDateString('pt-BR')}
                                            </span>
                                             <span className="font-mono font-bold text-red-600 dark:text-red-400">
                                                {formatCurrency(t.amount)}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-amber-200 dark:border-amber-800/50 font-bold">
                                        <span className="text-xs text-amber-800 dark:text-amber-500">Total Comprado</span>
                                        <span className="text-xs text-amber-800 dark:text-amber-500 font-mono">
                                             {formatCurrency(debtHistory.reduce((acc, t) => acc + t.amount, 0))}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Seção 2: Todas as Movimentações (Histórico Geral) */}
                        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 mt-2">
                            <h4 className="text-xs font-bold text-gray-500 dark:text-zinc-400 mb-2 uppercase tracking-widest">Movimentações Recentes</h4>
                            {history.length === 0 ? (
                                <p className="text-gray-500 dark:text-zinc-500 text-xs italic font-medium">Nenhuma transação recente.</p>
                            ) : (
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                    {history.map(t => (
                                        <div key={t.id} className="flex justify-between items-center text-xs p-2 rounded bg-gray-50 dark:bg-zinc-900/50 border border-transparent dark:border-zinc-800">
                                            <div>
                                                <span className="text-gray-900 dark:text-zinc-200 font-bold block">{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                                                <span className="text-[10px] text-gray-500 dark:text-zinc-400 font-medium">{t.description}</span>
                                            </div>
                                            <span className={`font-mono font-bold ${t.category === 'DEBT_PAYMENT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {t.category === 'DEBT_PAYMENT' ? '-' : '+'}{formatCurrency(t.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
              </AnimatePresence>

            </Card>
          </motion.div>
        )})}
      </div>

      {/* Client Modal */}
      <AnimatePresence>
        {isModalOpen && (
            <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-40" onClick={() => setIsModalOpen(false)} />
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 m-auto w-full max-w-md h-fit bg-white dark:bg-[#121212] border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"><X className="w-5 h-5" /></button>
                    </div>
                    
                    <form onSubmit={handleSaveClient} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Nome</label>
                            <input type="text" required value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-amber-500" placeholder="Ex: Ana Silva" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Telefone</label>
                            <input type="text" required value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-amber-500" placeholder="(00) 00000-0000" />
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