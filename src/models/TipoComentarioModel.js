import { supabase } from '../config/supabaseClient.js';

export const TipoComentarioModel = {
  list(){
    return supabase.from('tipo_comentario').select('*').order('nombre');
  }
};
