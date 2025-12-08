import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';

const RoleSelectionScreen = ({ navigation }) => {
  const handleRoleSelection = (role) => {
    if (role === 'customer') {
      navigation.navigate('CustomerSignup');
    } else if (role === 'barber') {
      navigation.navigate('BarberSignup');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back-outline" size={28} color="#FFD700" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Icon name="people-outline" size={24} color="#FFD700" />
          <Text style={styles.title}>Choose Your Role</Text>
        </View>
        <View style={styles.headerRight} />
      </View>
      
      <Text style={styles.subtitle}>Select how you want to use the app</Text>
      
      <View style={styles.roleContainer}>
        <TouchableOpacity 
          style={styles.roleCard}
          onPress={() => handleRoleSelection('customer')}
          activeOpacity={0.8}
        >
          <View style={styles.roleIconContainer}>
            <Icon name="person-outline" size={50} color="#4CAF50" />
          </View>
          <Text style={styles.roleTitle}>Customer</Text>
          <Text style={styles.roleDescription}>
            Book appointments, get haircuts, and manage your visits
          </Text>
          <View style={styles.roleFooter}>
            <Text style={styles.roleActionText}>Get Started</Text>
            <Icon name="arrow-forward-outline" size={18} color="#4CAF50" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.roleCard}
          onPress={() => handleRoleSelection('barber')}
          activeOpacity={0.8}
        >
          <View style={styles.roleIconContainer}>
            <Icon name="cut-outline" size={50} color="#2196F3" />
          </View>
          <Text style={styles.roleTitle}>Barber</Text>
          <Text style={styles.roleDescription}>
            Manage appointments, serve customers, and grow your business
          </Text>
          <View style={styles.roleFooter}>
            <Text style={styles.roleActionText}>Join as Professional</Text>
            <Icon name="arrow-forward-outline" size={18} color="#2196F3" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
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
    paddingHorizontal: 40,
  },
  roleContainer: {
    gap: 20,
    paddingHorizontal: 20,
  },
  roleCard: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 25,
    borderWidth: 1,
    borderColor: '#333',
  },
  roleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  roleDescription: {
    fontSize: 14,
    color: '#b0b0b0',
    lineHeight: 20,
    marginBottom: 20,
  },
  roleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleActionText: {
    color: '#FFD700',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default RoleSelectionScreen;