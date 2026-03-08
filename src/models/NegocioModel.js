import { supabase } from '../config/supabaseClient.js';

const NEGOCIOS_COLUMNS = [
  'id',
  'nombre',
  'tokens',
  'direccion',
  'latitud',
  'longitud',
  'activo',
  'creado_en',
  'actualizado_en',
  'owner_auth_user_id'
].join(',');

export const NegocioModel = {
  publicList(){
    return supabase.rpc('get_public_negocios');
  },

  mine(){
    return supabase
      .from('negocios')
      .select(NEGOCIOS_COLUMNS)
      .order('actualizado_en', { ascending: false });
  },

  async upsert(payload){
    const data = { ...(payload || {}) };

    if (data.tokens == null) data.tokens = 0;

    // La clave del negocio se guarda vía Edge Function, no directo en la tabla desde el frontend
    if (data.__businessKey !== undefined) delete data.__businessKey;

    return supabase
      .from('negocios')
      .upsert(data)
      .select(NEGOCIOS_COLUMNS)
      .single();
  },

  byId(id){
    return supabase
      .from('negocios')
      .select(NEGOCIOS_COLUMNS)
      .eq('id', id)
      .single();
  }
};