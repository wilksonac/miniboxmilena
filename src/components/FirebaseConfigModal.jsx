import React, { useState } from 'react';
import { X, Save, Database, AlertCircle, Trash2 } from 'lucide-react';
import { getSavedFirebaseConfig, saveFirebaseConfig, removeFirebaseConfig, isConnected } from '../firebase/config';

export const FirebaseConfigModal = ({ isOpen, onClose }) => {
  const currentConfig = getSavedFirebaseConfig() || {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  };

  const [config, setConfig] = useState(currentConfig);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!config.apiKey || !config.projectId) {
      alert('Preencha ao menos a apiKey e o projectId do Firebase.');
      return;
    }
    saveFirebaseConfig(config);
    onClose();
  };

  const handleDisconnect = () => {
    if (confirm('Deseja desconectar do Firebase e usar apenas o banco local?')) {
      removeFirebaseConfig();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Configuração do Firebase</h3>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'var(--bg-subtle)', border: 'none', padding: '6px', borderRadius: '50%', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ background: isConnected ? 'var(--success-light)' : 'var(--warning-light)', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '0.85rem' }}>
          <p style={{ fontWeight: 700, color: isConnected ? 'var(--success)' : 'var(--warning)' }}>
            Status: {isConnected ? 'Conectado ao Firebase Firestore' : 'Modo Armazenamento Local (Offline)'}
          </p>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
            Cole aqui a chave de configuração fornecida no Console do Firebase para sincronizar dados em tempo real.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>API Key *</label>
            <input 
              type="text" 
              className="form-input" 
              style={{ paddingLeft: '12px' }}
              value={config.apiKey} 
              onChange={e => setConfig({...config, apiKey: e.target.value})} 
              placeholder="AIzaSy..." 
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Project ID *</label>
            <input 
              type="text" 
              className="form-input" 
              style={{ paddingLeft: '12px' }}
              value={config.projectId} 
              onChange={e => setConfig({...config, projectId: e.target.value})} 
              placeholder="meu-projeto-id" 
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Auth Domain</label>
            <input 
              type="text" 
              className="form-input" 
              style={{ paddingLeft: '12px' }}
              value={config.authDomain} 
              onChange={e => setConfig({...config, authDomain: e.target.value})} 
              placeholder="meu-projeto.firebaseapp.com" 
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>App ID</label>
            <input 
              type="text" 
              className="form-input" 
              style={{ paddingLeft: '12px' }}
              value={config.appId} 
              onChange={e => setConfig({...config, appId: e.target.value})} 
              placeholder="1:123456789:web:abcdef" 
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            {isConnected && (
              <button type="button" className="btn btn-danger" onClick={handleDisconnect}>
                <Trash2 size={16} />
              </button>
            )}
            <button type="submit" className="btn btn-primary btn-full">
              <Save size={18} />
              Salvar Conexão
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
