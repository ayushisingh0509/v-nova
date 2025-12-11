import React, { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

export const VoiceAssistant = () => {
  const [isActive, setIsActive] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const location = useLocation();

  const toggleActive = () => {
    setIsActive(!isActive);
    setShowHint(false);
  };

  useEffect(() => {
    // Show hint after 3 seconds on new page
    const timer = setTimeout(() => {
      setShowHint(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const getHintForPath = () => {
    const path = location.pathname;

    if (path === "/" || path === "/intro") {
      return "Say 'Hey Voix Nova'";
    } else if (path === "/categories") {
      return "Try saying 'I'm joining gym and searching for new clothes'";
    } else if (path.includes("/products")) {
      return "Ask me about product recommendations";
    } else if (path.includes("/product")) {
      return "Ask about this product's features";
    } else if (path === "/cart") {
      return "Say 'Checkout' to proceed to payment";
    } else if (path === "/payment") {
      return "Say 'Complete my order' to finish";
    } else if (path === "/confirmation") {
      return "Ask about your order status";
    }

    return "How can I help you today?";
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {showHint && !isActive && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-16 left-0 bg-gradient-to-r from-indigo-500/90 via-purple-500/90 to-pink-500/90 p-3 rounded-lg text-white text-sm max-w-52 backdrop-blur-sm shadow-xl border border-white/20"
          >
            <div className="absolute -bottom-2 left-4 w-4 h-4 bg-purple-500 rotate-45" />
            {getHintForPath()}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className={cn(
          "flex items-center justify-center rounded-full w-14 h-14 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg",
          isActive ? "shadow-xl ring-2 ring-white/30" : "shadow-md",
          "transition-all duration-300"
        )}
        onClick={toggleActive}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isActive ? (
            <motion.div
              key="active"
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative h-6 w-12 flex items-center justify-center">
                {[...Array(5)].map((_, index) => (
                  <motion.div
                    key={index}
                    className="bg-white w-1.5 mx-0.5 rounded-full"
                    animate={{
                      height: [5, 15, 5],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: index * 0.1,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(255, 255, 255, 0.7)",
                    "0 0 0 10px rgba(255, 255, 255, 0)",
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="inactive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <Mic size={24} />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white/50"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 0.3, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
