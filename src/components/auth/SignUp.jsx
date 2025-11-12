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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Full Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">FULL NAME</label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          className={`bg-gray-100 border-0 rounded-lg ${errors.name ? 'border-red-500' : ''}`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">EMAIL</label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
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
        <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
      </div>

      {/* Phone (Optional) */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          PHONE <span className="text-gray-400 normal-case">(Optional)</span>
        </label>
        <Input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone Number"
          className="bg-gray-100 border-0 rounded-lg"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white py-3 font-semibold rounded-lg text-base shadow-lg"
      >
        {isLoading ? 'Creating Account...' : 'Sign Up'}
      </Button>
    </form>
  );
};

export default SignUp;
