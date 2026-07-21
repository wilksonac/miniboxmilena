import React, { useState } from 'react';
import { Search, Camera, Plus, Minus, Trash2, CheckCircle2, ShoppingBag, CreditCard, DollarSign, QrCode } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePhysicalBarcodeScanner } from '../hooks/usePhysicalBarcodeScanner';

export const SalesView = () => {
  const { 
    products, 
    cart, 
    addToCart, 
    updateCartQty, 
    removeFromCart, 
    completeSale, 
    openScanner 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [paymentMethod, setPaymentMethod] = useState('Dinheiro');
  const [discount, setDiscount] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [saleSuccess, setSaleSuccess] = useState(false);

  // Escuta leitores de código de barras físicos automaticamente!
  usePhysicalBarcodeScanner((scannedBarcode) => {
    const found = products.find(p => p.barcode === scannedBarcode);
    if (found) {
      const added = addToCart(found);
      if (!added) {
        alert(`Produto ${found.name} está sem estoque!`);
      }
    } else {
      alert(`Produto com código de barras "${scannedBarcode}" não encontrado no cadastro.`);
    }
  });

  const normalizeString = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const categories = ['Todas', ...new Set(products.map(p => p.category || 'Geral'))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = normalizeString(p.name).includes(normalizeString(searchTerm)) || 
                          (p.barcode && p.barcode.includes(searchTerm));
    const matchesCat = selectedCategory === 'Todas' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const discountVal = parseFloat(discount) || 0;
  const cartTotal = Math.max(0, cartSubtotal - discountVal);

  const handleOpenScanner = () => {
    openScanner((scannedCode) => {
      const found = products.find(p => p.barcode === scannedCode);
      if (found) {
        addToCart(found);
      } else {
        alert(`Código ${scannedCode} escaneado, porém não cadastrado.`);
      }
    });
  };

  const handleFinalizeSale = async () => {
    if (cart.length === 0) return;
    const success = await completeSale(paymentMethod, discountVal);
    if (success) {
      setIsCheckoutOpen(false);
      setSaleSuccess(true);
      setDiscount('');
      setTimeout(() => setSaleSuccess(false), 3000);
    }
  };

  return (
    <div>
      {/* Mensagem de sucesso da venda */}
      {saleSuccess && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--success)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-float)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 700
        }}>
          <CheckCircle2 size={20} />
          <span>Venda realizada com sucesso!</span>
        </div>
      )}

      {/* Cabeçalho de Busca & Scanner */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
          <Search className="input-icon" size={18} />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar produto ou código..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleOpenScanner}
          title="Escanear com Câmera"
          style={{ padding: '0 16px', borderRadius: 'var(--radius-md)' }}
        >
          <Camera size={22} />
        </button>
      </div>

      {/* Categorias de busca em chips roláveis */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '14px', scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: 'none',
              whiteSpace: 'nowrap',
              backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-card)',
              color: selectedCategory === cat ? 'white' : 'var(--text-muted)',
              boxShadow: selectedCategory === cat ? '0 4px 10px rgba(79,70,229,0.3)' : 'none',
              cursor: 'pointer'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lista de Produtos */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Produtos ({filteredProducts.length})
        </h4>

        {filteredProducts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
            <p>Nenhum produto encontrado.</p>
          </div>
        ) : (
          filteredProducts.map(product => {
            const isOutOfStock = product.stock <= 0;
            const inCartItem = cart.find(c => c.product.id === product.id);

            return (
              <div key={product.id} className="card flex-between" style={{ opacity: isOutOfStock ? 0.6 : 1 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>
                    {product.name}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="price-tag">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className={`badge ${isOutOfStock ? 'badge-danger' : product.stock <= (product.minStock || 5) ? 'badge-warning' : 'badge-success'}`}>
                      {isOutOfStock ? 'Esgotado' : `${product.stock} un`}
                    </span>
                  </div>
                </div>

                <button
                  className={`btn ${inCartItem ? 'btn-success' : 'btn-primary'}`}
                  disabled={isOutOfStock}
                  onClick={() => addToCart(product)}
                  style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)' }}
                >
                  <Plus size={18} />
                  {inCartItem ? `${inCartItem.quantity}` : 'Add'}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Painel / Bar de Carrinho Flutuante se houver itens */}
      {cart.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 'calc(var(--bottom-nav-height) + 12px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '448px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 16px',
          boxShadow: 'var(--shadow-float)',
          zIndex: 45,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {cart.reduce((s, i) => s + i.quantity, 0)} itens no carrinho
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
              Total: R$ {cartSubtotal.toFixed(2).replace('.', ',')}
            </div>
          </div>

          <button 
            className="btn btn-success"
            onClick={() => setIsCheckoutOpen(true)}
            style={{ borderRadius: 'var(--radius-md)', padding: '10px 18px' }}
          >
            <ShoppingBag size={18} />
            Ver Carrinho
          </button>
        </div>
      )}

      {/* Modal de Carrinho e Finalização da Venda */}
      {isCheckoutOpen && (
        <div className="modal-backdrop" onClick={() => setIsCheckoutOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
              Resumo da Venda
            </h3>

            {/* Itens do Carrinho */}
            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
              {cart.map(item => (
                <div key={item.product.id} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px dashed var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.product.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      R$ {item.product.price.toFixed(2).replace('.', ',')} un
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                      style={{ background: 'var(--bg-subtle)', border: 'none', padding: '4px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ fontWeight: 800, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button 
                      onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                      style={{ background: 'var(--bg-subtle)', border: 'none', padding: '4px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <Plus size={14} />
                    </button>
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', padding: '4px', cursor: 'pointer', marginLeft: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desconto */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Desconto (R$)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                style={{ paddingLeft: '14px', marginTop: '4px' }}
                placeholder="0.00"
                value={discount}
                onChange={e => setDiscount(e.target.value)}
              />
            </div>

            {/* Forma de Pagamento */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                Forma de Pagamento
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {['Dinheiro', 'PIX', 'Cartão Crédito', 'Cartão Débito'].map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      border: paymentMethod === method ? '2px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: paymentMethod === method ? 'var(--primary-light)' : 'var(--bg-card)',
                      color: paymentMethod === method ? 'var(--primary)' : 'var(--text-main)',
                      cursor: 'pointer'
                    }}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Totalizadores */}
            <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
              <div className="flex-between" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>Subtotal</span>
                <span>R$ {cartSubtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              {discountVal > 0 && (
                <div className="flex-between" style={{ fontSize: '0.85rem', color: 'var(--danger)', marginBottom: '4px' }}>
                  <span>Desconto</span>
                  <span>- R$ {discountVal.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex-between" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', paddingTop: '4px', borderTop: '1px solid var(--border)' }}>
                <span>Total a Pagar</span>
                <span style={{ color: 'var(--primary)' }}>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline btn-full" onClick={() => setIsCheckoutOpen(false)}>
                Voltar
              </button>
              <button className="btn btn-success btn-full" onClick={handleFinalizeSale}>
                <CheckCircle2 size={18} />
                Concluir Venda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
