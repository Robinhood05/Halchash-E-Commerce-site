import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session on app load
    const savedUser = Cookies.get('user');
    const savedToken = Cookies.get('auth_token');
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        
        // If user exists but no auth_token cookie, try to restore it from user data
        if (!savedToken && userData.jwt_token) {
          Cookies.set('auth_token', userData.jwt_token, { 
            expires: 7, 
            sameSite: 'lax',
            path: '/',
            secure: window.location.protocol === 'https:'
          });
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        Cookies.remove('user');
        Cookies.remove('auth_token');
      }
    } else if (!savedToken) {
      // No user and no token - clear any stale cookies
      Cookies.remove('auth_token');
    }
    setIsLoading(false);
  }, []);

  const persistUser = (userData) => {
    setUser(userData);
    Cookies.set('user', JSON.stringify(userData), { expires: 7 });
  };

  const login = async (email, password) => {
    try {
      const url = `${API_BASE_URL}/api/auth/login.php`;
      console.log('Login request to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      console.log('Login response status:', response.status, response.statusText);

      // Check if response is ok before parsing JSON
      let data;
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Response was:', responseText);
        return { 
          success: false, 
          error: response.status === 401 
            ? 'Invalid email or password' 
            : `Server error (${response.status}). Please check console for details.` 
        };
      }

      // Handle non-ok responses
      if (!response.ok) {
        return { 
          success: false, 
          error: data.error || (response.status === 401 ? 'Invalid email or password' : 'Login failed. Please try again.')
        };
      }

      // Handle successful response
      if (data.success && data.user) {
        // Set auth_token cookie for backend authentication
        if (data.token) {
          // Set cookie for localhost domain (works across ports)
          const hostname = window.location.hostname;
          const cookieOptions = { 
            expires: 7, 
            sameSite: 'lax',
            path: '/'
          };
          
          // For localhost, set domain explicitly to allow cross-port cookies
          if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // Don't set domain for localhost - it won't work
            // Cookies on localhost work across ports by default
          } else {
            // For other domains, set the domain
            cookieOptions.domain = hostname;
          }
          
          // Only set secure in production (HTTPS)
          if (window.location.protocol === 'https:') {
            cookieOptions.secure = true;
          }
          
          Cookies.set('auth_token', data.token, cookieOptions);
          
          // Verify cookie was set
          const verifyCookie = Cookies.get('auth_token');
          console.log('Auth token cookie set:', verifyCookie ? 'SUCCESS' : 'FAILED', data.token.substring(0, 20) + '...');
          
          if (!verifyCookie) {
            console.error('Cookie setting failed. Token:', data.token.substring(0, 30));
          }
        }
        persistUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { 
          success: false, 
          error: data.error || 'Login failed. Please try again.' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      // Handle network errors
      if (error.message.includes('fetch')) {
        return { 
          success: false, 
          error: 'Unable to connect to server. Please check your connection.' 
        };
      }
      return { 
        success: false, 
        error: error.message || 'Unable to login. Please try again.' 
      };
    }
  };

  const signup = async (formData) => {
    try {
      const { name, email, password, phone = '', address = '' } = formData;

      const response = await fetch(`${API_BASE_URL}/api/auth/signup.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, address })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      // Set auth_token cookie for backend authentication
      if (data.token) {
        Cookies.set('auth_token', data.token, { 
          expires: 7, 
          sameSite: 'lax',
          path: '/',
          secure: window.location.protocol === 'https:'
        });
      }
      persistUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message || 'Unable to signup' };
    }
  };

  const uploadAvatar = async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('userId', user.id);

      const response = await fetch(`${API_BASE_URL}/api/profile/upload-avatar.php`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Avatar upload failed');
      }

      const updatedUser = { ...user, avatar: data.avatar };
      persistUser(updatedUser);
      return { success: true, avatar: data.avatar };
    } catch (error) {
      return { success: false, error: error.message || 'Avatar upload failed' };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/update.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...profileData })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Profile update failed');
      }

      const updatedUser = { ...user, ...data.user };
      persistUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: error.message || 'Unable to update profile' };
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove('user');
    Cookies.remove('auth_token');
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
    uploadAvatar,
    updateProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

