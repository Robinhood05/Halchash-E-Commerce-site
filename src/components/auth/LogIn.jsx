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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Username/Email */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">USERNAME</label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Username"
          className={`bg-gray-100 border-0 rounded-lg ${errors.email ? 'border-red-500' : ''}`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">PASSWORD</label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className={`bg-gray-100 border-0 rounded-lg ${errors.password ? 'border-red-500' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.password}
          </p>
        )}
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
          />
          <span className="text-gray-700">Remember Me</span>
        </label>
        <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">
          Forgot Password
        </a>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white py-3 font-semibold rounded-lg text-base shadow-lg"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
};

export default LogIn;
