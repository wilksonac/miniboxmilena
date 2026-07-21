import React, { useState } from 'react';
import { Database, ShieldCheck, RefreshCw, Smartphone, Info, Share2, Plus, Trash2, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FirebaseConfigModal } from '../components/FirebaseConfigModal';

export const SettingsView = () => {
  const { isConnected, categories, addCategory, deleteCategory } = useApp();
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleResetData = () => {
    if (confirm('Deseja restaurar os produtos de demonstração iniciais? Seus dados locais atuais serão sobrescritos.')) {
      localStorage.removeItem('dniz_products');
      localStorage.removeItem('dniz_sales');
      localStorage.removeItem('dniz_categories');
      window.location.reload();
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      alert('Esta categoria já existe!');
      return;
    }
    addCategory(trimmed);
    setNewCategory('');
  };

  const handleDeleteCategory = (cat) => {
    if (cat === 'Geral') {
      alert('A categoria "Geral" é padrão e não pode ser removida.');
      return;
    }
    if (confirm(`Deseja realmente remover a categoria "${cat}"?`)) {
      deleteCategory(cat);
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px' }}>Ajustes & Configurações</h3>

      {/* Card Firebase */}
      <div className="card">
        <div className="flex-between" style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={22} color="var(--primary)" />
            <div>
              <div style={{ fontWeight: 800 }}>Banco de Dados Firebase</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isConnected ? 'Conectado à nuvem' : 'Modo Armazenamento Local'}
              </div>
            </div>
          </div>
          <span className={`badge ${isConnected ? 'badge-success' : 'badge-warning'}`}>
            {isConnected ? 'Online' : 'Offline'}
          </span>
        </div>

        <button className="btn btn-outline btn-full" onClick={() => setIsFirebaseModalOpen(true)}>
          Configurar Firebase Firestore
        </button>
      </div>

      {/* Card Gerenciar Categorias */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Tag size={22} color="var(--primary)" />
          <div>
            <div style={{ fontWeight: 800 }}>Gerenciar Categorias</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Adicione ou remova categorias do catálogo.
            </div>
          </div>
        </div>

        {/* Formulário de Adicionar Categoria */}
        <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '14px', marginBottom: 0 }}
            placeholder="Nova categoria..."
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 14px' }}>
            <Plus size={20} />
          </button>
        </form>

        {/* Lista de Categorias com Rolagem */}
        <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '6px' }}>
          {categories.map(cat => (
            <div key={cat} className="flex-between" style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: cat === 'Geral' ? 800 : 500 }}>{cat}</span>
              {cat !== 'Geral' && (
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat)}
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Card Dados Locais */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <RefreshCw size={22} color="var(--warning)" />
          <div>
            <div style={{ fontWeight: 800 }}>Restaurar Dados Demo</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Reinicia os produtos de teste (Coca-Cola, Salgado, Água).
            </div>
          </div>
        </div>
        <button className="btn btn-outline btn-full" onClick={handleResetData}>
          Restaurar Produtos de Teste
        </button>
      </div>

      {/* Info do Sistema */}
      <div className="card" style={{ background: 'var(--bg-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 800 }}>
          <Smartphone size={18} color="var(--primary)" />
          <span>Sistema Otimizado para Celular</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Este aplicativo pode ser instalado na tela inicial do celular como um PWA.
          Compatível com leitores de código de barras USB/Bluetooth e câmera nativa.
        </p>
      </div>

      <FirebaseConfigModal 
        isOpen={isFirebaseModalOpen} 
        onClose={() => setIsFirebaseModalOpen(false)} 
      />
    </div>
  );
};
