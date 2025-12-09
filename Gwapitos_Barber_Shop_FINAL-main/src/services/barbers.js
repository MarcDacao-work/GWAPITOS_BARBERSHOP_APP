import { supabase } from './supabase';

export const getRealBarbers = async () => {
  try {
    const { data: barbers, error } = await supabase
      .from('profiles')
      .select('full_name, role, specialization, id')
      .eq('role', 'barber')
      .eq('status', 'active'); // You might want to add a status field
    
    if (error) throw error;
    
    // Transform to match your mock data format
    const transformedBarbers = barbers.map((barber, index) => ({
      id: barber.id || `barber-${index}`,
      name: barber.full_name || 'Barber',
      title: 'Professional Barber',
      specialty: barber.specialization || 'Haircut',
      rating: 4.5 + (Math.random() * 0.5), // Default rating
      experience: '3+ years',
      bio: `Professional barber specializing in ${barber.specialization || 'haircuts'}`,
      services: ['Haircut', 'Beard Trim', 'Styling'],
      imageColor: ['#2196F3', '#FF4081', '#4CAF50', '#FF9800'][index % 4]
    }));
    
    return transformedBarbers;
  } catch (error) {
    console.error('Error fetching barbers:', error);
    // Return mock data as fallback
    return require('../utils/mockData').mockBarbers;
  }
};