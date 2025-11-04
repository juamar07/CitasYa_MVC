import { supabase } from '../config/supabaseClient.js';

export const EstadoCitaModel = {
  list(){
    return supabase.from('estado_cita').select('*').order('nombre');
  },
  byName(nombre){
    return supabase.from('estado_cita').select('id').eq('nombre', nombre).single();
  }
};
