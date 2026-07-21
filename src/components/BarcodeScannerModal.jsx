import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, Flashlight, RefreshCw, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BarcodeScannerModal = () => {
  const { isScannerOpen, closeScanner, handleBarcodeScanned } = useApp();
  const [errorMsg, setErrorMsg] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const html5QrcodeRef = useRef(null);
  const scannerContainerId = 'mobile-barcode-reader';

  useEffect(() => {
    if (!isScannerOpen) return;

    let scannerInstance = null;

    const startScanner = async () => {
      try {
        setErrorMsg('');
        const formatsToSupport = [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.QR_CODE
        ];

        scannerInstance = new Html5Qrcode(scannerContainerId, {
          formatsToSupport,
          verbose: false
        });
        html5QrcodeRef.current = scannerInstance;

        const config = {
          fps: 15,
          qrbox: { width: 250, height: 180 },
          aspectRatio: 1.0
        };

        await scannerInstance.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            // Sucesso na leitura
            if (navigator.vibrate) {
              navigator.vibrate(100);
            }
            handleBarcodeScanned(decodedText);
          },
          (errorMessage) => {
            // Ignora falhas de frame sem código
          }
        );
      } catch (err) {
        console.error('Erro ao iniciar câmera para barcode:', err);
        setErrorMsg('Não foi possível acessar a câmera. Verifique as permissões do seu navegador.');
      }
    };

    // Pequeno delay para garantir montagem do container no DOM
    const timer = setTimeout(() => {
      startScanner();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (html5QrcodeRef.current) {
        html5QrcodeRef.current.stop().then(() => {
          html5QrcodeRef.current.clear();
        }).catch(err => console.error('Erro ao parar scanner', err));
      }
    };
  }, [isScannerOpen]);

  const toggleFlashlight = async () => {
    if (html5QrcodeRef.current) {
      try {
        const capabilities = html5QrcodeRef.current.getRunningTrackCapabilities();
        if (capabilities.torch) {
          await html5QrcodeRef.current.applyVideoConstraints({
            advanced: [{ torch: !torchOn }]
          });
          setTorchOn(!torchOn);
        }
      } catch (e) {
        console.warn('Lanternanão suportada neste dispositivo', e);
      }
    }
  };

  if (!isScannerOpen) return null;

  return (
    <div className="scanner-overlay">
      <div className="scanner-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Camera size={22} color="#818cf8" />
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Escanear Código de Barras</span>
        </div>
        <button 
          onClick={closeScanner} 
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: '320px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div id={scannerContainerId} style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', background: '#000' }}></div>
        
        {errorMsg && (
          <div style={{ marginTop: '16px', background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <button className="btn btn-outline" onClick={toggleFlashlight} style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
          <Flashlight size={18} />
          {torchOn ? 'Desligar Lanterna' : 'Ligar Lanterna'}
        </button>
        <button className="btn btn-danger" onClick={closeScanner}>
          Cancelar
        </button>
      </div>
    </div>
  );
};
