import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { ArrowRight, Sparkles, ShoppingBag, Mic } from "lucide-react";
import { motion } from "framer-motion";

const IntroPage = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] },
    },
  };

  return (
    <Layout showHeader={false}>
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-black to-indigo-950 z-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-purple-600 rounded-full filter blur-[150px]" />
            <div className="absolute bottom-[20%] right-[5%] w-80 h-80 bg-indigo-700 rounded-full filter blur-[150px]" />
            <div className="absolute top-[60%] left-[30%] w-80 h-80 bg-pink-600 rounded-full filter blur-[180px]" />
          </div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptMC01aDR2MWgtNHYtMXptMC01aDR2MWgtNHYtMXpNMTAgNGg0djFoLTR2LTF6bTAtM2g0djFoLTR2LTF6bTUgMGg0djFoLTR2LTF6bTUgMGg0djFoLTR2LTF6bTUgMGg0djFoLTR2LTF6bTUgMGg0djFoLTR2LTF6bTUgMGg0djFoLTR2LTF6bTUgMGg0djFoLTR2LTF6bTUgMGg0djFoLTR2LTF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30 z-0"></div>

        <div className="container mx-auto px-4 py-8 md:py-20 relative z-10 flex flex-col items-center justify-center min-h-screen">
          <motion.div
            variants={container}
            initial="hidden"
            animate={loaded ? "show" : "hidden"}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Logo */}
            <motion.div variants={item} className="mb-8 inline-block">
              <div className="relative">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl transform -rotate-6">
                  <div className="w-20 h-20 bg-black rounded-xl flex items-center justify-center">
                    <Mic className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="absolute -right-2 -top-2 bg-white rounded-full p-1.5 shadow-lg">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                </div>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={item}
              className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-pink-100"
            >
              VOIX NOVA
            </motion.h1>

            <motion.div
              variants={item}
              className="flex items-center justify-center gap-1.5 mb-8"
            >
              <div className="h-0.5 w-12 bg-gradient-to-r from-purple-500 to-transparent rounded"></div>
              <p className="text-lg md:text-xl text-purple-200 tracking-wider uppercase font-light">
                AI Shopping Assistant
              </p>
              <div className="h-0.5 w-12 bg-gradient-to-l from-purple-500 to-transparent rounded"></div>
            </motion.div>

            {/* Description */}
            <motion.p
              variants={item}
              className="text-lg md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Your personal AI-powered shopping companion that helps you find
              the perfect fitness gear with voice commands.
            </motion.p>

            {/* AI Assistant Circle */}
            <motion.div variants={item} className="mb-12 relative">
              <div className="relative">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 mx-auto flex items-center justify-center shadow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/10"></div>
                  <div className="relative z-10 text-center">
                    <div className="flex flex-col items-center">
                      <div className="flex space-x-0.5">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="bg-white w-1 rounded-full"
                            animate={{
                              height: [4, 12, 4],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: i * 0.2,
                              ease: "easeInOut",
                            }}
                          />
                        ))}
                      </div>
                      <div className="mt-2 text-white text-xs font-bold uppercase tracking-wider">
                        Active
                      </div>
                    </div>
                  </div>
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(176, 132, 255, 0.5)",
                      "0 0 0 15px rgba(176, 132, 255, 0)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                />
              </div>
              <div className="mt-5 text-center">
                <p className="text-gray-300 italic">
                  "Hi there! I'm Voix Nova, your personal shopping assistant."
                </p>
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              variants={item}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
              {[
                {
                  title: "Voice Shopping",
                  description: "Find products using natural voice commands",
                  icon: <Mic className="w-6 h-6" />,
                },
                {
                  title: "Smart Recommendations",
                  description: "Get personalized product suggestions",
                  icon: <Sparkles className="w-6 h-6" />,
                },
                {
                  title: "Seamless Experience",
                  description: "Shop hands-free from browsing to checkout",
                  icon: <ShoppingBag className="w-6 h-6" />,
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-4 mx-auto">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-sm">{feature.description}</p>
                </div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div variants={item} className="space-y-6">
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-6 px-8 rounded-full text-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => navigate("/categories")}
              >
                Get Started <ArrowRight className="ml-2" size={18} />
              </Button>

              <p className="text-sm text-gray-400">
                Use the voice assistant at the bottom left to navigate by voice
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default IntroPage;
