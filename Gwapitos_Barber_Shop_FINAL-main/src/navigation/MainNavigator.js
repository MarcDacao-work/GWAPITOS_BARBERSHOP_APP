import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import CustomerHomeScreen from '../screens/CustomerHomeScreen';
import BarberHomeScreen from '../screens/BarberHomeScreen';
import BookAppointmentScreen from '../screens/BookAppointmentScreen';
import AppointmentConfirmationScreen from '../screens/AppointmentConfirmationScreen';
import BarberControlPanel from '../screens/BarberControlPanel';
import QueueDisplayScreen from '../screens/QueueDisplayScreen';
import CustomerQueueScreen from '../screens/CustomerQueueScreen';
import PaymentScreen from '../screens/PaymentScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import BarberScheduleScreen from '../screens/BarberScheduleScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// =================== CUSTOMER SCREENS ===================
const CustomerBookingsScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.title}>📅 My Appointments</Text>
    <Text style={styles.subtitle}>Manage your bookings</Text>
    
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate('BookAppointment')}
    >
      <Icon name="add-circle" size={24} color="#1a1a1a" />
      <Text style={styles.buttonText}>Book New Appointment</Text>
    </TouchableOpacity>
    
    <TouchableOpacity
      style={styles.secondaryButton}
      onPress={() => navigation.navigate('AppointmentConfirmation', {
        appointment: {
          barber: { name: 'Tony Styles' },
          service: { name: 'Haircut' },
          date: 'Today',
          time: '3:00 PM',
          status: 'confirmed',
          qrData: 'DEMO-12345'
        }
      })}
    >
      <Text style={styles.secondaryButtonText}>View Sample Appointment</Text>
    </TouchableOpacity>
    
    <TouchableOpacity
      style={styles.secondaryButton}
      onPress={() => navigation.navigate('CustomerQueue')}
    >
      <Text style={styles.secondaryButtonText}>Check Queue Status</Text>
    </TouchableOpacity>
  </View>
);

const CustomerSearchScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.title}>🔍 Find Barbers</Text>
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate('BookAppointment')}
    >
      <Text style={styles.buttonText}>Browse Available Barbers</Text>
    </TouchableOpacity>
  </View>
);

const CustomerProfileScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setEmail(user.email);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 My Profile</Text>
      <View style={styles.profileCard}>
        <Icon name="person-circle" size={60} color="#FFD700" />
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.roleLabel}>Customer Account</Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="log-out" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

// =================== BARBER SCREENS ===================
const BarberDashboardScreen = ({ navigation }) => <BarberHomeScreen navigation={navigation} />;

const BarberQueueScreen = ({ navigation }) => <BarberControlPanel navigation={navigation} />;

/*const BarberScheduleScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.title}>📅 My Schedule</Text>
    <Text style={styles.subtitle}>Today's appointments</Text>
    
    <TouchableOpacity style={styles.appointmentCard}>
      <Icon name="person" size={30} color="#FFD700" />
      <View style={styles.appointmentInfo}>
        <Text style={styles.customerName}>John Doe</Text>
        <Text style={styles.service}>Haircut & Beard</Text>
        <Text style={styles.time}>3:00 PM</Text>
      </View>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>Confirmed</Text>
      </View>
    </TouchableOpacity>
    
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate('QRScanner')}
    >
      <Icon name="qr-code" size={24} color="#1a1a1a" />
      <Text style={styles.buttonText}>Scan Customer QR</Text>
    </TouchableOpacity>
  </View>
);
*/

const BarberProfileScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setEmail(user.email);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✂️ Barber Profile</Text>
      <View style={styles.profileCard}>
        <Icon name="cut" size={60} color="#FFD700" />
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.roleLabel}>Professional Barber</Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="log-out" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

// =================== TAB NAVIGATORS ===================
const CustomerTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'Bookings') iconName = focused ? 'calendar' : 'calendar-outline';
        else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#FFD700',
      tabBarInactiveTintColor: '#888',
      tabBarStyle: {
        backgroundColor: '#1a1a1a',
        borderTopColor: '#333',
        height: 60,
        paddingBottom: 5,
      },
      tabBarLabelStyle: { fontSize: 12 },
      headerShown: false,
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={CustomerHomeScreen}
      options={{ unmountOnBlur: true }} // FIX: Prevent duplicate key issues
    />
    <Tab.Screen 
      name="Bookings" 
      component={CustomerBookingsScreen}
      options={{ unmountOnBlur: true }}
    />
    <Tab.Screen 
      name="Search" 
      component={CustomerSearchScreen}
      options={{ unmountOnBlur: true }}
    />
    <Tab.Screen 
      name="Profile" 
      component={CustomerProfileScreen}
      options={{ unmountOnBlur: true }}
    />
  </Tab.Navigator>
);

const BarberTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Dashboard') iconName = focused ? 'speedometer' : 'speedometer-outline';
        else if (route.name === 'Queue') iconName = focused ? 'list' : 'list-outline';
        else if (route.name === 'Schedule') iconName = focused ? 'calendar' : 'calendar-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#2196F3',
      tabBarInactiveTintColor: '#888',
      tabBarStyle: {
        backgroundColor: '#1a1a1a',
        borderTopColor: '#333',
        height: 60,
        paddingBottom: 5,
      },
      tabBarLabelStyle: { fontSize: 12 },
      headerShown: false,
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={BarberDashboardScreen}
      options={{ unmountOnBlur: true }} // FIX: Prevent duplicate key issues
    />
    <Tab.Screen 
      name="Queue" 
      component={BarberQueueScreen}
      options={{ unmountOnBlur: true }}
    />
    <Tab.Screen 
      name="Schedule" 
      component={BarberScheduleScreen}
      options={{ unmountOnBlur: true }}
    />
    <Tab.Screen 
      name="Profile" 
      component={BarberProfileScreen}
      options={{ unmountOnBlur: true }}
    />
  </Tab.Navigator>
);

// =================== MAIN NAVIGATOR ===================
const MainNavigator = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRole();
  }, []);

// In the fetchUserRole function, update the console.logs:
const fetchUserRole = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      setUserRole('customer');
      setLoading(false);
      return;
    }
    
    if (user) {
      // Don't log to console in production
      // Get user metadata
      const metadataRole = user.user_metadata?.role;
      
      // Try to get profile from database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('auth_id', user.id)
        .maybeSingle();
      
      // Decision logic
      let finalRole = 'customer'; // Default
      
      if (profile?.role) {
        finalRole = profile.role;
      } else if (metadataRole) {
        finalRole = metadataRole;
        
        // Create profile if it doesn't exist
        try {
          await supabase
            .from('profiles')
            .upsert({
              auth_id: user.id,
              email: user.email,
              role: metadataRole,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
            }, {
              onConflict: 'auth_id'
            });
        } catch (insertErr) {
          // Silently handle insert error
        }
      }
      
      setUserRole(finalRole);
      
    } else {
      setUserRole('customer');
    }
  } catch (error) {
    setUserRole('customer');
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
     <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#FFD700" />
      <Text style={styles.loadingText}>Loading...</Text>
     </View>
  );
}

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="MainTabs"
        key={userRole} // FIX: Unique key based on user role
      >
        {() => (userRole === 'barber' ? <BarberTabs /> : <CustomerTabs />)}
      </Stack.Screen>
      
      {/* Shared Screens */}
      <Stack.Screen 
        name="BookAppointment" 
        component={BookAppointmentScreen} 
        options={{ headerShown: true, title: 'Book Appointment' }}
      />
      <Stack.Screen 
        name="AppointmentConfirmation" 
        component={AppointmentConfirmationScreen} 
        options={{ headerShown: true, title: 'Appointment Details' }}
      />
      <Stack.Screen 
        name="CustomerQueue" 
        component={CustomerQueueScreen} 
        options={{ headerShown: true, title: 'Queue Status' }}
      />
      <Stack.Screen 
        name="Payment" 
        component={PaymentScreen} 
        options={{ headerShown: true, title: 'Payment' }}
      />
      <Stack.Screen 
        name="QRScanner" 
        component={QRScannerScreen} 
        options={{ headerShown: true, title: 'Scan QR Code' }}
      />
      <Stack.Screen 
        name="QueueDisplay" 
        component={QueueDisplayScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    gap: 10,
  },
  buttonText: {
    color: '#1a1a1a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#2d2d2d',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#444',
  },
  secondaryButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  appointmentCard: {
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  appointmentInfo: {
    flex: 1,
    marginLeft: 15,
  },
  customerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  service: {
    color: '#FFD700',
    fontSize: 14,
  },
  time: {
    color: '#888',
    fontSize: 14,
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileCard: {
    backgroundColor: '#2d2d2d',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
  },
  email: {
    color: '#fff',
    fontSize: 18,
    marginTop: 15,
    fontWeight: '600',
  },
  roleLabel: {
    color: '#FFD700',
    fontSize: 16,
    marginTop: 5,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MainNavigator;