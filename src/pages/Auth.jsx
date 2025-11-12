import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Facebook, Twitter } from 'lucide-react';
import LogIn from '../components/auth/LogIn';
import SignUp from '../components/auth/SignUp';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-5xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto md:h-[600px]">
          {/* Left Side - Form Section */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
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
                  
                  {/* Social Login Icons */}
                  <div className="flex gap-4 mb-6">
                    <button className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
                      <Facebook className="w-5 h-5 text-gray-700" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
                      <Twitter className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>

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
                  
                  {/* Social Login Icons */}
                  <div className="flex gap-4 mb-6">
                    <button className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
                      <Facebook className="w-5 h-5 text-gray-700" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
                      <Twitter className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>

                  <SignUp onSwitchToLogin={() => setIsLogin(true)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side - Welcome Section */}
          <motion.div
            className="w-full md:w-1/2 bg-gradient-to-br from-pink-500 via-red-500 to-pink-600 text-white p-8 md:p-12 flex flex-col justify-center items-center relative overflow-hidden"
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
                  <h2 className="text-4xl md:text-5xl font-bold mb-4">Welcome to login</h2>
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
                  <h2 className="text-4xl md:text-5xl font-bold mb-4">Welcome to signup</h2>
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
  );
};

export default Auth;
