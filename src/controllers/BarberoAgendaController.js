import { CitaModel } from '../models/CitaModel.js';
import { supabase } from '../config/supabaseClient.js';
import { getUsuarioId } from '../store/auth.js';

export const BarberoAgendaController = {
  async miAgenda(){
    const usuarioId = getUsuarioId();

    // ✅ buscar personal del barbero por usuario_id (NO por personal.id)
    const { data: personal, error } = await supabase
      .from('personal')
      .select('id')
      .eq('usuario_id', usuarioId)
      .single();

    if (error || !personal?.id) return [];

    // citas por personal_id
    return (await CitaModel.byStaff(personal.id)).data || [];
  }
};
