import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import CustomerSignupScreen from '../screens/CustomerSignupScreen';
import BarberSignupScreen from '../screens/BarberSignupScreen';
import SignInScreen from '../screens/SignInScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#1a1a1a' },
      }}
      initialRouteName="Welcome"
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen 
        name="SignIn" 
        component={SignInScreen} 
        // ADD THIS to ensure the screen exists with proper configuration
        options={{ 
          gestureEnabled: true,
          animationEnabled: true
        }}
      />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="CustomerSignup" component={CustomerSignupScreen} />
      <Stack.Screen name="BarberSignup" component={BarberSignupScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;