import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { Button } from '../components/ui/button';
import LogIn from '../components/auth/LogIn';
import SignUp from '../components/auth/SignUp';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { categories: categoryList } = useProducts();
  const categories = categoryList ?? [];

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Minimal Top Bar - Mobile Optimized */}
      <div className="bg-white shadow-sm py-2 px-3 md:py-4 md:px-6">
        <div className="w-full mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="bg-orange-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-base md:text-lg hover:bg-orange-600 transition-colors flex items-center gap-1.5 md:gap-2 touch-manipulation"
            aria-label="Go to home"
          >
            <Home className="w-4 h-4 md:w-5 md:h-5" />
            <span>Halchash</span>
          </button>
        </div>
      </div>

      {/* Category Navigation Bar - Mobile Optimized */}
      <div className="bg-emerald-600 text-white">
        <div className="w-full mx-auto px-2 md:px-4">
          <div className="flex items-center space-x-1 md:space-x-1 py-2 overflow-x-auto scrollbar-hide -webkit-overflow-scrolling-touch">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/products')}
              className="text-white hover:bg-emerald-700 active:bg-emerald-800 text-xs md:text-sm px-3 md:px-4 py-2.5 md:py-2 rounded-none whitespace-nowrap min-h-[44px] touch-manipulation flex-shrink-0"
            >
              All Products
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                size="sm"
                onClick={() => handleCategoryClick(category.id)}
                className="text-white hover:bg-emerald-700 active:bg-emerald-800 text-xs md:text-sm px-3 md:px-4 py-2.5 md:py-2 rounded-none whitespace-nowrap min-h-[44px] touch-manipulation flex-shrink-0"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Mobile First Design */}
      <div className="flex-1 flex items-start md:items-center justify-center py-4 md:py-12 px-3 md:px-4">
        <div className="w-full max-w-md md:max-w-5xl">
          {/* Mobile: Single Column with Compact Switch */}
          <div className="block md:hidden">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Compact Welcome/Switch Section - Mobile Only */}
              <div className="bg-gradient-to-r from-pink-500 via-red-500 to-pink-600 text-white p-4 text-center">
                <AnimatePresence mode="wait">
                  {isLogin ? (
                    <motion.div
                      key="login-switch"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-2"
                    >
                      <p className="text-sm text-white/90">Don't have an account?</p>
                      <button
                        onClick={() => setIsLogin(false)}
                        className="px-6 py-2 border-2 border-white rounded-lg text-white text-sm font-semibold active:bg-white active:text-pink-600 transition-all min-h-[44px] touch-manipulation"
                      >
                        Sign Up
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="signup-switch"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-2"
                    >
                      <p className="text-sm text-white/90">Already have an account?</p>
                      <button
                        onClick={() => setIsLogin(true)}
                        className="px-6 py-2 border-2 border-white rounded-lg text-white text-sm font-semibold active:bg-white active:text-pink-600 transition-all min-h-[44px] touch-manipulation"
                      >
                        Sign In
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Form Section - Mobile */}
              <div className="p-5 md:p-8">
                <AnimatePresence mode="wait">
                  {isLogin ? (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="w-full"
                    >
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h2>
                      <LogIn onSwitchToSignup={() => setIsLogin(false)} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="signup"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="w-full"
                    >
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign Up</h2>
                      <SignUp onSwitchToLogin={() => setIsLogin(true)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Desktop: Two Column Layout */}
          <div className="hidden md:block">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-row h-[600px]">
              {/* Left Side - Form Section */}
              <div className="w-1/2 p-12 flex flex-col justify-center relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {isLogin ? (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.3 }}
                      className="w-full"
                    >
                      <h2 className="text-3xl font-bold text-gray-900 mb-8">Sign In</h2>
                      <LogIn onSwitchToSignup={() => setIsLogin(false)} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="signup"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.3 }}
                      className="w-full"
                    >
                      <h2 className="text-3xl font-bold text-gray-900 mb-8">Sign Up</h2>
                      <SignUp onSwitchToLogin={() => setIsLogin(true)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Side - Welcome Section */}
              <motion.div
                className="w-1/2 bg-gradient-to-br from-pink-500 via-red-500 to-pink-600 text-white p-12 flex flex-col justify-center items-center relative overflow-hidden"
                animate={{
                  background: isLogin 
                    ? 'linear-gradient(to bottom right, #ec4899, #ef4444, #ec4899)'
                    : 'linear-gradient(to bottom right, #ec4899, #ef4444, #ec4899)'
                }}
                transition={{ duration: 0.3 }}
              >
                <AnimatePresence mode="wait">
                  {isLogin ? (
                    <motion.div
                      key="login-welcome"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="text-center"
                    >
                      <h2 className="text-5xl font-bold mb-4">Welcome to login</h2>
                      <p className="text-xl mb-8 text-white/90">Don't have an account?</p>
                      <button
                        onClick={() => setIsLogin(false)}
                        className="px-8 py-3 border-2 border-white rounded-lg text-white font-semibold hover:bg-white hover:text-pink-600 transition-all duration-300"
                      >
                        Sign Up
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="signup-welcome"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="text-center"
                    >
                      <h2 className="text-5xl font-bold mb-4">Welcome to signup</h2>
                      <p className="text-xl mb-8 text-white/90">Already have an account?</p>
                      <button
                        onClick={() => setIsLogin(true)}
                        className="px-8 py-3 border-2 border-white rounded-lg text-white font-semibold hover:bg-white hover:text-pink-600 transition-all duration-300"
                      >
                        Sign In
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
