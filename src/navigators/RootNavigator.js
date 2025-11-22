// src/navigators/RootNavigator.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../screens/common/LoadingScreen';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

// src/navigators/RootNavigator.js - ADD ERROR HANDLING
export default function RootNavigator() {
  const { user, userRole, loading } = useAuth();

  console.log('RootNavigator - User:', user?.id, 'Role:', userRole, 'Loading:', loading);

  if (loading) {
    return <LoadingScreen />;
  }

  // Add safety check
  if (user && !userRole) {
    console.log('User exists but no role, defaulting to customer');
    return <AppNavigator userRole="customer" />;
  }

  return user ? <AppNavigator userRole={userRole} /> : <AuthNavigator />;
}