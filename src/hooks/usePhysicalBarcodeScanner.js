import { useEffect, useRef } from 'react';

/**
 * Hook para detectar leitura de leitor de código de barras físico (HID keyboard emulation).
 * Leitores físicos digitam os caracteres rapidamente (em poucos milissegundos) e enviam 'Enter'.
 */
export const usePhysicalBarcodeScanner = (onScan) => {
  const bufferRef = useRef('');
  const lastKeyTimeRef = useRef(Date.now());

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignora se estiver digitando em um input de texto normal (exceto se for scanner rápido)
      const targetTag = e.target.tagName.toLowerCase();
      
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      // Se passou muito tempo entre teclas, limpa o buffer (digitação humana normal é mais lenta)
      if (timeDiff > 80) {
        bufferRef.current = '';
      }

      if (e.key === 'Enter') {
        if (bufferRef.current.length >= 3) { // Código válido geralmente tem 3+ caracteres
          onScan(bufferRef.current);
          bufferRef.current = '';
          e.preventDefault();
        }
      } else if (e.key.length === 1) { // Apenas caracteres imprimíveis
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onScan]);
};
