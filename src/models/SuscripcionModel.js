import { supabase } from '../config/supabaseClient.js';

export const SuscripcionModel = {
  listByUsuario(usuarioId){
    return supabase.from('suscripciones').select('*').eq('usuario_id', usuarioId);
  },
  upsert(payload){
    return supabase.from('suscripciones').upsert(payload).select().single();
  }
};
