import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CreditCard,
  PaypalIcon,
  AppleIcon,
  GooglePayIcon,
} from "@/components/PaymentIcons";
import { ShoppingBag, ArrowRight, CheckCircle2 } from "lucide-react";
import { useUserInfo } from "@/hooks/useUserInfo";
import { toast } from "@/components/ui/use-toast";
import { useLanguage } from "@/context/LanguageContext";

const PaymentPage = () => {
  const { items, subtotal, clearCart, registerCheckoutHandler } = useCart();
  const navigate = useNavigate();
  const { getUserInfo, updateUserInfo } = useUserInfo();
  const { t } = useLanguage();

  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Listen for voice command updates
  useEffect(() => {
    const handleStorageChange = (event: Event) => {
      const updatedInfo = getUserInfo();
      console.log("[PaymentPage] Voice update received:", updatedInfo);

      setFormData((prev) => {
        const newData = {
          ...prev,
          name: updatedInfo.name || prev.name,
          email: updatedInfo.email || prev.email,
          address: updatedInfo.address || prev.address,
          phone: updatedInfo.phone || prev.phone,
          cardName: updatedInfo.cardName || prev.cardName,
          cardNumber: updatedInfo.cardNumber || prev.cardNumber,
          expiryDate: updatedInfo.expiryDate || prev.expiryDate,
          cvv: updatedInfo.cvv || prev.cvv,
        };
        console.log("[PaymentPage] Form data updated to:", newData);
        return newData;
      });

      // Clear any errors for updated fields
      setErrors({});

      // Handle custom event with detail
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        // Show toast notification
        toast({
          title: "Information Updated",
          description:
            customEvent.detail.message || "Your information has been updated",
          variant: "default",
        });

        // Highlight updated fields
        if (customEvent.detail.updatedFields) {
          setHighlightedFields(customEvent.detail.updatedFields);
          // Remove highlight after 3 seconds
          setTimeout(() => {
            setHighlightedFields([]);
          }, 3000);
        }
      }
    };

    window.addEventListener("userInfoUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("userInfoUpdated", handleStorageChange);
    };
  }, [getUserInfo]);

  const handleFormChange =
    (field: keyof typeof formData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setFormData((prev) => {
          const newData = { ...prev, [field]: newValue };
          updateUserInfo(newData);
          return newData;
        });
        // Clear error when user types
        if (errors[field]) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
          });
        }
      };

  // Function to determine if a field is highlighted
  const isFieldHighlighted = (fieldName: string) => {
    return highlightedFields.some((field) => field.includes(fieldName));
  };

  const shippingCost = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.07; // 7% tax
  const total = subtotal + shippingCost + tax;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation - must have at least 2 words
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else {
      const nameWords = formData.name.trim().split(/\s+/).filter(w => w.length >= 2);
      if (nameWords.length < 2) {
        newErrors.name = "Please enter your full name (first and last name)";
      }
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Address validation - must have at least 5 words
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    } else {
      const addressWords = formData.address.trim().split(/\s+/).filter(w => w.length > 0);
      if (addressWords.length < 5) {
        newErrors.address = "Please enter your complete address including street, city, state, and zip code";
      }
    }

    // Phone validation - must have at least 10 digits
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const phoneDigits = formData.phone.replace(/[^0-9]/g, "");
      if (phoneDigits.length < 10) {
        newErrors.phone = "Please enter a valid 10-digit phone number";
      }
    }

    // Credit card validation (only if credit card is selected)
    if (paymentMethod === "credit-card") {
      // Card name - must have at least 2 words
      if (!formData.cardName.trim()) {
        newErrors.cardName = "Card name is required";
      } else {
        const cardNameWords = formData.cardName.trim().split(/\s+/).filter(w => w.length >= 2);
        if (cardNameWords.length < 2) {
          newErrors.cardName = "Please enter the full name as it appears on your card";
        }
      }

      // Card number - must be 13-19 digits
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = "Card number is required";
      } else {
        const cardDigits = formData.cardNumber.replace(/[^0-9]/g, "");
        if (cardDigits.length < 13 || cardDigits.length > 19) {
          newErrors.cardNumber = "Please enter a valid card number (13-19 digits)";
        }
      }

      // Expiry date - must be in MM/YY format
      if (!formData.expiryDate.trim()) {
        newErrors.expiryDate = "Expiry date is required";
      } else {
        const expiryMatch = formData.expiryDate.match(/^(\d{1,2})\/(\d{2})$/);
        if (!expiryMatch) {
          newErrors.expiryDate = "Please enter expiry date in MM/YY format";
        } else {
          const month = parseInt(expiryMatch[1]);
          if (month < 1 || month > 12) {
            newErrors.expiryDate = "Please enter a valid month (01-12)";
          }
        }
      }

      // CVV - must be 3 or 4 digits
      if (!formData.cvv.trim()) {
        newErrors.cvv = "CVV is required";
      } else {
        const cvvDigits = formData.cvv.replace(/[^0-9]/g, "");
        if (cvvDigits.length < 3 || cvvDigits.length > 4) {
          newErrors.cvv = "CVV must be 3 or 4 digits";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      toast({
        title: t('payment.error.validate'),
        description: t('payment.error.fill'),
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      clearCart();
      navigate("/confirmation");
    }, 2000);
  };

  // Register checkout handler for voice commands
  useEffect(() => {
    registerCheckoutHandler(() => {
      console.log("Checkout triggered via CartContext!");
      handlePayment();
    });

    return () => {
      // Cleanup: unregister by passing empty function
      registerCheckoutHandler(() => { });
    };
  }, [formData, paymentMethod, registerCheckoutHandler]);


  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('payment.title')}</h1>
          <p className="text-gray-600">{t('payment.subtitle')}</p>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">{t('payment.shippingInfo')}</h2>

              <form className="space-y-4 mb-8">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('payment.name')}</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleFormChange("name")}
                    className={
                      errors.name
                        ? "ring-2 ring-red-500 focus:ring-red-500 border-red-500"
                        : isFieldHighlighted("name")
                          ? "ring-2 ring-green-500 focus:ring-green-500"
                          : ""
                    }
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                  {isFieldHighlighted("name") && (
                    <div className="text-green-600 text-xs mt-1 flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Updated by voice
                      command
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('payment.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={handleFormChange("email")}
                    className={
                      errors.email
                        ? "ring-2 ring-red-500 focus:ring-red-500 border-red-500"
                        : isFieldHighlighted("email")
                          ? "ring-2 ring-green-500 focus:ring-green-500"
                          : ""
                    }
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                  {isFieldHighlighted("email") && (
                    <div className="text-green-600 text-xs mt-1 flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Updated by voice
                      command
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{t('payment.address')}</Label>
                  <Input
                    id="address"
                    placeholder="123 Main St, San Francisco, CA 94103"
                    value={formData.address}
                    onChange={handleFormChange("address")}
                    className={
                      errors.address
                        ? "ring-2 ring-red-500 focus:ring-red-500 border-red-500"
                        : isFieldHighlighted("address")
                          ? "ring-2 ring-green-500 focus:ring-green-500"
                          : ""
                    }
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                  )}
                  {isFieldHighlighted("address") && (
                    <div className="text-green-600 text-xs mt-1 flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Updated by voice
                      command
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('payment.phone')}</Label>
                  <Input
                    id="phone"
                    placeholder="(123) 456-7890"
                    value={formData.phone}
                    onChange={handleFormChange("phone")}
                    className={
                      errors.phone
                        ? "ring-2 ring-red-500 focus:ring-red-500 border-red-500"
                        : isFieldHighlighted("phone")
                          ? "ring-2 ring-green-500 focus:ring-green-500"
                          : ""
                    }
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                  {isFieldHighlighted("phone") && (
                    <div className="text-green-600 text-xs mt-1 flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Updated by voice
                      command
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="save-info" />
                  <label
                    htmlFor="save-info"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {t('payment.saveInfo')}
                  </label>
                </div>
              </form>

              <Separator className="my-8" />

              <div className="payment-method-section">
                <h2 className="text-xl font-bold mb-4">{t('payment.method')}</h2>
                <Tabs
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="mb-8"
                >
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger
                      value="credit-card"
                      className="flex flex-col items-center py-3"
                    >
                      <CreditCard className="h-6 w-6 mb-1" />
                      <span className="text-xs">{t('payment.card')}</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="paypal"
                      className="flex flex-col items-center py-3"
                    >
                      <PaypalIcon className="h-6 w-6 mb-1" />
                      <span className="text-xs">PayPal</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="apple-pay"
                      className="flex flex-col items-center py-3"
                    >
                      <AppleIcon className="h-6 w-6 mb-1" />
                      <span className="text-xs">Apple Pay</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="google-pay"
                      className="flex flex-col items-center py-3"
                    >
                      <GooglePayIcon className="h-6 w-6 mb-1" />
                      <span className="text-xs">Google Pay</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="credit-card">
                    <form className="space-y-4" onSubmit={handlePayment}>
                      <div className="space-y-2">
                        <Label htmlFor="cardName">{t('payment.cardName')}</Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          value={formData.cardName}
                          onChange={handleFormChange("cardName")}
                          className={
                            errors.cardName
                              ? "ring-2 ring-red-500 focus:ring-red-500 border-red-500"
                              : isFieldHighlighted("card name")
                                ? "ring-2 ring-green-500 focus:ring-green-500"
                                : ""
                          }
                        />
                        {errors.cardName && (
                          <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>
                        )}
                        {isFieldHighlighted("card name") && (
                          <div className="text-green-600 text-xs mt-1 flex items-center">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Updated by
                            voice command
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">{t('payment.cardNumber')}</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={handleFormChange("cardNumber")}
                          className={
                            errors.cardNumber
                              ? "ring-2 ring-red-500 focus:ring-red-500 border-red-500"
                              : isFieldHighlighted("card number")
                                ? "ring-2 ring-green-500 focus:ring-green-500"
                                : ""
                          }
                        />
                        {errors.cardNumber && (
                          <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
                        )}
                        {isFieldHighlighted("card number") && (
                          <div className="text-green-600 text-xs mt-1 flex items-center">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Updated by
                            voice command
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">{t('payment.expiry')}</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={formData.expiryDate}
                            onChange={handleFormChange("expiryDate")}
                            className={
                              errors.expiryDate
                                ? "ring-2 ring-red-500 focus:ring-red-500 border-red-500"
                                : isFieldHighlighted("card expiry date")
                                  ? "ring-2 ring-green-500 focus:ring-green-500"
                                  : ""
                            }
                          />
                          {errors.expiryDate && (
                            <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
                          )}
                          {isFieldHighlighted("card expiry date") && (
                            <div className="text-green-600 text-xs mt-1 flex items-center">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Updated
                              by voice command
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cvv">{t('payment.cvv')}</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={handleFormChange("cvv")}
                            className={
                              errors.cvv
                                ? "ring-2 ring-red-500 focus:ring-red-500 border-red-500"
                                : isFieldHighlighted("CVV")
                                  ? "ring-2 ring-green-500 focus:ring-green-500"
                                  : ""
                            }
                          />
                          {errors.cvv && (
                            <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
                          )}
                          {isFieldHighlighted("CVV") && (
                            <div className="text-green-600 text-xs mt-1 flex items-center">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Updated
                              by voice command
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox id="save-card" />
                        <label
                          htmlFor="save-card"
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {t('payment.saveCard')}
                        </label>
                      </div>

                      <Button
                        type="submit"
                        className="w-full mt-4"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <span className="flex items-center">
                            {t('payment.processing')}
                          </span>
                        ) : (
                          <span className="flex items-center">
                            {t('payment.complete')}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </span>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="paypal">
                    <div className="text-center p-8 space-y-4">
                      <PaypalIcon className="h-16 w-16 mx-auto text-[#003087]" />
                      <p className="text-gray-600">
                        Click the button below to complete your purchase with
                        PayPal.
                      </p>
                      <Button
                        className="bg-[#0070ba] hover:bg-[#003087]"
                        onClick={handlePayment}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <span className="flex items-center">
                            {t('payment.processing')}
                          </span>
                        ) : (
                          `${t('payment.payWith')} PayPal`
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="apple-pay">
                    <div className="text-center p-8 space-y-4">
                      <AppleIcon className="h-16 w-16 mx-auto" />
                      <p className="text-gray-600">
                        Click the button below to complete your purchase with
                        Apple Pay.
                      </p>
                      <Button
                        className="bg-black hover:bg-gray-800"
                        onClick={handlePayment}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <span className="flex items-center">
                            {t('payment.processing')}
                          </span>
                        ) : (
                          `${t('payment.payWith')} Apple Pay`
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="google-pay">
                    <div className="text-center p-8 space-y-4">
                      <GooglePayIcon className="h-16 w-16 mx-auto" />
                      <p className="text-gray-600">
                        Click the button below to complete your purchase with
                        Google Pay.
                      </p>
                      <Button
                        className="bg-white text-black hover:bg-gray-100 border border-gray-300"
                        onClick={handlePayment}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <span className="flex items-center">
                            {t('payment.processing')}
                          </span>
                        ) : (
                          `${t('payment.payWith')} Google Pay`
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-lg border p-6 bg-background">
              <h2 className="text-lg font-bold mb-4 flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                {t('cart.summary')}
              </h2>

              <div className="mb-4 max-h-48 overflow-auto">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex py-2">
                    <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-gray-100 mr-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      {item.size && (
                        <p className="text-xs text-gray-500">
                          {t('cart.size')}: {item.size}
                        </p>
                      )}
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="mb-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cart.subtotal')}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cart.shipping')}</span>
                  <span>
                    {shippingCost === 0
                      ? t('cart.shipping.free')
                      : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cart.tax')}</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg">
                <span>{t('cart.total')}</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentPage;