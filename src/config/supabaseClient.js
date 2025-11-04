import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const supabase = createClient(
  'https://gqygombswggoaikonrpa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxeWdvbWJzd2dnb2Fpa29ucnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMTI5NTUsImV4cCI6MjA3Nzc4ODk1NX0.6BGdjEwjSCvRTrbHxDJZ6TH9yughdOaRNX5qwRDgLS4',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);
