import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import IntroPage from "./pages/IntroPage";
import CategorySelectionPage from "./pages/CategorySelectionPage";
import ProductListingPage from "./pages/ProductListingPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import PaymentPage from "./pages/PaymentPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import NotFound from "./pages/NotFound";
import { VoiceAssistant } from "./components/VoiceAssistant";
import { VapiAssistant } from "./components/VapiAssistant";
import { CartProvider } from "./context/CartContext";
import { VoiceListener } from "./components/VoiceListener";
import { FilterProvider } from "./context/FilterContext";
import { ProductProvider } from "./context/ProductContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <FilterProvider>
        <ProductProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<IntroPage />} />
                <Route path="/categories" element={<CategorySelectionPage />} />
                <Route
                  path="/products/:category"
                  element={<ProductListingPage />}
                />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/confirmation" element={<ConfirmationPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <VoiceListener />
              {/*<VoiceAssistant /> */}
              <VapiAssistant />
            </BrowserRouter>
          </TooltipProvider>
        </ProductProvider>
      </FilterProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
