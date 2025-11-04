import { CitaModel } from '../models/CitaModel.js';
import { supabase } from '../config/supabaseClient.js';

export const AppointmentService = {
  async schedule({ usuario_cliente_id, negocio_id, personal_id, servicio_id, inicia_en }){
    const { data: svc } = await supabase.from('servicios').select('duracion_min').eq('id', servicio_id).single();
    const termina_en = new Date(new Date(inicia_en).getTime() + svc.duracion_min*60000).toISOString();
    const payload = { usuario_cliente_id, negocio_id, personal_id, servicio_id, inicia_en, termina_en,
                      fecha: inicia_en.substring(0,10),
                      estado_id: (await this._estadoId('pendiente')) };
    return CitaModel.create(payload);
  },
  async _estadoId(nombre){
    const { data } = await supabase.from('estado_cita').select('id').eq('nombre', nombre).single();
    return data.id;
  }
};
