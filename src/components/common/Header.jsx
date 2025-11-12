import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Heart, Home, Truck, Star, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useProducts } from '../../context/ProductContext';

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { getCartItemsCount } = useCart();
  const { user, logout } = useAuth();
  const { wishlistItems } = useWishlist();
  const { categories: categoryList } = useProducts();
  const categories = categoryList ?? [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
    setIsMenuOpen(false);
  };

  const features = [
    { icon: Truck, text: "Free Delivery", subtext: "On orders over ৳500" },
    { icon: Star, text: "Authentic Products", subtext: "100% Genuine Bengali Items" },
    { icon: ShoppingBag, text: "Easy Returns", subtext: "7-day return policy" }
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar with Features */}
      <div className="bg-emerald-600 text-white py-2 px-4">
        <div className="container mx-auto">
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-center md:text-left justify-center md:justify-start"
              >
                <div className="bg-white/20 p-1.5 rounded flex-shrink-0">
                  <feature.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-xs md:text-sm">{feature.text}</h3>
                  <p className="text-xs text-white/90 hidden md:block">{feature.subtext}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Clickable Home Button */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="bg-orange-500 text-white px-3 py-2 rounded-lg font-bold text-xl hover:bg-orange-600 transition-colors flex items-center gap-2"
              aria-label="Go to home"
            >
              <Home className="w-5 h-5" />
              Halchash
            </button>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="flex w-full">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-r-none border-r-0"
              />
              <Button 
                type="submit"
                className="rounded-l-none bg-orange-500 hover:bg-orange-600"
              >
                <Search className="w-4 h-4" />
              </Button>
            </form>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:flex items-center"
              onClick={() => navigate('/profile')}
            >
              <Heart className="w-5 h-5 mr-1" />
              <span className="text-sm">{wishlistItems.length} Wishlist</span>
            </Button>

            {/* Cart */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/cart')}
              className="flex items-center relative"
            >
              <ShoppingCart className="w-5 h-5 mr-1" />
              <span className="text-sm hidden md:block">৳0</span>
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </Button>

            {/* Account */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:flex items-center"
              onClick={() => user ? navigate('/profile') : navigate('/auth')}
            >
              <User className="w-5 h-5 mr-1" />
              <span className="text-sm">
                {user ? user.name : 'Account'}
              </span>
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4">
          <form onSubmit={handleSearch} className="flex">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-r-none border-r-0"
            />
            <Button 
              type="submit"
              className="rounded-l-none bg-orange-500 hover:bg-orange-600"
            >
              <Search className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Navigation Categories */}
      <div className="bg-emerald-600 text-white">
        <div className="container mx-auto px-4">
          <div className="hidden md:flex items-center space-x-1 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/products')}
              className="text-white hover:bg-emerald-700 text-sm px-3 py-2 rounded-none"
            >
              All Products
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                size="sm"
                onClick={() => handleCategoryClick(category.id)}
                className="text-white hover:bg-emerald-700 text-sm px-3 py-2 rounded-none"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-4">
              {/* Mobile Categories */}
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate('/');
                    setIsMenuOpen(false);
                  }}
                  className="w-full justify-start text-left font-semibold"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
                <h3 className="font-semibold text-gray-800 pt-2">Categories</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate('/products');
                    setIsMenuOpen(false);
                  }}
                  className="w-full justify-start text-left"
                >
                  All Products
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCategoryClick(category.id)}
                    className="w-full justify-start text-left"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>

              {/* Mobile Account Actions */}
              <div className="border-t pt-4 space-y-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => {
                    navigate('/profile');
                    setIsMenuOpen(false);
                  }}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Wishlist ({wishlistItems.length})
                </Button>
                {user ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => {
                        navigate('/profile');
                        setIsMenuOpen(false);
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      My Profile
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-red-600"
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/auth');
                      setIsMenuOpen(false);
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

