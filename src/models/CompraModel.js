import { supabase } from '../config/supabaseClient.js';

export const CompraModel = {
  listByUsuario(usuarioId){
    return supabase.from('compras').select('*').eq('usuario_id', usuarioId).order('creado_en', { ascending:false });
  },
  create(payload){
    return supabase.from('compras').insert(payload).select().single();
  }
};
