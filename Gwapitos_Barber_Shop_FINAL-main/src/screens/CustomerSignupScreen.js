import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ScrollView, SafeAreaView, KeyboardAvoidingView,
  Platform, ActivityIndicator
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { supabase } from '../services/supabase';

const CustomerSignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSignup = async () => {
    // Validation
    if (!formData.email || !formData.password || !formData.fullName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
  try {
    // 1. Sign up with auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName.trim(),
          phone: formData.phone.trim() || null,
          role: 'customer'
        }
      }
    });

    if (authError) throw authError;

    // 2. Wait for auth to complete
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 3. Get the user that was just created
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // 4. Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          auth_id: user.id,
          email: formData.email.trim(),
          full_name: formData.fullName.trim(),
          phone: formData.phone.trim() || null,
          role: 'customer'
        });

      if (profileError && !profileError.message.includes('duplicate')) {
        throw profileError;
      }

      // 5. Create customer record in customers table
      const { error: customerError } = await supabase
        .from('customers')
        .insert({
          auth_id: user.id,
          email: formData.email.trim(),
          full_name: formData.fullName.trim(),
          phone: formData.phone.trim() || null,
          created_at: new Date().toISOString()
        });

      if (customerError) {
        console.log('Customer table error:', customerError.message);
        // Don't fail if customer already exists
        if (!customerError.message.includes('duplicate')) {
          throw customerError;
        }
      }

      // 6. Sign out immediately so user has to sign in
      await supabase.auth.signOut();

      // 7. Show success message
      Alert.alert(
        'Success!',
        'Customer account created! Please sign in.',
        [
          {
            text: 'Sign In',
            onPress: () => {
              navigation.replace('SignIn', {
                email: formData.email,
                message: 'Account created successfully!'
              });
            },
          },
        ]
      );
    } else {
      throw new Error('User not created');
    }
  } catch (error) {
    console.error('Signup error:', error);
    Alert.alert('Error', error.message || 'Signup failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back-outline" size={28} color="#FFD700" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Icon name="person-outline" size={24} color="#FFD700" style={styles.titleIcon} />
              <Text style={styles.title}>Customer Registration</Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          <Text style={styles.subtitle}>Join our community of happy customers</Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Icon name="person-outline" size={18} color="#FFD700" />
                <Text style={styles.label}>Full Name</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#666"
                value={formData.fullName}
                onChangeText={(text) => handleChange('fullName', text)}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Icon name="mail-outline" size={18} color="#FFD700" />
                <Text style={styles.label}>Email Address</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="john@example.com"
                placeholderTextColor="#666"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Icon name="call-outline" size={18} color="#FFD700" />
                <Text style={styles.label}>Phone Number (Optional)</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="(123) 456-7890"
                placeholderTextColor="#666"
                value={formData.phone}
                onChangeText={(text) => handleChange('phone', text)}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            </View>

            {/* Password Section */}
            <View style={styles.passwordSection}>
              <View style={styles.sectionHeader}>
                <Icon name="lock-closed-outline" size={20} color="#FFD700" />
                <Text style={styles.sectionTitle}>Account Security</Text>
              </View>
              
              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="••••••••"
                    placeholderTextColor="#666"
                    value={formData.password}
                    onChangeText={(text) => handleChange('password', text)}
                    secureTextEntry={!showPassword}
                    autoComplete="password-new"
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
                <Text style={styles.passwordHint}>Minimum 6 characters</Text>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="••••••••"
                    placeholderTextColor="#666"
                    value={formData.confirmPassword}
                    onChangeText={(text) => handleChange('confirmPassword', text)}
                    secureTextEntry={!showConfirmPassword}
                    autoComplete="password-new"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Icon
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#888"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Terms */}
            <View style={styles.termsContainer}>
              <View style={styles.termsRow}>
                <Icon name="checkmark-circle-outline" size={18} color="#4CAF50" />
                <Text style={styles.termsText}>
                  By signing up, I agree to the Terms of Service and Privacy Policy
                </Text>
              </View>
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              style={[styles.signupButton, loading && styles.disabledButton]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="checkmark-circle" size={22} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.signupButtonText}>
                    CREATE ACCOUNT
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity
                style={styles.signInLinkContainer}
                onPress={() => navigation.navigate('SignIn')}
              >
                <Text style={styles.signInLink}>Sign In</Text>
                <Icon name="arrow-forward" size={16} color="#FFD700" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 20,
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
  titleIcon: {
    marginRight: 5,
  },
  title: {
    fontSize: 22,
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
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  form: {
    paddingHorizontal: 25,
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
    width: '100%', // FIX: Added width 100%
  },
  passwordSection: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
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
  passwordHint: {
    color: '#888',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  termsContainer: {
    marginBottom: 25,
    paddingHorizontal: 5,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  termsText: {
    color: '#888',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  signupButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 10,
  },
  signupButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  footerText: {
    color: '#ffffff',
    fontSize: 15,
  },
  signInLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  signInLink: {
    color: '#FFD700',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default CustomerSignupScreen;