import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
  Share
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

const AppointmentConfirmationScreen = ({ navigation, route }) => {
  const { appointment } = route.params || {
    appointment: {
      barber: { name: 'Tony Styles', price: 'P250.00' },
      service: { name: 'Haircut & Beard Trim' },
      date: 'Today',
      time: '3:00 PM',
      price: 'P250.00',
      duration: '45 min'
    }
  };

  const qrData = `APPT-${Date.now()}-${appointment.barber.name.replace(/\s+/g, '')}-${appointment.time.replace(/[:\s]/g, '')}`;
  const qrRef = useRef();

  const handleShareQR = async () => {
    try {
      const result = await Share.share({
        message: `My barbershop appointment with ${appointment.barber.name} on ${appointment.date} at ${appointment.time}. Service: ${appointment.service.name}`,
        title: 'Barbershop Appointment'
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share appointment');
    }
  };

  const handleDone = () => {
    Alert.alert(
      'Appointment Confirmed!',
      'Your appointment has been booked successfully. You can view it in "My Appointments".',
      [
        {
          text: 'View Appointments',
          onPress: () => navigation.navigate('Bookings')
        },
        {
          text: 'Return Home',
          onPress: () => navigation.navigate('Home')
        }
      ]
    );
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
        <Text style={styles.headerTitle}>Booking Confirmed!</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Success Icon */}
        <View style={styles.successContainer}>
          <View style={styles.successCircle}>
            <Icon name="checkmark-circle" size={80} color="#4CAF50" />
          </View>
          <Text style={styles.successTitle}>Appointment Booked!</Text>
          <Text style={styles.successSubtitle}>
            Your appointment has been confirmed
          </Text>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>Your QR Code</Text>
          <Text style={styles.qrSubtitle}>
            Show this to your barber when you arrive
          </Text>
          
          <View style={styles.qrContainer}>
            <View style={styles.qrCard}>
              <QRCode
                value={qrData}
                size={200}
                color="#000000"
                backgroundColor="#FFFFFF"
                getRef={(ref) => (qrRef.current = ref)}
              />
              <Text style={styles.qrText}>{qrData}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.shareButton} onPress={handleShareQR}>
            <Icon name="share-outline" size={20} color="#2196F3" />
            <Text style={styles.shareButtonText}>Share Appointment</Text>
          </TouchableOpacity>
        </View>

        {/* Appointment Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Appointment Details</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Icon name="person-outline" size={20} color="#FFD700" />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Barber</Text>
              <Text style={styles.detailValue}>{appointment.barber.name}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Icon name="cut-outline" size={20} color="#FFD700" />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Service</Text>
              <Text style={styles.detailValue}>{appointment.service.name}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Icon name="calendar-outline" size={20} color="#FFD700" />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>
                {appointment.date}, {appointment.time}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Icon name="time-outline" size={20} color="#FFD700" />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{appointment.duration}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Icon name="cash-outline" size={20} color="#FFD700" />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Total</Text>
              <Text style={styles.detailPrice}>{appointment.price}</Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>What to do next?</Text>
          
          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Arrive on time</Text>
              <Text style={styles.stepDescription}>
                Please arrive 5-10 minutes before your appointment
              </Text>
            </View>
          </View>

          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Show QR Code</Text>
              <Text style={styles.stepDescription}>
                Present this QR code to your barber for check-in
              </Text>
            </View>
          </View>

          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Enjoy your service</Text>
              <Text style={styles.stepDescription}>
                Relax and enjoy your haircut experience
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleShareQR}>
            <Icon name="share-outline" size={20} color="#2196F3" />
            <Text style={styles.secondaryButtonText}>Share QR Code</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={handleDone}>
            <Icon name="checkmark-outline" size={20} color="#1a1a1a" />
            <Text style={styles.primaryButtonText}>Done</Text>
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
    width: 44,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  qrCard: {
    alignItems: 'center',
  },
  qrText: {
    marginTop: 15,
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
    textAlign: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 10,
  },
  shareButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  detailPrice: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  instructionsCard: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: '#1a1a1a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  stepDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  primaryButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spacer: {
    height: 40,
  },
});

export default AppointmentConfirmationScreen;