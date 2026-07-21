import React, { Component } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { SalesView } from './views/SalesView';
import { InventoryView } from './views/InventoryView';
import { HistoryView } from './views/HistoryView';
import { SettingsView } from './views/SettingsView';
import { ShoppingBag, Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erro no App:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', textAlign: 'center', marginTop: '40px' }}>
          <AlertTriangle size={48} color="var(--warning)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Ops! Algo deu errado</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            {this.state.error?.message || 'Ocorreu um erro ao carregar a página.'}
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={18} />
            Recarregar Página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const MainApp = () => {
  const { activeTab, isConnected, loading } = useApp();

  return (
    <>
      {/* Top Header Mobile */}
      <header className="app-header">
        <div className="app-brand">
          <div className="brand-icon">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h1 className="brand-title">DNIZ PDV</h1>
          </div>
        </div>

        <div className={`status-pill ${isConnected ? 'online' : 'local'}`}>
          {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span>{isConnected ? 'Firebase' : 'Local'}</span>
        </div>
      </header>

      {/* View Content */}
      <main className="main-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            Carregando sistema...
          </div>
        ) : (
          <>
            {activeTab === 'sales' && <SalesView />}
            {activeTab === 'inventory' && <InventoryView />}
            {activeTab === 'history' && <HistoryView />}
            {activeTab === 'settings' && <SettingsView />}
          </>
        )}
      </main>

      {/* Leitor de Código de Barras (Câmera) */}
      <BarcodeScannerModal />

      {/* Navegação Inferior (Bottom Nav) */}
      <Navigation />
    </>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </ErrorBoundary>
  );
}
