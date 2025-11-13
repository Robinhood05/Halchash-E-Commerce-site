import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Minus, Plus, ShoppingBag, User, Mail, Phone, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import OptimizedImage from '../components/common/OptimizedImage';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/api';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, getCartTotal, placeOrder, clearCart } = useCart();
  const { user, signup } = useAuth();
  const { products } = useProducts();
  
  // Get product from URL params or location state
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get('productId');
  const quantityFromUrl = parseInt(searchParams.get('quantity') || '1');
  
  const [quantity, setQuantity] = useState(quantityFromUrl);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState('inside_dhaka'); // 'inside_dhaka' or 'outside_dhaka'
  const [checkoutData, setCheckoutData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  // Find the product if ordering a single product
  const singleProduct = productId ? products.find(p => p.id === parseInt(productId)) : null;
  
  // Determine if this is a single product order or cart order
  const isSingleProductOrder = !!singleProduct;
  const orderItems = isSingleProductOrder 
    ? [{
        ...singleProduct,
        quantity: quantity,
        price: singleProduct.discountPrice || singleProduct.price
      }]
    : cartItems;

  // Update checkout data when user changes
  useEffect(() => {
    if (user) {
      setCheckoutData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  // Calculate totals based on delivery location
  const shippingCost = deliveryLocation === 'inside_dhaka' ? 60 : 120;
  const subtotal = isSingleProductOrder
    ? (singleProduct.discountPrice || singleProduct.price) * quantity
    : getCartTotal();
  const total = subtotal + shippingCost;

  const handleQuantityChange = (change) => {
    if (isSingleProductOrder) {
      const newQuantity = quantity + change;
      if (newQuantity >= 1 && newQuantity <= 10) {
        setQuantity(newQuantity);
      }
    }
  };

  const handleInputChange = (e) => {
    setCheckoutData({
      ...checkoutData,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    
    if (!checkoutData.name || !checkoutData.email || !checkoutData.phone || !checkoutData.address) {
      toast.error('Please fill in all fields');
      return;
    }

    if (orderItems.length === 0) {
      toast.error('No items to order');
      return;
    }

    setIsPlacingOrder(true);

    try {
      let currentUserId = user?.id || null;

      // If user is not logged in, create an account automatically
      if (!user) {
        const autoPassword = `auto_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const signupResult = await signup(
          checkoutData.name,
          checkoutData.email,
          autoPassword,
          checkoutData.address,
          checkoutData.phone
        );

        if (!signupResult.success) {
          throw new Error(signupResult.error || 'Failed to create account. Please try again.');
        }

        currentUserId = signupResult.user?.id || null;
        toast.success('Account created automatically!');
      }

      const orderPayload = {
        user_id: currentUserId,
        customer: {
          name: checkoutData.name,
          email: checkoutData.email,
          phone: checkoutData.phone,
          address: checkoutData.address
        },
        items: orderItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.discountPrice || item.price,
          quantity: isSingleProductOrder ? quantity : item.quantity
        })),
        totals: {
          subtotal: subtotal,
          shipping: shippingCost,
          total: total
        }
      };

      const orderResult = await placeOrder(orderPayload);

      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to place order.');
      }

      const { data } = orderResult;

      if (!isSingleProductOrder) {
        clearCart();
      }

      if (data.account_created && data.temporary_password) {
        toast.success(`Order placed successfully! Temporary password: ${data.temporary_password}`);
      } else if (data.order?.order_number) {
        toast.success(`Order ${data.order.order_number} placed successfully!`);
      } else {
        toast.success('Order placed successfully!');
      }

      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isSingleProductOrder && !singleProduct) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
        <Button onClick={() => navigate('/products')}>
          Back to Products
        </Button>
      </div>
    );
  }

  if (!isSingleProductOrder && cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-4" />
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Add some products to get started!</p>
        <Button 
          onClick={() => navigate('/products')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3"
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 lg:py-8">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4 md:mb-6 min-h-[44px] md:min-h-[36px] touch-manipulation"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 lg:mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Order Items Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-4 md:p-6"
          >
            <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Order Items</h2>
            <div className="space-y-3 md:space-y-4">
              {orderItems.map((item) => {
                const itemPrice = item.discountPrice || item.price;
                const itemQuantity = isSingleProductOrder ? quantity : item.quantity;
                
                return (
                  <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 pb-3 md:pb-4 border-b last:border-0">
                    <div className="w-full sm:w-20 md:w-20 h-48 sm:h-20 md:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <OptimizedImage 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full"
                        aspectRatio="1/1"
                        objectFit="cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                      <h3 className="font-semibold text-gray-800 mb-1 text-sm md:text-base">{item.name}</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-emerald-600 font-bold text-sm md:text-base">৳{itemPrice}</span>
                        {item.discountPrice && (
                          <span className="text-xs md:text-sm text-gray-500 line-through">৳{item.price}</span>
                        )}
                      </div>
                      {isSingleProductOrder && (
                        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                          <span className="text-xs md:text-sm text-gray-600">Quantity:</span>
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(-1)}
                              disabled={quantity <= 1}
                              className="p-2.5 md:p-1 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-w-[44px] min-h-[44px] md:min-w-[32px] md:min-h-[32px] flex items-center justify-center"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-3 md:px-3 py-1 font-medium min-w-[2rem] text-center text-sm md:text-base">
                              {quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(1)}
                              disabled={quantity >= 10}
                              className="p-2.5 md:p-1 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-w-[44px] min-h-[44px] md:min-w-[32px] md:min-h-[32px] flex items-center justify-center"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                      {!isSingleProductOrder && (
                        <p className="text-xs md:text-sm text-gray-600">
                          Quantity: {itemQuantity}
                        </p>
                      )}
                    </div>
                    <div className="text-right sm:text-right w-full sm:w-auto">
                      <p className="font-semibold text-gray-900 text-sm md:text-base">
                        ৳{(itemPrice * itemQuantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Checkout Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Full Name *
                </label>
                <Input
                  type="text"
                  name="name"
                  value={checkoutData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={checkoutData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={checkoutData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your phone number"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Delivery Location *
                </label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setDeliveryLocation('inside_dhaka')}
                    className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                      deliveryLocation === 'inside_dhaka'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-emerald-400'
                    }`}
                  >
                    Inside Dhaka
                    <span className="block text-xs mt-1 text-gray-500">৳60</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryLocation('outside_dhaka')}
                    className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                      deliveryLocation === 'outside_dhaka'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-emerald-400'
                    }`}
                  >
                    Outside Dhaka
                    <span className="block text-xs mt-1 text-gray-500">৳120</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Delivery Address *
                </label>
                <textarea
                  name="address"
                  value={checkoutData.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter your delivery address"
                />
              </div>
              {!user && (
                <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                  * An account will be created automatically using your order information
                </p>
              )}
            </form>
          </motion.div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6 sticky top-4"
          >
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({orderItems.reduce((sum, item) => sum + (isSingleProductOrder ? quantity : item.quantity), 0)} items):</span>
                <span>৳{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping:</span>
                <span>৳{shippingCost.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-emerald-600">৳{total.toFixed(2)}</span>
              </div>
            </div>
            <Button
              onClick={handleCheckoutSubmit}
              disabled={isPlacingOrder}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg font-medium"
            >
              {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

