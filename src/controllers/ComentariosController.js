// src/controllers/ComentariosController.js
import { ComentarioModel } from '../models/ComentarioModel.js';
import { TipoComentarioModel } from '../models/TipoComentarioModel.js';
import { getUsuarioId } from '../store/auth.js';

function toInt(v){
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

function toBool(v){
  // HTML forms: "on" cuando checked, undefined cuando no
  if (v === true) return true;
  if (v === false) return false;
  if (v === 'on') return true;
  if (v === 'true') return true;
  return false;
}

function sentimientoFromCalificacion(cal){
  if (cal == null) return null;
  if (cal >= 4) return 'positivo';
  if (cal === 3) return 'neutro';
  return 'negativo';
}

export const ComentariosController = {
  async list(negocioId){
    return (await ComentarioModel.listByNegocio(negocioId)).data || [];
  },

  async listMine(){
    const usuarioId = getUsuarioId();
    if (!usuarioId) return [];
    return (await ComentarioModel.listByUsuario(usuarioId)).data || [];
  },

  async tipos(){
    return (await TipoComentarioModel.list()).data || [];
  },

  async crear(payload){
    const usuarioId = getUsuarioId();
    if (!usuarioId) throw new Error('Sesión inválida: no hay usuario.');

    // Normaliza claves del form (compatibilidad con tu vista actual y la nueva)
    const tipo = payload.tipo_comentario_id ?? payload.tipo_id ?? null;
    const texto = payload.texto ?? payload.comentario ?? '';

    const calificacion = toInt(payload.calificacion);
    const recomienda = toBool(payload.recomienda);

    const insertPayload = {
      negocio_id: toInt(payload.negocio_id),
      tipo_comentario_id: toInt(tipo),
      usuario_autor_id: usuarioId,
      nombre_autor: (payload.nombre_autor || '').trim() || null,
      texto: (texto || '').trim(),
      calificacion: calificacion ?? 0,
      recomienda,
      sentimiento: sentimientoFromCalificacion(calificacion),
      visible: true
    };

    const { data, error } = await ComentarioModel.create(insertPayload);
    if (error) throw error;
    return data;
  },

  async eliminar(id){
    const usuarioId = getUsuarioId();
    if (!usuarioId) throw new Error('Sesión inválida: no hay usuario.');

    const { data, error } = await ComentarioModel.removeByIdAndUsuario(id, usuarioId);
    if (error) throw error;
    return data;
  }
};
