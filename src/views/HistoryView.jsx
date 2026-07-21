import React from 'react';
import { Clock, DollarSign, Calendar, ShoppingBag, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HistoryView = () => {
  const { sales } = useApp();

  const totalRevenue = sales.reduce((acc, s) => acc + (s.total || 0), 0);
  
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

      {/* Card de Faturamento acumulado */}
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary), #818cf8)', color: 'white', padding: '16px' }}>
        <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '4px' }}>Faturamento Total</div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
          R$ {totalRevenue.toFixed(2).replace('.', ',')}
        </div>
        <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>
          {sales.length} vendas registradas
        </div>
      </div>

      {/* Lista de Vendas */}
      <div style={{ marginTop: '16px' }}>
        {sales.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
            <Clock size={32} style={{ opacity: 0.5, marginBottom: '8px' }} />
            <p>Nenhuma venda registrada ainda.</p>
          </div>
        ) : (
          sales.map(sale => (
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
