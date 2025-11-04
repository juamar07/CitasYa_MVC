import { supabase } from '../config/supabaseClient.js';

export const DiaHorarioModel = {
  listByConjunto(conjuntoId){
    return supabase.from('dia_horario').select('*').eq('conjunto_horario_id', conjuntoId).order('dia_semana');
  },
  upsert(payload){
    return supabase.from('dia_horario').upsert(payload).select();
  }
};
