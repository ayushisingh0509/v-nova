import React, { createContext, useState, useContext, ReactNode, useRef, useCallback } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  registerCheckoutHandler: (handler: () => void) => void;
  triggerCheckout: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cart_items");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse cart items", e);
        }
      }
    }
    return [];
  });

  // Checkout handler registration for voice commands
  const checkoutHandlerRef = useRef<(() => void) | null>(null);

  const registerCheckoutHandler = useCallback((handler: () => void) => {
    checkoutHandlerRef.current = handler;
  }, []);

  const triggerCheckout = useCallback(() => {
    if (checkoutHandlerRef.current) {
      checkoutHandlerRef.current();
    } else {
      console.warn("[CartContext] No checkout handler registered");
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem("cart_items", JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    console.log("[CartContext] addItem CALLED. Item:", item);
    console.log(`[CartContext] Adding size: "${item.size}"`);
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (i) => i.id === item.id && i.size === item.size && i.color === item.color
      );

      if (existingItemIndex > -1) {
        console.log("[CartContext] Updating existing item quantity");
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity
        };
        return updatedItems;
      } else {
        console.log("[CartContext] Adding new item to list");
        return [...prevItems, item];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    registerCheckoutHandler,
    triggerCheckout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
