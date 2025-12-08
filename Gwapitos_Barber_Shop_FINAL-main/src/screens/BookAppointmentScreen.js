import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { mockBarbers, mockServices, mockTimeSlots } from '../utils/mockData';

const BookAppointmentScreen = ({ navigation }) => {
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedTime, setSelectedTime] = useState(null);

  const dates = ['Today', 'Tomorrow', 'Dec 15', 'Dec 16', 'Dec 17'];

  const handleConfirmBooking = () => {
    if (!selectedBarber || !selectedService || !selectedTime) {
      alert('Please select barber, service, and time');
      return;
    }
    
    const appointmentData = {
      barber: selectedBarber,
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      price: selectedBarber.price,
      duration: '45 min'
    };
    
    navigation.navigate('AppointmentConfirmation', { appointment: appointmentData });
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
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Step Indicator */}
        <View style={styles.stepContainer}>
          <View style={[styles.step, styles.activeStep]}>
            <Icon name="person-outline" size={20} color="#1a1a1a" />
            <Text style={styles.stepText}>Barber</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={[styles.step, selectedBarber ? styles.activeStep : styles.inactiveStep]}>
            <Icon name="cut-outline" size={20} color={selectedBarber ? "#1a1a1a" : "#888"} />
            <Text style={[styles.stepText, selectedBarber ? styles.activeStepText : styles.inactiveStepText]}>
              Service
            </Text>
          </View>
          <View style={styles.stepLine} />
          <View style={[styles.step, selectedService ? styles.activeStep : styles.inactiveStep]}>
            <Icon name="time-outline" size={20} color={selectedService ? "#1a1a1a" : "#888"} />
            <Text style={[styles.stepText, selectedService ? styles.activeStepText : styles.inactiveStepText]}>
              Time
            </Text>
          </View>
        </View>

        {/* Choose Barber Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Barber</Text>
          <Text style={styles.sectionSubtitle}>Select from our top-rated professionals</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.barberScroll}>
            {mockBarbers.map((barber) => (
              <TouchableOpacity
                key={barber.id}
                style={[
                  styles.barberCard,
                  selectedBarber?.id === barber.id && styles.selectedBarberCard
                ]}
                onPress={() => setSelectedBarber(barber)}
              >
                <View style={[styles.barberIcon, { backgroundColor: barber.imageColor }]}>
                  <Icon name="person" size={40} color="#fff" />
                </View>
                <Text style={styles.barberName}>{barber.name}</Text>
                <Text style={styles.barberSpecialty}>{barber.specialty}</Text>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={14} color="#FFD700" />
                  <Text style={styles.ratingText}>{barber.rating}</Text>
                </View>
                {selectedBarber?.id === barber.id && (
                  <View style={styles.selectedIndicator}>
                    <Icon name="checkmark-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Choose Service Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Service</Text>
          <Text style={styles.sectionSubtitle}>What would you like done today?</Text>
          
          <View style={styles.servicesGrid}>
            {mockServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  selectedService?.id === service.id && styles.selectedServiceCard
                ]}
                onPress={() => setSelectedService(service)}
              >
                <View style={styles.serviceIconContainer}>
                  <Icon name="cut-outline" size={24} color="#FFD700" />
                </View>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDuration}>{service.duration}</Text>
                <Text style={styles.servicePrice}>{service.price}</Text>
                {selectedService?.id === service.id && (
                  <View style={styles.serviceSelectedIndicator}>
                    <Icon name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Choose Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            {dates.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateCard,
                  selectedDate === date && styles.selectedDateCard
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[
                  styles.dateText,
                  selectedDate === date && styles.selectedDateText
                ]}>
                  {date}
                </Text>
                <Text style={[
                  styles.dayText,
                  selectedDate === date && styles.selectedDayText
                ]}>
                  {date === 'Today' ? 'Now' : date === 'Tomorrow' ? 'Tomorrow' : 'Sat'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Choose Time Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time Slot</Text>
          <Text style={styles.sectionSubtitle}>Available times for {selectedDate}</Text>
          
          <View style={styles.timeGrid}>
            {mockTimeSlots.map((time, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeCard,
                  selectedTime === time && styles.selectedTimeCard
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[
                  styles.timeText,
                  selectedTime === time && styles.selectedTimeText
                ]}>
                  {time}
                </Text>
                {selectedTime === time && (
                  <Icon name="checkmark" size={16} color="#4CAF50" style={styles.timeCheck} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Booking Summary */}
        {(selectedBarber || selectedService || selectedTime) && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Barber:</Text>
              <Text style={styles.summaryValue}>
                {selectedBarber ? selectedBarber.name : 'Not selected'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service:</Text>
              <Text style={styles.summaryValue}>
                {selectedService ? selectedService.name : 'Not selected'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date & Time:</Text>
              <Text style={styles.summaryValue}>
                {selectedDate}, {selectedTime || 'Not selected'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Price:</Text>
              <Text style={styles.summaryPrice}>
                {selectedBarber ? selectedBarber.price : 'P0'}
              </Text>
            </View>
          </View>
        )}

        {/* Confirm Button */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!selectedBarber || !selectedService || !selectedTime) && styles.disabledButton
          ]}
          onPress={handleConfirmBooking}
          disabled={!selectedBarber || !selectedService || !selectedTime}
        >
          <Icon name="calendar-outline" size={22} color="#fff" />
          <Text style={styles.confirmButtonText}>
            CONFIRM BOOKING
          </Text>
        </TouchableOpacity>

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
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  step: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: '#FFD700',
  },
  inactiveStep: {
    backgroundColor: '#252525',
    borderWidth: 1,
    borderColor: '#333',
  },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: '#333',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  activeStepText: {
    color: '#1a1a1a',
  },
  inactiveStepText: {
    color: '#888',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 15,
  },
  barberScroll: {
    flexDirection: 'row',
  },
  barberCard: {
    width: 140,
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedBarberCard: {
    borderColor: '#FFD700',
    backgroundColor: '#2a2a2a',
  },
  barberIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  barberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  barberSpecialty: {
    fontSize: 12,
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedServiceCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#2a2a2a',
  },
  serviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  serviceDuration: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  serviceSelectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateScroll: {
    flexDirection: 'row',
  },
  dateCard: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#252525',
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  selectedDateCard: {
    backgroundColor: '#FFD700',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  selectedDateText: {
    color: '#1a1a1a',
  },
  dayText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  selectedDayText: {
    color: '#1a1a1a',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeCard: {
    width: '30%',
    backgroundColor: '#252525',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedTimeCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#2a2a2a',
  },
  timeText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  selectedTimeText: {
    color: '#4CAF50',
  },
  timeCheck: {
    position: 'absolute',
    top: 5,
    right: 5,
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#888',
  },
  summaryValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  summaryPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  confirmButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spacer: {
    height: 40,
  },
});

export default BookAppointmentScreen;