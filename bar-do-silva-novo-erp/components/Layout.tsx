import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Users, Truck, LogOut, Wine, Package, Banknote, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children }) => {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'CASHFLOW', label: 'Fluxo de Caixa', icon: Banknote },
    { id: 'INVENTORY', label: 'Estoque', icon: Package },
    { id: 'CLIENTS', label: 'Clientes', icon: Users },
    { id: 'SUPPLIERS', label: 'Fornecedores', icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white flex flex-col md:flex-row transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-[#121212] border-r border-gray-200 dark:border-zinc-800 h-screen sticky top-0 transition-colors duration-300">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white dark:text-black">
            <Wine className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide text-gray-900 dark:text-white">BAR DO SILVA</h1>
            <p className="text-xs text-amber-600 dark:text-amber-500 tracking-wider font-semibold">PREMIUM ERP</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group
                ${currentView === item.id 
                  ? 'bg-gray-100 dark:bg-zinc-900 text-amber-600 dark:text-amber-500 border border-amber-500/20 shadow-md' 
                  : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-amber-600 dark:text-amber-500' : 'group-hover:text-gray-900 dark:group-hover:text-white'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-zinc-800 space-y-2">
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-gray-50 dark:hover:bg-zinc-900/50 rounded-lg transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>

          <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-[#121212] p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 z-20 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white dark:text-black">
            <Wine className="w-4 h-4" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white tracking-wide">BAR DO SILVA</span>
        </div>
        <button onClick={toggleTheme} className="p-2 text-gray-600 dark:text-zinc-400">
           {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8 scroll-smooth">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800 p-4 flex justify-around z-30 pb-safe overflow-x-auto transition-colors duration-300">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as ViewState)}
            className={`flex flex-col items-center gap-1 transition-colors min-w-[64px] ${
              currentView === item.id ? 'text-amber-600 dark:text-amber-500' : 'text-gray-400 dark:text-zinc-500'
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium tracking-wide whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};