import { supabase } from '../config/supabaseClient.js';

export const EstadoPagoModel = {
  list(){
    return supabase.from('estado_pago').select('*').order('nombre');
  }
};
