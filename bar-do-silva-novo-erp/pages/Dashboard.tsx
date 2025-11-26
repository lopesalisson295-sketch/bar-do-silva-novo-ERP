import React, { useMemo, useState } from 'react';
import { useERP } from '../context/ERPContext';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend, ReferenceLine } from 'recharts';
import { TrendingUp, DollarSign, Wallet, AlertCircle, Calendar, ArrowDown } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { motion } from 'framer-motion';

const COLORS = {
  bar: '#f59e0b', // Amber 500
  quentinhas: '#10b981', // Emerald 500
  expenses: '#ef4444', // Red 500
  profit: '#3b82f6', // Blue 500
  fixedCost: '#a855f7', // Purple 500
  variableCost: '#ec4899', // Pink 500
};

export const Dashboard: React.FC = () => {
  const { transactions, clients } = useERP();
  const { theme } = useTheme();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [pieChartScope, setPieChartScope] = useState<'MONTH' | 'YEAR'>('MONTH');

  // Dynamic Chart Colors based on Theme
  const chartColors = {
      grid: theme === 'dark' ? '#27272a' : '#e5e7eb', // zinc-800 vs gray-200
      text: theme === 'dark' ? '#a1a1aa' : '#6b7280', // zinc-400 vs gray-500
      tooltipBg: theme === 'dark' ? '#18181b' : '#ffffff',
      tooltipBorder: theme === 'dark' ? '#3f3f46' : '#e5e7eb',
      tooltipText: theme === 'dark' ? '#fff' : '#1f2937',
  };

  // --- Filter Transactions for Specific Selected Month ---
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // --- Filter Transactions for Last 12 Months (Year) ---
  const yearTransactions = useMemo(() => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return transactions.filter(t => new Date(t.date) >= oneYearAgo);
  }, [transactions]);

  // --- DRE Calculation Logic (Based on Selected Month) ---
  const dre = useMemo(() => {
    // 1. Gross Revenue
    const incomeTransactions = monthTransactions.filter(t => t.type === 'INCOME');
    const grossRevenue = incomeTransactions.reduce((acc, t) => acc + t.amount, 0);

    // 2. Variable Costs
    const variableCostTransactions = monthTransactions.filter(t => t.type === 'EXPENSE' && t.category === 'SUPPLIER');
    const variableCosts = variableCostTransactions.reduce((acc, t) => acc + t.amount, 0);

    // 3. Contribution Margin
    const contributionMargin = grossRevenue - variableCosts;

    // 4. Fixed Expenses
    const fixedCostTransactions = monthTransactions.filter(t => t.type === 'EXPENSE' && t.category === 'FIXED_COST');
    const fixedCosts = fixedCostTransactions.reduce((acc, t) => acc + t.amount, 0);

    // 5. Other Expenses
    const otherExpTransactions = monthTransactions.filter(t => t.type === 'EXPENSE' && t.category === 'OTHER_EXPENSE');
    const otherCosts = otherExpTransactions.reduce((acc, t) => acc + t.amount, 0);

    // 6. Net Profit
    const totalExpenses = variableCosts + fixedCosts + otherCosts;
    const netProfit = grossRevenue - totalExpenses;

    return {
      grossRevenue,
      variableCosts,
      contributionMargin,
      fixedCosts,
      otherCosts,
      totalExpenses,
      netProfit,
      marginPercent: grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0
    };
  }, [monthTransactions]);

  // --- Waterfall Chart Data for DRE ---
  const waterfallData = useMemo(() => [
    { name: 'Receita Bruta', uv: dre.grossRevenue, fill: COLORS.bar, isTotal: true },
    { name: 'Custos Variáveis', uv: -dre.variableCosts, fill: COLORS.variableCost },
    { name: 'Margem Contrib.', uv: dre.contributionMargin, fill: theme === 'dark' ? '#64748b' : '#94a3b8', isTotal: true }, 
    { name: 'Desp. Fixas', uv: -dre.fixedCosts, fill: COLORS.fixedCost },
    { name: 'Outros', uv: -dre.otherCosts, fill: COLORS.expenses },
    { name: 'Lucro Líquido', uv: dre.netProfit, fill: dre.netProfit >= 0 ? COLORS.profit : COLORS.expenses, isTotal: true },
  ], [dre, theme]);

  // --- Chart 1: Daily Breakdown (For Selected Month) ---
  const dailyChartData = useMemo(() => {
    const dataMap = new Map();
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    for(let i = 1; i <= daysInMonth; i++) {
        const dayStr = String(i).padStart(2, '0');
        dataMap.set(dayStr, { name: dayStr, receita: 0, despesa: 0 });
    }

    monthTransactions.forEach(t => {
      const dayKey = new Date(t.date).getDate().toString().padStart(2, '0');
      if (dataMap.has(dayKey)) {
        const entry = dataMap.get(dayKey);
        if (t.type === 'INCOME') entry.receita += t.amount;
        else entry.despesa += t.amount;
      }
    });

    return Array.from(dataMap.values());
  }, [monthTransactions, selectedMonth]);

  // --- Chart 2: Monthly History Trend (Last 12 Months) ---
  const monthlyHistoryData = useMemo(() => {
    const dataMap = new Map();
    const sortedAll = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedAll.forEach(t => {
       const monthKey = t.date.slice(0, 7); // YYYY-MM
       if (!dataMap.has(monthKey)) {
            const displayKey = new Date(monthKey + '-15').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
           dataMap.set(monthKey, { name: displayKey, sortKey: monthKey, receita: 0, despesa: 0, lucro: 0 });
       }
       const entry = dataMap.get(monthKey);
       if (t.type === 'INCOME') entry.receita += t.amount;
       else entry.despesa += t.amount;
       entry.lucro = entry.receita - entry.despesa;
    });

    return Array.from(dataMap.values())
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
        .slice(-12);
  }, [transactions]);


  // --- Pie Chart: Source Breakdown ---
  const sourceData = useMemo(() => {
    const targetTransactions = pieChartScope === 'MONTH' ? monthTransactions : yearTransactions;
    const barTotal = targetTransactions.filter(t => t.type === 'INCOME' && t.category === 'BAR_SALES').reduce((acc, t) => acc + t.amount, 0);
    const foodTotal = targetTransactions.filter(t => t.type === 'INCOME' && t.category === 'QUENTINHAS').reduce((acc, t) => acc + t.amount, 0);
    const otherTotal = targetTransactions.filter(t => t.type === 'INCOME' && t.category === 'OTHER_INCOME').reduce((acc, t) => acc + t.amount, 0);

    if (barTotal === 0 && foodTotal === 0 && otherTotal === 0) return [];

    return [
      { name: 'Bar & Bebidas', value: barTotal, color: COLORS.bar },
      { name: 'Quentinhas', value: foodTotal, color: COLORS.quentinhas },
      { name: 'Outros', value: otherTotal, color: '#6366f1' },
    ].filter(item => item.value > 0);
  }, [monthTransactions, yearTransactions, pieChartScope]);


  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard Financeiro</h2>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">Visão estratégica e saúde financeira do negócio.</p>
        </div>
        
        <div className="flex items-center gap-3">
             <div className="bg-amber-500 border border-amber-600 rounded-xl px-5 py-3 flex items-center gap-3 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-colors">
                <Calendar className="w-6 h-6 text-black" />
                <span className="text-xs text-black/80 uppercase font-extrabold tracking-wider">Mês de Referência:</span>
                <input 
                    type="month" 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-transparent text-black text-lg font-black focus:outline-none cursor-pointer placeholder-black [color-scheme:light]"
                />
             </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Faturamento" 
          value={dre.grossRevenue} 
          icon={DollarSign} 
          trend={dre.grossRevenue > 0 ? "Receita Bruta" : "Sem dados"} 
          color="text-emerald-500 dark:text-emerald-400" 
        />
        <KPICard 
          title="Lucro Líquido" 
          value={dre.netProfit} 
          icon={TrendingUp} 
          trend={`${dre.marginPercent.toFixed(1)}% Margem`}
          color={dre.netProfit >= 0 ? "text-blue-500 dark:text-blue-400" : "text-red-500 dark:text-red-400"} 
        />
        <KPICard 
          title="Despesas Totais" 
          value={dre.totalExpenses} 
          icon={ArrowDown} 
          trend="Custos + Despesas"
          color="text-red-500 dark:text-red-400" 
        />
         <KPICard 
          title="Fiado a Receber" 
          value={clients.reduce((acc, c) => acc + c.debt, 0)} 
          icon={Wallet} 
          color="text-amber-500" 
          isAlert
          subtext="Acumulado Geral"
        />
      </div>

      {/* SECTION 1: HISTORICAL EVOLUTION (BIG CHART) */}
      <Card title="Evolução Financeira (Últimos 12 Meses)" className="p-1">
             <div className="h-[400px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyHistoryData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                    <defs>
                        <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.profit} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={COLORS.profit} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.bar} stopOpacity={0.1}/>
                        <stop offset="95%" stopColor={COLORS.bar} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                    <XAxis dataKey="name" stroke={chartColors.text} fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke={chartColors.text} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val/1000}k`} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, color: chartColors.tooltipText, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        formatter={(value: number) => formatCurrency(value)}
                        labelStyle={{ color: '#fbbf24', fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Area type="monotone" dataKey="receita" name="Receita Total" stroke={COLORS.bar} fill="url(#colorReceita)" strokeWidth={2} />
                    <Area type="monotone" dataKey="despesa" name="Despesas Totais" stroke={COLORS.expenses} fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                    <Area type="monotone" dataKey="lucro" name="Lucro Líquido" stroke={COLORS.profit} fill="url(#colorLucro)" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
      </Card>

      {/* SECTION 2: DAILY BREAKDOWN (BIG CHART) */}
      <Card title={`Performance Diária - ${new Date(selectedMonth + '-02').toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'})}`} className="p-1">
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                <XAxis dataKey="name" stroke={chartColors.text} fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke={chartColors.text} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                <Tooltip 
                  cursor={{fill: theme === 'dark' ? '#27272a' : '#f3f4f6', opacity: 0.4}}
                  contentStyle={{ backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, color: chartColors.tooltipText, borderRadius: '8px' }}
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Dia ${label}`}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="receita" name="Entradas" fill={COLORS.bar} radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="despesa" name="Saídas" fill={COLORS.expenses} radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
      </Card>

      {/* SECTION 3: REVENUE SOURCE & DRE VISUAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* PIE CHART */}
           <Card className="lg:col-span-1 flex flex-col">
            <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="font-semibold text-gray-800 dark:text-zinc-100 text-lg">Origem da Receita</h3>
                <div className="flex bg-gray-100 dark:bg-zinc-900 rounded-lg p-1 border border-gray-200 dark:border-zinc-800">
                    <button 
                        onClick={() => setPieChartScope('MONTH')}
                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-colors ${pieChartScope === 'MONTH' ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Mês
                    </button>
                    <button 
                        onClick={() => setPieChartScope('YEAR')}
                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-colors ${pieChartScope === 'YEAR' ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Ano
                    </button>
                </div>
            </div>
            
            <div className="h-[300px] w-full relative flex-1">
                {sourceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={sourceData}
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={4}
                        >
                        {sourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        </Pie>
                        <Tooltip 
                        contentStyle={{ backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, color: chartColors.tooltipText, borderRadius: '8px' }}
                        formatter={(value: number) => formatCurrency(value)}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-900 dark:fill-white font-bold text-xl">
                             {pieChartScope === 'MONTH' ? 'Mês' : 'Ano'}
                        </text>
                    </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-zinc-500 text-sm">Sem dados.</div>
                )}
            </div>
           </Card>

            {/* DRE VISUAL */}
            <Card title="DRE Visual (Demonstrativo do Resultado)" className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                    {/* Visual Chart */}
                    <div className="h-[300px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={waterfallData} margin={{top: 20, right: 30, left: 0, bottom: 5}}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                                <XAxis dataKey="name" stroke={chartColors.text} fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={60} />
                                <YAxis stroke={chartColors.text} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${Math.abs(val)/1000}k`} />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-zinc-700 p-3 rounded-lg shadow-xl">
                                                    <p className="text-gray-500 dark:text-zinc-400 text-xs uppercase mb-1">{data.name}</p>
                                                    <p className={`font-mono text-lg font-bold ${data.uv >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500 dark:text-red-400'}`}>
                                                        {formatCurrency(Math.abs(data.uv))}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <ReferenceLine y={0} stroke={theme === 'dark' ? '#52525b' : '#d1d5db'} />
                                <Bar dataKey="uv" radius={[4, 4, 4, 4]}>
                                    {waterfallData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Detailed List */}
                    <div className="flex flex-col justify-center space-y-4 pr-4">
                        <DRERow label="Receita Bruta" value={dre.grossRevenue} color="text-amber-600 dark:text-amber-500" />
                        <DRERow label="(-) Custos Variáveis" value={dre.variableCosts} color="text-red-500 dark:text-red-400" isNegative />
                        
                        <div className="h-px bg-gray-200 dark:bg-zinc-800 my-2"></div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 dark:text-zinc-400 text-sm font-medium">Margem Contrib.</span>
                            <div className="text-right">
                                <span className="text-gray-900 dark:text-white font-mono font-bold block">{formatCurrency(dre.contributionMargin)}</span>
                                <span className="text-xs text-gray-500 dark:text-zinc-500">
                                    {dre.grossRevenue > 0 ? ((dre.contributionMargin / dre.grossRevenue) * 100).toFixed(1) : 0}% da Receita
                                </span>
                            </div>
                        </div>

                        <div className="h-px bg-gray-200 dark:bg-zinc-800 my-2"></div>

                        <DRERow label="(-) Despesas Fixas" value={dre.fixedCosts} color="text-red-500 dark:text-red-400" isNegative />
                        <DRERow label="(-) Outras Despesas" value={dre.otherCosts} color="text-red-500 dark:text-red-400" isNegative />

                        <div className="mt-4 p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Lucro Líquido</span>
                            <span className={`text-xl font-mono font-bold ${dre.netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-500'}`}>
                                {formatCurrency(dre.netProfit)}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon: Icon, trend, color, isAlert, subtext }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white dark:bg-[#121212] border ${isAlert ? 'border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/5' : 'border-gray-200 dark:border-zinc-800'} p-6 rounded-xl shadow-sm dark:shadow-lg relative overflow-hidden group hover:border-gray-300 dark:hover:border-zinc-600 transition-colors duration-300`}
  >
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-gray-500 dark:text-zinc-400 text-xs font-medium uppercase tracking-wider">{title}</p>
        <h3 className={`text-2xl font-bold mt-1 ${color}`}>{formatCurrency(value)}</h3>
      </div>
      <div className={`p-3 rounded-xl ${isAlert ? 'bg-amber-100 dark:bg-amber-500/20' : 'bg-gray-100 dark:bg-zinc-800'} group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20 transition-colors`}>
        <Icon className={`w-6 h-6 ${isAlert ? 'text-amber-600 dark:text-amber-500' : 'text-gray-400 dark:text-zinc-400'} group-hover:text-amber-600 dark:group-hover:text-amber-500`} />
      </div>
    </div>
    {trend && (
      <div className="text-xs font-medium text-gray-500 dark:text-zinc-500 flex items-center gap-1">
        <TrendingUp className="w-3 h-3 text-emerald-500" /> {trend}
      </div>
    )}
    {subtext && (
       <div className="text-[10px] text-gray-400 dark:text-zinc-600 uppercase tracking-widest mt-1">
         {subtext}
       </div>
    )}
  </motion.div>
);

const DRERow = ({ label, value, color, isNegative }: any) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500 dark:text-zinc-500">{label}</span>
        <span className={`font-mono font-medium ${color}`}>
            {isNegative ? '-' : ''}{formatCurrency(value)}
        </span>
    </div>
);