import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Icon name="cut" size={80} color="#FFD700" style={styles.mainIcon} />
          </View>
          <Icon name="star" size={40} color="#FFD700" style={styles.sparkleIcon1} />
          <Icon name="star" size={40} color="#FFD700" style={styles.sparkleIcon2} />
        </View>
        
        {/* App Name */}
        <View style={styles.titleContainer}>
          <Text style={styles.appName}>GWAPITOS</Text>
          <Text style={styles.subtitle}>BARBER SHOP</Text>
        </View>
        
        {/* Tagline */}
        <Text style={styles.tagline}>
          skip the line, keep the style
        </Text>
        
        {/* Welcome Message */}
        <Text style={styles.welcomeText}>
          Book appointments, discover barbers, and get the perfect haircut every time
        </Text>
        
        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.signUpButton]}
            onPress={() => navigation.navigate('RoleSelection')}
            activeOpacity={0.8}
          >
            <Icon name="person-add" size={22} color="#FFD700" style={styles.buttonIcon} />
            <Text style={styles.signUpButtonText}>GET STARTED</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.signInButton]}
            onPress={() => navigation.navigate('SignIn')}
            activeOpacity={0.8}
          >
            <Icon name="log-in" size={22} color="#1a1a1a" style={styles.buttonIcon} />
            <Text style={styles.signInButtonText}>SIGN IN</Text>
          </TouchableOpacity>
        </View>
        
        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Icon name="calendar" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Easy Booking</Text>
          </View>
          <View style={styles.feature}>
            <Icon name="star" size={20} color="#FFD700" />
            <Text style={styles.featureText}>Top Barbers</Text>
          </View>
          <View style={styles.feature}>
            <Icon name="shield-checkmark" size={20} color="#2196F3" />
            <Text style={styles.featureText}>Secure</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 40,
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  mainIcon: {
    transform: [{ rotate: '90deg' }],
  },
  sparkleIcon1: {
    position: 'absolute',
    top: 10,
    left: 10,
    opacity: 0.8,
  },
  sparkleIcon2: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    opacity: 0.8,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    letterSpacing: 3,
    marginTop: -2,
  },
  tagline: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 20,
    fontStyle: 'italic',
    opacity: 0.9,
  },
  welcomeText: {
    fontSize: 15,
    color: '#b0b0b0',
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
    marginBottom: 50,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  signUpButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  signInButton: {
    backgroundColor: '#FFD700',
  },
  buttonIcon: {
    marginRight: 12,
  },
  signUpButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  signInButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginTop: 20,
  },
  feature: {
    alignItems: 'center',
    gap: 5,
  },
  featureText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default WelcomeScreen;