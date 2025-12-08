import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { supabase } from '../services/supabase';

const CustomerHomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('Customer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('auth_id', user.id) // Changed to use auth_id
          .single();
        
        if (profile?.full_name) setUserName(profile.full_name);
      }
    } catch (error) {
      console.log('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{userName} 👋</Text>
          <Text style={styles.subtitle}>Ready for a fresh cut?</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Icon name="log-out-outline" size={22} color="#ff4444" />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="time-outline" size={30} color="#FFD700" />
          <Text style={styles.statNumber}>15 min</Text>
          <Text style={styles.statLabel}>Avg wait</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="calendar-outline" size={30} color="#4CAF50" />
          <Text style={styles.statNumber}>2</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="star-outline" size={30} color="#2196F3" />
          <Text style={styles.statNumber}>4.8</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Main Action */}
      <TouchableOpacity 
        style={styles.mainActionButton}
        onPress={() => navigation.navigate('BookAppointment')}
      >
        <View style={styles.actionIcon}>
          <Icon name="cut" size={28} color="#1a1a1a" />
        </View>
        <View style={styles.actionText}>
          <Text style={styles.actionTitle}>Book Appointment</Text>
          <Text style={styles.actionSubtitle}>Find and book barbers near you</Text>
        </View>
        <Icon name="chevron-forward" size={24} color="#1a1a1a" />
      </TouchableOpacity>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('Bookings')}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#4CAF5020' }]}>
            <Icon name="calendar" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.actionCardText}>My Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('CustomerQueue')}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#2196F320' }]}>
            <Icon name="list" size={24} color="#2196F3" />
          </View>
          <Text style={styles.actionCardText}>Queue Status</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('Search')}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#FFD70020' }]}>
            <Icon name="search" size={24} color="#FFD700" />
          </View>
          <Text style={styles.actionCardText}>Find Barbers</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('Payment')}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#9C27B020' }]}>
            <Icon name="card" size={24} color="#9C27B0" />
          </View>
          <Text style={styles.actionCardText}>Payments</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.activityCard}>
        <View style={styles.activityIcon}>
          <Icon name="checkmark-circle" size={24} color="#4CAF50" />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>Appointment Confirmed</Text>
          <Text style={styles.activityTime}>Today, 3:00 PM with Tony</Text>
        </View>
      </View>

      <View style={styles.activityCard}>
        <View style={styles.activityIcon}>
          <Icon name="qr-code" size={24} color="#FFD700" />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>QR Code Ready</Text>
          <Text style={styles.activityTime}>Show at check-in</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  greeting: {
    color: '#888',
    fontSize: 14,
  },
  userName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
  },
  logoutBtn: {
    padding: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },
  mainActionButton: {
    backgroundColor: '#FFD700',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  actionIcon: {
    marginRight: 15,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionSubtitle: {
    color: '#1a1a1a',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 2,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  actionIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionCardText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityIcon: {
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  activityTime: {
    color: '#888',
    fontSize: 14,
    marginTop: 2,
  },
});

export default CustomerHomeScreen;