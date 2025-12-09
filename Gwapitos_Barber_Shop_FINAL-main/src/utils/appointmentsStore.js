// file name: appointmentsStore.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const APPOINTMENTS_KEY = 'user_appointments';
let currentAppointmentNumber = 1000; // Start from 1000

// Get all appointments
export const getAllAppointments = async () => {
  try {
    const appointmentsJson = await AsyncStorage.getItem(APPOINTMENTS_KEY);
    return appointmentsJson ? JSON.parse(appointmentsJson) : [];
  } catch (error) {
    console.error('Error getting appointments:', error);
    return [];
  }
};

// Get the next appointment number
export const getNextAppointmentNumber = async () => {
  try {
    const appointments = await getAllAppointments();
    if (appointments.length === 0) {
      return 1001; // First appointment
    }
    
    // Find the highest appointment number
    const highestNumber = appointments.reduce((max, app) => {
      const appNum = app.appointmentNumber || 0;
      return appNum > max ? appNum : max;
    }, 1000);
    
    return highestNumber + 1;
  } catch (error) {
    console.error('Error getting next appointment number:', error);
    return Date.now(); // Fallback
  }
};

// Add a new appointment
export const addAppointment = async (appointment) => {
  try {
    const appointments = await getAllAppointments();
    appointments.push(appointment);
    await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    return appointment;
  } catch (error) {
    console.error('Error adding appointment:', error);
    throw error;
  }
};

// Get appointments for a specific barber
export const getBarberAppointments = async (barberName) => {
  try {
    const appointments = await getAllAppointments();
    return appointments.filter(app => 
      app.barber?.name === barberName || 
      app.barberName === barberName
    );
  } catch (error) {
    console.error('Error getting barber appointments:', error);
    return [];
  }
};

// Get upcoming appointments (confirmed status)
export const getUpcomingAppointments = async () => {
  try {
    const appointments = await getAllAppointments();
    return appointments.filter(app => 
      app.status === 'confirmed' || app.status === 'upcoming'
    );
  } catch (error) {
    console.error('Error getting upcoming appointments:', error);
    return [];
  }
};

// Seed with sample data
export const seedSampleData = async () => {
  try {
    const appointments = await getAllAppointments();
    if (appointments.length === 0) {
      const sampleData = [
        {
          id: 'APPT-1001',
          appointmentNumber: 1001,
          barber: { name: 'Tony Styles', specialty: 'Fade Master', rating: 4.8 },
          services: [{ name: 'Haircut', price: 250 }],
          date: 'Today',
          time: '3:00 PM',
          totalPrice: 250,
          totalDuration: '30 min',
          status: 'confirmed',
          customerName: 'John Smith',
          createdAt: new Date().toISOString()
        },
        {
          id: 'APPT-1002',
          appointmentNumber: 1002,
          barber: { name: 'Maria Razor', specialty: 'Classic Cuts', rating: 4.9 },
          services: [{ name: 'Haircut & Beard', price: 450 }],
          date: 'Tomorrow',
          time: '11:00 AM',
          totalPrice: 450,
          totalDuration: '45 min',
          status: 'upcoming',
          customerName: 'Sarah Johnson',
          createdAt: new Date().toISOString()
        }
      ];
      await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(sampleData));
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

// Clear all appointments (for testing)
export const clearAppointments = async () => {
  try {
    await AsyncStorage.removeItem(APPOINTMENTS_KEY);
  } catch (error) {
    console.error('Error clearing appointments:', error);
  }
};