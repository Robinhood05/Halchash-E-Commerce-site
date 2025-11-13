import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import HeroSection from '../components/hero/HeroSection';
import ProductCard from '../components/product/ProductCard';
import { Button } from '../components/ui/button';
import toast from 'react-hot-toast';
import { useProducts } from '../context/ProductContext';

const Home = () => {
  const navigate = useNavigate();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const { products, categories, loading, error } = useProducts();

  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);
  const shariProducts = useMemo(
    () => products.filter((p) => p.category === 'shari').slice(0, 3),
    [products],
  );
  const sweetProducts = useMemo(
    () => products.filter((p) => p.category === 'sweets').slice(0, 3),
    [products],
  );
  const homeProducts = useMemo(
    () => products.filter((p) => p.category === 'bedsheets').slice(0, 3),
    [products],
  );
  
  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      toast.success('Thank you for subscribing to our newsletter!');
      setNewsletterEmail('');
    } else {
      toast.error('Please enter your email address');
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Categories Section */}
      <section className="py-8 md:py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-3 md:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 md:mb-8 lg:mb-12"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 md:mb-4 px-2">
              Shop by Category
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              Discover authentic Bengali products across our carefully curated categories
            </p>
            {error && (
              <p className="text-xs md:text-sm text-red-500 mt-2">
                {error}. Showing available products.
              </p>
            )}
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
            {categories.map((category, index) => {
              // Define gradient backgrounds for each category
              const categoryGradients = {
                'shari': 'bg-gradient-to-br from-purple-50 via-purple-100/50 to-pink-50',
                'sweets': 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50',
                'bedsheets': 'bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50',
                'traditional': 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50',
                'beauty': 'bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50'
              };
              
              const gradientClass = categoryGradients[category.slug || category.id] || 'bg-gradient-to-br from-gray-50 to-gray-100';
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`${gradientClass} rounded-lg md:rounded-xl p-4 md:p-5 lg:p-6 text-center hover:shadow-lg md:hover:shadow-xl transition-all duration-300 cursor-pointer group border border-white/50 hover:border-white/80 relative overflow-hidden touch-manipulation min-h-[120px] md:min-h-[140px] lg:min-h-[160px] flex flex-col items-center justify-center`}
                >
                  {/* Subtle pattern overlay */}
                  <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1),transparent_50%)]"></div>
                  
                  <div className="relative z-10 flex flex-col items-center justify-center w-full">
                    <div className="text-2xl md:text-3xl lg:text-4xl mb-2 md:mb-3 lg:mb-4 group-active:scale-110 transition-transform duration-300 filter drop-shadow-sm">
                      {category.icon}
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2 md:mb-3 text-xs md:text-sm lg:text-base group-hover:text-gray-900 transition-colors px-1">{category.name}</h3>
                    <span className={`inline-block px-2 md:px-3 lg:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-semibold ${category.color} shadow-sm group-hover:shadow-md transition-all`}>
                      View
                    </span>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 group-active:bg-white/20 transition-all duration-300 rounded-lg md:rounded-xl"></div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-3 md:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 md:mb-8 lg:mb-12"
          >
            <div className="flex items-center justify-center mb-3 md:mb-4">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 mr-2" />
              <span className="text-emerald-600 font-semibold uppercase tracking-wide text-xs md:text-sm">Featured Products</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 md:mb-4 px-2">
              Best Selling Bengali Products
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              Handpicked selection of our most popular authentic Bengali items
            </p>
          </motion.div>

          {/* Mobile-first grid: 2 columns on mobile, 3 on tablet, 5 on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3 lg:gap-4 mb-6 md:mb-8 lg:mb-12">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

          <div className="text-center px-2">
            <Button 
              size="lg" 
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base min-h-[48px] md:min-h-[44px] touch-manipulation"
              onClick={() => navigate('/products')}
            >
              View All Products
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Category Showcases */}
      <section className="py-8 md:py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-3 md:px-4 space-y-10 md:space-y-12 lg:space-y-16">
          {/* Shari Collection */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 lg:mb-8 gap-3 md:gap-4"
            >
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 md:mb-2">
                  Traditional Shari Collection
                </h3>
                <p className="text-sm md:text-base text-gray-600">Handwoven elegance from Bengal</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="hidden md:flex min-h-[44px] touch-manipulation"
                onClick={() => handleCategoryClick('shari')}
              >
                View All Shari
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="md:hidden w-full sm:w-auto min-h-[44px] touch-manipulation"
                onClick={() => handleCategoryClick('shari')}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
            
            {/* Mobile-first: 2 columns on mobile, 3 on tablet, 4 on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
              {shariProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>

          {/* Sweet Collection */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between mb-6 md:mb-8"
            >
              <div>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                  Traditional Bengali Sweets
                </h3>
                <p className="text-sm md:text-base text-gray-600">Fresh and authentic taste of Bengal</p>
              </div>
              <Button 
                variant="outline" 
                className="hidden md:flex"
                onClick={() => handleCategoryClick('sweets')}
              >
                View All Sweets
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
            
            {/* Mobile-first: 2 columns on mobile, 3 on tablet, 4 on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
              {sweetProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>

          {/* Home Collection */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between mb-6 md:mb-8"
            >
              <div>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                  Home & Bed Sheets
                </h3>
                <p className="text-sm md:text-base text-gray-600">Comfort and style for your home</p>
              </div>
              <Button 
                variant="outline" 
                className="hidden md:flex"
                onClick={() => handleCategoryClick('bedsheets')}
              >
                View All Home Items
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
            
            {/* Mobile-first: 2 columns on mobile, 3 on tablet, 4 on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
              {homeProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-4 md:py-6 lg:py-8" style={{ backgroundColor: '#227594' }}>
        <div className="container mx-auto px-3 md:px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl mx-auto text-white"
          >
            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 md:mb-3" />
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3 px-2">
              Stay Updated with Bengali Culture
            </h2>
            <p className="text-xs md:text-sm lg:text-base mb-4 md:mb-5 opacity-90 px-2">
              Subscribe to our newsletter for the latest Bengali products, cultural insights, and exclusive offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 md:gap-3 max-w-md mx-auto px-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-3 py-2 md:py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white text-sm min-h-[40px] md:min-h-[44px]"
                required
              />
              <Button type="submit" className="bg-white hover:bg-gray-100 active:bg-gray-200 font-semibold px-4 py-2 md:py-2 min-h-[40px] md:min-h-[44px] touch-manipulation text-sm" style={{ color: '#227594' }}>
                Subscribe
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;

