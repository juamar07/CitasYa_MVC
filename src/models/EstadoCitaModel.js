import { supabase } from '../config/supabaseClient.js';

export const EstadoCitaModel = {
  list(){
    return supabase.from('estado_cita').select('*').order('nombre');
  },
  byName(nombre){
    return supabase.from('estado_cita').select('id').eq('nombre', nombre).single();

    },
  byNames(nombres = []){
    const clean = [...new Set((nombres || []).map(v => String(v || '').trim()).filter(Boolean))];
    if (!clean.length) return Promise.resolve({ data: [], error: null });
    return supabase.from('estado_cita').select('id,nombre').in('nombre', clean);
  }
};
