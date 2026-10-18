import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ncvzbrobotjckqpcekla.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jdnpicm9ib3RqY2txcGNla2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMDQ2NzYsImV4cCI6MjEwNzg4MDY3Nn0.AaSk1SuGD17DouibOOQEL3F8BeRJCPxEenyUQsy8ao0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
