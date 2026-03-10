import { ComentarioModel } from '../models/ComentarioModel.js';
import { TipoComentarioModel } from '../models/TipoComentarioModel.js';
import { NegocioModel } from '../models/NegocioModel.js';
import { getUsuarioId } from '../store/auth.js';

const DEFAULT_TIPO_NOMBRE = 'reseña';
const DEFAULT_TIPO_COMENTARIO_ID = 1;

function toInt(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

function toBool(v) {
  if (v === true || v === 'true' || v === 'on' || v === 1 || v === '1') return true;
  return false;
}

function sentimientoFromCalificacion(cal) {
  if (cal == null || !Number.isFinite(cal) || cal <= 0) return null;
  if (cal >= 4) return 'positivo';
  if (cal === 3) return 'neutro';
  return 'negativo';
}

async function resolveTipoComentarioId() {
  const { data, error } = await TipoComentarioModel.list();
  if (error) throw error;

  const rows = Array.isArray(data) ? data : [];
  const match = rows.find(
    (t) => String(t.nombre || '').trim().toLowerCase() === DEFAULT_TIPO_NOMBRE
  );

  if (match?.id) return Number(match.id);
  return DEFAULT_TIPO_COMENTARIO_ID;
}

export const ComentariosController = {
  async list(negocioId) {
    return (await ComentarioModel.listByNegocio(negocioId)).data || [];
  },

  async listMine() {
    const usuarioId = getUsuarioId();
    if (!usuarioId) return [];
    return (await ComentarioModel.listByUsuario(usuarioId)).data || [];
  },

  async negocios() {
    const { data, error } = await NegocioModel.publicList();
    if (error) throw error;

    return (Array.isArray(data) ? data : [])
      .map((n) => ({ id: Number(n.id), nombre: n.nombre }))
      .filter((n) => n.id && n.nombre);
  },

  async crear(payload) {
    const usuarioId = getUsuarioId();
    if (!usuarioId) {
      throw new Error('Debes iniciar sesión para enviar un comentario.');
    }

    const destino = payload.destino === 'barberia' ? 'barberia' : 'pagina';
    const texto = String(payload.texto ?? payload.comentario ?? '').trim();

    if (!texto) {
      throw new Error('El comentario no puede estar vacío.');
    }

    const negocioId = destino === 'barberia' ? toInt(payload.negocio_id) : null;
    if (destino === 'barberia' && !negocioId) {
      throw new Error('Debes seleccionar una barbería válida.');
    }

    const calificacion = toInt(payload.calificacion) ?? 0;
    const tipoComentarioId = await resolveTipoComentarioId();

    const insertPayload = {
      negocio_id: negocioId,
      tipo_comentario_id: tipoComentarioId,
      usuario_autor_id: Number(usuarioId),
      nombre_autor: String(payload.nombre_autor || '').trim() || null,
      texto,
      calificacion,
      recomienda: toBool(payload.recomienda),
      sentimiento: sentimientoFromCalificacion(calificacion),
      visible: true
    };

    const { data, error } = await ComentarioModel.create(insertPayload);
    if (error) throw error;
    return data;
  },

  async eliminar(id) {
    const usuarioId = getUsuarioId();
    if (!usuarioId) throw new Error('Sesión inválida: no hay usuario.');

    const { data, error } = await ComentarioModel.removeByIdAndUsuario(id, usuarioId);
    if (error) throw error;
    return data;
  }
};