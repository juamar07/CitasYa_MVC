import { supabase } from '../config/supabaseClient.js';

export const PromocionModel = {
  listActivas(){
    return supabase.from('promociones').select('*').eq('activa', true);
  },
  upsert(payload){
    return supabase.from('promociones').upsert(payload).select().single();
  }
};
