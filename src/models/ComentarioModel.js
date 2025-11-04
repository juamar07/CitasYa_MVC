import { supabase } from '../config/supabaseClient.js';

export const ComentarioModel = {
  listByNegocio(negocioId){
    return supabase.from('comentarios').select('*').eq('negocio_id', negocioId).order('creado_en', { ascending:false });
  },
  create(payload){
    return supabase.from('comentarios').insert(payload).select().single();
  }
};
