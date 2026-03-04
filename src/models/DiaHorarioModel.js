import { supabase } from '../config/supabaseClient.js';

export const DiaHorarioModel = {
  listByConjunto(conjuntoId){
    return supabase
      .from('dia_horario')
      .select('*')
      .eq('conjunto_horario_id', conjuntoId)
      .order('dia_id');
  },
  listDiasSemana(){
    return supabase.from('dias_semana').select('id,nombre').order('id');
  },
  upsert(payload){
    return supabase
      .from('dia_horario')
      .upsert(payload, { onConflict: 'conjunto_horario_id,dia_id' })
      .select();
  }
};