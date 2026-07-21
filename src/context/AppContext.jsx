import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, isConnected } from '../firebase/config';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy 
} from 'firebase/firestore';

const AppContext = createContext();

const INITIAL_DEMO_PRODUCTS = [
  {
    id: 'demo-1',
    name: 'Refrigerante Coca-Cola 350ml',
    barcode: '7894900011517',
    price: 5.00,
    costPrice: 3.20,
    stock: 24,
    minStock: 5,
    category: 'Bebidas'
  },
  {
    id: 'demo-2',
    name: 'Salgado Assado de Frango',
    barcode: '7891234567890',
    price: 7.50,
    costPrice: 4.00,
    stock: 12,
    minStock: 5,
    category: 'Alimentos'
  },
  {
    id: 'demo-3',
    name: 'Água Mineral Sem Gás 500ml',
    barcode: '7898000000010',
    price: 3.00,
    costPrice: 1.20,
    stock: 3,
    minStock: 10,
    category: 'Bebidas'
  }
];

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sales'); // sales, inventory, history, settings
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerCallback, setScannerCallback] = useState(null); // Callback when barcode scanned

  // Carregar Produtos e Vendas (do Firestore ou LocalStorage)
  useEffect(() => {
    if (isConnected && db) {
      // Usando Firebase Firestore
      const productsQuery = query(collection(db, 'products'), orderBy('name'));
      const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
        const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(prods);
        setLoading(false);
      }, (error) => {
        console.error('Erro ao ler produtos do Firestore:', error);
        loadFromLocalStorage();
      });

      const salesQuery = query(collection(db, 'sales'), orderBy('timestamp', 'desc'));
      const unsubscribeSales = onSnapshot(salesQuery, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSales(list);
      }, (error) => {
        console.error('Erro ao ler vendas do Firestore:', error);
      });

      return () => {
        unsubscribeProducts();
        unsubscribeSales();
      };
    } else {
      // Usando LocalStorage Fallback
      loadFromLocalStorage();
    }
  }, []);

  const loadFromLocalStorage = () => {
    try {
      const localProds = localStorage.getItem('dniz_products');
      if (localProds) {
        setProducts(JSON.parse(localProds));
      } else {
        setProducts(INITIAL_DEMO_PRODUCTS);
        localStorage.setItem('dniz_products', JSON.stringify(INITIAL_DEMO_PRODUCTS));
      }

      const localSales = localStorage.getItem('dniz_sales');
      if (localSales) {
        setSales(JSON.parse(localSales));
      } else {
        setSales([]);
      }
    } catch (e) {
      console.error('Erro no localStorage', e);
      setProducts(INITIAL_DEMO_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const saveProductsLocal = (newProds) => {
    setProducts(newProds);
    localStorage.setItem('dniz_products', JSON.stringify(newProds));
  };

  const saveSalesLocal = (newSales) => {
    setSales(newSales);
    localStorage.setItem('dniz_sales', JSON.stringify(newSales));
  };

  // Funções CRUD de Produtos
  const addProduct = async (productData) => {
    const formatted = {
      name: productData.name.trim(),
      barcode: productData.barcode.trim(),
      price: parseFloat(productData.price) || 0,
      costPrice: parseFloat(productData.costPrice) || 0,
      stock: parseInt(productData.stock, 10) || 0,
      minStock: parseInt(productData.minStock, 10) || 5,
      category: productData.category || 'Geral',
      updatedAt: new Date().toISOString()
    };

    if (isConnected && db) {
      await addDoc(collection(db, 'products'), {
        ...formatted,
        createdAt: serverTimestamp()
      });
    } else {
      const newProd = { id: 'prod-' + Date.now(), ...formatted };
      const updated = [...products, newProd];
      saveProductsLocal(updated);
    }
  };

  const updateProduct = async (id, productData) => {
    const formatted = {
      name: productData.name.trim(),
      barcode: productData.barcode.trim(),
      price: parseFloat(productData.price) || 0,
      costPrice: parseFloat(productData.costPrice) || 0,
      stock: parseInt(productData.stock, 10) || 0,
      minStock: parseInt(productData.minStock, 10) || 5,
      category: productData.category || 'Geral',
      updatedAt: new Date().toISOString()
    };

    if (isConnected && db) {
      const ref = doc(db, 'products', id);
      await updateDoc(ref, formatted);
    } else {
      const updated = products.map(p => p.id === id ? { ...p, ...formatted } : p);
      saveProductsLocal(updated);
    }
  };

  const deleteProduct = async (id) => {
    if (isConnected && db) {
      const ref = doc(db, 'products', id);
      await deleteDoc(ref);
    } else {
      const updated = products.filter(p => p.id !== id);
      saveProductsLocal(updated);
    }
  };

  // Funções de Carrinho & Venda
  const addToCart = (product) => {
    if (product.stock <= 0) return false;

    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prevCart; // Limite de estoque
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
    return true;
  };

  const updateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.product.id === productId) {
          const qty = Math.min(newQty, item.product.stock);
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  const completeSale = async (paymentMethod = 'Dinheiro', discount = 0) => {
    if (cart.length === 0) return false;

    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const total = Math.max(0, subtotal - discount);

    const saleRecord = {
      items: cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        barcode: item.product.barcode,
        price: item.product.price,
        costPrice: item.product.costPrice || 0,
        quantity: item.quantity
      })),
      subtotal,
      discount,
      total,
      paymentMethod,
      timestamp: new Date().toISOString()
    };

    // Dar baixa no estoque de cada produto
    for (const item of cart) {
      const newStock = Math.max(0, item.product.stock - item.quantity);
      await updateProduct(item.product.id, {
        ...item.product,
        stock: newStock
      });
    }

    // Registrar venda
    if (isConnected && db) {
      await addDoc(collection(db, 'sales'), {
        ...saleRecord,
        createdAt: serverTimestamp()
      });
    } else {
      const newSale = { id: 'sale-' + Date.now(), ...saleRecord };
      const updatedSales = [newSale, ...sales];
      saveSalesLocal(updatedSales);
    }

    clearCart();
    return true;
  };

  // Função para acionar o scanner de código de barras
  const openScanner = (onScanCallback) => {
    setScannerCallback(() => onScanCallback);
    setIsScannerOpen(true);
  };

  const closeScanner = () => {
    setIsScannerOpen(false);
    setScannerCallback(null);
  };

  const handleBarcodeScanned = (code) => {
    if (scannerCallback) {
      scannerCallback(code);
    } else {
      // Se chamado direto da tela de vendas, busca o produto correspondente
      const found = products.find(p => p.barcode === code);
      if (found) {
        addToCart(found);
      }
    }
    closeScanner();
  };

  return (
    <AppContext.Provider value={{
      products,
      sales,
      cart,
      loading,
      activeTab,
      setActiveTab,
      isScannerOpen,
      isConnected,
      addProduct,
      updateProduct,
      deleteProduct,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      completeSale,
      openScanner,
      closeScanner,
      handleBarcodeScanned
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
