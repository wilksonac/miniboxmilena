import React, { useState } from 'react';
import { Clock, Calendar, ShoppingBag, CreditCard, ChevronRight, TrendingUp, DollarSign, Percent } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Componente do Gráfico de Vendas Responsivo
const SalesChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        Sem dados de vendas suficientes para exibir o gráfico.
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 10);
  const chartHeight = 120;
  const barWidth = 34;
  const gap = 12;

  return (
    <div style={{ marginTop: '16px' }}>
      <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <TrendingUp size={16} color="var(--primary)" />
        Evolução de Faturamento (Por Dia)
      </h4>
      <div style={{ 
        display: 'flex', 
        gap: `${gap}px`, 
        overflowX: 'auto', 
        paddingBottom: '12px', 
        alignItems: 'flex-end',
        height: `${chartHeight + 35}px`,
        scrollbarWidth: 'none'
      }}>
        {data.map((item, idx) => {
          const barHeight = (item.value / maxValue) * chartHeight;
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: `${barWidth}px`, flexShrink: 0 }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                R$ {Math.round(item.value)}
              </span>
              <div style={{
                width: `${barWidth}px`,
                height: `${Math.max(barHeight, 6)}px`,
                background: 'linear-gradient(to top, var(--primary), #818cf8)',
                borderRadius: '6px 6px 2px 2px',
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.2)',
                transition: 'height 0.3s ease'
              }} />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 700 }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const HistoryView = () => {
  const { sales } = useApp();
  const [filterType, setFilterType] = useState('diario'); // 'diario', 'semanal', 'mensal', 'personalizado'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 1. Filtrar Vendas
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

  // 2. Cálculos Financeiros (Faturamento, Custos e Lucro)
  const totalRevenue = filteredSales.reduce((acc, s) => acc + (s.total || 0), 0);
  
  const totalCost = filteredSales.reduce((acc, sale) => {
    const saleCost = sale.items ? sale.items.reduce((sum, item) => sum + ((item.costPrice || 0) * item.quantity), 0) : 0;
    // O custo proporcional é reduzido caso haja desconto proporcional na venda
    const discountFactor = sale.subtotal > 0 ? (sale.total / sale.subtotal) : 1;
    return acc + (saleCost * discountFactor);
  }, 0);

  const grossProfit = Math.max(0, totalRevenue - totalCost);
  const profitMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // 3. Preparar dados para o Gráfico (Agrupado por Dia)
  const getChartData = () => {
    const groups = {};
    
    filteredSales.forEach(sale => {
      const timeStr = sale.timestamp || sale.createdAt;
      if (!timeStr) return;
      
      const date = new Date(timeStr);
      // Chave de agrupamento: dd/mm
      const label = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      groups[label] = (groups[label] || 0) + (sale.total || 0);
    });

    // Converter para array e ordenar cronologicamente (do mais antigo para o mais recente)
    // As vendas costumam vir ordenadas por data descrescente (mais recente primeiro), então invertemos
    const sortedLabels = Object.keys(groups).reverse();
    return sortedLabels.map(label => ({
      label,
      value: groups[label]
    }));
  };

  const chartData = getChartData();

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

      {/* Painel Financeiro do Período */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        {/* Card Faturamento */}
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary), #818cf8)', color: 'white', padding: '12px', marginBottom: 0 }}>
          <div style={{ fontSize: '0.65rem', opacity: 0.85, marginBottom: '2px', fontWeight: 700 }}>Faturamento</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            R$ {totalRevenue.toFixed(2).replace('.', ',')}
          </div>
          <div style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '2px' }}>
            {filteredSales.length} {filteredSales.length === 1 ? 'venda' : 'vendas'}
          </div>
        </div>

        {/* Card Margem de Lucro */}
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--success), #34d399)', color: 'white', padding: '12px', marginBottom: 0 }}>
          <div style={{ fontSize: '0.65rem', opacity: 0.85, marginBottom: '2px', fontWeight: 700 }}>Margem / Lucro</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            {profitMarginPercent.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '2px' }}>
            Lucro: R$ {grossProfit.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Gráfico de Vendas */}
      {filteredSales.length > 0 && (
        <div className="card" style={{ padding: '14px 16px 8px 16px', marginBottom: '16px' }}>
          <SalesChart data={chartData} />
        </div>
      )}

      {/* Lista de Vendas */}
      <div>
        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700 }}>
          Detalhamento das Vendas
        </h4>
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
