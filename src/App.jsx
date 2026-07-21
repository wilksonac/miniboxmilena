import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { SalesView } from './views/SalesView';
import { InventoryView } from './views/InventoryView';
import { HistoryView } from './views/HistoryView';
import { SettingsView } from './views/SettingsView';
import { ShoppingBag, Wifi, WifiOff } from 'lucide-react';

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
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
