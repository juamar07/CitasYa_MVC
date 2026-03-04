import { supabase } from '../config/supabaseClient.js';

const SECRET_FIELD_CANDIDATES = [
  'clave_negocio',
  'clave',
  'contrasena',
  'password',
  'pass',
  'pin',
  'hash_contrasena'
];

let cachedSecretField = null;

async function detectSecretField() {
  if (cachedSecretField !== null) return cachedSecretField;

  for (const field of SECRET_FIELD_CANDIDATES) {
    const { error } = await supabase
      .from('negocios')
      .select(`id,${field}`)
      .limit(1);

    if (!error) {
      cachedSecretField = field;
      return cachedSecretField;
    }

    const msg = String(error?.message || '').toLowerCase();
    if (!msg.includes('column') || !msg.includes('does not exist')) {
      console.error('Error detectando campo de clave de negocio:', error);
      cachedSecretField = null;
      return cachedSecretField;
    }
  }

  cachedSecretField = null;
  return cachedSecretField;
}

export const NegocioModel = {
  publicList(){ return supabase.rpc('get_public_negocios'); },
  mine(){ return supabase.from('negocios').select('*').order('actualizado_en', { ascending:false }); },
  async upsert(payload){
    const data = { ...(payload || {}) };
    if (data.tokens == null) data.tokens = 0;

    if (data.__businessKey !== undefined) {
      const field = await detectSecretField();
      if (field) data[field] = data.__businessKey;
      delete data.__businessKey;
    }

    return supabase.from('negocios').upsert(data).select().single();
  },
  byId(id){ return supabase.from('negocios').select('*').eq('id', id).single(); },
  async getSecretFieldName(){
    return detectSecretField();
  },
  async readSecretByBusinessId(id){
    const field = await detectSecretField();
    if (!field) return { data: null, error: null, field: null };

    const { data, error } = await supabase
      .from('negocios')
      .select(`id,${field}`)
      .eq('id', id)
      .single();

    return {
      data: data ? { id: data.id, secret: data[field] ?? null } : null,
      error,
      field
    };
  }
};