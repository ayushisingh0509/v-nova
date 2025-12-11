import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { BadgeCheck, ArrowRight, Home } from "lucide-react";
import { useUserInfo } from "@/hooks/useUserInfo";

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const { getUserInfo } = useUserInfo();
  const userInfo = getUserInfo();
  const orderNumber = "ORD" + Math.floor(100000 + Math.random() * 900000);

  useEffect(() => {
    // Scroll to top when the component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-2xl mx-auto text-center opacity-100 transition-opacity duration-500">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-4">
              <BadgeCheck className="h-16 w-16 text-green-600" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Your order is confirmed!
          </h1>

          <p className="text-lg text-gray-600 mb-6">
            Thank you for your purchase. We've received your order and will
            begin processing it right away.
          </p>

          <div className="bg-background border rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Order Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-4">
              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="font-medium">{orderNumber}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">
                  {userInfo.email || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium">
                  {userInfo.cardNumber ? "Credit Card" : "Not specified"}
                </p>
              </div>
            </div>

            <div className="text-left">
              <p className="text-sm text-gray-500 mb-1">Shipping Address</p>
              <p className="font-medium">{userInfo.name || "Not provided"}</p>
              <p className="text-gray-700">
                {userInfo.address || "Address not provided"}
              </p>
              <p className="text-gray-700">
                {userInfo.phone ? `Phone: ${userInfo.phone}` : ""}
              </p>
            </div>

            {userInfo.cardNumber && (
              <div className="text-left mt-4 border-t pt-4">
                <p className="text-sm text-gray-500 mb-1">Payment Details</p>
                <p className="font-medium">
                  Card ending in {userInfo.cardNumber.slice(-4)}
                </p>
                {userInfo.cardName && (
                  <p className="text-gray-700">
                    Name on card: {userInfo.cardName}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              You will receive a confirmation email with your order details and
              tracking information once your order ships.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Button
                onClick={() => navigate("/products/all")}
                className="flex gap-2 items-center"
              >
                Continue Shopping
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="flex gap-2 items-center"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConfirmationPage;
