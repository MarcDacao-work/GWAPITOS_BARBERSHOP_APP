import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { mockServices, mockTimeSlots } from '../utils/mockData';
import { getNextAppointmentNumber, addAppointment } from '../utils/appointmentsStore';
import { supabase } from '../services/supabase';

const BookAppointmentScreen = ({ navigation }) => {
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedTime, setSelectedTime] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const [loadingBarbers, setLoadingBarbers] = useState(true);
  const [currentUserName, setCurrentUserName] = useState('');

  const dates = ['Today', 'Tomorrow', 'Dec 15', 'Dec 16', 'Dec 17'];

  useEffect(() => {
    fetchCurrentUser();
    fetchRealBarbers();
  }, []);

  const fetchCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('auth_id', user.id)
        .single();
      
      console.log('👤 Current user profile:', profile);
      
      if (profile?.full_name) {
        setCurrentUserName(profile.full_name);
      } else {
        // Fallback to email name
        const emailName = user.email?.split('@')[0] || 'Customer';
        setCurrentUserName(emailName);
        console.log('⚠️ Using email name fallback:', emailName);
      }
    }
  } catch (error) {
    console.log('❌ Error fetching user:', error);
    setCurrentUserName('Customer');
  }
};

  const fetchRealBarbers = async () => {
    try {
      setLoadingBarbers(true);
      
      const { data: barberProfiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'barber');
      
      if (error) throw error;
      
      if (barberProfiles && barberProfiles.length > 0) {
        const transformedBarbers = barberProfiles.map((barber, index) => ({
          id: barber.auth_id || barber.id || `barber-${index}`,
          name: barber.full_name || barber.email?.split('@')[0] || 'Barber',
          title: barber.specialization ? `${barber.specialization} Specialist` : 'Professional Barber',
          specialty: barber.specialization || 'Haircut',
          rating: 4.5,
          reviews: 0,
          experience: barber.years_experience ? `${barber.years_experience} years` : 'Experienced',
          bio: barber.bio || `Professional barber specializing in ${barber.specialization || 'haircuts'}`,
          services: ['Haircut', 'Beard Trim', 'Styling'],
          priceRange: '$20-$35',
          available: true,
          todaySlots: 3,
          nextAvailable: 'Today, 2:00 PM',
          imageColor: ['#2196F3', '#FF4081', '#4CAF50', '#FF9800', '#9C27B0'][index % 5]
        }));
        
        setBarbers(transformedBarbers);
      } else {
        setBarbers([
          {
            id: '1',
            name: 'Kikibon',
            title: 'Fade Master',
            specialty: 'Modern Fades',
            rating: 4.8,
            experience: '5 years',
            imageColor: '#2196F3'
          },
          {
            id: '2',
            name: 'Jayson',
            title: 'Classic Barber',
            specialty: 'Traditional Cuts',
            rating: 4.9,
            experience: '7 years',
            imageColor: '#FF4081'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching barbers:', error);
      setBarbers([
        {
          id: 'fallback-1',
          name: 'Barber 1',
          title: 'Professional',
          specialty: 'Haircuts',
          rating: 4.5,
          experience: 'Experienced',
          imageColor: '#2196F3'
        },
        {
          id: 'fallback-2',
          name: 'Barber 2',
          title: 'Professional',
          specialty: 'Styling',
          rating: 4.5,
          experience: 'Experienced',
          imageColor: '#4CAF50'
        }
      ]);
    } finally {
      setLoadingBarbers(false);
    }
  };

  const toggleService = (service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  // ADD THESE MISSING FUNCTIONS:
  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => total + service.price, 0);
  };

  const calculateTotalDuration = () => {
    const totalMinutes = selectedServices.reduce((total, service) => {
      const minutes = parseInt(service.duration.split(' ')[0]);
      return total + minutes;
    }, 0);
    
    if (totalMinutes < 60) {
      return `${totalMinutes} min`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  const handleConfirmBooking = async () => {
  if (!selectedBarber || selectedServices.length === 0 || !selectedTime) {
    alert('Please select barber, at least one service, and time');
    return;
  }
  
  try {
    const appointmentNumber = await getNextAppointmentNumber();
    const totalPrice = calculateTotal();
    const totalDuration = calculateTotalDuration();
    
    const appointmentData = {
      id: `APPT-${appointmentNumber}`,
      appointmentNumber: appointmentNumber,
      barber: {
        id: selectedBarber.id,
        name: selectedBarber.name,
        specialty: selectedBarber.specialty,
        rating: selectedBarber.rating
      },
      customerName: currentUserName, // This needs to be the customer's actual name
      services: selectedServices.map(service => ({
        name: service.name,
        price: service.price,
        duration: service.duration
      })),
      date: selectedDate,
      time: selectedTime,
      totalPrice: totalPrice,
      totalDuration: totalDuration,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    
    console.log('📋 Saving appointment:', {
      customerName: currentUserName,
      appointmentData: appointmentData
    });
    
    await addAppointment(appointmentData);
    
    console.log('✅ Appointment saved successfully');
    
    navigation.navigate('AppointmentConfirmation', { 
      appointment: appointmentData 
    });
  } catch (error) {
    console.error('❌ Error saving appointment:', error);
    alert('Failed to save appointment');
  }
};
  // COMPLETE RETURN STATEMENT WITH ALL SECTIONS:
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
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
          <View style={[styles.step, selectedServices.length > 0 ? styles.activeStep : styles.inactiveStep]}>
            <Icon name="time-outline" size={20} color={selectedServices.length > 0 ? "#1a1a1a" : "#888"} />
            <Text style={[styles.stepText, selectedServices.length > 0 ? styles.activeStepText : styles.inactiveStepText]}>
              Time
            </Text>
          </View>
        </View>

        {/* Choose Barber Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Barber</Text>
          <Text style={styles.sectionSubtitle}>
            {barbers.length} professional barbers available
          </Text>
          
          {loadingBarbers ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFD700" />
              <Text style={styles.loadingText}>Loading barbers...</Text>
            </View>
          ) : barbers.length === 0 ? (
            <View style={styles.noBarbersContainer}>
              <Icon name="people-outline" size={50} color="#666" />
              <Text style={styles.noBarbersText}>No barbers available</Text>
              <Text style={styles.noBarbersSubtext}>
                Barbers will appear here once they register
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.barberScroll}>
              {barbers.map((barber) => (
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
          )}
        </View>

        {/* Choose Service Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Select Services</Text>
            {selectedServices.length > 0 && (
              <View style={styles.selectionBadge}>
                <Text style={styles.selectionBadgeText}>{selectedServices.length} selected</Text>
              </View>
            )}
          </View>
          <Text style={styles.sectionSubtitle}>Choose one or more services</Text>
          
          <View style={styles.servicesGrid}>
            {mockServices.map((service) => {
              const isSelected = selectedServices.find(s => s.id === service.id);
              
              return (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceCard,
                    isSelected && styles.selectedServiceCard
                  ]}
                  onPress={() => toggleService(service)}
                >
                  <View style={[
                    styles.serviceIconContainer,
                    isSelected && styles.selectedServiceIconContainer
                  ]}>
                    <Icon 
                      name="cut-outline" 
                      size={24} 
                      color={isSelected ? "#fff" : "#FFD700"} 
                    />
                  </View>
                  <Text style={[
                    styles.serviceName,
                    isSelected && styles.selectedServiceName
                  ]}>
                    {service.name}
                  </Text>
                  <Text style={[
                    styles.serviceDuration,
                    isSelected && styles.selectedServiceDuration
                  ]}>
                    {service.duration}
                  </Text>
                  <Text style={[
                    styles.servicePrice,
                    isSelected && styles.selectedServicePrice
                  ]}>
                    P{service.price}
                  </Text>
                  {isSelected && (
                    <View style={styles.serviceSelectedIndicator}>
                      <Icon name="checkmark" size={16} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          
          {selectedServices.length > 0 && (
            <View style={styles.servicesSummary}>
              <Text style={styles.summaryLabel}>Selected:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedScroll}>
                {selectedServices.map((service, index) => (
                  <View key={`${service.id}-${index}`} style={styles.selectedTag}>
                    <Icon name="checkmark-circle" size={12} color="#4CAF50" />
                    <Text style={styles.selectedTagText}>{service.name}</Text>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalPrice}>P{calculateTotal()}</Text>
                <Text style={styles.totalDuration}> • {calculateTotalDuration()}</Text>
              </View>
            </View>
          )}
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
        {(selectedBarber || selectedServices.length > 0 || selectedTime) && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Barber:</Text>
              <Text style={styles.summaryValue}>
                {selectedBarber ? selectedBarber.name : 'Not selected'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Services:</Text>
              <Text style={styles.summaryValue}>
                {selectedServices.length > 0 
                  ? `${selectedServices.length} service${selectedServices.length > 1 ? 's' : ''}`
                  : 'Not selected'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration:</Text>
              <Text style={styles.summaryValue}>
                {selectedServices.length > 0 ? calculateTotalDuration() : '0 min'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date & Time:</Text>
              <Text style={styles.summaryValue}>
                {selectedDate}, {selectedTime || 'Not selected'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Price:</Text>
              <Text style={styles.summaryPrice}>
                P{calculateTotal()}
              </Text>
            </View>
          </View>
        )}

        {/* Confirm Button */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!selectedBarber || selectedServices.length === 0 || !selectedTime) && styles.disabledButton
          ]}
          onPress={handleConfirmBooking}
          disabled={!selectedBarber || selectedServices.length === 0 || !selectedTime}
        >
          <Icon name="calendar-outline" size={22} color="#fff" />
          <Text style={styles.confirmButtonText}>
            CONFIRM BOOKING - P{calculateTotal()}
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  selectionBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectionBadgeText: {
    color: '#1a1a1a',
    fontSize: 12,
    fontWeight: 'bold',
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
  selectedServiceIconContainer: {
    backgroundColor: '#4CAF50',
  },
  serviceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  selectedServiceName: {
    color: '#fff',
  },
  serviceDuration: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  selectedServiceDuration: {
    color: '#fff',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  selectedServicePrice: {
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
  servicesSummary: {
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  selectedScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    gap: 4,
  },
  selectedTagText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  totalLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  totalDuration: {
    fontSize: 14,
    color: '#888',
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
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#888',
    marginTop: 10,
  },
  noBarbersContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#252525',
    borderRadius: 12,
  },
  noBarbersText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
  },
  noBarbersSubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default BookAppointmentScreen;