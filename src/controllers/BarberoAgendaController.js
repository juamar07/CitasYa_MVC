import { CitaModel } from '../models/CitaModel.js';
import { EstadoCitaModel } from '../models/EstadoCitaModel.js';
import { supabase } from '../config/supabaseClient.js';
import { getUsuarioId } from '../store/auth.js';

export const BarberoAgendaController = {
  async miAgenda(personalId = null) {
    const usuarioId = getUsuarioId();
    const cancelNames = ['cancelada', 'cancelado', 'cancelar', 'anulada', 'anulado'];

    const { data: cancelStates } = await EstadoCitaModel.byNames(cancelNames);
    const excludeEstadoIds = (cancelStates || []).map(r => Number(r.id)).filter(Boolean);

    // Si llega un personal_id específico, usarlo directamente
    if (personalId) {
      return (await CitaModel.byStaff(Number(personalId), { excludeEstadoIds })).data || [];
    }

    // Buscar todos los registros de personal asociados al usuario barbero
    const { data: personalRows, error } = await supabase
      .from('personal')
      .select('id')
      .eq('usuario_id', usuarioId)
      .order('id', { ascending: false });

    if (error || !Array.isArray(personalRows) || !personalRows.length) return [];

    const personalIds = personalRows.map((p) => Number(p.id)).filter(Boolean);
    if (!personalIds.length) return [];

    return (await CitaModel.byStaff(personalIds, { excludeEstadoIds })).data || [];
  }
};