import React from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

import { useLanguage } from '@/context/LanguageContext';

const CategorySelectionPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const categories = [
    {
      id: "yoga",
      name: t('category.yoga'),
      image:
        "https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      description: t('category.yoga.desc'),
    },
    {
      id: "jogging",
      name: t('category.jogging'),
      image: "https://www.shape.com/thmb/XhaeY6hfYXOUEmpvxZKjOi_-H5A=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/running-longer-or-faster-31e97070bda14ffc8afdea52094504c7.jpg",
      description: t('category.jogging.desc'),
    },
    {
      id: "gym",
      name: t('category.gym'),
      image:
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      description: t('category.gym.desc'),
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {t('category.title')}
        </h1>
        <p className="text-lg text-gray-600 mb-12 text-center">
          {t('category.subtitle')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              className="relative overflow-hidden rounded-2xl shadow-lg group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => navigate(`/products/${category.id}`)}
            >
              <div className="relative h-80 sm:h-96">
                <div className="absolute inset-0">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 p-6 text-white z-10">
                  <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                  <p className="text-sm text-white/80">
                    {category.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default CategorySelectionPage;
