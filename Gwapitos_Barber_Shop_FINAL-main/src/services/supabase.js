import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nwmhtpucswjevrjnnusy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53bWh0cHVjc3dqZXZyam5udXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwODUzODUsImV4cCI6MjA4MDY2MTM4NX0.scmQ7rC4Vn-iQnRR829DWNDwJ9Vwg3otE4hvsAbKIfs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
