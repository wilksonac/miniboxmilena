import React, { useState } from 'react';
import { Clock, Calendar, ShoppingBag, CreditCard, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HistoryView = () => {
  const { sales } = useApp();
  const [filterType, setFilterType] = useState('diario'); // 'diario', 'semanal', 'mensal', 'personalizado'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredSales = sales.filter(sale => {
    const timeStr = sale.timestamp || sale.createdAt;
    if (!timeStr) return false;
    
    const saleDate = new Date(timeStr);
    const now = new Date();

    if (filterType === 'diario') {
      return saleDate.toDateString() === now.toDateString();
    }
    
    if (filterType === 'semanal') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      oneWeekAgo.setHours(0, 0, 0, 0);
      return saleDate >= oneWeekAgo && saleDate <= now;
    }
    
    if (filterType === 'mensal') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      oneMonthAgo.setHours(0, 0, 0, 0);
      return saleDate >= oneMonthAgo && saleDate <= now;
    }
    
    if (filterType === 'personalizado') {
      if (!startDate) return true;
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999);
      
      return saleDate >= start && saleDate <= end;
    }
    
    return true;
  });

  const totalRevenue = filteredSales.reduce((acc, s) => acc + (s.total || 0), 0);
  
  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px' }}>
        Histórico de Vendas
      </h3>

      {/* Chips de filtro temporal */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '14px', scrollbarWidth: 'none' }}>
        {[
          { key: 'diario', label: 'Hoje' },
          { key: 'semanal', label: 'Semanal' },
          { key: 'mensal', label: 'Mensal' },
          { key: 'personalizado', label: 'Período' }
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setFilterType(item.key)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: 'none',
              whiteSpace: 'nowrap',
              backgroundColor: filterType === item.key ? 'var(--primary)' : 'var(--bg-card)',
              color: filterType === item.key ? 'white' : 'var(--text-muted)',
              boxShadow: filterType === item.key ? '0 4px 10px rgba(79,70,229,0.3)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Controles de Período Personalizado */}
      {filterType === 'personalizado' && (
        <div className="card" style={{ padding: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>De:</label>
              <input 
                type="date" 
                className="form-input" 
                style={{ padding: '8px', paddingLeft: '10px', marginBottom: 0, fontSize: '0.85rem' }} 
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Até:</label>
              <input 
                type="date" 
                className="form-input" 
                style={{ padding: '8px', paddingLeft: '10px', marginBottom: 0, fontSize: '0.85rem' }} 
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Card de Faturamento acumulado */}
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary), #818cf8)', color: 'white', padding: '16px', marginBottom: '16px' }}>
        <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '4px' }}>Faturamento no Período</div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
          R$ {totalRevenue.toFixed(2).replace('.', ',')}
        </div>
        <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>
          {filteredSales.length} {filteredSales.length === 1 ? 'venda registrada' : 'vendas registradas'}
        </div>
      </div>

      {/* Lista de Vendas */}
      <div>
        {filteredSales.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
            <Clock size={32} style={{ opacity: 0.5, marginBottom: '8px' }} />
            <p>Nenhuma venda no período selecionado.</p>
          </div>
        ) : (
          filteredSales.map(sale => (
            <div key={sale.id} className="card" style={{ padding: '14px' }}>
              <div className="flex-between" style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} />
                  {formatDate(sale.timestamp || sale.createdAt)}
                </span>
                <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                  {sale.paymentMethod || 'Dinheiro'}
                </span>
              </div>

              <div style={{ marginBottom: '8px' }}>
                {sale.items && sale.items.map((item, idx) => (
                  <div key={idx} className="flex-between" style={{ fontSize: '0.85rem', padding: '2px 0' }}>
                    <span>{item.quantity}x {item.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex-between" style={{ paddingTop: '8px', borderTop: '1px dashed var(--border)', fontWeight: 800 }}>
                <span>Total:</span>
                <span style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>
                  R$ {sale.total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
