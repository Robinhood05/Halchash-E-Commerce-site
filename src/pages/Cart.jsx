import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, updateQuantity, removeFromCart, clearCart, placeOrder } = useCart();
  const { user, signup } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: ''
  });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const shippingCost = 50;
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const itemPrice = item.discountPrice || item.price;
            return (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                    <p className="text-sm text-gray-600">
                      Total: <span className="font-semibold">৳{itemPrice * item.quantity}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        removeFromCart(item.id);
                        toast.success('Item removed from cart');
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items):</span>
                <span>৳{getCartTotal()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping:</span>
                <span>৳{shippingCost}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-emerald-600">৳{total}</span>
              </div>
            </div>
            <Button
              onClick={() => navigate('/checkout')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3"
            >
              Proceed to Checkout
            </Button>
          </div>

          {/* Checkout Form */}
          {showCheckout && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Checkout Information</h2>
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={checkoutData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={checkoutData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={checkoutData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCheckout(false)}
                    className="flex-1"
                    disabled={isPlacingOrder}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isPlacingOrder}
                  >
                    {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </div>
                {!user && (
                  <p className="text-xs text-gray-500 text-center">
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
