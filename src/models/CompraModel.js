import { supabase } from '../config/supabaseClient.js';

export const CompraModel = {
  listByNegocio(negocioId){
    return supabase
      .from('compras')
      .select('*')
      .eq('negocio_id', negocioId)
      .order('creado_en', { ascending: false });
  },

  create(payload){
    // payload esperado: { negocio_id, metodo_id, estado_id, tokens, monto_cop, ref_externa }
    return supabase
      .from('compras')
      .insert(payload)
      .select()
      .single();
  }
};
