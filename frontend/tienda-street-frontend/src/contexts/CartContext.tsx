import React, { createContext, useState, useEffect } from 'react';

export interface TallaStockInfo {
  id: number;
  talla: string;
  stock: number;
}

export interface CartItem {
  id: string;
  productId: string;
  nombre: string;
  precio: string;
  imagen: string | null;
  cantidad: number;
  talla: string;
  marca: string;
  tallaStockInfo: TallaStockInfo[];
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  updateTalla: (id: string, talla: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  // 1. Agregamos un estado para saber si ya leímos el localStorage
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar carrito del localStorage al montar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedItems = JSON.parse(savedCart);
        // Migrar items antiguos...
        const migratedItems = parsedItems.map((item: any) => {
          if (!item.productId) {
            const parts = item.id.split('-');
            const productId = parts.slice(0, -1).join('-');
            return {
              ...item,
              productId,
              tallaStockInfo: item.tallaStockInfo || [],
            };
          }
          return item;
        });
        setItems(migratedItems);
      } catch (e) {
        console.error('Error al cargar carrito:', e);
      }
    }
    // 2. Marcamos como inicializado una vez que terminamos de leer (haya datos o no)
    setIsInitialized(true);
  }, []);

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    // 3. IMPORTANTE: Si no está inicializado, NO guardamos nada.
    // Esto evita que el estado inicial [] sobrescriba tus datos guardados.
    if (!isInitialized) return;

    localStorage.setItem('cart', JSON.stringify(items));
  }, [items, isInitialized]); // Agregamos isInitialized a las dependencias

  const addToCart = (newItem: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.productId === newItem.productId && item.talla === newItem.talla
      );
      if (existingItem) {
        const maxStock =
          newItem.tallaStockInfo.find((ts) => ts.talla === newItem.talla)?.stock || 0;
        const newCantidad = Math.min(existingItem.cantidad + newItem.cantidad, maxStock);
        return prevItems.map((item) =>
          item.id === existingItem.id ? { ...item, cantidad: newCantidad } : item
        );
      }
      return [...prevItems, newItem];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const maxStock = item.tallaStockInfo.find((ts) => ts.talla === item.talla)?.stock || 0;
          const validCantidad = Math.min(cantidad, maxStock);
          return { ...item, cantidad: validCantidad };
        }
        return item;
      })
    );
  };

  const updateTalla = (id: string, talla: string) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const newStockDisponible =
            item.tallaStockInfo.find((ts) => ts.talla === talla)?.stock || 0;
          const newCantidad = Math.min(item.cantidad, newStockDisponible);
          return {
            ...item,
            talla,
            cantidad: newCantidad,
            id: `${item.productId}-${talla}`,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
  const totalPrice = items.reduce((sum, item) => sum + parseFloat(item.precio) * item.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateTalla,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
