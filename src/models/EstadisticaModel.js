import { supabase } from '../config/supabaseClient.js';

export const EstadisticaModel = {
  resumenNegocio(negocioId){
    return supabase.from('estadisticas_negocio').select('*').eq('negocio_id', negocioId).single();
  },
  resumenGlobal(){
    return supabase.from('estadisticas_globales').select('*');
  }
};
