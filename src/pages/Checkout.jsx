import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Minus, Plus, ShoppingBag, User, Mail, Phone, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
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

  // Calculate totals
  const shippingCost = 50;
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
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {orderItems.map((item) => {
                const itemPrice = item.discountPrice || item.price;
                const itemQuantity = isSingleProductOrder ? quantity : item.quantity;
                
                return (
                  <div key={item.id} className="flex items-center space-x-4 pb-4 border-b last:border-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-emerald-600 font-bold">৳{itemPrice}</span>
                        {item.discountPrice && (
                          <span className="text-sm text-gray-500 line-through">৳{item.price}</span>
                        )}
                      </div>
                      {isSingleProductOrder && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(-1)}
                              disabled={quantity <= 1}
                              className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-1 font-medium min-w-[2rem] text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(1)}
                              disabled={quantity >= 10}
                              className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                      {!isSingleProductOrder && (
                        <p className="text-sm text-gray-600">
                          Quantity: {itemQuantity}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
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

