import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import OptimizedImage from '../components/common/OptimizedImage';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, updateQuantity, removeFromCart, clearCart, placeOrder } = useCart();
  const { user, signup } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState('inside_dhaka'); // 'inside_dhaka' or 'outside_dhaka'
  const [checkoutData, setCheckoutData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: ''
  });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const shippingCost = deliveryLocation === 'inside_dhaka' ? 60 : 120;
  const total = getCartTotal() + shippingCost;

  const handleQuantityChange = (itemId, change) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity > 0) {
        updateQuantity(itemId, newQuantity);
      }
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    
    if (!checkoutData.name || !checkoutData.email || !checkoutData.phone || !checkoutData.address) {
      toast.error('Please fill in all fields');
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
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.discountPrice || item.price,
          quantity: item.quantity
        })),
        totals: {
          subtotal: getCartTotal(),
          shipping: shippingCost,
          total
        }
      };

      const orderResult = await placeOrder(orderPayload);

      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to place order.');
      }

      const { data } = orderResult;

      clearCart();
      setShowCheckout(false);

      if (data.account_created && data.temporary_password) {
        toast.success(`Order placed successfully! Temporary password: ${data.temporary_password}`);
      } else if (data.order?.order_number) {
        toast.success(`Order ${data.order.order_number} placed successfully!`);
      } else {
        toast.success('Order placed successfully!');
      }

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleInputChange = (e) => {
    setCheckoutData({
      ...checkoutData,
      [e.target.name]: e.target.value
    });
  };

  if (cartItems.length === 0 && !showCheckout) {
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
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 lg:mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          {cartItems.map((item) => {
            const itemPrice = item.discountPrice || item.price;
            return (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-3 md:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
                  <div className="w-full sm:w-20 md:w-24 h-48 sm:h-20 md:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 sm:flex-shrink-0">
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
                    <p className="text-xs md:text-sm text-gray-600 mb-3 sm:mb-0">
                      Total: <span className="font-semibold">৳{itemPrice * item.quantity}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-3 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="p-2.5 md:p-2 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px] flex items-center justify-center"
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 md:px-4 py-2 font-medium min-w-[2.5rem] md:min-w-[3rem] text-center text-sm md:text-base">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="p-2.5 md:p-2 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px] flex items-center justify-center"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        removeFromCart(item.id);
                        toast.success('Item removed from cart');
                      }}
                      className="p-2.5 md:p-2 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px] flex items-center justify-center"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Checkout */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 h-fit sticky top-4">
            <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Order Summary</h2>
            <div className="space-y-2 mb-3 md:mb-4 text-sm md:text-base">
              <div className="flex justify-between text-gray-600">
                <span className="text-xs md:text-sm">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items):</span>
                <span className="font-medium">৳{getCartTotal()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="text-xs md:text-sm">Shipping:</span>
                <span className="font-medium">৳{shippingCost}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-base md:text-lg">
                <span>Total:</span>
                <span className="text-emerald-600">৳{total}</span>
              </div>
            </div>
            <Button
              onClick={() => navigate('/checkout')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-3 md:py-3 min-h-[48px] md:min-h-[44px] touch-manipulation text-sm md:text-base"
            >
              Proceed to Checkout
            </Button>
          </div>

          {/* Checkout Form */}
          {showCheckout && (
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Checkout Information</h2>
              <form onSubmit={handleCheckoutSubmit} className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={checkoutData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                    className="text-sm md:text-base min-h-[48px] md:min-h-[40px]"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={checkoutData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email"
                    className="text-sm md:text-base min-h-[48px] md:min-h-[40px]"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={checkoutData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your phone number"
                    className="text-sm md:text-base min-h-[48px] md:min-h-[40px]"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Delivery Location *
                  </label>
                  <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
                    <button
                      type="button"
                      onClick={() => setDeliveryLocation('inside_dhaka')}
                      className={`px-3 md:px-4 py-2.5 md:py-3 border-2 rounded-lg font-medium transition-all text-xs md:text-sm touch-manipulation min-h-[48px] md:min-h-[44px] ${
                        deliveryLocation === 'inside_dhaka'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 bg-white text-gray-700 active:border-emerald-400'
                      }`}
                    >
                      Inside Dhaka
                      <span className="block text-[10px] md:text-xs mt-1 text-gray-500">৳60</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryLocation('outside_dhaka')}
                      className={`px-3 md:px-4 py-2.5 md:py-3 border-2 rounded-lg font-medium transition-all text-xs md:text-sm touch-manipulation min-h-[48px] md:min-h-[44px] ${
                        deliveryLocation === 'outside_dhaka'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 bg-white text-gray-700 active:border-emerald-400'
                      }`}
                    >
                      Outside Dhaka
                      <span className="block text-[10px] md:text-xs mt-1 text-gray-500">৳120</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                    Delivery Address *
                  </label>
                  <textarea
                    name="address"
                    value={checkoutData.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base min-h-[120px]"
                    placeholder="Enter your delivery address"
                  />
                </div>
                <div className="flex gap-2 md:gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 min-h-[48px] md:min-h-[44px] touch-manipulation text-sm md:text-base"
                    disabled={isPlacingOrder}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white min-h-[48px] md:min-h-[44px] touch-manipulation text-sm md:text-base"
                    disabled={isPlacingOrder}
                  >
                    {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </div>
                {!user && (
                  <p className="text-[10px] md:text-xs text-gray-500 text-center px-2">
                    * An account will be created automatically using your order information
                  </p>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
