import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Star,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/context/CartContext";
import { useProduct } from "@/context/ProductContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  const { t, language } = useLanguage();

  const {
    selectedSize,
    quantity,
    setSelectedSize,
    setQuantity,
    resetProductState,
  } = useProduct();

  const product = products.find((p) => p.id === id);

  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (product) {
      console.log(`[ProductDetailPage] Effect triggered - Resetting product state for product: ${product.id}`);
      resetProductState();
      setShowError(false);
    }
  }, [id, resetProductState]);

  console.log(`[ProductDetailPage] Render - Product: ${product?.name}, SelectedSize: "${selectedSize}"`);

  const handleAddToCart = () => {
    console.log(`[ProductDetailPage] handleAddToCart triggered. Current selectedSize: "${selectedSize}"`);
    if (!selectedSize) {
      setShowError(true);
      toast({
        title: t('product.selectSize'),
        description: t('product.selectSizeDesc'),
        variant: "destructive",
      });
      return;
    }

    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: selectedSize,
        quantity: quantity,
      });

      toast({
        title: t('product.added'),
        description: `${product.name} (${selectedSize}) x ${quantity} ${t('product.added')}`,
        action: (
          <Button variant="outline" onClick={() => navigate("/cart")}>
            {t('product.viewCart')}
          </Button>
        ),
      });
    }
  };

  return (
    <Layout>
      {product ? (
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product image - Updated styling for consistent display */}
            <div className="rounded-lg overflow-hidden flex items-center justify-center">
              <div className="w-full h-[500px] flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>

            {/* Product info */}
            <div>
              <h1 className="text-3xl font-bold">
                {language === 'ar' && product.nameAr ? product.nameAr : product.name}
              </h1>
              <div className="flex items-center mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-500">(42 {t('product.reviews')})</span>
              </div>

              <div className="mt-4">
                <span className="text-2xl font-bold">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium">{t('product.description')}</h3>
                <p className="mt-2 text-gray-600">
                  {language === 'ar' && product.descriptionAr ? product.descriptionAr : product.description}
                </p>
              </div>

              {/* Size selection */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">{t('product.size')}</h3>
                  {showError && (
                    <span className="text-red-500 text-xs flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {t('product.selectSize')}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      type="button"
                      data-size={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      className={`relative ${selectedSize === size
                        ? "ring-2 ring-offset-2 ring-blue-500"
                        : ""
                        }`}
                      onClick={() => {
                        setSelectedSize(size);
                        setShowError(false);
                      }}
                    >
                      {size}
                      {selectedSize === size && (
                        <Check className="h-3 w-3 absolute top-1 right-1" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quantity selector */}
              <div className="mt-6">
                <h3 className="text-sm font-medium">{t('product.quantity')}</h3>
                <div className="flex items-center mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-12 mx-2 text-center border rounded-md"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add to cart button */}
              <div className="mt-8 flex space-x-4">
                <Button
                  className="flex-1"
                  data-action="add-to-cart"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {t('product.addToCart')}
                </Button>
                <Button variant="outline">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold">{t('product.notFound')}</h2>
          <Button className="mt-4" onClick={() => navigate("/products")}>
            {t('product.back')}
          </Button>
        </div>
      )}
    </Layout>
  );
};

export default ProductDetailPage;
