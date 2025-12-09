// file name: appointmentsStore.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';

const APPOINTMENTS_KEY = 'user_appointments';

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
    
    // Debug log
    console.log('🔍 Looking for appointments for barber:', barberName);
    console.log('📋 All appointments:', appointments.length);
    
    // Try different ways to match barber name
    const filteredAppointments = appointments.filter(app => {
      // Check if appointment has barber object with name
      if (app.barber && app.barber.name) {
        return app.barber.name === barberName;
      }
      // Check if appointment has barberName property
      if (app.barberName) {
        return app.barberName === barberName;
      }
      return false;
    });
    
    console.log('✅ Found appointments for barber:', filteredAppointments.length);
    return filteredAppointments;
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

// Get customer appointments
export const getCustomerAppointments = async (customerName) => {
  try {
    const appointments = await getAllAppointments();
    console.log('🔍 Searching appointments for customer:', customerName);
    console.log('📋 All appointments:', appointments);
    
    // Try exact match first
    let filtered = appointments.filter(app => 
      app.customerName === customerName
    );
    
    // If no exact match, try case-insensitive partial match
    if (filtered.length === 0) {
      filtered = appointments.filter(app => 
        app.customerName && 
        app.customerName.toLowerCase().includes(customerName.toLowerCase())
      );
    }
    
    console.log('✅ Found appointments:', filtered);
    return filtered;
  } catch (error) {
    console.error('Error getting customer appointments:', error);
    return [];
  }
};

// FIXED: Seed with sample data (removed supabase dependency)
export const seedSampleData = async () => {
  try {
    const appointments = await getAllAppointments();
    if (appointments.length === 0) {
      console.log('🌱 Seeding sample data...');
      
      // Create sample data WITHOUT supabase dependency
      const sampleData = [
        {
          id: 'APPT-1001',
          appointmentNumber: 1001,
          barber: { name: 'Barber 1', specialty: 'Fade Master', rating: 4.8 },
          services: [{ name: 'Haircut', price: 250 }],
          date: 'Today',
          time: '3:00 PM',
          totalPrice: 250,
          totalDuration: '30 min',
          status: 'confirmed',
          customerName: 'John Customer',
          createdAt: new Date().toISOString()
        },
        {
          id: 'APPT-1002',
          appointmentNumber: 1002,
          barber: { name: 'Barber 2', specialty: 'Classic Cuts', rating: 4.9 },
          services: [{ name: 'Haircut & Beard', price: 450 }],
          date: 'Tomorrow',
          time: '11:00 AM',
          totalPrice: 450,
          totalDuration: '45 min',
          status: 'upcoming',
          customerName: 'Sarah Customer',
          createdAt: new Date().toISOString()
        }
      ];
      
      await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(sampleData));
      console.log('✅ Sample data seeded');
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

// Alternative: Seed sample data with supabase but with better error handling
export const seedSampleDataWithSupabase = async () => {
  try {
    const appointments = await getAllAppointments();
    if (appointments.length === 0) {
      console.log('🌱 Seeding sample data with Supabase...');
      
      let customerName1 = 'John Customer';
      let customerName2 = 'Sarah Customer';
      let barber1 = 'Barber 1';
      let barber2 = 'Barber 2';
      
      // Try to get data from Supabase if available
      try {
        // Check if supabase is properly imported and available
        if (supabase && typeof supabase.auth !== 'undefined') {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, role')
              .eq('auth_id', user.id)
              .single();
            
            if (profile?.role === 'customer') {
              customerName1 = profile.full_name || customerName1;
              
              // Get actual barbers
              const { data: barbers } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('role', 'barber')
                .limit(2);
              
              if (barbers && barbers.length > 0) {
                barber1 = barbers[0]?.full_name || barber1;
                barber2 = barbers[1]?.full_name || barber2;
              }
            }
          }
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase not available for seeding, using default data:', supabaseError.message);
      }
      
      const sampleData = [
        {
          id: 'APPT-1001',
          appointmentNumber: 1001,
          barber: { name: barber1, specialty: 'Fade Master', rating: 4.8 },
          services: [{ name: 'Haircut', price: 250 }],
          date: 'Today',
          time: '3:00 PM',
          totalPrice: 250,
          totalDuration: '30 min',
          status: 'confirmed',
          customerName: customerName1,
          createdAt: new Date().toISOString()
        },
        {
          id: 'APPT-1002',
          appointmentNumber: 1002,
          barber: { name: barber2, specialty: 'Classic Cuts', rating: 4.9 },
          services: [{ name: 'Haircut & Beard', price: 450 }],
          date: 'Tomorrow',
          time: '11:00 AM',
          totalPrice: 450,
          totalDuration: '45 min',
          status: 'upcoming',
          customerName: customerName2,
          createdAt: new Date().toISOString()
        }
      ];
      
      await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(sampleData));
      console.log('✅ Sample data seeded with Supabase');
    }
  } catch (error) {
    console.error('Error seeding data with Supabase:', error);
  }
};

export const clearFakeBarberAppointments = async (barberName) => {
  try {
    const appointments = await getAllAppointments();
    const realAppointments = appointments.filter(app => 
      app.barber?.name !== 'Tony Styles' && 
      app.barber?.name !== 'Maria Razor' &&
      app.barberName !== 'Tony Styles' &&
      app.barberName !== 'Maria Razor'
    );
    
    await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(realAppointments));
    console.log('🧹 Cleared fake barber appointments');
    return realAppointments;
  } catch (error) {
    console.error('Error clearing fake appointments:', error);
  }
};

export const getRealBarberAppointments = async (barberName) => {
  try {
    const appointments = await getAllAppointments();
    const fakeBarberNames = ['Tony Styles', 'Maria Razor', 'Carlos Traditional'];
    
    return appointments.filter(app => 
      // Exclude fake barber names
      !fakeBarberNames.includes(app.barber?.name) &&
      !fakeBarberNames.includes(app.barberName) &&
      // Include only this barber's appointments
      (app.barber?.name === barberName || app.barberName === barberName)
    );
  } catch (error) {
    console.error('Error getting real barber appointments:', error);
    return [];
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

// Export a safe version that doesn't use supabase
export const safeSeedSampleData = async () => {
  try {
    return await seedSampleData(); // Use the non-supabase version
  } catch (error) {
    console.error('Error in safe seed:', error);
    return false;
  }
};