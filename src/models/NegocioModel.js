import { supabase } from '../config/supabaseClient.js';

export const NegocioModel = {
  publicList(){ return supabase.rpc('get_public_negocios'); },
  mine(){ return supabase.from('negocios').select('*').order('actualizado_en', { ascending:false }); },
  upsert(payload){ return supabase.from('negocios').upsert(payload).select().single(); },
  byId(id){ return supabase.from('negocios').select('*').eq('id', id).single(); }
};
