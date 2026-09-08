import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api/auth.service';
import { DEFAULT_MARKETPLACE_CATEGORY, normalizeCategoryId, MARKETPLACE_CATEGORIES } from '../constants/categories';

// Create Context
export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  activeCategory: DEFAULT_MARKETPLACE_CATEGORY,
  availableCategories: MARKETPLACE_CATEGORIES,
  login: async () => {},
  buyerLogin: async () => {},
  sellerLogin: async () => {},
  adminLogin: async () => {},
  register: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
  updateUser: () => {},
  switchCategory: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(() => {
    try {
      const stored = localStorage.getItem('velvorax_active_category');
      return stored ? normalizeCategoryId(stored) : DEFAULT_MARKETPLACE_CATEGORY;
    } catch {
      return DEFAULT_MARKETPLACE_CATEGORY;
    }
  });

  // Sync active category when user state changes
  const syncCategoryFromUser = useCallback((userData) => {
    if (!userData) return;
    const cat = userData.activeCategory || userData.sellerCategory;
    if (cat) {
      const normalized = normalizeCategoryId(cat);
      setActiveCategory(normalized);
      try {
        localStorage.setItem('velvorax_active_category', normalized);
      } catch (e) {}
    }
  }, []);

  // Check if user is already logged in on mount (validated via backend /auth/me)
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        syncCategoryFromUser(currentUser);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [syncCategoryFromUser]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    setUser(null); // Clean previous session state immediately
    const targetCategory = credentials?.category || credentials?.sellerCategory || activeCategory;
    const normalizedCategory = normalizeCategoryId(targetCategory);
    
    const payload = {
      ...credentials,
      category: normalizedCategory
    };

    const userData = await authService.login(payload);
    setUser(userData);
    if (userData) {
      const resolved = normalizeCategoryId(userData.activeCategory || normalizedCategory);
      setActiveCategory(resolved);
      try {
        localStorage.setItem('velvorax_active_category', resolved);
      } catch (e) {}
    }
    return userData;
  };

  const buyerLogin = async (credentials) => {
    setUser(null);
    const userData = await authService.buyerLogin(credentials);
    setUser(userData);
    return userData;
  };

  const sellerLogin = async (credentials) => {
    setUser(null);
    const targetCategory = credentials?.category || credentials?.sellerCategory || activeCategory;
    const normalizedCategory = normalizeCategoryId(targetCategory);

    const payload = {
      ...credentials,
      category: normalizedCategory
    };

    const userData = await authService.sellerLogin(payload);
    setUser(userData);
    if (userData) {
      const resolved = normalizeCategoryId(userData.activeCategory || normalizedCategory);
      setActiveCategory(resolved);
      try {
        localStorage.setItem('velvorax_active_category', resolved);
      } catch (e) {}
    }
    return userData;
  };

  const switchCategory = async (newCategory) => {
    const normalized = normalizeCategoryId(newCategory);
    setActiveCategory(normalized);
    try {
      localStorage.setItem('velvorax_active_category', normalized);
    } catch (e) {}

    // Update state immediately for instant UI response
    setUser(prev => prev ? { ...prev, activeCategory: normalized } : prev);

    // Persist to backend if authenticated
    if (user) {
      try {
        await authService.switchCategory(normalized);
      } catch (err) {
        console.warn('Could not persist category switch to backend:', err);
      }
    }
    return normalized;
  };

  const adminLogin = async (credentials) => {
    setUser(null);
    const userData = await authService.adminLogin(credentials);
    setUser(userData);
    return userData;
  };

  const verifyAdmin2FA = async ({ tempSessionId, code }) => {
    setUser(null);
    const userData = await authService.verifyAdmin2FA({ tempSessionId, code });
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    setUser(null);
    const initialCat = normalizeCategoryId(userData.category || userData.sellerCategory || activeCategory);
    const payload = {
      ...userData,
      category: initialCat,
      sellerCategory: initialCat
    };
    const newUserData = await authService.register(payload);
    setUser(newUserData);
    if (newUserData) {
      setActiveCategory(initialCat);
      try {
        localStorage.setItem('velvorax_active_category', initialCat);
      } catch (e) {}
    }
    return newUserData;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error in AuthContext:', err);
    } finally {
      try {
        localStorage.removeItem('velvorax_location');
        localStorage.removeItem('velvorax_active_category');
      } catch (e) {}
      setUser(null);
      setActiveCategory(DEFAULT_MARKETPLACE_CATEGORY);
    }
  };

  const updateUser = (updatedData) => {
    setUser(prev => {
      if (!prev) return updatedData;
      const merged = { ...prev, ...updatedData };
      if (merged.activeCategory) {
        setActiveCategory(normalizeCategoryId(merged.activeCategory));
      }
      return merged;
    });
  };

  const availableCategories = (user?.enabledCategories && user.enabledCategories.length > 0)
    ? MARKETPLACE_CATEGORIES.filter(c => user.enabledCategories.includes(c.id) || user.enabledCategories.includes(c.slug))
    : MARKETPLACE_CATEGORIES;

  const contextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    activeCategory,
    availableCategories,
    switchCategory,
    login,
    buyerLogin,
    sellerLogin,
    adminLogin,
    verifyAdmin2FA,
    register,
    logout,
    checkAuth,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export { useAuth } from '../hooks/useAuth';


