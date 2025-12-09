import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { getBarberAppointments } from '../utils/appointmentsStore';

const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;

const QueueDisplayScreen = ({ navigation }) => {
  const [queue, setQueue] = useState([]); // EMPTY ARRAY FOR NEW BARBERS
  const [currentTime, setCurrentTime] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(true);
  const [barberName, setBarberName] = useState('');

  // Load real queue data
  useEffect(() => {
    fetchBarberQueue();
    
    // Auto-refresh every 30 seconds
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        setCurrentTime(new Date());
        fetchBarberQueue(); // Refresh queue data too
      }, 30000);
    }
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchBarberQueue = async () => {
    try {
      setLoading(true);
      
      // Get current barber's info
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('auth_id', user.id)
          .single();
        
        if (profile?.full_name) {
          setBarberName(profile.full_name);
          
          // Get this barber's appointments
          const barberAppointments = await getBarberAppointments(profile.full_name);
          
          // Transform appointments into queue format
          const transformedQueue = transformAppointmentsToQueue(barberAppointments);
          setQueue(transformedQueue);
        }
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
      // Set empty queue if error
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  const transformAppointmentsToQueue = (appointments) => {
    if (!appointments || appointments.length === 0) {
      return []; // Return empty array for new barbers
    }
    
    // Filter today's appointments that are not completed
    const todayAppointments = appointments.filter(app => 
      (app.date === 'Today' || app.date === 'Now') && 
      app.status !== 'completed'
    );
    
    // Sort by time and create queue items
    return todayAppointments
      .sort((a, b) => {
        // Simple time sorting (you might want more robust time parsing)
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        return timeA.localeCompare(timeB);
      })
      .map((app, index) => ({
        id: app.id || `appt-${index}`,
        customerName: app.customerName || 'Customer',
        service: app.services?.[0]?.name || app.service || 'Haircut',
        position: index + 1,
        waitTime: calculateWaitTime(index),
        status: index === 0 ? 'now serving' : 'waiting'
      }));
  };

  const calculateWaitTime = (position) => {
    const minutesPerCustomer = 15;
    const minutes = position * minutesPerCustomer;
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { 
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const currentCustomer = queue.find(c => c.status === 'now serving');
  const waitingCustomers = queue.filter(c => c.status === 'waiting');

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar hidden />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading queue...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      
      {/* Top Bar - Only visible in developer mode */}
      <TouchableOpacity 
        style={styles.developerBar}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back-outline" size={20} color="#FFD700" />
        <Text style={styles.developerText}>Exit Display</Text>
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.shopName}>GWAPITOS</Text>
          <Text style={styles.shopTagline}>BARBER SHOP</Text>
          <View style={styles.timeDateContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
          </View>
          <Text style={styles.barberName}>Barber: {barberName || 'Loading...'}</Text>
        </View>

        {/* Now Serving */}
        <View style={styles.nowServingContainer}>
          <Text style={styles.sectionLabel}>NOW SERVING</Text>
          
          {currentCustomer ? (
            <View style={styles.currentCustomerCard}>
              <Text style={styles.customerNumber}>#{currentCustomer.position}</Text>
              <Text style={styles.customerName}>{currentCustomer.customerName}</Text>
              <Text style={styles.customerService}>{currentCustomer.service}</Text>
              <View style={styles.serviceStatus}>
                <Icon name="cut-outline" size={22} color="#FFD700" />
                <Text style={styles.serviceStatusText}>IN SERVICE</Text>
              </View>
            </View>
          ) : queue.length === 0 ? (
            <View style={styles.emptyQueueCard}>
              <Icon name="people-outline" size={50} color="#666" />
              <Text style={styles.emptyQueueText}>Queue is Empty</Text>
              <Text style={styles.emptyQueueSubtext}>
                No customers in queue
              </Text>
            </View>
          ) : (
            <View style={styles.noCurrentCustomerCard}>
              <Icon name="people-outline" size={40} color="#666" />
              <Text style={styles.noCustomerText}>No active service</Text>
            </View>
          )}
        </View>

        {/* Next In Line (Side by side) - Only show if there are waiting customers */}
        {waitingCustomers.length > 0 && (
          <View style={styles.nextInLineContainer}>
            <Text style={styles.sectionLabel}>NEXT IN LINE ({waitingCustomers.length})</Text>
            <View style={styles.nextCustomersRow}>
              {waitingCustomers.slice(0, 3).map((customer) => (
                <View key={customer.id} style={styles.nextCustomerItem}>
                  <Text style={styles.nextCustomerNumber}>#{customer.position}</Text>
                  <Text style={styles.nextCustomerName} numberOfLines={1}>
                    {customer.customerName.split(' ')[0]}
                  </Text>
                  <View style={styles.waitTime}>
                    <Icon name="time-outline" size={14} color="#FFD700" />
                    <Text style={styles.waitTimeText}>{customer.waitTime}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{queue.length}</Text>
            <Text style={styles.statLabel}>TOTAL</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{waitingCustomers.length}</Text>
            <Text style={styles.statLabel}>WAITING</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {queue.filter(c => c.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>DONE</Text>
          </View>
        </View>

        {/* Estimated Wait - Only show if there are waiting customers */}
        {waitingCustomers.length > 0 && (
          <View style={styles.waitContainer}>
            <Text style={styles.waitLabel}>ESTIMATED WAIT</Text>
            <Text style={styles.waitTime}>
              {waitingCustomers[0].waitTime}
            </Text>
            <Text style={styles.waitNote}>
              for customer #{waitingCustomers[0].position}
            </Text>
          </View>
        )}

        {/* Show message when queue is completely empty */}
        {queue.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="calendar-outline" size={60} color="#444" />
            <Text style={styles.emptyStateTitle}>No Appointments Today</Text>
            <Text style={styles.emptyStateText}>
              When customers book appointments with you, they'll appear here
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Icon name="information-circle-outline" size={14} color="#666" />
            <Text style={styles.footerText}>Wait for your number</Text>
          </View>
          <View style={styles.footerItem}>
            <Icon name="qr-code-outline" size={14} color="#666" />
            <Text style={styles.footerText}>Scan QR for updates</Text>
          </View>
          <View style={styles.refreshInfo}>
            <Icon 
              name={autoRefresh ? "sync" : "sync-outline"} 
              size={12} 
              color="#666" 
            />
            <Text style={styles.refreshText}>
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'} • {formatTime(currentTime)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#FFD700',
    marginTop: 20,
    fontSize: 16,
  },
  developerBar: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  developerText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  shopName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 1,
  },
  shopTagline: {
    fontSize: 12,
    color: '#FFF',
    letterSpacing: 3,
    marginTop: 2,
  },
  timeDateContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  timeText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#888',
  },
  barberName: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    fontStyle: 'italic',
  },
  nowServingContainer: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  currentCustomerCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  customerNumber: {
    fontSize: 52,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  customerService: {
    fontSize: 16,
    color: '#888',
    marginBottom: 12,
  },
  serviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#252525',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  serviceStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  noCurrentCustomerCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  emptyQueueCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  emptyQueueText: {
    fontSize: 20,
    color: '#FFF',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyQueueSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  noCustomerText: {
    fontSize: 18,
    color: '#888',
    marginTop: 12,
    textAlign: 'center',
  },
  nextInLineContainer: {
    marginBottom: 20,
  },
  nextCustomersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  nextCustomerItem: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  nextCustomerNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  nextCustomerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 6,
  },
  waitTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  waitTimeText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#888',
    letterSpacing: 1,
  },
  waitContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 16,
  },
  waitLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
    letterSpacing: 1,
  },
  waitTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  waitNote: {
    fontSize: 11,
    color: '#888',
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 30,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 15,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#888',
  },
  refreshInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  refreshText: {
    fontSize: 10,
    color: '#666',
  },
});

export default QueueDisplayScreen;