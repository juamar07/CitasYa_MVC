// src/models/CancelacionCitaModel.js
import { supabase } from '../config/supabaseClient.js';

export const CancelacionCitaModel = {
  create(payload){
    // payload: { cita_id, usuario_id_cancelo, motivo, cancelado_en }
    return supabase
      .from('cancelaciones_cita')
      .insert(payload)
      .select()
      .single();
  }
};
