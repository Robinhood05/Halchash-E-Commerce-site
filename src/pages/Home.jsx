import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, Gift } from 'lucide-react';
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
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover authentic Bengali products across our carefully curated categories
            </p>
            {error && (
              <p className="text-sm text-red-500 mt-2">
                {error}. Showing available products.
              </p>
            )}
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
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
                  className={`${gradientClass} rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 cursor-pointer group border border-white/50 hover:border-white/80 relative overflow-hidden`}
                >
                  {/* Subtle pattern overlay */}
                  <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1),transparent_50%)]"></div>
                  
                  <div className="relative z-10">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 filter drop-shadow-sm">
                      {category.icon}
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors">{category.name}</h3>
                    <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold ${category.color} shadow-sm group-hover:shadow-md transition-all`}>
                      View Products
                    </span>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 rounded-xl"></div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-yellow-500 mr-2" />
              <span className="text-emerald-600 font-semibold uppercase tracking-wide">Featured Products</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Best Selling Bengali Products
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Handpicked selection of our most popular authentic Bengali items
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3"
              onClick={() => navigate('/products')}
            >
              View All Products
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Category Showcases */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 space-y-16">
          {/* Shari Collection */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  Traditional Shari Collection
                </h3>
                <p className="text-gray-600">Handwoven elegance from Bengal</p>
              </div>
              <Button 
                variant="outline" 
                className="hidden md:flex"
                onClick={() => handleCategoryClick('shari')}
              >
                View All Shari
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  Traditional Bengali Sweets
                </h3>
                <p className="text-gray-600">Fresh and authentic taste of Bengal</p>
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  Home & Bed Sheets
                </h3>
                <p className="text-gray-600">Comfort and style for your home</p>
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {homeProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Special Offers Banner */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 md:p-12 text-white text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <Gift className="w-8 h-8 mr-3" />
              <span className="text-xl font-semibold">Special Offer</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get 25% OFF on Your First Order
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Use code BENGAL25 at checkout. Valid for new customers only.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-orange-600 hover:bg-gray-100 font-semibold px-8"
                onClick={() => navigate('/products')}
              >
                Shop Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-orange-600 font-semibold px-8"
                onClick={() => navigate('/products')}
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-emerald-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-white"
          >
            <TrendingUp className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stay Updated with Bengali Culture
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Subscribe to our newsletter for the latest Bengali products, cultural insights, and exclusive offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <Button type="submit" className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold px-6">
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

