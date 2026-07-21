import React, { useState, useEffect } from 'react';
import { X, Camera, Save, Tag, Package, Barcode } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProductFormModal = ({ isOpen, onClose, productToEdit }) => {
  const { addProduct, updateProduct, openScanner, categories } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    price: '',
    costPrice: '',
    stock: '',
    minStock: '5',
    category: 'Geral'
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        barcode: productToEdit.barcode || '',
        price: productToEdit.price ? productToEdit.price.toString() : '',
        costPrice: productToEdit.costPrice ? productToEdit.costPrice.toString() : '',
        stock: productToEdit.stock ? productToEdit.stock.toString() : '',
        minStock: productToEdit.minStock ? productToEdit.minStock.toString() : '5',
        category: productToEdit.category || 'Geral'
      });
    } else {
      setFormData({
        name: '',
        barcode: '',
        price: '',
        costPrice: '',
        stock: '',
        minStock: '5',
        category: 'Geral'
      });
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('Por favor, preencha o nome e o preço do produto.');
      return;
    }

    if (productToEdit) {
      await updateProduct(productToEdit.id, formData);
    } else {
      await addProduct(formData);
    }

    onClose();
  };

  const handleScanBarcode = () => {
    openScanner((scannedCode) => {
      setFormData(prev => ({ ...prev, barcode: scannedCode }));
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
            {productToEdit ? 'Editar Produto' : 'Novo Produto'}
          </h3>
          <button 
            onClick={onClose}
            style={{ background: 'var(--bg-subtle)', border: 'none', padding: '6px', borderRadius: '50%', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Nome */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              Nome do Produto *
            </label>
            <div className="input-group">
              <Tag className="input-icon" size={18} />
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Coca-Cola 350ml"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Código de Barras + Leitor */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              Código de Barras
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                <Barcode className="input-icon" size={18} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Escaneie ou digite"
                  value={formData.barcode}
                  onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                />
              </div>
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={handleScanBarcode}
                title="Escanear com Câmera"
                style={{ padding: '0 14px' }}
              >
                <Camera size={20} color="var(--primary)" />
              </button>
            </div>
          </div>

          {/* Preços */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                Preço Venda (R$) *
              </label>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <span className="input-icon" style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)' }}>R$</span>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                Preço Custo (R$)
              </label>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <span className="input-icon" style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)' }}>R$</span>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={formData.costPrice}
                  onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Estoques */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                Qtd em Estoque
              </label>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <Package className="input-icon" size={18} />
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  value={formData.stock}
                  onChange={e => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                Alerta Mínimo
              </label>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <Package className="input-icon" size={18} />
                <input
                  type="number"
                  className="form-input"
                  placeholder="5"
                  value={formData.minStock}
                  onChange={e => setFormData({ ...formData, minStock: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Categoria */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              Categoria
            </label>
            <select
              className="form-input"
              style={{ paddingLeft: '14px' }}
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn btn-outline btn-full" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary btn-full">
              <Save size={18} />
              {productToEdit ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
