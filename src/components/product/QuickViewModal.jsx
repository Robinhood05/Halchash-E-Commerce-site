import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Heart, ShoppingCart, Minus, Plus, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import OptimizedImage from '../common/OptimizedImage';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../config/api';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

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

  if (!product || !isOpen) return null;

  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${quantity} ${product.name} added to cart!`);
  };

  const handleWishlist = async () => {
    const result = await toggleWishlist(product.id);
    
    // If not authenticated, redirect to login
    if (!result && !user) {
      onClose();
      navigate('/auth');
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleOrderNow = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to place an order');
      onClose();
      navigate('/auth');
      return;
    }

    if (!checkoutData.name || !checkoutData.email || !checkoutData.phone || !checkoutData.address) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!product.inStock) {
      toast.error('Product is out of stock');
      return;
    }

    setIsPlacingOrder(true);

    try {
      const orderData = {
        items: [{
          product_id: product.id,
          product_name: product.name,
          product_price: product.discountPrice || product.price,
          quantity: quantity,
          subtotal: (product.discountPrice || product.price) * quantity
        }],
        shipping_name: checkoutData.name,
        shipping_email: checkoutData.email,
        shipping_phone: checkoutData.phone,
        shipping_address: checkoutData.address,
        total_amount: (product.discountPrice || product.price) * quantity + 50, // 50 for shipping
        shipping_cost: 50
      };

      const response = await fetch(`${API_BASE_URL}/api/orders/create.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Order placed successfully!');
        setShowCheckout(false);
        onClose();
        navigate('/profile');
      } else {
        toast.error(data.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black bg-opacity-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex flex-col md:flex-row overflow-y-auto">
              {/* Left Side - Images */}
              <div className="md:w-1/2 bg-gray-50 p-6">
                <div className="relative aspect-square mb-4">
                  <OptimizedImage
                    src={productImages[selectedImage] || product.image}
                    alt={product.name}
                    className="w-full h-full rounded-lg"
                    aspectRatio="1/1"
                    objectFit="cover"
                    priority={selectedImage === 0}
                  />
                </div>
                {productImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {productImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          selectedImage === index
                            ? 'border-emerald-600'
                            : 'border-gray-200'
                        }`}
                      >
                        <OptimizedImage
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full"
                          aspectRatio="1/1"
                          objectFit="cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side - Product Info */}
              <div className="md:w-1/2 p-6 flex flex-col">
                <div className="flex-1">
                  {/* Category */}
                  <div className="text-sm text-emerald-600 font-medium uppercase tracking-wide mb-2">
                    {product.categoryName || product.category}
                  </div>

                  {/* Name */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {product.name}
                  </h2>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.rating || 0} ({product.reviews || 0} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-emerald-600">
                        ৳{product.discountPrice || product.price}
                      </span>
                      {product.discountPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          ৳{product.price}
                        </span>
                      )}
                      {product.discount && (
                        <span className="bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                          -{product.discount}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {product.description && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {product.description}
                    </p>
                  )}

                  {/* Stock Status */}
                  <div className="mb-4">
                    {product.inStock ? (
                      <span className="text-green-600 font-medium">✓ In Stock</span>
                    ) : (
                      <span className="text-red-600 font-medium">✗ Out of Stock</span>
                    )}
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-medium text-gray-700">Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-medium">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= 10}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAddToCart}
                      disabled={!product.inStock}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleWishlist}
                      className={`px-4 ${isInWishlist(product.id) ? 'text-red-500 border-red-500' : ''}`}
                    >
                      <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                  <Button
                    onClick={() => {
                      onClose();
                      navigate(`/checkout?productId=${product.id}&quantity=${quantity}`);
                    }}
                    disabled={!product.inStock}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Order Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onClose();
                      navigate(`/product/${product.id}`);
                    }}
                    className="w-full"
                  >
                    View Full Details
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Checkout Modal */}
            {showCheckout && (
              <div className="absolute inset-0 bg-white z-10 flex flex-col">
                <div className="border-b px-6 py-4 flex justify-between items-center">
                  <h3 className="text-xl font-bold">Quick Checkout</h3>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleOrderNow} className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <Input
                        type="text"
                        value={checkoutData.name}
                        onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })}
                        required
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <Input
                        type="email"
                        value={checkoutData.email}
                        onChange={(e) => setCheckoutData({ ...checkoutData, email: e.target.value })}
                        required
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <Input
                        type="tel"
                        value={checkoutData.phone}
                        onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                        required
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Address *
                      </label>
                      <textarea
                        value={checkoutData.address}
                        onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span>Subtotal:</span>
                        <span>৳{((product.discountPrice || product.price) * quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Shipping:</span>
                        <span>৳50.00</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span className="text-emerald-600">
                          ৳{(((product.discountPrice || product.price) * quantity) + 50).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCheckout(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isPlacingOrder}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;

