import { supabase } from '../config/supabaseClient.js';

export const CancelacionModel = {
  create(payload){
    return supabase.from('cancelaciones').insert(payload).select().single();
  },
  byCita(citaId){
    return supabase.from('cancelaciones').select('*').eq('cita_id', citaId).maybeSingle();
  }
};
