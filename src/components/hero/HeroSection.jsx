import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MessageCircle, Phone, MessageSquare, ArrowUp } from 'lucide-react';
import { Button } from '../ui/button';
import OptimizedImage from '../common/OptimizedImage';
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
        <div className="h-[350px] sm:h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center bg-gray-100">
          <p className="text-gray-500 text-sm sm:text-base">Loading hero section...</p>
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

  // Contact information
  const phoneNumber = '01742060566';
  const whatsappNumber = '8801742060566'; // Bangladesh country code
  const messengerLink = 'https://www.facebook.com/iamarraza';
  
  // Handle phone call
  const handlePhoneCall = () => {
    window.location.href = `tel:${phoneNumber}`;
  };
  
  // Handle WhatsApp
  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hello! I am interested in your products.');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };
  
  // Handle Messenger
  const handleMessenger = () => {
    window.open(`https://m.me/iamarraza`, '_blank');
  };
  
  // Handle scroll to top
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden">
      {/* Floating Action Buttons - Smaller size */}
      <div className="fixed right-2 sm:right-3 md:right-4 bottom-20 sm:bottom-24 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-[100] flex flex-col gap-1.5 sm:gap-2 md:gap-2">
        {/* Messenger Button */}
        <motion.button
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          onClick={handleMessenger}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white p-2 rounded-full shadow-md transition-all duration-200 touch-manipulation w-9 h-9 sm:w-10 sm:h-10 md:w-10 md:h-10 flex items-center justify-center group relative"
          aria-label="Contact us on Messenger"
          title="Message us on Facebook Messenger"
        >
          <MessageCircle className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white" />
          <span className="absolute -right-0.5 top-0 w-1.5 h-1.5 bg-red-500 rounded-full border border-white animate-pulse"></span>
        </motion.button>
        
        {/* Phone Button */}
        <motion.button
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          onClick={handlePhoneCall}
          className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white p-2 rounded-full shadow-md transition-all duration-200 touch-manipulation w-9 h-9 sm:w-10 sm:h-10 md:w-10 md:h-10 flex items-center justify-center group"
          aria-label="Call us"
          title={`Call us at ${phoneNumber}`}
        >
          <Phone className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white" />
        </motion.button>
        
        {/* WhatsApp Button */}
        <motion.button
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          onClick={handleWhatsApp}
          className="bg-[#25D366] hover:bg-[#20BA5A] active:bg-[#1DA851] text-white p-2 rounded-full shadow-md transition-all duration-200 touch-manipulation w-9 h-9 sm:w-10 sm:h-10 md:w-10 md:h-10 flex items-center justify-center group"
          aria-label="Contact us on WhatsApp"
          title="Message us on WhatsApp"
        >
          <MessageSquare className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white" />
        </motion.button>
        
        {/* Scroll to Top Button */}
        <motion.button
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          onClick={handleScrollToTop}
          className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white p-2 rounded-full shadow-md transition-all duration-200 touch-manipulation w-9 h-9 sm:w-10 sm:h-10 md:w-10 md:h-10 flex items-center justify-center group"
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          <ArrowUp className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white" />
        </motion.button>
      </div>

      {/* Main Hero Slider - Mobile-First Design */}
      <div className="relative h-[350px] sm:h-[400px] md:h-[500px] lg:h-[600px]">
        {/* Orange Borders - Mobile optimized */}
        <div className="absolute inset-0 border-[4px] sm:border-[6px] md:border-[8px] border-orange-500 z-20 pointer-events-none"></div>
        <div className="absolute inset-0 border-[1px] sm:border-[2px] border-orange-500/50 z-20 pointer-events-none"></div>
        
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
            
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-full relative z-10">
              <div className="h-full flex items-center py-4 sm:py-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 lg:gap-8 items-center w-full">
                  {/* Mobile Layout: Stack vertically on small screens */}
                  <div className="md:col-span-12 lg:col-span-4 order-2 md:order-1">
                    {/* Products Grid - Hidden on mobile, shown on tablet+ */}
                    <div className="hidden md:grid grid-cols-2 gap-3 lg:gap-4">
                      {productImages.slice(0, 4).map((img, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-2 lg:p-3 shadow-xl">
                          <OptimizedImage
                            src={img}
                            alt={`${currentHero.title} ${index + 1}`}
                            className="w-full h-auto rounded"
                            aspectRatio="1/1"
                            objectFit="cover"
                            loading={index < 2 ? 'eager' : 'lazy'}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Promotional Text - Mobile First */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="col-span-1 md:col-span-7 lg:col-span-6 text-white text-center md:text-left order-1 md:order-2"
                  >
                    <div className="space-y-1.5 sm:space-y-2 md:space-y-4">
                      <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-black leading-tight sm:leading-none text-white drop-shadow-2xl">
                        {currentHero.title}
                      </h1>
                      <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-black leading-tight sm:leading-none text-orange-500 drop-shadow-2xl">
                        {currentHero.subtitle}
                      </h2>
                      <p className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-white/90 mt-1 sm:mt-2 md:mt-4">
                        {currentHero.description}
                      </p>
                      <div className="pt-2 sm:pt-3 md:pt-4">
                        <Button 
                          size="lg"
                          className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg shadow-2xl hover:shadow-orange-500/50 transition-all transform hover:scale-105 active:scale-95 min-h-[48px] sm:min-h-[52px] touch-manipulation w-full sm:w-auto"
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

                  {/* Discount Badge - Mobile optimized */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="col-span-1 md:col-span-12 lg:col-span-2 flex flex-col items-center lg:items-end justify-center order-3 py-2 sm:py-4"
                  >
                    {/* Discount Badge */}
                    <div className="relative">
                      <div className="bg-white rounded-full p-3 sm:p-4 md:p-6 shadow-2xl">
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900">
                            {currentHero.discount}
                          </div>
                          <div className="text-[10px] sm:text-xs md:text-sm font-bold text-gray-700 uppercase mt-0.5 sm:mt-1">
                            OFF
                          </div>
                        </div>
                        {/* Badge String Effect */}
                        <div className="absolute -top-1.5 sm:-top-2 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-white/50 rounded-full"></div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows - Mobile optimized */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 bg-orange-500/90 hover:bg-orange-500 active:bg-orange-600 text-white p-2.5 sm:p-3 rounded-full transition-all duration-200 z-30 shadow-xl hover:shadow-2xl touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] flex items-center justify-center"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 bg-orange-500/90 hover:bg-orange-500 active:bg-orange-600 text-white p-2.5 sm:p-3 rounded-full transition-all duration-200 z-30 shadow-xl hover:shadow-2xl touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] flex items-center justify-center"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
        </button>

        {/* Slide Indicators - Mobile optimized */}
        <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex space-x-1.5 sm:space-x-2 z-30">
          {heroProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-200 touch-manipulation min-w-[20px] sm:min-w-[24px] ${
                index === currentSlide ? 'bg-orange-500 w-6 sm:w-8' : 'bg-white/40 hover:bg-white/60 w-1.5 sm:w-2'
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

