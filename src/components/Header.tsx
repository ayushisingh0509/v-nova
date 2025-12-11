
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
  transparent?: boolean;
}

export const Header = ({ transparent = false }: HeaderProps) => {
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <header className={cn(
      "sticky top-0 z-30 w-full transition-all duration-300",
      transparent ? "bg-transparent" : "bg-background/80 backdrop-blur-md border-b"
    )}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl">
          <span className="bg-gradient-to-r from-purple-600 to-electric-blue-600 bg-clip-text text-transparent">
            VoiceShop
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link to="/categories" className="text-sm font-medium hover:text-primary transition-colors">
            Shop
          </Link>
          <Link to="/products/all" className="text-sm font-medium hover:text-primary transition-colors">
            All Products
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <User size={18} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => navigate('/cart')}
          >
            <ShoppingCart size={18} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs text-white">
                {totalItems}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
};
