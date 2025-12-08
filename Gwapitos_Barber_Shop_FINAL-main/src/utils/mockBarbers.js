export const mockBarbers = [
  {
    id: '1',
    name: 'Tony Styles',
    title: 'Senior Barber',
    specialty: 'Fades & Modern Styles',
    rating: 4.8,
    reviews: 142,
    experience: '5 years',
    bio: 'Specializes in modern fades and beard grooming. Known for precision cuts.',
    services: ['Haircut', 'Beard Trim', 'Design', 'Line Up'],
    priceRange: '$20-$35',
    available: true,
    todaySlots: 3,
    nextAvailable: 'Today, 2:00 PM'
  },
  {
    id: '2',
    name: 'Maria Razor',
    title: 'Master Barber',
    specialty: 'Classic & Precision Cuts',
    rating: 4.9,
    reviews: 89,
    experience: '7 years',
    bio: 'Expert in classic styles with attention to detail. Trained in London.',
    services: ['Haircut', 'Coloring', 'Styling', 'Consultation'],
    priceRange: '$25-$40',
    available: true,
    todaySlots: 2,
    nextAvailable: 'Today, 4:30 PM'
  },
  {
    id: '3',
    name: 'Alex Clipper',
    title: 'Style Specialist',
    specialty: 'Youth & Trendy Styles',
    rating: 4.7,
    reviews: 56,
    experience: '3 years',
    bio: 'Young talent with fresh approach to contemporary hairstyles.',
    services: ['Fade', 'Design', 'Color Highlights', 'Buzz Cut'],
    priceRange: '$15-$30',
    available: true,
    todaySlots: 4,
    nextAvailable: 'Today, 1:00 PM'
  },
  {
    id: '4',
    name: 'Carlos Traditional',
    title: 'Traditional Barber',
    specialty: 'Old School Grooming',
    rating: 4.9,
    reviews: 203,
    experience: '10 years',
    bio: 'Master of traditional barbering with hot towel shaves.',
    services: ['Straight Razor', 'Hot Towel', 'Mustache', 'Head Shave'],
    priceRange: '$30-$50',
    available: false,
    todaySlots: 0,
    nextAvailable: 'Tomorrow, 10:00 AM'
  }
];

export const getBarberById = (id) => {
  return mockBarbers.find(barber => barber.id === id);
};