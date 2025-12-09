// utils/userDebug.js
import { supabase } from '../services/supabase';

export const debugUserInfo = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('❌ No user logged in');
      return null;
    }
    
    console.log('👤 === USER DEBUG INFO ===');
    console.log('User ID:', user.id);
    console.log('Email:', user.email);
    console.log('Auth Metadata:', JSON.stringify(user.user_metadata, null, 2));
    
    // Get profile from database
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', user.id)
      .single();
    
    if (error) {
      console.log('❌ Profile error:', error.message);
    } else {
      console.log('📋 Database Profile:', profile);
    }
    
    return { user, profile };
  } catch (error) {
    console.error('Debug error:', error);
    return null;
  }
};