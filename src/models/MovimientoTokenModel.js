import { supabase } from '../config/supabaseClient.js';

export const MovimientoTokenModel = {
  listByUsuario(usuarioId){
    return supabase.from('movimiento_token').select('*').eq('usuario_id', usuarioId).order('creado_en', { ascending:false });
  },
  create(payload){
    return supabase.from('movimiento_token').insert(payload).select().single();
  }
};
