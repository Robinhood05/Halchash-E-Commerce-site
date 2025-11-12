import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MessageCircle, Phone, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { API_BASE_URL } from '../../config/api';

// Helper function to build image URLs
const buildImageUrl = (path) => {
  if (!path) {
    return 'https://placehold.co/600x600?text=Product';
  }

  if (path.startsWith('/src/') || path.startsWith('/public/')) {
    return path;
  }

  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) {
    return path;
  }

  const base = API_BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (base.endsWith('/backend') && normalizedPath.startsWith('/backend/')) {
    return `${base}${normalizedPath.replace('/backend', '')}`;
  }

  return `${base}${normalizedPath}`;
};

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroProducts, setHeroProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Background colors for different categories
  const categoryColors = {
    shari: "from-purple-900 via-red-900 to-black",
    sweets: "from-orange-900 via-red-900 to-black",
    bedsheets: "from-emerald-900 via-teal-900 to-black",
    traditional: "from-amber-900 via-orange-900 to-black",
    beauty: "from-pink-900 via-rose-900 to-black"
  };

  useEffect(() => {
    // Fetch hero products from API
    const fetchHeroProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/hero.php`);
        const data = await response.json();
        
        console.log('Hero products API response:', JSON.stringify(data, null, 2)); // Debug log
        console.log('Response status:', response.status);
        console.log('Data success:', data.success);
        console.log('Products array:', data.products);
        console.log('Products length:', data.products?.length);
        
        if (data.success && data.products && Array.isArray(data.products) && data.products.length > 0) {
          // Transform products to hero slide format
          const slides = data.products.map((product, index) => {
            // Build image URL properly
            const productImage = product.images && product.images.length > 0 
              ? buildImageUrl(product.images[0])
              : buildImageUrl(product.image);
            
            return {
              id: product.id,
              title: product.name.toUpperCase().split(' ').slice(0, 2).join(' ') || "SPECIAL",
              subtitle: product.name.toUpperCase().split(' ').slice(2).join(' ') || "PRODUCT",
              description: product.discount ? `${product.discount}% OFF` : "DISCOUNT",
              ctaText: "ORDER NOW",
              image: productImage,
              discount: product.discount ? `${product.discount}%` : "50%",
              bgColor: categoryColors[product.category] || "from-purple-900 via-red-900 to-black",
              category: product.category || product.category_slug,
              productId: product.id
            };
          });
          
          console.log('Hero slides created:', slides); // Debug log
          setHeroProducts(slides);
        } else {
          console.warn('No hero products found:', data);
          setHeroProducts([]);
        }
      } catch (error) {
        console.error('Error fetching hero products:', error);
        // Fallback to empty array
        setHeroProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroProducts();
  }, []);

  useEffect(() => {
    if (heroProducts.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroProducts.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [heroProducts.length]);

  const nextSlide = () => {
    if (heroProducts.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % heroProducts.length);
    }
  };

  const prevSlide = () => {
    if (heroProducts.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + heroProducts.length) % heroProducts.length);
    }
  };

  // If no hero products, show empty state or return null
  if (loading) {
    return (
      <section className="relative overflow-hidden">
        <div className="h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Loading hero section...</p>
        </div>
      </section>
    );
  }

  if (heroProducts.length === 0) {
    return null; // Don't show hero section if no products
  }

  const currentHero = heroProducts[currentSlide];
  
  // Get all product images for the grid (use current product's images or repeat)
  const productImages = currentHero.image 
    ? [currentHero.image, currentHero.image, currentHero.image, currentHero.image]
    : [];

  return (
    <section className="relative overflow-hidden">
      {/* Main Hero Slider - Hit Bangladesh Style */}
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px]">
        {/* Orange Borders */}
        <div className="absolute inset-0 border-[6px] md:border-[8px] border-orange-500 z-20 pointer-events-none"></div>
        <div className="absolute inset-0 border-[2px] border-orange-500/50 z-20 pointer-events-none"></div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={`absolute inset-0 bg-gradient-to-r ${currentHero.bgColor}`}
          >
            {/* Background Image Overlay */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url(${currentHero.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(8px)'
              }}
            ></div>
            
            <div className="container mx-auto px-4 md:px-6 lg:px-8 h-full relative z-10">
              <div className="h-full flex items-center">
                <div className="grid grid-cols-12 gap-4 lg:gap-8 items-center w-full">
                  {/* Left Side - Products Display */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="col-span-12 md:col-span-5 lg:col-span-4"
                  >
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      {productImages.slice(0, 4).map((img, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3 shadow-xl">
                          <img
                            src={img}
                            alt={`${currentHero.title} ${index + 1}`}
                            className="w-full h-auto rounded object-cover"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/200x200?text=Product';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Center/Right - Promotional Text */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="col-span-12 md:col-span-7 lg:col-span-6 text-white text-center md:text-left"
                  >
                    <div className="space-y-2 md:space-y-4">
                      <h1 className="text-4xl md:text-5xl lg:text-7xl font-black leading-none text-white drop-shadow-2xl">
                        {currentHero.title}
                      </h1>
                      <h2 className="text-5xl md:text-6xl lg:text-8xl font-black leading-none text-orange-500 drop-shadow-2xl">
                        {currentHero.subtitle}
                      </h2>
                      <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white/90 mt-2 md:mt-4">
                        {currentHero.description}
                      </p>
                      <div className="pt-2 md:pt-4">
                        <Button 
                          size="lg"
                          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 md:px-8 py-3 md:py-4 text-base md:text-lg shadow-2xl hover:shadow-orange-500/50 transition-all transform hover:scale-105"
                          onClick={() => {
                            if (currentHero.productId) {
                              navigate(`/product/${currentHero.productId}`);
                            } else if (currentHero.category) {
                              navigate(`/products?category=${currentHero.category}`);
                            } else {
                              navigate('/products');
                            }
                          }}
                        >
                          {currentHero.ctaText}
                        </Button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Right Side - Discount Badge & Social Icons */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="col-span-12 md:col-span-12 lg:col-span-2 flex flex-col items-center lg:items-end justify-between h-full py-4"
                  >
                    {/* Discount Badge */}
                    <div className="relative">
                      <div className="bg-white rounded-full p-4 md:p-6 shadow-2xl">
                        <div className="text-center">
                          <div className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900">
                            {currentHero.discount}
                          </div>
                          <div className="text-xs md:text-sm font-bold text-gray-700 uppercase mt-1">
                            OFF
                          </div>
                        </div>
                        {/* Badge String Effect */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-white/50 rounded-full"></div>
                      </div>
                    </div>

                    {/* Social Media Icons */}
                    <div className="flex flex-col gap-3 mt-4 lg:mt-0">
                      <a href="#" className="bg-blue-600 hover:bg-blue-700 p-2 md:p-3 rounded-full shadow-lg transition-all transform hover:scale-110" aria-label="Messenger">
                        <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </a>
                      <a href="tel:01742060566" className="bg-green-600 hover:bg-green-700 p-2 md:p-3 rounded-full shadow-lg transition-all transform hover:scale-110" aria-label="Call">
                        <Phone className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </a>
                      <a href="#" className="bg-green-500 hover:bg-green-600 p-2 md:p-3 rounded-full shadow-lg transition-all transform hover:scale-110" aria-label="WhatsApp">
                        <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </a>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 bg-orange-500/80 hover:bg-orange-500 text-white p-3 rounded-full transition-all duration-200 z-30 shadow-xl hover:shadow-2xl"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 bg-orange-500/80 hover:bg-orange-500 text-white p-3 rounded-full transition-all duration-200 z-30 shadow-xl hover:shadow-2xl"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Slide Indicators - Bottom Center */}
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
          {heroProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-200 ${
                index === currentSlide ? 'bg-orange-500 w-8' : 'bg-white/40 hover:bg-white/60 w-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

