import { supabase } from '../config/supabaseClient.js';

export const EstadisticaModel = {
  resumenNegocio(negocioId){
    return supabase
      .from('estadisticas')
      .select('*')
      .eq('negocio_id', negocioId)
      .single();
  },

  resumenGlobal(){
    // Resumen global: tomamos el registro más reciente
    return supabase
      .from('estadisticas')
      .select('*')
      .order('creado_en', { ascending: false })
      .limit(1)
      .maybeSingle();
  }
};