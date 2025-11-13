import React, { useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Eye, Zap, Loader2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import OptimizedImage from '../common/OptimizedImage';
import toast from 'react-hot-toast';

// Lazy load QuickViewModal for code splitting
const QuickViewModal = lazy(() => import('./QuickViewModal'));

const ProductCard = ({ product, index = 0 }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const [showQuickView, setShowQuickView] = useState(false);

  const categoryLabels = {
    shari: 'Shari & Clothing',
    sweets: 'Traditional Sweets',
    bedsheets: 'Bed Sheets & Home',
    traditional: 'Traditional Items',
    beauty: 'Beauty & Care',
  };

  const categoryLabel = product.categoryName ||
    categoryLabels[product.category] ||
    product.category ||
    'Product';

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const result = await toggleWishlist(product.id);
    
    // If not authenticated, redirect to login
    if (!result && !user) {
      navigate('/auth');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onClick={handleCardClick}
      className="group bg-white rounded-md md:rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative overflow-hidden bg-gray-50">
        {/* Badge */}
        {product.badge && (
          <div className="absolute top-0.5 left-0.5 md:top-1 md:left-1 z-10">
            <span className={`px-0.5 py-0.5 text-[8px] md:text-[9px] font-medium rounded ${
              product.badge === 'Best Seller' ? 'bg-red-500 text-white' :
              product.badge === 'Premium' ? 'bg-purple-500 text-white' :
              product.badge === 'Popular' ? 'bg-blue-500 text-white' :
              product.badge === 'Fresh' ? 'bg-green-500 text-white' :
              product.badge === 'Seasonal' ? 'bg-orange-500 text-white' :
              product.badge === 'Healthy' ? 'bg-emerald-500 text-white' :
              product.badge === 'Heritage' ? 'bg-amber-500 text-white' :
              product.badge === 'Traditional' ? 'bg-indigo-500 text-white' :
              product.badge === 'Handmade' ? 'bg-pink-500 text-white' :
              product.badge === 'Authentic' ? 'bg-teal-500 text-white' :
              product.badge === 'Eco-Friendly' ? 'bg-lime-500 text-white' :
              product.badge === 'Natural' ? 'bg-green-600 text-white' :
              product.badge === 'Organic' ? 'bg-emerald-600 text-white' :
              product.badge === 'Ayurvedic' ? 'bg-yellow-600 text-white' :
              product.badge === 'Pure' ? 'bg-blue-600 text-white' :
              product.badge === 'Artistic' ? 'bg-violet-500 text-white' :
              product.badge === 'Comfort' ? 'bg-cyan-500 text-white' :
              'bg-gray-500 text-white'
            }`}>
              {product.badge}
            </span>
          </div>
        )}

        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-0.5 right-0.5 md:top-1 md:right-1 z-10">
            <span className="bg-red-500 text-white px-0.5 py-0.5 text-[8px] md:text-[9px] font-bold rounded">
              -{product.discount}%
            </span>
          </div>
        )}

        {/* Product Image - Smaller aspect ratio with max height */}
        <div className="aspect-square overflow-hidden w-full max-h-[200px] md:max-h-[220px]">
          <OptimizedImage
            src={product.image}
            alt={product.name}
            className="w-full h-full max-w-full group-hover:scale-105 transition-transform duration-500"
            aspectRatio="1/1"
            objectFit="cover"
            loading="lazy"
          />
        </div>

        {/* Hover Actions - Only on desktop */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleQuickView}
              className="bg-white/90 hover:bg-white text-gray-800 min-w-[48px] min-h-[48px] p-3"
            >
              <Eye className="w-5 h-5" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleWishlist}
              className={`bg-white/90 hover:bg-white text-gray-800 min-w-[48px] min-h-[48px] p-3 ${isInWishlist(product.id) ? 'text-red-500' : ''}`}
            >
              <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Info - Extra compact padding */}
      <div className="p-1.5 md:p-2 space-y-1 md:space-y-1.5">
        {/* Category - Extra compact */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[8px] md:text-[9px] text-gray-500 uppercase tracking-wide font-medium line-clamp-1 flex-1 min-w-0">
            {categoryLabel}
          </span>
          {product.inStock ? (
            <span className="text-[8px] md:text-[9px] text-green-600 font-medium whitespace-nowrap">In Stock</span>
          ) : (
            <span className="text-[8px] md:text-[9px] text-red-600 font-medium whitespace-nowrap">Out of Stock</span>
          )}
        </div>

        {/* Product Name - Extra compact: smaller text, 2 lines max */}
        <h3 className="text-[11px] md:text-xs font-semibold text-gray-800 line-clamp-2 min-h-[2em] group-hover:text-emerald-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating - Extra compact */}
        <div className="flex items-center space-x-0.5">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-2 h-2 md:w-2.5 md:h-2.5 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-[9px] md:text-[10px] text-gray-600">
            {product.rating} ({product.reviews})
          </span>
        </div>

        {/* Price - Extra compact sizing */}
        <div className="flex items-center space-x-1">
          <span className="text-xs md:text-sm font-bold text-emerald-600">
            ৳{product.discountPrice || product.price}
          </span>
          {product.discountPrice && (
            <span className="text-[9px] md:text-[10px] text-gray-500 line-through">
              ৳{product.price}
            </span>
          )}
        </div>

        {/* Features - Hidden on mobile to save space */}
        {product.features && product.features.length > 0 && (
          <div className="hidden md:flex flex-wrap gap-0.5">
            {product.features.slice(0, 2).map((feature, index) => (
              <span
                key={index}
                className="text-[9px] bg-gray-100 text-gray-600 px-1 py-0.5 rounded-full"
              >
                {feature}
              </span>
            ))}
            {product.features.length > 2 && (
              <span className="text-[9px] text-gray-500">
                +{product.features.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons - Extra compact */}
        <div className="space-y-1 pt-0.5">
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1 md:py-1.5 min-h-[32px] md:min-h-[34px] disabled:bg-gray-300 disabled:cursor-not-allowed text-[10px] md:text-xs"
          >
            <ShoppingCart className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" />
            <span>{product.inStock ? 'Add To Cart' : 'Out of Stock'}</span>
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/checkout?productId=${product.id}&quantity=1`);
            }}
            disabled={!product.inStock}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 md:py-1.5 min-h-[32px] md:min-h-[34px] disabled:bg-gray-300 disabled:cursor-not-allowed text-[10px] md:text-xs"
          >
            <Zap className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" />
            <span>Order Now</span>
          </Button>
        </div>
      </div>

      {/* Quick View Modal - Lazy loaded */}
      {showQuickView && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <p className="text-white text-sm">Loading...</p>
              </div>
            </div>
          }
        >
          <QuickViewModal
            product={product}
            isOpen={showQuickView}
            onClose={() => setShowQuickView(false)}
          />
        </Suspense>
      )}
    </motion.div>
  );
};

export default ProductCard;

