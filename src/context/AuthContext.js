// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await authService.getUserProfile(userId);
      
      if (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile(null);
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const result = await authService.signIn(email, password);
      return result;
    } catch (error) {
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, fullName, role) => {
    try {
      setLoading(true);
      const result = await authService.signUp(email, password, fullName, role);
      return result;
    } catch (error) {
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const result = await authService.signOut();
      if (result.error) throw new Error(result.error);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      const result = await authService.resetPassword(email);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user?.id) throw new Error('No user logged in');
      
      const result = await authService.updateUserProfile(user.id, updates);
      if (result.error) throw new Error(result.error);
      
      if (result.data) {
        setUserProfile(result.data);
      }
      
      return result;
    } catch (error) {
      return { data: null, error: error.message };
    }
  };

  const value = {
    // State
    user,
    userProfile,
    userRole: userProfile?.role,
    session,
    loading,
    
    // Actions
    login,
    signup,
    logout,
    resetPassword,
    updateProfile,
    
    // Helper functions
    isAuthenticated: !!user,
    isAdmin: userProfile?.role === 'admin',
    isBarber: userProfile?.role === 'barber',
    isCustomer: userProfile?.role === 'customer',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};