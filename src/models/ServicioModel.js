import { supabase } from '../config/supabaseClient.js';

export const ServicioModel = {
  listByNegocio(negocioId){
    return supabase.from('servicios').select('*').eq('negocio_id', negocioId);
  },
  byId(id){
    return supabase.from('servicios').select('*').eq('id', id).single();
  }
};
