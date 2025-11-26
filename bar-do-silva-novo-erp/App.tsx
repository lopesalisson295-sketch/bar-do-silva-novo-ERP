import React, { useState } from 'react';
import { ERPProvider } from './context/ERPContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Suppliers } from './pages/Suppliers';
import { Inventory } from './pages/Inventory';
import { CashFlow } from './pages/CashFlow';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard />;
      case 'CLIENTS':
        return <Clients />;
      case 'SUPPLIERS':
        return <Suppliers />;
      case 'INVENTORY':
        return <Inventory />;
      case 'CASHFLOW':
        return <CashFlow />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <ERPProvider>
        <Layout currentView={currentView} onNavigate={setCurrentView}>
          {renderView()}
        </Layout>
      </ERPProvider>
    </ThemeProvider>
  );
};

export default App;