import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Upload, Edit2, Save, X, Package, Truck, ShoppingBag, 
  XCircle, Heart, Headphones, MapPin, Star, MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/api';

const Profile = () => {
  const { user, updateProfile, uploadAvatar, logout } = useAuth();
  const { refreshProducts } = useProducts();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
    cancelled: 0
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ productId: null, orderId: null, rating: 0, comment: '' });
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatar || null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
      setPreviewAvatar(user.avatar || null);
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    if (!user?.id) return;
    
    setOrdersLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/user_orders.php?user_id=${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
        setOrderStats(data.stats || {
          total: 0,
          pending: 0,
          processing: 0,
          delivered: 0,
          cancelled: 0
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleReview = (productId, orderId) => {
    setReviewData({ productId, orderId, rating: 0, comment: '' });
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      toast.error('Please select a rating');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/create.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          product_id: reviewData.productId,
          order_id: reviewData.orderId,
          rating: reviewData.rating,
          comment: reviewData.comment
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Review submitted successfully! ⭐');
        setShowReviewModal(false);
        fetchUserOrders(); // Refresh orders to update reviewed status
        // Refresh product data to update ratings
        if (refreshProducts) {
          refreshProducts();
        }
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewAvatar(reader.result);
    };
    reader.readAsDataURL(file);

    setAvatarLoading(true);
    try {
      const result = await uploadAvatar(file);
      if (result.success) {
        toast.success('Avatar updated successfully! ✨');
      } else {
        toast.error(result.error);
        setPreviewAvatar(user?.avatar);
      }
    } catch {
      toast.error('Failed to upload avatar');
      setPreviewAvatar(user?.avatar);
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        toast.success('Profile updated!');
        setIsEditing(false);
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800">Please log in first</h2>
          <p className="text-gray-600 mt-2">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  const orderStatusIcons = [
    { label: 'Pending Payment', icon: Package, color: 'bg-blue-500', count: orderStats.pending },
    { label: 'Delivered', icon: Truck, color: 'bg-yellow-500', count: orderStats.delivered },
    { label: 'Processing', icon: ShoppingBag, color: 'bg-purple-500', count: orderStats.processing },
    { label: 'Cancelled', icon: XCircle, color: 'bg-green-500', count: orderStats.cancelled },
    { label: 'Wishlist', icon: Heart, color: 'bg-pink-500', count: 0 },
    { label: 'Customer Care', icon: Headphones, color: 'bg-purple-500', count: 0 }
  ];

  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        </div>

        {/* Profile Section with Wave Background */}
        <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Wave Background */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-pink-500 via-red-500 to-pink-600 opacity-20">
            <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 120" fill="none">
              <path d="M0,60 Q360,0 720,60 T1440,60" stroke="currentColor" strokeWidth="2" className="text-pink-500" />
            </svg>
          </div>

          <div className="relative p-8">
            {/* Avatar and Name */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <img
                  src={previewAvatar || user.avatar || '/default-avatar.png'}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                />
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-emerald-700 transition">
                  <Upload size={16} />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={avatarLoading}
                  />
                </label>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mt-4">{user.name}</h2>
              <p className="text-gray-500 mt-1">Member since {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</p>
            </div>

            {/* My Orders Section */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">My Orders</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {orderStatusIcons.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (item.label === 'Pending Payment') navigate('/profile/orders?status=pending');
                      else if (item.label === 'Delivered') navigate('/profile/orders?status=delivered');
                      else if (item.label === 'Processing') navigate('/profile/orders?status=processing');
                      else if (item.label === 'Cancelled') navigate('/profile/orders?status=cancelled');
                    }}
                    className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className={`${item.color} p-3 rounded-full mb-2`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-center text-gray-700 font-medium">{item.label}</span>
                    {item.count > 0 && (
                      <span className="text-xs text-gray-500 mt-1">({item.count})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Management */}
            <div className="space-y-2">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center">
                  <Edit2 className="w-5 h-5 mr-3 text-gray-600" />
                  <span className="text-gray-900 font-medium">Edit Profile</span>
                </div>
                <span className="text-gray-400">›</span>
              </button>
              <button
                onClick={() => navigate('/profile/address')}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-3 text-gray-600" />
                  <span className="text-gray-900 font-medium">Shipping Address</span>
                </div>
                <span className="text-gray-400">›</span>
              </button>
            </div>
          </div>
        </div>

        {/* Delivered Orders for Review */}
        {deliveredOrders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Review Your Products</h3>
            <div className="space-y-4">
              {deliveredOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold">Order #{order.order_number}</p>
                      <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      Delivered
                    </span>
                  </div>
                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{item.product_name} (Qty: {item.quantity})</span>
                        {item.reviewed ? (
                          <span className="text-xs text-green-600">✓ Reviewed</span>
                        ) : (
                          <button
                            onClick={() => handleReview(item.product_id, order.id)}
                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Edit Profile</h3>
                <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <Input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Write a Review</h3>
                <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewData({ ...reviewData, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= reviewData.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows="4"
                    placeholder="Share your experience with this product..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={submitReview}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Submit Review
                </Button>
                <Button
                  onClick={() => setShowReviewModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="text-center">
          <Button
            onClick={logout}
            variant="outline"
            className="border-2 border-gray-300 hover:border-gray-400"
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
