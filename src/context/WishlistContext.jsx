import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/wishlist/index.php`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setWishlistItems(data.wishlist || []);
        }
      } else if (response.status === 401) {
        // User not authenticated - set empty wishlist
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      // On error, set empty wishlist
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Load wishlist when user is authenticated
  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      // Clear wishlist when user logs out
      setWishlistItems([]);
    }
  }, [user]);

  const addToWishlist = async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wishlist/index.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ product_id: productId }),
      });

      // Check response status before parsing JSON
      if (response.status === 401) {
        // Try to parse error message if available
        try {
          const errorData = await response.json();
          toast.error(errorData.error || 'Please login to add items to wishlist');
        } catch {
          toast.error('Please login to add items to wishlist');
        }
        return false;
      }

      const data = await response.json();

      if (data.success) {
        await loadWishlist();
        toast.success('Added to wishlist!');
        return true;
      } else {
        toast.error(data.error || 'Failed to add to wishlist');
        return false;
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wishlist/index.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ product_id: productId }),
      });

      // Check response status before parsing JSON
      if (response.status === 401) {
        // Try to parse error message if available
        try {
          const errorData = await response.json();
          toast.error(errorData.error || 'Please login to manage wishlist');
        } catch {
          toast.error('Please login to manage wishlist');
        }
        return false;
      }

      const data = await response.json();

      if (data.success) {
        await loadWishlist();
        toast.success('Removed from wishlist');
        return true;
      } else {
        toast.error(data.error || 'Failed to remove from wishlist');
        return false;
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
      return false;
    }
  };

  const toggleWishlist = async (productId) => {
    const isInWishlist = wishlistItems.some(item => item.product_id === productId);
    
    if (isInWishlist) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    loadWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

