import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package, AlertTriangle, Barcode, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductFormModal } from '../components/ProductFormModal';

export const InventoryView = () => {
  const { products, deleteProduct } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const lowStockCount = products.filter(p => p.stock <= (p.minStock || 5)).length;
  const totalStockItems = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalStockValue = products.reduce((acc, p) => acc + ((p.stock || 0) * (p.price || 0)), 0);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.barcode && p.barcode.includes(searchTerm))
  );

  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product) => {
    setProductToEdit(product);
    setIsFormOpen(true);
  };

  const handleDelete = (id, name) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${name}"?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div>
      {/* Botão Novo Produto Flutuante/Topo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Gestão de Estoque</h3>
        <button className="btn btn-primary" onClick={handleOpenAdd} style={{ padding: '8px 14px' }}>
          <Plus size={18} />
          Cadastrar
        </button>
      </div>

      {/* Cards de Resumo do Estoque */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
        <div className="card" style={{ padding: '10px', textAlign: 'center', marginBottom: 0 }}>
          <Package size={18} color="var(--primary)" style={{ marginBottom: '4px' }} />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cadastrados</div>
          <div style={{ fontWeight: 800, fontSize: '1rem' }}>{products.length}</div>
        </div>

        <div className="card" style={{ padding: '10px', textAlign: 'center', marginBottom: 0 }}>
          <AlertTriangle size={18} color="var(--warning)" style={{ marginBottom: '4px' }} />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Estoque Baixo</div>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: lowStockCount > 0 ? 'var(--warning)' : 'inherit' }}>
            {lowStockCount}
          </div>
        </div>

        <div className="card" style={{ padding: '10px', textAlign: 'center', marginBottom: 0 }}>
          <DollarSign size={18} color="var(--success)" style={{ marginBottom: '4px' }} />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Valor Total</div>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--success)' }}>
            R$ {totalStockValue.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Input de Pesquisa */}
      <div className="input-group">
        <Search className="input-icon" size={18} />
        <input
          type="text"
          className="form-input"
          placeholder="Buscar produto por nome ou código..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de Produtos para Edição/Exclusão */}
      <div>
        {filteredProducts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
            <p>Nenhum produto cadastrado.</p>
          </div>
        ) : (
          filteredProducts.map(product => {
            const isLowStock = product.stock <= (product.minStock || 5);
            return (
              <div key={product.id} className="card" style={{ padding: '14px' }}>
                <div className="flex-between" style={{ marginBottom: '6px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem' }}>{product.name}</span>
                  <span className={`badge ${product.stock <= 0 ? 'badge-danger' : isLowStock ? 'badge-warning' : 'badge-success'}`}>
                    Qtd: {product.stock}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  {product.barcode && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Barcode size={14} /> {product.barcode}
                    </span>
                  )}
                  <span>Categoria: {product.category || 'Geral'}</span>
                </div>

                <div className="flex-between" style={{ paddingTop: '8px', borderTop: '1px dashed var(--border)' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '4px' }}>Preço:</span>
                    <span className="price-tag" style={{ fontSize: '1rem' }}>
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn-outline btn-icon-only"
                      onClick={() => handleOpenEdit(product)}
                      title="Editar"
                      style={{ padding: '6px 10px' }}
                    >
                      <Edit2 size={16} color="var(--primary)" />
                    </button>
                    <button
                      className="btn btn-outline btn-icon-only"
                      onClick={() => handleDelete(product.id, product.name)}
                      title="Excluir"
                      style={{ padding: '6px 10px', borderColor: 'var(--danger-light)' }}
                    >
                      <Trash2 size={16} color="var(--danger)" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Cadastro/Edição */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        productToEdit={productToEdit}
      />
    </div>
  );
};
