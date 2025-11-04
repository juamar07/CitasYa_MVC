import { supabase } from '../config/supabaseClient.js';

export const ConjuntoHorarioModel = {
  listByPersonal(personalId){
    return supabase.from('conjunto_horario').select('*').eq('personal_id', personalId);
  },
  create(payload){
    return supabase.from('conjunto_horario').insert(payload).select().single();
  }
};
