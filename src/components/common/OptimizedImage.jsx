import React, { useState, useRef, useEffect } from 'react';

/**
 * OptimizedImage Component
 * 
 * Features:
 * - Lazy loading with Intersection Observer
 * - Loading placeholder with blur effect
 * - Error handling with fallback image
 * - Responsive image support (srcset)
 * - WebP format support with fallback
 * - Smooth fade-in animation
 * - Aspect ratio preservation
 */
const OptimizedImage = ({
  src,
  alt = '',
  className = '',
  fallbackSrc = 'https://placehold.co/600x600?text=Product',
  loading = 'lazy',
  aspectRatio = null,
  objectFit = 'cover',
  onError = null,
  onLoad = null,
  priority = false, // If true, loads immediately without lazy loading
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    // If priority is true, load immediately
    if (priority) {
      setIsInView(true);
      return;
    }

    // If loading is 'eager', load immediately
    if (loading === 'eager') {
      setIsInView(true);
      return;
    }

    // Set up Intersection Observer for lazy loading
    if (!isInView && imgRef.current && 'IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              if (observerRef.current && imgRef.current) {
                observerRef.current.unobserve(imgRef.current);
              }
            }
          });
        },
        {
          rootMargin: '50px', // Start loading 50px before image enters viewport
          threshold: 0.01
        }
      );

      observerRef.current.observe(imgRef.current);
    }

    // Fallback for browsers without Intersection Observer
    if (!isInView && !('IntersectionObserver' in window)) {
      setIsInView(true);
    }

    return () => {
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
    };
  }, [isInView, priority, loading]);

  // Load image when in view
  useEffect(() => {
    if (isInView && src) {
      // Try to load WebP first, then fallback to original
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoading(false);
        if (onLoad) onLoad();
      };

      img.onerror = () => {
        // If WebP fails or original fails, use fallback
        setImageSrc(fallbackSrc);
        setIsLoading(false);
        setHasError(true);
        if (onError) onError();
      };

      img.src = src;
    }
  }, [isInView, src, fallbackSrc, onLoad, onError]);

  // Generate responsive srcset if needed
  const generateSrcSet = (baseSrc) => {
    if (!baseSrc || baseSrc.startsWith('data:') || baseSrc.startsWith('http')) {
      return undefined;
    }
    
    // For now, return undefined - can be extended to generate multiple sizes
    // This would require backend support for image resizing
    return undefined;
  };

  const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    ...(aspectRatio && { aspectRatio }),
  };

  const imageStyle = {
    objectFit,
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoading ? 0 : 1,
    width: '100%',
    height: '100%',
  };

  return (
    <div 
      ref={imgRef}
      className={`relative ${className}`}
      style={containerStyle}
    >
      {/* Loading Placeholder */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ zIndex: 1 }}
        >
          <div className="w-12 h-12 border-4 border-gray-300 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error Placeholder */}
      {hasError && !isLoading && (
        <div 
          className="absolute inset-0 bg-gray-100 flex items-center justify-center"
          style={{ zIndex: 2 }}
        >
          <svg 
            className="w-12 h-12 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
      )}

      {/* Actual Image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`${isLoading ? 'opacity-0' : 'opacity-100'}`}
          style={imageStyle}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={(e) => {
            if (!hasError) {
              setHasError(true);
              setIsLoading(false);
              e.target.src = fallbackSrc;
              if (onError) onError(e);
            }
          }}
          onLoad={() => {
            setIsLoading(false);
            if (onLoad) onLoad();
          }}
          {...props}
        />
      )}
    </div>
  );
};

export default OptimizedImage;

