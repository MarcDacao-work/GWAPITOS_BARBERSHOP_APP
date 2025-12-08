import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Vibration
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { mockQueue } from '../utils/mockData';

const BarberControlPanel = ({ navigation }) => {
  const [queue, setQueue] = useState(mockQueue);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(queue[0]);
  const [stationStatus, setStationStatus] = useState('active');

  const handleCallNext = () => {
    if (queue.length > 1) {
      Vibration.vibrate(100);
      
      // Move current customer to completed
      const updatedQueue = [...queue];
      const nextCustomer = updatedQueue[1];
      
      // Update statuses
      updatedQueue[0].status = 'completed';
      updatedQueue[1].status = 'now serving';
      
      // Shift queue
      const completed = updatedQueue.shift();
      setQueue(updatedQueue);
      setCurrentCustomer(nextCustomer);
      
      Alert.alert(
        'Next Customer',
        `Now serving: ${nextCustomer.customerName}\nService: ${nextCustomer.service}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Queue Empty', 'No more customers in queue');
    }
  };

  const handleComplete = () => {
    Vibration.vibrate(50);
    
    if (queue.length > 0) {
      const updatedQueue = [...queue];
      updatedQueue.shift(); // Remove current customer
      
      if (updatedQueue.length > 0) {
        updatedQueue[0].status = 'now serving';
        setCurrentCustomer(updatedQueue[0]);
      } else {
        setCurrentCustomer(null);
      }
      
      setQueue(updatedQueue);
      Alert.alert('Completed', 'Customer marked as completed');
    }
  };

  const handleBreak = () => {
    Vibration.vibrate(200);
    const newStatus = !isOnBreak;
    setIsOnBreak(newStatus);
    setStationStatus(newStatus ? 'break' : 'active');
    
    Alert.alert(
      newStatus ? 'Break Started' : 'Break Ended',
      newStatus 
        ? 'Station is now on break. Queue is paused.' 
        : 'Station is now active. Queue resumed.'
    );
  };

  const handleEmergency = () => {
    Vibration.vibrate([0, 500, 200, 500]);
    Alert.alert(
      'Emergency Stop',
      'Queue has been paused. Please check station.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => {
          setStationStatus('emergency');
          setIsOnBreak(true);
        }}
      ]
    );
  };

  const handleAddToQueue = () => {
    const newCustomer = {
      id: (queue.length + 1).toString(),
      customerName: 'Walk-in Customer',
      service: 'Haircut',
      position: queue.length + 1,
      waitTime: `${(queue.length + 1) * 15} min`,
      status: 'waiting'
    };
    
    setQueue([...queue, newCustomer]);
    Alert.alert('Added', 'Walk-in customer added to queue');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'now serving': return '#4CAF50';
      case 'waiting': return '#2196F3';
      case 'completed': return '#9E9E9E';
      default: return '#FF9800';
    }
  };

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
        <Text style={styles.headerTitle}>Barber Control Panel</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('QueueDisplay')}>
            <Icon name="tv-outline" size={24} color="#FFD700" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Station Status */}
        <View style={styles.stationCard}>
          <View style={styles.stationHeader}>
            <View style={styles.statusIndicator}>
              <View style={[
                styles.statusDot,
                { backgroundColor: stationStatus === 'active' ? '#4CAF50' : stationStatus === 'break' ? '#FF9800' : '#F44336' }
              ]} />
              <Text style={styles.statusText}>
                {stationStatus === 'active' ? 'ACTIVE' : stationStatus === 'break' ? 'ON BREAK' : 'EMERGENCY'}
              </Text>
            </View>
            <Text style={styles.stationTitle}>Station #1</Text>
          </View>
          
          <View style={styles.stationStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{queue.length}</Text>
              <Text style={styles.statLabel}>In Queue</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {queue.find(c => c.status === 'now serving')?.position || '0'}
              </Text>
              <Text style={styles.statLabel}>Now Serving</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {queue.filter(c => c.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Current Customer */}
        {currentCustomer && (
          <View style={styles.currentCustomerCard}>
            <Text style={styles.sectionTitle}>Now Serving</Text>
            <View style={styles.customerInfo}>
              <View style={styles.customerIcon}>
                <Icon name="person" size={40} color="#FFD700" />
              </View>
              <View style={styles.customerDetails}>
                <Text style={styles.customerName}>{currentCustomer.customerName}</Text>
                <Text style={styles.customerService}>{currentCustomer.service}</Text>
                <View style={styles.customerStatus}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentCustomer.status) }]} />
                  <Text style={styles.statusText}>NOW SERVING</Text>
                </View>
              </View>
              <View style={styles.timerContainer}>
                <Icon name="time-outline" size={24} color="#FFD700" />
                <Text style={styles.timerText}>15:00</Text>
              </View>
            </View>
          </View>
        )}

        {/* Control Buttons */}
        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>Quick Controls</Text>
          
          <View style={styles.controlsGrid}>
            <TouchableOpacity 
              style={[styles.controlButton, styles.primaryControl]}
              onPress={handleCallNext}
              disabled={isOnBreak || queue.length <= 1}
            >
              <Icon name="megaphone-outline" size={30} color="#fff" />
              <Text style={styles.controlButtonText}>Call Next</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.controlButton, styles.successControl]}
              onPress={handleComplete}
              disabled={isOnBreak || queue.length === 0}
            >
              <Icon name="checkmark-done-outline" size={30} color="#fff" />
              <Text style={styles.controlButtonText}>Complete</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.controlButton, 
                isOnBreak ? styles.warningControlActive : styles.warningControl
              ]}
              onPress={handleBreak}
            >
              <Icon name={isOnBreak ? "play-outline" : "cafe-outline"} size={30} color="#fff" />
              <Text style={styles.controlButtonText}>
                {isOnBreak ? 'End Break' : 'Start Break'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.controlButton, styles.dangerControl]}
              onPress={handleEmergency}
            >
              <Icon name="alert-circle-outline" size={30} color="#fff" />
              <Text style={styles.controlButtonText}>Emergency</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Queue List */}
        <View style={styles.queueSection}>
          <View style={styles.queueHeader}>
            <Text style={styles.sectionTitle}>Queue ({queue.length})</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddToQueue}>
              <Icon name="add-circle-outline" size={20} color="#FFD700" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          {queue.length === 0 ? (
            <View style={styles.emptyQueue}>
              <Icon name="people-outline" size={50} color="#333" />
              <Text style={styles.emptyQueueText}>No customers in queue</Text>
            </View>
          ) : (
            queue.map((customer, index) => (
              <View key={customer.id} style={[
                styles.queueItem,
                customer.status === 'now serving' && styles.currentQueueItem
              ]}>
                <View style={styles.queuePosition}>
                  <Text style={styles.queuePositionText}>{customer.position}</Text>
                </View>
                <View style={styles.queueCustomerInfo}>
                  <Text style={styles.queueCustomerName}>{customer.customerName}</Text>
                  <Text style={styles.queueService}>{customer.service}</Text>
                </View>
                <View style={styles.queueStatusContainer}>
                  <View style={[
                    styles.queueStatusBadge,
                    { backgroundColor: getStatusColor(customer.status) }
                  ]} />
                  <Text style={styles.queueStatusText}>{customer.status.toUpperCase()}</Text>
                </View>
                <View style={styles.queueTime}>
                  <Icon name="time-outline" size={14} color="#888" />
                  <Text style={styles.queueTimeText}>{customer.waitTime}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Additional Controls */}
        <View style={styles.additionalControls}>
          <TouchableOpacity style={styles.additionalButton}>
            <Icon name="qr-code-outline" size={24} color="#2196F3" />
            <Text style={styles.additionalButtonText}>Scan QR</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.additionalButton}>
            <Icon name="notifications-outline" size={24} color="#FFD700" />
            <Text style={styles.additionalButtonText}>Notify All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.additionalButton}>
            <Icon name="stats-chart-outline" size={24} color="#4CAF50" />
            <Text style={styles.additionalButtonText}>Reports</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.additionalButton}
            onPress={() => navigation.navigate('Payment', {
              appointment: {
                barberName: currentCustomer?.customerName || 'Customer',
                service: currentCustomer?.service || 'Haircut',
                price: '$25',
                status: 'completed'
              }
            })}
          >
            <Icon name="cash-outline" size={24} color="#4CAF50" />
            <Text style={styles.additionalButtonText}>Payment</Text>
          </TouchableOpacity>
        </View>

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
  headerRight: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stationCard: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  stationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  stationStats: {
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
  currentCustomerCard: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  customerService: {
    fontSize: 14,
    color: '#FFD700',
    marginBottom: 8,
  },
  customerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  controlsSection: {
    marginBottom: 20,
  },
  controlsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  controlButton: {
    width: '48%',
    height: 100,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryControl: {
    backgroundColor: '#2196F3',
  },
  successControl: {
    backgroundColor: '#4CAF50',
  },
  warningControl: {
    backgroundColor: '#FF9800',
  },
  warningControlActive: {
    backgroundColor: '#FF5722',
  },
  dangerControl: {
    backgroundColor: '#F44336',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
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
    marginBottom: 15,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyQueue: {
    alignItems: 'center',
    padding: 40,
  },
  emptyQueueText: {
    color: '#888',
    fontSize: 16,
    marginTop: 15,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  currentQueueItem: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  queuePosition: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  queuePositionText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 15,
  },
  queueStatusBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  queueStatusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  queueTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  queueTimeText: {
    fontSize: 12,
    color: '#888',
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  additionalButton: {
    alignItems: 'center',
    gap: 8,
  },
  additionalButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  spacer: {
    height: 40,
  },
});

export default BarberControlPanel;