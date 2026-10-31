import { useState, useEffect } from 'react';
import { AuthContext } from './authContextDef.js';
import { getMe, login as apiLogin, register as apiRegister, logout as apiLogout } from '../../services/api.js';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshUser = async () => {
    try {
      const response = await getMe();
      setUser(response.data.user);
      setCustomer(response.data.customer);
      setError(null);
    } catch {
      setUser(null);
      setCustomer(null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    getMe()
      .then((response) => {
        if (isMounted) {
          setUser(response.data.user);
          setCustomer(response.data.customer);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          setCustomer(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials) => {
    setError(null);
    const response = await apiLogin(credentials);
    setUser(response.data.user);
    setCustomer(response.data.customer);
    return response.data;
  };

  const register = async (customerData) => {
    setError(null);
    const response = await apiRegister(customerData);
    setUser(response.data.user);
    setCustomer(response.data.customer);
    return response.data;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
      setCustomer(null);
    }
  };

  const value = {
    user,
    customer,
    loading,
    error,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff',
    isCustomer: user?.role === 'customer',
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
