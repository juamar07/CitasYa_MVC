import { supabase } from '../config/supabaseClient.js';

export const ConjuntoHorarioModel = {
  listByPersonal(personalId){
    return supabase
      .from('conjunto_horario')
      .select('*')
      .eq('personal_id', personalId)
      .order('id', { ascending: false });
  },

  listByPersonalIds(personalIds){
    return supabase
      .from('conjunto_horario')
      .select('*')
      .in('personal_id', personalIds)
      .order('id', { ascending: false });
  },

  latestByBusinessAndPersonal(negocioId, personalId){
    return supabase
      .from('conjunto_horario')
      .select('*')
      .eq('negocio_id', negocioId)
      .eq('personal_id', personalId)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();
  },

  create(payload){
    return supabase
      .from('conjunto_horario')
      .insert(payload)
      .select()
      .single();
  }
};