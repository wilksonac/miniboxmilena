import React, { useState } from 'react';
import { Database, ShieldCheck, RefreshCw, Smartphone, Info, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FirebaseConfigModal } from '../components/FirebaseConfigModal';

export const SettingsView = () => {
  const { isConnected } = useApp();
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  const handleResetData = () => {
    if (confirm('Deseja restaurar os produtos de demonstração iniciais? Seus dados locais atuais serão sobrescritos.')) {
      localStorage.removeItem('dniz_products');
      localStorage.removeItem('dniz_sales');
      window.location.reload();
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
