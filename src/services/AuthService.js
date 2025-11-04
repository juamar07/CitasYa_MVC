import { supabase } from '../config/supabaseClient.js';

export const AuthService = {
  login(email, password){ return supabase.auth.signInWithPassword({ email, password }); },
  logout(){ return supabase.auth.signOut(); },
  registerCliente({ email, password, full_name }){
    return supabase.auth.signUp({ email, password, options:{ data:{ full_name } } });
  }
};
