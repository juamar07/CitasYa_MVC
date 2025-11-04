import { supabase } from '../config/supabaseClient.js';

export const PersonalModel = {
  listByNegocio(negocioId){
    return supabase.from('personal').select('*').eq('negocio_id', negocioId);
  },
  byId(id){
    return supabase.from('personal').select('*').eq('id', id).single();
  },
  upsert(payload){
    return supabase.from('personal').upsert(payload).select().single();
  }
};
