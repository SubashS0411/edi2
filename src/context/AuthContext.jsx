import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for active session on load
    const storedUser = localStorage.getItem('edi_current_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('edi_current_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((email, password) => {
    // Simulate DB lookup
    const allUsers = JSON.parse(localStorage.getItem('edi_users') || '[]');
    const foundUser = allUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('edi_current_user', JSON.stringify(foundUser));
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  }, []);

  const register = useCallback((userData) => {
    const allUsers = JSON.parse(localStorage.getItem('edi_users') || '[]');
    
    if (allUsers.find(u => u.email === userData.email)) {
      return { success: false, error: 'Email already registered' };
    }

    const newUser = {
      ...userData,
      id: Date.now().toString(),
      subscriptionStatus: 'inactive',
      subscriptionExpiry: null
    };

    allUsers.push(newUser);
    localStorage.setItem('edi_users', JSON.stringify(allUsers));
    
    // Auto login after register
    setUser(newUser);
    localStorage.setItem('edi_current_user', JSON.stringify(newUser));
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('edi_current_user');
  }, []);

  const activateSubscription = useCallback((paymentRef) => {
    if (!user) return;

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const updatedUser = {
      ...user,
      subscriptionStatus: 'active',
      subscriptionExpiry: expiryDate.toISOString(),
      lastPaymentRef: paymentRef // Store reference number for verification audit
    };

    // Update current session
    setUser(updatedUser);
    localStorage.setItem('edi_current_user', JSON.stringify(updatedUser));

    // Update "DB"
    const allUsers = JSON.parse(localStorage.getItem('edi_users') || '[]');
    const updatedAllUsers = allUsers.map(u => u.id === user.id ? updatedUser : u);
    localStorage.setItem('edi_users', JSON.stringify(updatedAllUsers));
  }, [user]);

  const isSubscriptionValid = useCallback(() => {
    if (!user || user.subscriptionStatus !== 'active' || !user.subscriptionExpiry) return false;
    return new Date(user.subscriptionExpiry) > new Date();
  }, [user]);

  // Memoize the context value to prevent unnecessary re-renders in consumers
  const value = useMemo(() => ({
    user, 
    login, 
    register, 
    logout, 
    activateSubscription, 
    isSubscriptionValid, 
    loading
  }), [user, login, register, logout, activateSubscription, isSubscriptionValid, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);