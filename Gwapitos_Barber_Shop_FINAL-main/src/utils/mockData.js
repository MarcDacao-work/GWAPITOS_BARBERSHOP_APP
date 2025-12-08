// Mock data for the entire application
export const mockBarbers = [
  {
    id: '1',
    name: 'Kikibon',
    specialty: 'Fade Master',
    rating: 4.8,
    experience: '5 years',
    bio: 'Specializes in modern fades and beard grooming. Known for precision and attention to detail.',
    location: 'Downtown Salon',
    imageColor: '#2196F3',
    services: ['Haircut', 'Beard Trim', 'Shaving'],
  },
  {
    id: '2',
    name: 'Jayson tupihi ko ya',
    specialty: 'Classic Cuts',
    rating: 4.9,
    experience: '7 years',
    bio: 'Expert in classic styles and precision haircuts. Trained in traditional barbering techniques.',
    location: 'Uptown Barbershop',
    imageColor: '#FF4081',
    services: ['Haircut', 'Coloring', 'Styling'],
  },
  {
    id: '3',
    name: 'Marc Davao',
    specialty: 'Modern Styles',
    rating: 4.7,
    experience: '3 years',
    bio: 'Young talent with fresh approach to contemporary hairstyles and trends.',
    location: 'Midtown Lounge',
    imageColor: '#4CAF50',
    services: ['Haircut', 'Fade', 'Design'],
  },
  {
    id: '4',
    name: 'Carlos Traditional',
    specialty: 'Old School',
    rating: 4.9,
    experience: '10 years',
    bio: 'Master of traditional barbering with hot towel shaves and straight razor work.',
    location: 'Classic Cuts',
    imageColor: '#FF9800',
    services: ['Haircut', 'Hot Towel Shave', 'Mustache Grooming'],
  }
];

export const mockAppointments = [
  {
    id: '1',
    barberName: 'Tony Styles',
    service: 'Haircut & Beard Trim',
    date: 'Today',
    time: '3:00 PM',
    status: 'confirmed',
    duration: '45 min',
    qrData: 'APPT-001-TONY-3PM'
  },
  {
    id: '2',
    barberName: 'Maria Razor',
    service: 'Haircut & Styling',
    date: 'Tomorrow',
    time: '11:00 AM',
    status: 'upcoming',
    duration: '1 hour',
    qrData: 'APPT-002-MARIA-11AM'
  },
  {
    id: '3',
    barberName: 'Carlos Traditional',
    service: 'Hot Towel Shave',
    date: 'Dec 15',
    time: '2:30 PM',
    status: 'completed',
    duration: '30 min',
    qrData: 'APPT-003-CARLOS-230PM'
  }
];

export const mockQueue = [
  {
    id: '1',
    customerName: 'John Smith',
    service: 'Haircut',
    position: 1,
    waitTime: '15 min',
    status: 'now serving'
  },
  {
    id: '2',
    customerName: 'Sarah Johnson',
    service: 'Beard Trim',
    position: 2,
    waitTime: '30 min',
    status: 'waiting'
  },
  {
    id: '3',
    customerName: 'Mike Wilson',
    service: 'Full Service',
    position: 3,
    waitTime: '45 min',
    status: 'waiting'
  },
  {
    id: '4',
    customerName: 'Emma Davis',
    service: 'Haircut',
    position: 4,
    waitTime: '60 min',
    status: 'waiting'
  }
];

export const mockServices = [
  { id: '1', name: 'Haircut', duration: '30 min', price: 'P250' },
  { id: '2', name: 'Beard Trim', duration: '15 min', price: 'P100' },
  { id: '3', name: 'Haircut & Beard', duration: '45 min', price: 'P450' },
  { id: '4', name: 'Hot Towel Shave', duration: '30 min', price: 'P350' },
  { id: '5', name: 'Kid\'s Cut', duration: '25 min', price: 'P100' },
  { id: '6', name: 'Design/Fade', duration: '45 min', price: 'P500' }
];

export const mockTimeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];