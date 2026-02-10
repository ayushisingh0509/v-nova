import React, { createContext, useContext, useState, useCallback } from "react";

type ProductContextType = {
  selectedSize: string;
  quantity: number;
  setSelectedSize: (size: string) => void;
  setQuantity: (quantity: number) => void;
  resetProductState: () => void;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedSize, setSelectedSizeState] = useState<string>("");

  const setSelectedSize = useCallback((size: string) => {
    console.log(`[ProductContext] Setting selected size to: "${size}"`);
    setSelectedSizeState(size);
  }, []);
  const [quantity, setQuantity] = useState<number>(1);

  // Use useCallback to prevent unnecessary re-renders
  const resetProductState = useCallback(() => {
    console.log("[ProductContext] Resetting product state");
    setSelectedSize("");
    setQuantity(1);
  }, []);

  // Use a more robust setQuantity function
  const handleSetQuantity = useCallback((newQuantity: number) => {
    // Ensure quantity is always a valid number and at least 1
    const validQuantity = Math.max(1, isNaN(newQuantity) ? 1 : newQuantity);
    setQuantity(validQuantity);
  }, []);

  const handleSetSelectedSize = useCallback((size: string) => {
    console.log(`[ProductContext] Setting selected size to: "${size}"`);
    setSelectedSize(size);
  }, []);

  return (
    <ProductContext.Provider
      value={{
        selectedSize,
        quantity,
        setSelectedSize: handleSetSelectedSize,
        setQuantity: handleSetQuantity,
        resetProductState
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
};