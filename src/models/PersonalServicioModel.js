import { supabase } from '../config/supabaseClient.js';

export const PersonalServicioModel = {
  listByPersonal(personalId){
    return supabase.from('personal_servicio').select('*').eq('personal_id', personalId);
  },
  assign(payload){
    return supabase.from('personal_servicio').upsert(payload).select();
  },
  remove(personalId, servicioId){
    return supabase.from('personal_servicio').delete().eq('personal_id', personalId).eq('servicio_id', servicioId);
  }
};
