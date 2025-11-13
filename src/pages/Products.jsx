import React, { useState, useMemo, useEffect, useRef, startTransition } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Search, SlidersHorizontal, Grid, List } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useProducts } from '../context/ProductContext';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const isSyncingFromUrl = useRef(false);
  const prevSearchRef = useRef(location.search);
  const { products, categories, loading, error } = useProducts();
  
  // Initialize from URL params
  const categoryFromUrl = searchParams.get('category') || 'all';
  const searchFromUrl = searchParams.get('search') || '';
  
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const maxProductPrice = useMemo(() => {
    if (products.length === 0) {
      return 10000;
    }
    return products.reduce((max, product) => {
      const price = product.discountPrice || product.price || 0;
      return price > max ? price : max;
    }, 0);
  }, [products]);

  const sliderMax = useMemo(() => {
    const rounded = Math.ceil((maxProductPrice || 1000) / 500) * 500;
    return Math.max(1000, rounded);
  }, [maxProductPrice]);

  useEffect(() => {
    setPriceRange((prev) => {
      const [min, currentMax] = prev;
      if (currentMax === sliderMax) {
        return prev;
      }
      if (min === 0) {
        return [0, sliderMax];
      }
      if (currentMax > sliderMax) {
        return [min, sliderMax];
      }
      return prev;
    });
  }, [sliderMax]);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Sync state with URL when URL changes (e.g., when clicking category in header)
  useEffect(() => {
    // Only sync if URL actually changed
    if (location.search !== prevSearchRef.current) {
      prevSearchRef.current = location.search;
      
      const urlCategory = searchParams.get('category') || 'all';
      const urlSearch = searchParams.get('search') || '';
      
      // Only update if values actually changed to prevent unnecessary re-renders
      if (urlCategory !== selectedCategory || urlSearch !== searchQuery) {
        // Mark that we're syncing from URL to prevent circular updates
        isSyncingFromUrl.current = true;
        
        // Use startTransition to mark this as non-urgent update to prevent flickering
        startTransition(() => {
          setSelectedCategory(urlCategory);
          setSearchQuery(urlSearch);
        });
        
        // Reset flag after state updates complete
        setTimeout(() => {
          isSyncingFromUrl.current = false;
        }, 0);
      }
    }
  }, [location.search, searchParams, selectedCategory, searchQuery]);

  // Update URL when category or search changes from user interaction in this component
  useEffect(() => {
    // Skip if we're currently syncing from URL
    if (isSyncingFromUrl.current) {
      return;
    }
    
    const currentCategory = searchParams.get('category') || 'all';
    const currentSearch = searchParams.get('search') || '';
    
    // Only update URL if state differs from current URL
    if (selectedCategory !== currentCategory || searchQuery !== currentSearch) {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }
      if (searchQuery) {
        params.set('search', searchQuery);
      }
      setSearchParams(params, { replace: true });
    }
  }, [selectedCategory, searchQuery, setSearchParams, searchParams]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const productPrice = product.discountPrice || product.price;
      const matchesPrice = productPrice >= priceRange[0] && productPrice <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.discountPrice || a.price) - (b.discountPrice || b.price);
        case 'price-high':
          return (b.discountPrice || b.price) - (a.discountPrice || a.price);
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, priceRange, sortBy]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handlePriceRangeChange = (e) => {
    const value = parseInt(e.target.value);
    const nextValue = Number.isFinite(value) ? Math.min(value, sliderMax) : sliderMax;
    setPriceRange([0, nextValue]);
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header - Mobile-first */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 md:mb-4">
              All Products
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-gray-600">
              Discover our complete collection of authentic Bengali products
            </p>
            {error && (
              <p className="text-sm text-red-500 mt-2">
                {error}. Showing available products.
              </p>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
          {/* Sidebar Filters - Mobile-first */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden"
                >
                  ×
                </Button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Products
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Categories
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-emerald-100 text-emerald-800 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All Products ({products.length})
                  </button>
                  {categories.map((category) => {
                    const categoryId = category.slug || category.id;
                    const count = products.filter(p => p.category === categoryId).length;
                    return (
                      <button
                        key={categoryId}
                        onClick={() => handleCategoryChange(categoryId)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === categoryId
                            ? 'bg-emerald-100 text-emerald-800 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span className="mr-2">{category.icon}</span>
                        {category.name} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Price Range: ৳0 - ৳{priceRange[1]}
                </label>
                <input
                  type="range"
                  min="0"
                  max={sliderMax}
                  step="100"
                  value={priceRange[1]}
                  onChange={handlePriceRangeChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>৳0</span>
                  <span>৳{sliderMax.toLocaleString()}+</span>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar - Mobile-first */}
            <div className="bg-white rounded-lg shadow-sm p-3 md:p-4 mb-4 md:mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
                <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden min-w-[48px] min-h-[48px] md:min-h-[36px]"
                  >
                    <Filter className="w-4 h-4 md:mr-2" />
                    <span className="hidden sm:inline">Filters</span>
                  </Button>
                  
                  <p className="text-xs md:text-sm text-gray-600">
                    Showing {filteredProducts.length} of {products.length} products
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="min-w-[48px] min-h-[48px] md:min-h-[36px]"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="min-w-[48px] min-h-[48px] md:min-h-[36px]"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid - Mobile-first: 1 column on mobile, 2 on tablet, 3+ on desktop */}
            {filteredProducts.length > 0 ? (
              <motion.div
                key={`products-${selectedCategory}-${searchQuery}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className={`grid gap-2 md:gap-3 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
                    : 'grid-cols-1'
                }`}
              >
                {filteredProducts.map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    index={index}
                  />
                ))}
              </motion.div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or browse our categories
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setPriceRange([0, 10000]);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Load More Button (for pagination simulation) */}
            {filteredProducts.length > 0 && filteredProducts.length >= 12 && (
              <div className="text-center mt-12">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  Load More Products
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;

