import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { 
  getCustomerAppointments, 
  getAllAppointments,
  seedSampleData 
} from '../utils/appointmentsStore';

const CustomerHomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('Customer');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    today: 0
    // Removed rating from here
  });

  useEffect(() => {
    fetchUserProfile();
    loadAppointments();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('auth_id', user.id)
          .single();
        
        if (profile?.full_name) setUserName(profile.full_name);
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      // Seed sample data if empty
      await seedSampleData();
      
      // Fetch current user's profile to get their name
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('auth_id', user.id)
          .single();
        
        let customerName = profile?.full_name || user.email?.split('@')[0] || 'Customer';
        
        // Load appointments for this customer
        const customerAppointments = await getCustomerAppointments(customerName);
        setAppointments(customerAppointments);
        
        // Calculate stats (removed rating)
        const upcoming = customerAppointments.filter(a => 
          a.status === 'confirmed' || a.status === 'upcoming'
        ).length;
        
        const completed = customerAppointments.filter(a => 
          a.status === 'completed'
        ).length;
        
        const today = customerAppointments.filter(a => 
          a.date === 'Today'
        ).length;
        
        setStats({
          upcoming,
          completed,
          today
          // No rating here
        });
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const formatTimeUntilAppointment = (date, time) => {
    // Simple implementation
    if (date === 'Today') {
      const hour = parseInt(time.split(':')[0]);
      const now = new Date().getHours();
      const diff = hour - now;
      if (diff > 0) {
        return `In ${diff} hour${diff > 1 ? 's' : ''}`;
      } else {
        return 'Today';
      }
    } else if (date === 'Tomorrow') {
      return 'Tomorrow';
    } else {
      return date;
    }
  };

  const getLatestAppointments = () => {
    // Return the 2 most recent appointments (confirmed or upcoming)
    return appointments
      .filter(app => app.status === 'confirmed' || app.status === 'upcoming')
      .sort((a, b) => {
        // Simple sorting - Today > Tomorrow > other dates
        const dateOrder = { 'Today': 1, 'Tomorrow': 2 };
        const aOrder = dateOrder[a.date] || 3;
        const bOrder = dateOrder[b.date] || 3;
        return aOrder - bOrder;
      })
      .slice(0, 2);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const latestAppointments = getLatestAppointments();

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#FFD700"
        />
      }
    >
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

      {/* Quick Stats - Now 3 items instead of 4 */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="time-outline" size={30} color="#FFD700" />
          <Text style={styles.statNumber}>{stats.today}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="calendar-outline" size={30} color="#4CAF50" />
          <Text style={styles.statNumber}>{stats.upcoming}</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="checkmark-circle-outline" size={30} color="#2196F3" />
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        {/* Removed the 4th rating stat card */}
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
      
      {latestAppointments.length === 0 ? (
        <View style={styles.noActivityCard}>
          <Icon name="calendar-outline" size={40} color="#666" />
          <Text style={styles.noActivityText}>No upcoming appointments</Text>
          <Text style={styles.noActivitySubtext}>
            Book your first appointment to get started
          </Text>
        </View>
      ) : (
        latestAppointments.map((appointment, index) => (
          <TouchableOpacity 
            key={appointment.id}
            style={styles.activityCard}
            onPress={() => navigation.navigate('AppointmentConfirmation', { 
              appointment: appointment 
            })}
          >
            <View style={styles.activityIcon}>
              <Icon 
                name={appointment.status === 'confirmed' ? "checkmark-circle" : "time-outline"} 
                size={24} 
                color={appointment.status === 'confirmed' ? "#4CAF50" : "#FFD700"} 
              />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>
                {appointment.status === 'confirmed' ? 'Appointment Confirmed' : 'Upcoming Appointment'}
              </Text>
              <Text style={styles.activityTime}>
                {appointment.date}, {appointment.time} with {appointment.barber?.name || 'Barber'}
              </Text>
              {appointment.services && appointment.services.length > 0 && (
                <Text style={styles.activityService}>
                  {appointment.services[0].name}
                  {appointment.services.length > 1 ? ` +${appointment.services.length - 1} more` : ''}
                </Text>
              )}
            </View>
            <View style={styles.activityBadge}>
              <Text style={styles.activityBadgeText}>
                {formatTimeUntilAppointment(appointment.date, appointment.time)}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* View All Button */}
      {appointments.length > 2 && (
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('Bookings')}
        >
          <Text style={styles.viewAllText}>View All Appointments ({appointments.length})</Text>
          <Icon name="chevron-forward" size={18} color="#FFD700" />
        </TouchableOpacity>
      )}

      <View style={styles.spacer} />
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
    width: '31%', // Adjusted from '48%' to '31%' for 3 items
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
  noActivityCard: {
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginBottom: 10,
  },
  noActivityText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
  },
  noActivitySubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 20,
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
  activityService: {
    color: '#FFD700',
    fontSize: 12,
    marginTop: 4,
  },
  activityBadge: {
    backgroundColor: '#252525',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  activityBadgeText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 15,
    backgroundColor: '#252525',
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  viewAllText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  spacer: {
    height: 40,
  },
});

export default CustomerHomeScreen;