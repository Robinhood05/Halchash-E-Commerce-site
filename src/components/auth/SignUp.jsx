import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SignUp = ({ onSwitchToLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      const result = await signup(formData);

      if (result.success) {
        toast.success('Account created successfully! 🎉');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        toast.error(result.error);
        if (result.error.includes('email')) {
          setErrors(prev => ({
            ...prev,
            email: result.error
          }));
        }
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
      {/* Full Name */}
      <div>
        <label className="block text-xs md:text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">FULL NAME</label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          className={`bg-gray-100 border-0 rounded-lg h-12 md:h-10 text-base md:text-sm px-4 ${errors.name ? 'border-red-500' : ''}`}
        />
        {errors.name && (
          <p className="mt-1.5 text-xs md:text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs md:text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">EMAIL</label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
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
        <p className="text-xs text-gray-500 mt-1.5">At least 6 characters</p>
      </div>

      {/* Phone (Optional) */}
      <div>
        <label className="block text-xs md:text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          PHONE <span className="text-gray-400 normal-case">(Optional)</span>
        </label>
        <Input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone Number"
          className="bg-gray-100 border-0 rounded-lg h-12 md:h-10 text-base md:text-sm px-4"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 active:from-pink-700 active:to-red-700 text-white py-3.5 md:py-3 font-semibold rounded-lg text-base md:text-base shadow-lg min-h-[48px] md:min-h-[44px] touch-manipulation mt-2"
      >
        {isLoading ? 'Creating Account...' : 'Sign Up'}
      </Button>
    </form>
  );
};

export default SignUp;
