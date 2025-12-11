import React from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

const CategorySelectionPage = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: "yoga",
      name: "Yoga",
      image:
        "https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      description: "Find your zen with our premium yoga collection",
    },
    {
      id: "jogging",
      name: "Jogging + Running + Walking",
      image:
        "data:image/jpeg;base64,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",
      description: "Gear designed for comfort and performance on every run",
    },
    {
      id: "gym",
      name: "Gym",
      image:
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      description: "Power your workouts with our gym essentials",
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          What are you shopping for today?
        </h1>
        <p className="text-lg text-gray-600 mb-12 text-center">
          Select a category to explore our curated collection
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
