import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  showAuthModal: boolean;
  authMode: 'login' | 'signup';
  setShowAuthModal: (show: boolean) => void;
  setAuthMode: (mode: 'login' | 'signup') => void;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  showAuthModal: false,
  authMode: 'login',
  setShowAuthModal: () => {},
  setAuthMode: () => {},
  login: async () => ({}),
  signup: async () => ({}),
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    // Check for stored user session
    const stored = localStorage.getItem('pickle_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('ecom_customers')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error || !data) {
        return { error: 'Invalid email or password' };
      }

      const userData: User = {
        id: data.id,
        email: data.email,
        name: data.name || email.split('@')[0],
      };
      setUser(userData);
      localStorage.setItem('pickle_user', JSON.stringify(userData));
      setShowAuthModal(false);
      return {};
    } catch {
      return { error: 'Login failed. Please try again.' };
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<{ error?: string }> => {
    try {
      // Check if user already exists
      const { data: existing } = await supabase
        .from('ecom_customers')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (existing) {
        return { error: 'An account with this email already exists' };
      }

      // Create new customer
      const { data, error } = await supabase
        .from('ecom_customers')
        .insert({
          email: email.toLowerCase(),
          name,
        })
        .select('*')
        .single();

      if (error) {
        return { error: 'Signup failed. Please try again.' };
      }

      const userData: User = {
        id: data.id,
        email: data.email,
        name: data.name,
      };
      setUser(userData);
      localStorage.setItem('pickle_user', JSON.stringify(userData));
      setShowAuthModal(false);
      return {};
    } catch {
      return { error: 'Signup failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pickle_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        showAuthModal,
        authMode,
        setShowAuthModal,
        setAuthMode,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
