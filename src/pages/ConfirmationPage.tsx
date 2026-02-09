import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { BadgeCheck, ArrowRight, Home } from "lucide-react";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useLanguage } from "@/context/LanguageContext";


const ConfirmationPage = () => {
  const navigate = useNavigate();
  const { getUserInfo } = useUserInfo();
  const { t } = useLanguage();
  const userInfo = getUserInfo();
  const orderNumber = React.useMemo(() => "ORD" + Math.floor(100000 + Math.random() * 900000), []);

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
            {t('confirm.title')}
          </h1>

          <p className="text-lg text-gray-600 mb-6">
            {t('confirm.subtitle')}
          </p>

          <div className="bg-background border rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">{t('confirm.orderInfo')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-4">
              <div>
                <p className="text-sm text-gray-500">{t('confirm.orderNum')}</p>
                <p className="font-medium">{orderNumber}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">{t('confirm.date')}</p>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">{t('confirm.email')}</p>
                <p className="font-medium">
                  {userInfo.email || t('confirm.notProvided')}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">{t('confirm.paymentMethod')}</p>
                <p className="font-medium">
                  {userInfo.cardNumber ? t('confirm.creditCard') : t('confirm.notSpecified')}
                </p>
              </div>
            </div>

            <div className="text-left">
              <p className="text-sm text-gray-500 mb-1">{t('confirm.shippingAddress')}</p>
              <p className="font-medium">{userInfo.name || t('confirm.notProvided')}</p>
              <p className="text-gray-700">
                {userInfo.address || t('confirm.addressNotProvided')}
              </p>
              <p className="text-gray-700">
                {userInfo.phone ? `${t('payment.phone')}: ${userInfo.phone}` : ""}
              </p>
            </div>

            {userInfo.cardNumber && (
              <div className="text-left mt-4 border-t pt-4">
                <p className="text-sm text-gray-500 mb-1">{t('confirm.paymentDetails')}</p>
                <p className="font-medium">
                  {t('confirm.cardEnding')} {userInfo.cardNumber.slice(-4)}
                </p>
                {userInfo.cardName && (
                  <p className="text-gray-700">
                    {t('confirm.nameOnCard')}: {userInfo.cardName}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              {t('confirm.emailNote')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Button
                onClick={() => navigate("/products/all")}
                className="flex gap-2 items-center"
              >
                {t('cart.continue')}
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="flex gap-2 items-center"
              >
                <Home className="h-4 w-4" />
                {t('confirm.backHome')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConfirmationPage;