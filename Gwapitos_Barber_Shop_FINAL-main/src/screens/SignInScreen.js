import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  Alert, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { setLastError } from '../utils/errorStore';

const SignInScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Prefill email and show message when coming from signup
    if (route?.params?.email) {
      setEmail(route.params.email);
    }

    if (route?.params?.message) {
      // Small delay so UI is ready
      setTimeout(() => {
        Alert.alert('Info', route.params.message);
      }, 250);
    }
  }, [route]);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting sign in with email:', email.trim());
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error('Sign in error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        throw error;
      }
      
      console.log('Sign in successful for user:', data.user?.email);
      
      // Get user role after successful login
      if (data?.user) {
        // Get profile from database
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('auth_id', data.user.id)
          .maybeSingle();
        
        let userRole = 'customer';
        let userName = email.split('@')[0];
        
        if (!profileError && profile) {
          userRole = profile.role || 'customer';
          userName = profile.full_name || userName;
        } else {
          // Check metadata if no profile
          userRole = data.user.user_metadata?.role || 'customer';
          userName = data.user.user_metadata?.full_name || userName;
        }
        
        console.log('👤 Detected role:', userRole);
        console.log('👤 Detected name:', userName);
        
        // Show appropriate welcome message WITHOUT mentioning role
        Alert.alert(
          'Success!', 
          `Welcome back, ${userName}!`,
          [{ text: 'OK' }]
        );
        
        // The auth state change in MainNavigator will handle navigation
        // No need to navigate manually
      }
    } catch (error) {
      console.error('Full sign in error:', {
        message: error.message,
        code: error.code,
        status: error.status
      });
      
      setLastError(error);
      
      // More specific error messages
      if (error.message.includes('Invalid login credentials')) {
        Alert.alert(
          'Login Failed',
          'The email or password is incorrect. Please check your credentials and try again.',
          [
            { text: 'OK' },
            { 
              text: 'Reset Password',
              onPress: () => handleForgotPassword()
            },
            {
              text: 'Create Account',
              onPress: () => navigation.navigate('RoleSelection')
            }
          ]
        );
      } else if (error.message.includes('Email not confirmed')) {
        Alert.alert('Email Not Confirmed', 'Please check your email and confirm your account before signing in.');
      } else {
        Alert.alert('Error', error.message || 'Sign in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email first');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'http://localhost:3000/reset-password',
      });
      
      if (error) throw error;
      
      Alert.alert(
        'Password Reset Email Sent',
        `Check your email (${email}) for password reset instructions.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert('Error', error.message || 'Could not send reset email. Please try again.');
    }
  };

  const handleDebugBarberLogin = () => {
    Alert.alert(
      'Debug: Test Barber Login',
      'Use these test credentials:\n\nEmail: barber@example.com\nPassword: barber123',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Use Credentials',
          onPress: () => {
            setEmail('barber@example.com');
            setPassword('barber123');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back-outline" size={28} color="#FFD700" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Icon name="log-in-outline" size={24} color="#FFD700" />
              <Text style={styles.title}>Sign In</Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          <Text style={styles.subtitle}>Welcome back! Please sign in to continue</Text>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Icon name="mail-outline" size={18} color="#FFD700" />
                <Text style={styles.label}>Email Address</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Icon name="lock-closed-outline" size={18} color="#FFD700" />
                <Text style={styles.label}>Password</Text>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="••••••••"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.signInButton, loading && styles.disabledButton]}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#1a1a1a" />
              ) : (
                <>
                  <Icon name="log-in" size={22} color="#1a1a1a" style={styles.buttonIcon} />
                  <Text style={styles.signInButtonText}>SIGN IN</Text>
                </>
              )}
            </TouchableOpacity>
            
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.otherOption}
              onPress={() => navigation.navigate('RoleSelection')}
            >
              <Icon name="person-add-outline" size={18} color="#FFD700" />
              <Text style={styles.otherOptionText}>Create New Account</Text>
            </TouchableOpacity>

            {/* Debug button for testing */}
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={handleDebugBarberLogin}
            >
              <Icon name="bug-outline" size={16} color="#888" />
              <Text style={styles.debugButtonText}>Test Barber Login</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Icon name="shield-checkmark-outline" size={16} color="#666" />
            <Text style={styles.footerText}>Secure login with encryption</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerRight: {
    width: 44,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
    marginTop: 10,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 25,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 10,
  },
  signInButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#888',
    paddingHorizontal: 15,
    fontSize: 14,
  },
  otherOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  otherOptionText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 15,
    padding: 10,
  },
  debugButtonText: {
    color: '#888',
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 30,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
});

export default SignInScreen;