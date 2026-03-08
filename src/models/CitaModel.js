// src/models/CitaModel.js
import { supabase } from '../config/supabaseClient.js';

function applyExcludedStates(query, excludeEstadoIds = []) {
  const ids = (excludeEstadoIds || []).map(Number).filter(Boolean);
  if (!ids.length) return query;
  return query.not('estado_id', 'in', `(${ids.join(',')})`);
}

export const CitaModel = {
  byCliente(usuarioId, { excludeEstadoIds = [] } = {}) {
    let query = supabase
      .from('citas')
      .select('id, negocio_id, personal_id, servicio_id, fecha, inicia_en, termina_en, estado_id')
      .eq('usuario_cliente_id', usuarioId);

    query = applyExcludedStates(query, excludeEstadoIds);
    return query.order('inicia_en', { ascending: false });
  },

  byClienteDetailed(usuarioId, { excludeEstadoIds = [] } = {}) {
    let query = supabase
      .from('citas')
      .select(`
        id,
        negocio_id,
        personal_id,
        servicio_id,
        fecha,
        inicia_en,
        termina_en,
        estado_id,
        negocios:negocio_id ( id, nombre ),
        servicios:servicio_id ( id, nombre, duracion_min ),
        personal:personal_id ( id, nombre_publico )
      `)
      .eq('usuario_cliente_id', usuarioId);

    query = applyExcludedStates(query, excludeEstadoIds);
    return query.order('inicia_en', { ascending: false });
  },

  byStaff(personalIdOrIds, { excludeEstadoIds = [] } = {}) {
    let query = supabase
      .from('citas')
      .select(`
        id,
        usuario_cliente_id,
        personal_id,
        servicio_id,
        fecha,
        inicia_en,
        termina_en,
        estado_id,
        nombre_invitado,
        servicios:servicio_id ( id, nombre ),
        usuarios:usuario_cliente_id ( id, nombre_completo )
      `);

    if (Array.isArray(personalIdOrIds)) {
      const ids = personalIdOrIds.map(Number).filter(Boolean);
      if (!ids.length) {
        return Promise.resolve({ data: [], error: null });
      }
      query = query.in('personal_id', ids);
    } else {
      query = query.eq('personal_id', Number(personalIdOrIds));
    }

    query = applyExcludedStates(query, excludeEstadoIds);
    return query.order('inicia_en', { ascending: true });
  },

  create(payload) {
    return supabase.from('citas').insert(payload).select().single();
  },

  update(id, patch) {
    return supabase.from('citas').update(patch).eq('id', id).select().single();
  }
};