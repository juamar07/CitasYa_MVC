import { supabase } from '../config/supabaseClient.js';

export const SolicitudAprobacionModel = {
  listPending(tipo){
    return supabase
      .from('solicitudes_aprobacion')
      .select('id, tipo, estado, creado_en, usuario_solicitante_id, negocio_id')
      .eq('estado', 'pendiente')
      .eq('tipo', tipo)
      .order('creado_en', { ascending: true });
  },

  findPendingBarberoByUsuario(usuarioId){
    return supabase
      .from('solicitudes_aprobacion')
      .select('id, estado')
      .eq('tipo', 'barbero')
      .eq('estado', 'pendiente')
      .eq('usuario_solicitante_id', usuarioId)
      .maybeSingle();
  },

  createBarbero(usuarioId){
    return supabase
      .from('solicitudes_aprobacion')
      .insert({ tipo:'barbero', usuario_solicitante_id: usuarioId })
      .select()
      .single();
  },

  createNegocio(usuarioId, negocioId){
    return supabase
      .from('solicitudes_aprobacion')
      .insert({ tipo:'negocio', usuario_solicitante_id: usuarioId, negocio_id: negocioId })
      .select()
      .single();
  },

  resolve(id, patch){
    return supabase
      .from('solicitudes_aprobacion')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
  }
};