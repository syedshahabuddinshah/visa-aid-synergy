import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage
  }
});

// Initialize session from URL if present
const initializeSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error.message);
    // Clear any potentially corrupted session data
    localStorage.removeItem('supabase.auth.token');
    await supabase.auth.signOut();
  }
  return session;
};

// Set up auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_OUT') {
    // Clear any stored session data
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('tempProfile');
    localStorage.removeItem('lastStep');
  } else if (event === 'SIGNED_IN' && session) {
    // Store the session
    localStorage.setItem('supabase.auth.token', session.refresh_token || '');
    await initializeSession();
  }
});

// Initialize session when the client is created
initializeSession().catch(console.error);

export { initializeSession };