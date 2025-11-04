import { supabase } from '../config/supabaseClient.js';

export const MetodoPagoModel = {
  list(){
    return supabase.from('metodo_pago').select('*').order('nombre');
  }
};
