import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { mockQueue } from '../utils/mockData';
import { supabase } from '../services/supabase';
import { getCustomerAppointments, seedSampleData } from '../utils/appointmentsStore'; // ADD THIS IMPORT
import { ActivityIndicator } from 'react-native';

const CustomerQueueScreen = ({ navigation }) => {
  const [queue, setQueue] = useState(mockQueue);
  const [userAppointment, setUserAppointment] = useState(null); // CHANGE FROM mockAppointments[0] TO null
  const [refreshing, setRefreshing] = useState(false);
  const [userPosition, setUserPosition] = useState(3); // Simulated user position
  const [estimatedWait, setEstimatedWait] = useState('45 min');
  const [userName, setUserName] = useState('Customer');
  const [loading, setLoading] = useState(true); // ADD LOADING STATE

  useEffect(() => {
    fetchUserProfile();
    fetchUserAppointment();
  }, []);

  // Update fetchUserProfile to also fetch appointments
  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('auth_id', user.id)
          .single();
        
        if (profile?.full_name) {
          setUserName(profile.full_name);
        } else {
          setUserName(user.email?.split('@')[0] || 'Customer');
        }
      }
    } catch (error) {
      console.log('Error fetching user profile:', error);
    }
  };

  // NEW FUNCTION: Fetch the user's actual appointment
  const fetchUserAppointment = async () => {
    try {
      setLoading(true);
      
      // Seed sample data if empty
      await seedSampleData();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('auth_id', user.id)
          .single();
        
        let customerName = profile?.full_name || user.email?.split('@')[0] || 'Customer';
        
        // Get user's appointments
        const customerAppointments = await getCustomerAppointments(customerName);
        
        if (customerAppointments.length > 0) {
          // Get the most recent confirmed/upcoming appointment
          const upcomingAppointments = customerAppointments.filter(app => 
            app.status === 'confirmed' || app.status === 'upcoming'
          );
          
          if (upcomingAppointments.length > 0) {
            // Sort by date (Today > Tomorrow > other dates)
            const sortedAppointments = upcomingAppointments.sort((a, b) => {
              const dateOrder = { 'Today': 1, 'Tomorrow': 2 };
              const aOrder = dateOrder[a.date] || 3;
              const bOrder = dateOrder[b.date] || 3;
              return aOrder - bOrder;
            });
            
            setUserAppointment(sortedAppointments[0]);
          } else {
            // Use the most recent appointment if no upcoming ones
            setUserAppointment(customerAppointments[0]);
          }
        } else {
          // If no appointments, create a default one for display
          setUserAppointment({
            id: 'default',
            barberName: 'No Barber Selected',
            service: 'No Service Booked',
            date: 'No Date',
            time: 'No Time',
            status: 'pending',
            duration: 'N/A',
            qrData: 'NO-APPOINTMENT'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Fetch updated appointment data
    await fetchUserAppointment();
    // Simulate queue refresh
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Refreshed', 'Queue information updated');
    }, 1000);
  };

  // Update queue with user's actual name
  useEffect(() => {
    if (userName && userName !== 'Customer') {
      const updatedQueue = [...queue];
      const userIndex = updatedQueue.findIndex(item => item.position === userPosition);
      if (userIndex !== -1) {
        updatedQueue[userIndex] = {
          ...updatedQueue[userIndex],
          customerName: userName
        };
        setQueue(updatedQueue);
      }
    }
  }, [userName]);

  const handleCheckIn = () => {
    Alert.alert(
      'Check In',
      `Welcome ${userName}! Would you like to check in for your appointment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Check In', 
          onPress: () => {
            Alert.alert('Checked In', `${userName}, you have been added to the queue. Your position is #3`);
            setUserPosition(3);
          }
        }
      ]
    );
  };

  const handleNotifyMe = () => {
    Alert.alert(
      'Notifications',
      `We will notify ${userName} 10 minutes before your turn`,
      [{ text: 'OK' }]
    );
  };

  const getTimeUntil = (position) => {
    const minutesPerCustomer = 15;
    const minutes = (position - 1) * minutesPerCustomer;
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  const userInQueue = queue.find(customer => customer.position === userPosition);

  // If still loading, show loading screen
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading appointment...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back-outline" size={28} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Queue Status</Text>
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
        {/* Appointment Card - NOW SHOWS ACTUAL APPOINTMENT */}
        <View style={styles.appointmentCard}>
          <View style={styles.appointmentHeader}>
            <Icon name="calendar-outline" size={24} color="#FFD700" />
            <Text style={styles.appointmentTitle}>Your Appointment</Text>
          </View> 
          <View style={styles.appointmentDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Customer:</Text>
              <Text style={styles.detailValue}>{userName || 'Customer'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Barber:</Text>
              <Text style={styles.detailValue}>
                {userAppointment?.barber?.name || userAppointment?.barberName || 'Not Selected'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Service:</Text>
              <Text style={styles.detailValue}>
                {userAppointment?.services?.[0]?.name || userAppointment?.service || 'Not Selected'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date & Time:</Text>
              <Text style={styles.detailValue}>
                {userAppointment?.date || 'No Date'}, {userAppointment?.time || 'No Time'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <View style={[
                styles.statusBadge,
                { 
                  backgroundColor: userAppointment?.status === 'confirmed' ? '#4CAF50' : 
                                  userAppointment?.status === 'upcoming' ? '#FF9800' : 
                                  userAppointment?.status === 'completed' ? '#9E9E9E' : '#888'
                }
              ]}>
                <Text style={styles.statusText}>
                  {userAppointment?.status?.toUpperCase() || 'PENDING'}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.qrButton} 
            onPress={() => {
              if (userAppointment?.id !== 'default') {
                navigation.navigate('AppointmentConfirmation', {
                  appointment: userAppointment
                });
              } else {
                Alert.alert('No Appointment', 'Please book an appointment first');
              }
            }}
          >
            <Icon name="qr-code-outline" size={20} color="#2196F3" />
            <Text style={styles.qrButtonText}>
              {userAppointment?.id !== 'default' ? 'View QR Code' : 'Book Appointment'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Check In Section */}
        {!userInQueue ? (
          <View style={styles.checkInCard}>
            <Icon name="location-outline" size={40} color="#FFD700" />
            <Text style={styles.checkInTitle}>Ready to Check In?</Text>
            <Text style={styles.checkInText}>
              Hi {userName}, are you at the barbershop? Check in to join the virtual queue.
            </Text>
            <TouchableOpacity 
              style={[
                styles.checkInButton,
                userAppointment?.id === 'default' && styles.disabledButton
              ]} 
              onPress={handleCheckIn}
              disabled={userAppointment?.id === 'default'}
            >
              <Icon name="log-in-outline" size={20} color="#fff" />
              <Text style={styles.checkInButtonText}>CHECK IN NOW</Text>
            </TouchableOpacity>
            {userAppointment?.id === 'default' && (
              <Text style={styles.warningText}>
                Please book an appointment first before checking in
              </Text>
            )}
          </View>
        ) : (
          /* Queue Position Card */
          <View style={styles.positionCard}>
            <View style={styles.positionHeader}>
              <Icon name="list-outline" size={24} color="#FFD700" />
              <Text style={styles.positionTitle}>Your Queue Position</Text>
            </View>
            
            <View style={styles.positionContent}>
              <View style={styles.positionNumberContainer}>
                <Text style={styles.positionNumber}>#{userPosition}</Text>
                <Text style={styles.positionLabel}>{userName}'s Position</Text>
              </View>
              
              <View style={styles.positionInfo}>
                <View style={styles.infoItem}>
                  <Icon name="people-outline" size={20} color="#2196F3" />
                  <Text style={styles.infoValue}>
                    {queue.filter(c => c.position < userPosition).length} ahead
                  </Text>
                  <Text style={styles.infoLabel}>Ahead of you</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Icon name="time-outline" size={20} color="#4CAF50" />
                  <Text style={styles.infoValue}>{getTimeUntil(userPosition)}</Text>
                  <Text style={styles.infoLabel}>Estimated wait</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.notifyButton} onPress={handleNotifyMe}>
              <Icon name="notifications-outline" size={20} color="#FFD700" />
              <Text style={styles.notifyButtonText}>NOTIFY ME WHEN READY</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Current Queue Section */}
        <View style={styles.queueSection}>
          <View style={styles.queueHeader}>
            <Text style={styles.queueTitle}>Current Queue</Text>
            <Text style={styles.queueCount}>{queue.length} customers</Text>
          </View>

          {queue.map((customer) => (
            <View 
              key={customer.id} 
              style={[
                styles.queueItem,
                customer.position === userPosition && styles.userQueueItem,
                customer.status === 'now serving' && styles.servingQueueItem
              ]}
            >
              <View style={styles.queuePosition}>
                <Text style={[
                  styles.queuePositionText,
                  customer.position === userPosition && styles.userPositionText,
                  customer.status === 'now serving' && styles.servingPositionText
                ]}>
                  #{customer.position}
                </Text>
              </View>
              
              <View style={styles.queueCustomerInfo}>
                <Text style={styles.queueCustomerName}>
                  {customer.customerName}
                  {customer.position === userPosition && ' (You)'}
                </Text>
                <Text style={styles.queueService}>{customer.service}</Text>
              </View>
              
              <View style={styles.queueStatusContainer}>
                {customer.status === 'now serving' ? (
                  <View style={styles.servingIndicator}>
                    <Icon name="cut-outline" size={14} color="#4CAF50" />
                    <Text style={styles.servingText}>NOW</Text>
                  </View>
                ) : (
                  <View style={styles.waitTimeContainer}>
                    <Icon name="time-outline" size={14} color="#888" />
                    <Text style={styles.waitTimeText}>{customer.waitTime}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Queue Legend */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Queue Status</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Now Serving</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
              <Text style={styles.legendText}>Waiting</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FFD700' }]} />
              <Text style={styles.legendText}>Your Position</Text>
            </View>
          </View>
        </View>

        {/* Tips & Information */}
        <View style={styles.tipsCard}>
          <Icon name="bulb-outline" size={24} color="#FFD700" />
          <Text style={styles.tipsTitle}>Queue Tips</Text>
          <Text style={styles.tip}>• Arrive 5 minutes before your estimated time</Text>
          <Text style={styles.tip}>• You'll be notified when it's your turn</Text>
          <Text style={styles.tip}>• Feel free to wait in the lounge area</Text>
          <Text style={styles.tip}>• Show QR code when called</Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Add missing styles - add this to your existing styles
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
  appointmentCard: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  appointmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  appointmentDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#888',
  },
  detailValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 10,
  },
  qrButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  checkInCard: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderStyle: 'dashed',
  },
  checkInTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 15,
    marginBottom: 10,
  },
  checkInText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  checkInButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: '100%',
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  checkInButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningText: {
    color: '#FF9800',
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  positionCard: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  positionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  positionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  positionContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  positionNumberContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  positionNumber: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 5,
  },
  positionLabel: {
    fontSize: 16,
    color: '#888',
  },
  positionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
  },
  notifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 12,
  },
  notifyButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  queueSection: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  queueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  queueCount: {
    fontSize: 14,
    color: '#888',
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  userQueueItem: {
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  servingQueueItem: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  queuePosition: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  queuePositionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  userPositionText: {
    color: '#FFD700',
  },
  servingPositionText: {
    color: '#4CAF50',
  },
  queueCustomerInfo: {
    flex: 1,
  },
  queueCustomerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  queueService: {
    fontSize: 14,
    color: '#888',
  },
  queueStatusContainer: {
    alignItems: 'flex-end',
  },
  servingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  servingText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  waitTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  waitTimeText: {
    fontSize: 12,
    color: '#888',
  },
  legendCard: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#888',
  },
  tipsCard: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 15,
    marginBottom: 15,
  },
  tip: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
    lineHeight: 20,
  },
  spacer: {
    height: 40,
  },
});

export default CustomerQueueScreen;