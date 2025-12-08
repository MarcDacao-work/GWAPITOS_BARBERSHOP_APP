import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { mockQueue } from '../utils/mockData';

const { width, height } = Dimensions.get('window');

const QueueDisplayScreen = ({ navigation }) => {
  const [queue, setQueue] = useState(mockQueue);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        setCurrentTime(new Date());
        // In a real app, you would fetch updated queue here
      }, 30000);
    }
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { 
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const currentCustomer = queue.find(c => c.status === 'now serving');
  const waitingCustomers = queue.filter(c => c.status === 'waiting');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      
      {/* Top Bar - Only visible in developer mode */}
      <TouchableOpacity 
        style={styles.developerBar}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back-outline" size={24} color="#FFD700" />
        <Text style={styles.developerText}>Exit Display Mode</Text>
      </TouchableOpacity>

      {/* Main Display */}
      <View style={styles.mainDisplay}>
        {/* Shop Title */}
        <View style={styles.shopHeader}>
          <Text style={styles.shopName}>GWAPITOS BARBER SHOP</Text>
          <Text style={styles.shopTagline}>Professional Haircuts & Grooming</Text>
        </View>

        {/* Current Time and Date */}
        <View style={styles.timeSection}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
        </View>

        {/* Now Serving Section */}
        <View style={styles.nowServingSection}>
          <Text style={styles.nowServingLabel}>NOW SERVING</Text>
          
          {currentCustomer ? (
            <View style={styles.currentCustomerCard}>
              <Text style={styles.customerNumber}>#{currentCustomer.position}</Text>
              <Text style={styles.customerName}>{currentCustomer.customerName}</Text>
              <Text style={styles.customerService}>{currentCustomer.service}</Text>
              
              <View style={styles.serviceIndicator}>
                <Icon name="cut-outline" size={30} color="#FFD700" />
                <Text style={styles.serviceStatus}>IN SERVICE</Text>
              </View>
            </View>
          ) : (
            <View style={styles.noCustomerCard}>
              <Icon name="people-outline" size={60} color="#333" />
              <Text style={styles.noCustomerText}>No customers being served</Text>
            </View>
          )}
        </View>

        {/* Next Up Section */}
        <View style={styles.nextUpSection}>
          <Text style={styles.nextUpLabel}>NEXT UP</Text>
          
          {waitingCustomers.slice(0, 3).map((customer, index) => (
            <View key={customer.id} style={styles.nextCustomerCard}>
              <View style={styles.nextCustomerInfo}>
                <Text style={styles.nextPosition}>#{customer.position}</Text>
                <View style={styles.nextCustomerDetails}>
                  <Text style={styles.nextCustomerName}>{customer.customerName}</Text>
                  <Text style={styles.nextCustomerService}>{customer.service}</Text>
                </View>
              </View>
              <View style={styles.waitTimeContainer}>
                <Icon name="time-outline" size={20} color="#FFD700" />
                <Text style={styles.waitTimeText}>{customer.waitTime}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Queue Summary */}
        <View style={styles.queueSummary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{queue.length}</Text>
            <Text style={styles.summaryLabel}>TOTAL IN QUEUE</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {waitingCustomers.length}
            </Text>
            <Text style={styles.summaryLabel}>WAITING</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {queue.filter(c => c.status === 'completed').length}
            </Text>
            <Text style={styles.summaryLabel}>COMPLETED</Text>
          </View>
        </View>

        {/* Estimated Wait Time */}
        <View style={styles.waitTimeSection}>
          <Text style={styles.waitTimeLabel}>ESTIMATED WAIT TIME</Text>
          <Text style={styles.waitTimeValue}>
            {waitingCustomers.length > 0 ? waitingCustomers[0].waitTime : '0 min'}
          </Text>
          <Text style={styles.waitTimeNote}>
            {waitingCustomers.length > 0 
              ? `for customer #${waitingCustomers[0].position}` 
              : 'No customers waiting'}
          </Text>
        </View>

        {/* Footer Information */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            <Icon name="information-circle-outline" size={16} color="#888" /> 
            Please wait for your number to be called
          </Text>
          <Text style={styles.footerText}>
            <Icon name="qr-code-outline" size={16} color="#888" /> 
            Scan QR code for real-time updates
          </Text>
        </View>

        {/* Refresh Indicator */}
        <View style={styles.refreshIndicator}>
          <Icon 
            name={autoRefresh ? "sync" : "sync-outline"} 
            size={16} 
            color="#888" 
          />
          <Text style={styles.refreshText}>
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'} • 
            Last update: {formatTime(currentTime)}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  developerBar: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    borderRadius: 8,
  },
  developerText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  mainDisplay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  shopHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  shopName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFD700',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 5,
  },
  shopTagline: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
  },
  timeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timeText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 20,
    color: '#888888',
    textAlign: 'center',
  },
  nowServingSection: {
    width: '100%',
    marginBottom: 40,
  },
  nowServingLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 3,
  },
  currentCustomerCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  customerNumber: {
    fontSize: 80,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 10,
  },
  customerName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  customerService: {
    fontSize: 24,
    color: '#888888',
    marginBottom: 20,
  },
  serviceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#252525',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  serviceStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  noCustomerCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  noCustomerText: {
    fontSize: 24,
    color: '#888888',
    marginTop: 20,
  },
  nextUpSection: {
    width: '100%',
    marginBottom: 40,
  },
  nextUpLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 2,
  },
  nextCustomerCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  nextCustomerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nextPosition: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2196F3',
    marginRight: 20,
    minWidth: 60,
  },
  nextCustomerDetails: {
    flex: 1,
  },
  nextCustomerName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  nextCustomerService: {
    fontSize: 16,
    color: '#888888',
  },
  waitTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  waitTimeText: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '600',
  },
  queueSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
  },
  waitTimeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  waitTimeLabel: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 10,
    letterSpacing: 1,
  },
  waitTimeValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  waitTimeNote: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 10,
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshText: {
    fontSize: 12,
    color: '#888888',
  },
});

export default QueueDisplayScreen;