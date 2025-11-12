import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, Heart, Share2, ShoppingCart, Minus, Plus, 
  Truck, RotateCcw, Shield, Award, ChevronLeft, ChevronRight, User, X, Zap
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import ProductCard from '../components/product/ProductCard';
import toast from 'react-hot-toast';
import { useProducts } from '../context/ProductContext';
import { API_BASE_URL } from '../config/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, placeOrder, clearCart } = useCart();
  const { user, signup } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { products, loading, error, refreshProducts } = useProducts();
  
  const productId = Number(id);
  const product = products.find((p) => p.id === productId);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(product);
  const [showQuickCheckout, setShowQuickCheckout] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  useEffect(() => {
    if (product) {
      setCurrentProduct(product);
      fetchReviews();
    }
  }, [product, productId]);

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

  const fetchReviews = async () => {
    if (!productId) return;
    setReviewsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/get.php?product_id=${productId}`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Refresh product data when reviews are updated
  useEffect(() => {
    if (product) {
      // Update local product state with latest rating
      const updatedProduct = products.find((p) => p.id === productId);
      if (updatedProduct) {
        setCurrentProduct(updatedProduct);
      }
    }
  }, [products, productId]);

  const relatedProducts = useMemo(() => {
    if (!currentProduct) {
      return [];
    }

    return products
      .filter((p) => p.category === currentProduct.category && p.id !== currentProduct.id)
      .slice(0, 4);
  }, [currentProduct, products]);

  // Define displayProduct early
  const displayProduct = currentProduct || product;

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (!displayProduct) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
        <Button onClick={() => navigate('/products')}>
          Back to Products
        </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(displayProduct, quantity);
    toast.success(`${quantity} ${displayProduct.name} added to cart!`);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleWishlist = async () => {
    const result = await toggleWishlist(displayProduct.id);
    
    // If not authenticated, redirect to login
    if (!result && !user) {
      navigate('/auth');
    }
  };

  const handleOrderNow = () => {
    if (!displayProduct.inStock) {
      toast.error('Product is out of stock');
      return;
    }
    setShowQuickCheckout(true);
  };

  const handleQuickCheckoutSubmit = async (e) => {
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

      const itemPrice = displayProduct.discountPrice || displayProduct.price;
      const subtotal = itemPrice * quantity;
      const shippingCost = 50;
      const total = subtotal + shippingCost;

      const orderPayload = {
        user_id: currentUserId,
        customer: {
          name: checkoutData.name,
          email: checkoutData.email,
          phone: checkoutData.phone,
          address: checkoutData.address
        },
        items: [{
          id: displayProduct.id,
          name: displayProduct.name,
          price: itemPrice,
          quantity: quantity
        }],
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
      setShowQuickCheckout(false);

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

  const handleCheckoutInputChange = (e) => {
    setCheckoutData({
      ...checkoutData,
      [e.target.name]: e.target.value
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: displayProduct.name,
        text: displayProduct.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  const productImages = currentProduct?.images && currentProduct.images.length > 0 
    ? currentProduct.images 
    : [currentProduct?.image || product.image];

  return (
    <div className="min-h-screen bg-gray-50">
      {error && (
        <div className="bg-red-50 border-b border-red-100">
          <div className="container mx-auto px-4 py-3">
            <p className="text-sm text-red-600">
              {error}. Showing available product information.
            </p>
          </div>
        </div>
      )}
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <button onClick={() => navigate('/')} className="hover:text-emerald-600">
              Home
            </button>
            <span>/</span>
            <button onClick={() => navigate('/products')} className="hover:text-emerald-600">
              Products
            </button>
            <span>/</span>
            <span className="text-gray-800 font-medium">{displayProduct.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
                {displayProduct.badge && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-red-500 text-white px-3 py-1 text-sm font-medium rounded-full">
                      {displayProduct.badge}
                    </span>
                  </div>
                )}
                {displayProduct.discount && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-red-500 text-white px-3 py-1 text-sm font-bold rounded-full">
                      -{displayProduct.discount}%
                    </span>
                  </div>
                )}
                <img
                  src={productImages[selectedImage]}
                  alt={displayProduct.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Image Navigation */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(prev => 
                        prev === 0 ? productImages.length - 1 : prev - 1
                      )}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImage(prev => 
                        prev === productImages.length - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index 
                          ? 'border-emerald-500' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Category */}
            <div className="text-sm text-emerald-600 font-medium uppercase tracking-wide">
              {displayProduct.categoryName ||
               (displayProduct.category === 'shari' ? 'Shari & Clothing' :
                displayProduct.category === 'sweets' ? 'Traditional Sweets' :
                displayProduct.category === 'bedsheets' ? 'Bed Sheets & Home' :
                displayProduct.category === 'traditional' ? 'Traditional Items' :
                displayProduct.category === 'beauty' ? 'Beauty & Care' :
                displayProduct.category)}
            </div>

            {/* Product Name */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
              {displayProduct.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(currentProduct?.rating || product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {(currentProduct?.rating || product.rating).toFixed(1)} ({(currentProduct?.reviews || product.reviews)} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-emerald-600">
                ৳{displayProduct.discountPrice || displayProduct.price}
              </span>
              {displayProduct.discountPrice && (
                <span className="text-xl text-gray-500 line-through">
                  ৳{displayProduct.price}
                </span>
              )}
              {displayProduct.discount && (
                <span className="bg-red-100 text-red-800 px-2 py-1 text-sm font-medium rounded">
                  Save {displayProduct.discount}%
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 text-lg leading-relaxed">
              {displayProduct.description}
            </p>

            {/* Features */}
            {displayProduct.features && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Key Features:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {displayProduct.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span className="text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${displayProduct.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`font-medium ${displayProduct.inStock ? 'text-green-600' : 'text-red-600'}`}>
                {displayProduct.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-800">Quantity:</span>
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

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={!displayProduct.inStock}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 text-lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleOrderNow}
                  disabled={!displayProduct.inStock}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 text-lg"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Order Now
                </Button>
                <Button
                  variant="outline"
                  onClick={handleWishlist}
                  className={`px-6 py-3 ${isInWishlist(displayProduct.id) ? 'text-red-500 border-red-500' : ''}`}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(displayProduct.id) ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="px-6 py-3"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-3">
                <Truck className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="font-medium text-gray-800">Free Delivery</p>
                  <p className="text-sm text-gray-600">On orders over ৳500</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="font-medium text-gray-800">Easy Returns</p>
                  <p className="text-sm text-gray-600">7-day return policy</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="font-medium text-gray-800">Authentic</p>
                  <p className="text-sm text-gray-600">100% genuine products</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Star className="w-6 h-6 text-yellow-400 mr-2 fill-current" />
              Customer Reviews
              <span className="ml-2 text-lg font-normal text-gray-600">
                ({(currentProduct?.reviews || product.reviews || 0)} reviews)
              </span>
            </h2>

            {reviewsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          {review.user_avatar ? (
                            <img
                              src={review.user_avatar}
                              alt={review.user_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-emerald-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{review.user_name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 ml-13 mt-2">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                Related Products
              </h2>
              <p className="text-gray-600">
                More products from the same category
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <ProductCard 
                  key={relatedProduct.id} 
                  product={relatedProduct} 
                  index={index}
                />
              ))}
            </div>
          </section>
        )}

        {/* Quick Checkout Modal */}
        {showQuickCheckout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Quick Checkout</h2>
                <button
                  onClick={() => setShowQuickCheckout(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {/* Order Summary */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={displayProduct.image}
                        alt={displayProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{displayProduct.name}</h4>
                      <p className="text-sm text-gray-600">Quantity: {quantity}</p>
                      <p className="text-emerald-600 font-semibold">
                        ৳{(displayProduct.discountPrice || displayProduct.price) * quantity}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span>৳{((displayProduct.discountPrice || displayProduct.price) * quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping:</span>
                      <span>৳50.00</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total:</span>
                      <span className="text-emerald-600">
                        ৳{(((displayProduct.discountPrice || displayProduct.price) * quantity) + 50).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Form */}
                <form onSubmit={handleQuickCheckoutSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={checkoutData.name}
                      onChange={handleCheckoutInputChange}
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
                      onChange={handleCheckoutInputChange}
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
                      onChange={handleCheckoutInputChange}
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
                      onChange={handleCheckoutInputChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter your delivery address"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowQuickCheckout(false)}
                      className="flex-1"
                      disabled={isPlacingOrder}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
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
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

