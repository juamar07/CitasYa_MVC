import { supabase } from '../config/supabaseClient.js';

export const CitaModel = {
  byCliente(usuarioId){
    return supabase.from('citas')
      .select('id, negocio_id, personal_id, servicio_id, fecha, inicia_en, termina_en, estado_id')
      .eq('usuario_cliente_id', usuarioId)
      .order('inicia_en', { ascending:false });
  },
  byStaff(personalId){
    return supabase.from('citas')
      .select('id, usuario_cliente_id, servicio_id, fecha, inicia_en, termina_en, estado_id')
      .eq('personal_id', personalId)
      .order('inicia_en', { ascending:true });
  },
  create(payload){ return supabase.from('citas').insert(payload).select().single(); },
  update(id, patch){ return supabase.from('citas').update(patch).eq('id', id).select().single(); }
};
