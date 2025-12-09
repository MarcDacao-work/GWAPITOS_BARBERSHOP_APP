import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ScrollView, SafeAreaView, KeyboardAvoidingView,
  Platform, Dimensions, ActivityIndicator
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';

const { width } = Dimensions.get('window');

const BarberSignupScreen = ({ navigation }) => {
  // Hook as a fallback when `navigation` prop is not available
  const nav = useNavigation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    specialization: '',
    yearsExperience: '',
    shopLocation: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async () => {
  // Validation
  if (!formData.email || !formData.password || !formData.fullName || !formData.specialization) {
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
    // SIGN UP with EXPLICIT role in both places
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName.trim(),
          phone: formData.phone.trim() || null,
          role: 'barber' // Make sure this is 'barber' exactly
        }
      }
    });

    if (authError) throw authError;

    // Get the user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not created');

    // CREATE PROFILE with the SAME role - Use upsert to handle duplicates
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        auth_id: user.id,
        email: formData.email.trim(),
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim() || null,
        role: 'barber', // Explicitly set to barber
        specialization: formData.specialization.trim() || null,
        shop_location: formData.shopLocation.trim() || null,
        years_experience: parseInt(formData.yearsExperience) || null,
        bio: formData.bio.trim() || null
      }, {
        onConflict: 'auth_id',
        ignoreDuplicates: false
      });

    if (profileError) {
      console.log('Profile error (non-critical):', profileError.message);
    }

    // Sign out so user has to sign in
    await supabase.auth.signOut();
    
    // Navigate to SignIn with success message
    Alert.alert(
      'Success!',
      'Barber account created successfully! Please sign in to access your dashboard.',
      [
        {
          text: 'Sign In',
          onPress: () => {
            navigation.replace('SignIn', {
              email: formData.email,
              message: 'Barber account created! Please sign in.'
            });
          }
        }
      ]
    );
    
  } catch (error) {
    console.error('Barber signup error:', error);
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
              <Icon name="cut-outline" size={26} color="#FFD700" style={styles.titleIcon} />
              <Text style={styles.title}>Barber Registration</Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          <Text style={styles.subtitle}>Join our professional barber community</Text>

          {/* Main Form Section */}
          <View style={styles.form}>
            
            {/* Personal Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="person-outline" size={20} color="#FFD700" />
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>
              
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="John Barber"
                    placeholderTextColor="#666"
                    value={formData.fullName}
                    onChangeText={(text) => handleChange('fullName', text)}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="barber@example.com"
                    placeholderTextColor="#666"
                    value={formData.email}
                    onChangeText={(text) => handleChange('email', text)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Phone</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="(123) 456-7890"
                    placeholderTextColor="#666"
                    value={formData.phone}
                    onChangeText={(text) => handleChange('phone', text)}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>

            {/* Professional Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="briefcase-outline" size={20} color="#FFD700" />
                <Text style={styles.sectionTitle}>Professional Information</Text>
              </View>
              
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Specialization</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Haircut, Shaving, etc."
                    placeholderTextColor="#666"
                    value={formData.specialization}
                    onChangeText={(text) => handleChange('specialization', text)}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Experience (Years)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="5"
                    placeholderTextColor="#666"
                    value={formData.yearsExperience}
                    onChangeText={(text) => handleChange('yearsExperience', text)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Shop Location</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="City, Area"
                    placeholderTextColor="#666"
                    value={formData.shopLocation}
                    onChangeText={(text) => handleChange('shopLocation', text)}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Professional Bio</Text>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  placeholder="Tell us about your skills, experience, and style..."
                  placeholderTextColor="#666"
                  value={formData.bio}
                  onChangeText={(text) => handleChange('bio', text)}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Account Security */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="lock-closed-outline" size={20} color="#FFD700" />
                <Text style={styles.sectionTitle}>Account Security</Text>
              </View>
              
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputWithIcon}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="••••••••"
                      placeholderTextColor="#666"
                      value={formData.password}
                      onChangeText={(text) => handleChange('password', text)}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      style={styles.iconButton}
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
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.inputWithIcon}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="••••••••"
                      placeholderTextColor="#666"
                      value={formData.confirmPassword}
                      onChangeText={(text) => handleChange('confirmPassword', text)}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                      style={styles.iconButton}
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
              
              <Text style={styles.passwordHint}>Minimum 6 characters</Text>
            </View>

            {/* Terms and Signup */}
            <View style={styles.termsContainer}>
              <View style={styles.termsRow}>
                <Icon name="checkmark-circle-outline" size={18} color="#4CAF50" />
                <Text style={styles.termsText}>
                  By signing up, I agree to the professional barber guidelines and terms of service
                </Text>
              </View>
            </View>

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
                    BECOME A BARBER
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already a barber?</Text>
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
    paddingBottom: 15,
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
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  form: {
    paddingHorizontal: 20,
  },
  section: {
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 15,
  },
  flex1: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    padding: 14,
    color: '#ffffff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#444',
    width: '100%', // FIX: Added width 100% to prevent resizing
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 45,
  },
  iconButton: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  passwordHint: {
    color: '#888',
    fontSize: 12,
    marginTop: -5,
    marginBottom: 5,
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
    backgroundColor: '#2196F3',
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

export default BarberSignupScreen;