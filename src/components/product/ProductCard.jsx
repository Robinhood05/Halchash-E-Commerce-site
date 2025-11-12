import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Eye, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import QuickViewModal from './QuickViewModal';
import toast from 'react-hot-toast';

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
      className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative overflow-hidden bg-gray-50">
        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
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
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-red-500 text-white px-2 py-1 text-xs font-bold rounded-full">
              -{product.discount}%
            </span>
          </div>
        )}

        {/* Product Image */}
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleQuickView}
              className="bg-white/90 hover:bg-white text-gray-800 p-2"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleWishlist}
              className={`bg-white/90 hover:bg-white text-gray-800 p-2 ${isInWishlist(product.id) ? 'text-red-500' : ''}`}
            >
              <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            {categoryLabel}
          </span>
          {product.inStock ? (
            <span className="text-xs text-green-600 font-medium">In Stock</span>
          ) : (
            <span className="text-xs text-red-600 font-medium">Out of Stock</span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {product.rating} ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-emerald-600">
            ৳{product.discountPrice || product.price}
          </span>
          {product.discountPrice && (
            <span className="text-sm text-gray-500 line-through">
              ৳{product.price}
            </span>
          )}
        </div>

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.features.slice(0, 2).map((feature, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
              >
                {feature}
              </span>
            ))}
            {product.features.length > 2 && (
              <span className="text-xs text-gray-500">
                +{product.features.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/checkout?productId=${product.id}&quantity=1`);
            }}
            disabled={!product.inStock}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4 mr-2" />
            Order Now
          </Button>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </motion.div>
  );
};

export default ProductCard;

