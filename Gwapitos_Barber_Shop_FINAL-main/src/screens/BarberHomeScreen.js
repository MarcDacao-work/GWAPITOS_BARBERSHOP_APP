import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { supabase } from '../services/supabase';

const BarberHomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('Barber');
  const [stats, setStats] = useState({
    todayCustomers: 8,
    inQueue: 3,
    completed: 5,
    rating: 4.8
  });

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
    }
  };

  const [todayAppointments, setTodayAppointments] = useState([]);

useEffect(() => {
  loadTodayAppointments();
}, []);

const loadTodayAppointments = async () => {
  try {
    const barberAppointments = await getBarberAppointments('Tony Styles');
    const todayApps = barberAppointments.filter(app => app.date === 'Today');
    setTodayAppointments(todayApps);
  } catch (error) {
    console.error('Error loading appointments:', error);
  }
};

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{userName} ✂️</Text>
          <Text style={styles.subtitle}>Professional Barber Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Icon name="log-out-outline" size={22} color="#ff4444" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="people-outline" size={30} color="#2196F3" />
          <Text style={styles.statNumber}>{stats.todayCustomers}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="list-outline" size={30} color="#FFD700" />
          <Text style={styles.statNumber}>{stats.inQueue}</Text>
          <Text style={styles.statLabel}>In Queue</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="checkmark-circle-outline" size={30} color="#4CAF50" />
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="star-outline" size={30} color="#FF9800" />
          <Text style={styles.statNumber}>{stats.rating}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Main Actions */}
      <View style={styles.mainActions}>
        <TouchableOpacity 
          style={[styles.mainAction, { backgroundColor: '#2196F3' }]}
          onPress={() => navigation.navigate('Queue')}
        >
          <Icon name="list" size={30} color="#fff" />
          <Text style={styles.mainActionText}>Manage Queue</Text>
          <Text style={styles.mainActionSubtext}>{stats.inQueue} waiting</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.mainAction, { backgroundColor: '#4CAF50' }]}
          onPress={() => navigation.navigate('Schedule')}
        >
          <Icon name="calendar" size={30} color="#fff" />
          <Text style={styles.mainActionText}>View Schedule</Text>
          <Text style={styles.mainActionSubtext}>Today's appointments</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('QRScanner')}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#2196F320' }]}>
            <Icon name="qr-code" size={24} color="#2196F3" />
          </View>
          <Text style={styles.actionCardText}>Scan QR</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('QueueDisplay')}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#FFD70020' }]}>
            <Icon name="tv" size={24} color="#FFD700" />
          </View>
          <Text style={styles.actionCardText}>Queue Display</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('Schedule')}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#4CAF5020' }]}>
            <Icon name="time" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.actionCardText}>Add Slot</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => {}}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#9C27B020' }]}>
            <Icon name="stats-chart" size={24} color="#9C27B0" />
          </View>
          <Text style={styles.actionCardText}>Analytics</Text>
        </TouchableOpacity>
      </View>

      {/* Next Customer */}
      <Text style={styles.sectionTitle}>Next Customer</Text>
      <View style={styles.nextCustomerCard}>
        <View style={styles.customerAvatar}>
          <Icon name="person" size={40} color="#FFD700" />
        </View>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>Michael Jordan</Text>
          <Text style={styles.customerService}>Haircut & Styling</Text>
          <View style={styles.customerDetails}>
            <Icon name="time" size={16} color="#4CAF50" />
            <Text style={styles.customerTime}>In 15 minutes</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startButtonText}>START</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Appointments */}
      <Text style={styles.sectionTitle}>Today's Appointments</Text>
      {todayAppointments.length === 0 ? (
        <Text style={styles.noAppointmentsText}>No appointments today</Text>
      ) : (
        todayAppointments.map((appointment, index) => (
          <View key={appointment.id} style={styles.appointmentRow}>
            <View style={styles.timeBadge}>
              <Text style={styles.timeText}>{appointment.time}</Text>
            </View>
            <View style={styles.appointmentInfo}>
              <Text style={styles.appointmentCustomer}>
                {appointment.customerName || `Customer`}
              </Text>
              <Text style={styles.appointmentService}>
                {appointment.services?.map(s => s.name).join(', ') || 'Haircut'}
              </Text>
            </View>
            <View style={[
              styles.statusBadge,
              { 
                backgroundColor: appointment.status === 'confirmed' ? '#FFD700' : 
                              appointment.status === 'completed' ? '#4CAF50' : '#888' 
              }
            ]}>
              <Text style={styles.statusText}>
                {appointment.status === 'confirmed' ? 'UPCOMING' : 
                appointment.status === 'completed' ? 'DONE' : 'PENDING'}
              </Text>
            </View>
          </View>
        ))
      )}
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
    color: '#2196F3',
    fontSize: 14,
    marginTop: 5,
  },
  logoutBtn: {
    padding: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  statNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },
  mainActions: {
    marginBottom: 30,
  },
  mainAction: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  mainActionText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  mainActionSubtext: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
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
  nextCustomerCard: {
    backgroundColor: '#2d2d2d',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  customerAvatar: {
    marginRight: 15,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerService: {
    color: '#FFD700',
    fontSize: 14,
    marginTop: 2,
  },
  customerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 5,
  },
  customerTime: {
    color: '#4CAF50',
    fontSize: 14,
  },
  startButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  appointmentRow: {
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 15,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentCustomer: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  appointmentService: {
    color: '#888',
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusDone: {
    backgroundColor: '#4CAF50',
  },
  statusNow: {
    backgroundColor: '#FFD700',
  },
  statusPending: {
    backgroundColor: '#888',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default BarberHomeScreen;