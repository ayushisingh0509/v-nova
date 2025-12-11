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
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  // Use useCallback to prevent unnecessary re-renders
  const resetProductState = useCallback(() => {
    setSelectedSize("");
    setQuantity(1);
  }, []);

  // Use a more robust setQuantity function
  const handleSetQuantity = useCallback((newQuantity: number) => {
    // Ensure quantity is always a valid number and at least 1
    const validQuantity = Math.max(1, isNaN(newQuantity) ? 1 : newQuantity);
    setQuantity(validQuantity);
  }, []);

  return (
    <ProductContext.Provider 
      value={{ 
        selectedSize, 
        quantity, 
        setSelectedSize, 
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