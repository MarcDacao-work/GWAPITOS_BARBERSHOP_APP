import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { getBarberAppointments, seedSampleData } from '../utils/appointmentsStore';

const BarberScheduleScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
  try {
    // REMOVE: await seedSampleData(); // Don't auto-seed for barbers
    
    // Get current barber's name
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('auth_id', user.id)
        .single();
      
      if (profile?.full_name) {
        // Only load appointments for this specific barber
        const barberAppointments = await getBarberAppointments(profile.full_name);
        setAppointments(barberAppointments);
      }
    }
  } catch (error) {
    console.error('Error loading appointments:', error);
  } finally {
    setLoading(false);
  }
};
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'upcoming': return '#FF9800';
      case 'completed': return '#9E9E9E';
      case 'cancelled': return '#F44336';
      default: return '#888';
    }
  };

  // Group appointments by date
  const groupByDate = () => {
    const groups = {};
    appointments.forEach(app => {
      if (!groups[app.date]) {
        groups[app.date] = [];
      }
      groups[app.date].push(app);
    });
    return groups;
  };

  const appointmentGroups = groupByDate();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back-outline" size={28} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Schedule</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Icon name="refresh-outline" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFD700"
          />
        }
      >
        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Appointments Overview</Text>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{appointments.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {appointments.filter(a => a.date === 'Today').length}
              </Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {appointments.filter(a => a.date === 'Tomorrow').length}
              </Text>
              <Text style={styles.statLabel}>Tomorrow</Text>
            </View>
          </View>
        </View>

        {/* Appointments by Date */}
        {Object.keys(appointmentGroups).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="calendar-outline" size={60} color="#333" />
            <Text style={styles.emptyText}>No appointments scheduled</Text>
            <Text style={styles.emptySubtext}>
              New appointments will appear here when customers book with you
            </Text>
          </View>
        ) : (
          Object.entries(appointmentGroups).map(([date, dateAppointments]) => (
            <View key={date} style={styles.dateSection}>
              <Text style={styles.dateTitle}>{date}</Text>
              {dateAppointments.map((appointment) => (
                <TouchableOpacity
                  key={appointment.id}
                  style={styles.appointmentCard}
                  onPress={() => navigation.navigate('AppointmentConfirmation', { 
                    appointment: appointment 
                  })}
                >
                  <View style={styles.appointmentHeader}>
                    <View style={styles.timeContainer}>
                      <Icon name="time-outline" size={16} color="#FFD700" />
                      <Text style={styles.timeText}>{appointment.time}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
                      <Text style={styles.statusText}>
                        {appointment.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.appointmentBody}>
                    <Text style={styles.customerName}>
                      {appointment.customerName || 'Customer'}
                    </Text>
                    <Text style={styles.serviceText}>
                      {appointment.services?.map(s => s.name).join(', ') || 'Service'}
                    </Text>
                    <View style={styles.appointmentFooter}>
                      <Text style={styles.appointmentNumber}>
                        Appointment #{appointment.appointmentNumber}
                      </Text>
                      <Text style={styles.priceText}>
                        ₱{appointment.totalPrice}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#252525',
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  dateSection: {
    marginBottom: 20,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  appointmentCard: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  appointmentBody: {
    marginTop: 5,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  serviceText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  appointmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appointmentNumber: {
    fontSize: 12,
    color: '#2196F3',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  spacer: {
    height: 40,
  },
});

export default BarberScheduleScreen;