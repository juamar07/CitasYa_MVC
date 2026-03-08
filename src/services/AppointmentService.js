import { CitaModel } from '../models/CitaModel.js';
import { supabase } from '../config/supabaseClient.js';
import { CancelacionCitaModel } from '../models/CancelacionCitaModel.js';
import { EstadoCitaModel } from '../models/EstadoCitaModel.js';

export const AppointmentService = {
 async schedule({ usuario_cliente_id, negocio_id, personal_id, servicio_id, inicia_en, nombre_invitado = null }){
  const { data: svc } = await supabase.from('servicios').select('duracion_min').eq('id', servicio_id).single();
    const termina_en = new Date(new Date(inicia_en).getTime() + svc.duracion_min*60000).toISOString();
    const payload = { usuario_cliente_id, negocio_id, personal_id, servicio_id, inicia_en, termina_en,
                       fecha: inicia_en.substring(0,10),
                       estado_id: (await this._estadoId('pendiente')) };

    if (nombre_invitado && String(nombre_invitado).trim()) {
      payload.nombre_invitado = String(nombre_invitado).trim();
    }

    return CitaModel.create(payload);
  },
  async _estadoId(nombre){
    const { data } = await supabase.from('estado_cita').select('id').eq('nombre', nombre).single();
    return data.id;
    },

  async _estadoIds(nombres = []){
    const { data, error } = await EstadoCitaModel.byNames(nombres);
    if (error) throw error;
    return (data || []).map(r => Number(r.id)).filter(Boolean);
  },

  async _cancelStateId(){
    const candidates = ['cancelada', 'cancelado', 'cancelar', 'anulada', 'anulado'];
    const ids = await this._estadoIds(candidates);
    if (!ids.length) {
      throw new Error('No se pudo resolver estado_id de cancelación en estado_cita.');
    }
    return ids[0];
  },

  async cancel({ cita_id, usuario_id_cancelo, motivo }){
    const cancelStateId = await this._cancelStateId();

    // 1) primero actualizar la cita
    const { data: updated, error: updateError } = await CitaModel.update(Number(cita_id), {
      estado_id: cancelStateId
    });
    if (updateError) throw updateError;
    if (!updated?.id) {
      throw new Error('No se pudo actualizar la cita al estado cancelado.');
    }

    // 2) luego registrar el historial de cancelación
    const payload = {
      cita_id: Number(cita_id),
      usuario_id_cancelo: Number(usuario_id_cancelo),
      motivo: String(motivo || '').trim(),
      cancelado_en: new Date().toISOString()
    };

    const { data: cancelacion, error: cancelError } = await CancelacionCitaModel.create(payload);
    if (cancelError) throw cancelError;

    return { data: { cita: updated, cancelacion }, error: null };
  }
};
