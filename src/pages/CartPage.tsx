
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash2, ChevronUp, ChevronDown, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CartPage = () => {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();
  const navigate = useNavigate();
  
  const shippingCost = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.07; // 7% tax
  const total = subtotal + shippingCost + tax;
  
  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button onClick={() => navigate('/categories')}>
              Start Shopping
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
        <p className="text-gray-600 mb-8">{totalItems} items in your cart</p>
        
        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {items.map((item, index) => (
                <motion.div
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-24 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      
                      {item.size && (
                        <p className="text-sm text-gray-600">Size: {item.size}</p>
                      )}
                      
                      {item.color && (
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-600 mr-2">Color:</span>
                          <span 
                            className="w-4 h-4 rounded-full border" 
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                          <div className="w-10 h-8 flex items-center justify-center border-y">
                            {item.quantity}
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 px-2 text-gray-500 hover:text-red-500"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                  {index < items.length - 1 && <Separator className="mt-6" />}
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="sticky top-24 rounded-lg border p-6 bg-background"
            >
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>
                    {shippingCost === 0 
                      ? "Free" 
                      : `$${shippingCost.toFixed(2)}`
                    }
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                className="w-full mt-6"
                onClick={() => navigate('/payment')}
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/products/all')}
                >
                  Continue Shopping
                </Button>
              </div>
              
              <div className="mt-6 text-xs text-gray-500">
                <p>Free shipping on orders over $50.</p>
                <p className="mt-2">Taxes calculated at checkout.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
