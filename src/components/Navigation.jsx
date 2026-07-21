import React from 'react';
import { ShoppingCart, Package, Clock, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navigation = () => {
  const { activeTab, setActiveTab, cart } = useApp();

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bottom-nav">
      <button 
        className={`nav-item ${activeTab === 'sales' ? 'active' : ''}`}
        onClick={() => setActiveTab('sales')}
        style={{ position: 'relative' }}
      >
        <ShoppingCart />
        <span>Vendas</span>
        {cartTotalItems > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '12px',
            background: 'var(--primary)',
            color: 'white',
            borderRadius: '50%',
            fontSize: '0.65rem',
            fontWeight: 800,
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {cartTotalItems}
          </span>
        )}
      </button>

      <button 
        className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
        onClick={() => setActiveTab('inventory')}
      >
        <Package />
        <span>Estoque</span>
      </button>

      <button 
        className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => setActiveTab('history')}
      >
        <Clock />
        <span>Histórico</span>
      </button>

      <button 
        className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => setActiveTab('settings')}
      >
        <Settings />
        <span>Ajustes</span>
      </button>
    </nav>
  );
};
