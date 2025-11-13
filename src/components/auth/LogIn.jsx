import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const LogIn = ({ onSwitchToSignup }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        toast.success(`Welcome back, ${result.user.name}! 👋`);
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        // Display the actual error message from backend
        const errorMessage = result.error || 'Invalid email or password';
        toast.error(errorMessage);
        setErrors(prev => ({
          ...prev,
          email: errorMessage.includes('email') || errorMessage.includes('password') 
            ? errorMessage 
            : 'Invalid email or password',
          password: errorMessage.includes('password') ? errorMessage : ''
        }));
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
      {/* Username/Email */}
      <div>
        <label className="block text-xs md:text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">USERNAME</label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Username"
          className={`bg-gray-100 border-0 rounded-lg h-12 md:h-10 text-base md:text-sm px-4 ${errors.email ? 'border-red-500' : ''}`}
        />
        {errors.email && (
          <p className="mt-1.5 text-xs md:text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs md:text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">PASSWORD</label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className={`bg-gray-100 border-0 rounded-lg h-12 md:h-10 text-base md:text-sm px-4 pr-12 ${errors.password ? 'border-red-500' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-700 active:text-gray-800 p-2 -mr-2 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 text-xs md:text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.password}
          </p>
        )}
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between text-sm pt-1">
        <label className="flex items-center gap-2 cursor-pointer touch-manipulation">
          <input 
            type="checkbox" 
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-5 h-5 md:w-4 md:h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500 touch-manipulation"
          />
          <span className="text-gray-700 text-sm md:text-sm">Remember Me</span>
        </label>
        <a href="#" className="text-gray-600 hover:text-gray-900 active:text-gray-800 font-medium text-sm md:text-sm touch-manipulation py-2 px-1">
          Forgot Password
        </a>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 active:from-pink-700 active:to-red-700 text-white py-3.5 md:py-3 font-semibold rounded-lg text-base md:text-base shadow-lg min-h-[48px] md:min-h-[44px] touch-manipulation mt-2"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
};

export default LogIn;
