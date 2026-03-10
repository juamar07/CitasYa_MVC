import { supabase } from '../config/supabaseClient.js';
import { SolicitudAprobacionModel } from '../models/SolicitudAprobacionModel.js';
import { EstadisticaModel } from '../models/EstadisticaModel.js';
import { ComentarioModel } from '../models/ComentarioModel.js';

async function currentUsuarioId() {
  const { data, error } = await supabase.rpc('current_usuario_id');
  if (error) throw error;
  return data;
}

function pick(row, keys, fallback = 0) {
  for (const k of keys) {
    if (row && row[k] !== undefined && row[k] !== null) return row[k];
  }
  return fallback;
}

function sentimentKey(raw) {
  if (raw === null || raw === undefined || raw === '') return 'malo';

  const asNumber = Number(raw);
  if (Number.isFinite(asNumber) && asNumber > 0) {
    if (asNumber >= 4) return 'muy bueno';
    if (asNumber === 3) return 'neutro';
    return 'malo';
  }

  const value = String(raw || '').trim().toLowerCase().replaceAll('_', ' ');
  if (value === 'positivo') return 'muy bueno';
  if (value === 'neutro') return 'neutro';
  if (value === 'negativo') return 'malo';

  if (value.includes('muy')) return 'muy bueno';
  if (value.includes('neut')) return 'neutro';
  return 'malo';
}

async function buildComentariosDashboard() {
  const [
    { data: allComments, error: commentsErr },
    { data: recentRows, error: recentErr }
  ] = await Promise.all([
    ComentarioModel.listAllForAdmin(),
    ComentarioModel.listRecentDetailed(8)
  ]);

  if (commentsErr) throw commentsErr;
  if (recentErr) throw recentErr;

  const comments = Array.isArray(allComments) ? allComments : [];
  const total = comments.length;

  const calificaciones = comments
    .map((c) => Number(c.calificacion))
    .filter((n) => Number.isFinite(n) && n > 0);

  const promedioCalificacion = calificaciones.length
    ? calificaciones.reduce((acc, n) => acc + n, 0) / calificaciones.length
    : null;

  const recomendacionesSi = comments.filter((c) => c.recomienda === true).length;
  const recomendacionesNo = comments.filter((c) => c.recomienda !== true).length;

  const sentimientos = comments.reduce((acc, c) => {
    const key = sentimentKey(c.sentimiento ?? c.calificacion);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, { malo: 0, neutro: 0, 'muy bueno': 0 });

  const recientes = (recentRows || []).map((c) => ({
    ...c,
    destino: c.negocio_id ? 'barbería' : 'página',
    nombre_autor: c.nombre_autor || 'Anónimo',
    negocio_nombre: c.negocio_id ? (c.negocio_nombre || 'Barbería') : null
  }));

  return {
    total,
    promedioCalificacion,
    recomendacionesSi,
    recomendacionesNo,
    sentimientos,
    recientes
  };
}

export const AdminService = {
  async pendingBusinesses() {
    const { data, error } = await SolicitudAprobacionModel.listPending('negocio');
    if (error) throw error;

    const rows = data || [];
    const negocioIds = [...new Set(rows.map((r) => r.negocio_id).filter(Boolean))];

    let negocioMap = new Map();
    if (negocioIds.length) {
      const { data: negocios, error: nErr } = await supabase
        .from('negocios')
        .select('id, nombre, direccion, activo, creado_en')
        .in('id', negocioIds);

      if (nErr) throw nErr;
      negocioMap = new Map((negocios || []).map((n) => [n.id, n]));
    }

    return rows.map((r) => ({
      ...r,
      negocio: r.negocio_id ? (negocioMap.get(r.negocio_id) || null) : null
    }));
  },

  async pendingBarbers() {
    const { data, error } = await SolicitudAprobacionModel.listPending('barbero');
    if (error) throw error;

    const rows = data || [];
    const usuarioIds = [...new Set(rows.map((r) => r.usuario_solicitante_id).filter(Boolean))];

    let usuarioMap = new Map();
    if (usuarioIds.length) {
      const { data: usuarios, error: uErr } = await supabase
        .from('usuarios')
        .select('id, nombre_completo, correo, rol_id')
        .in('id', usuarioIds);

      if (uErr) throw uErr;
      usuarioMap = new Map((usuarios || []).map((u) => [u.id, u]));
    }

    return rows.map((r) => ({
      ...r,
      usuario: r.usuario_solicitante_id ? (usuarioMap.get(r.usuario_solicitante_id) || null) : null
    }));
  },

  async dashboardData() {
    const [statsRows, comentarios] = await Promise.all([
      EstadisticaModel.resumenGlobal(),
      buildComentariosDashboard()
    ]);

    const stats = Array.isArray(statsRows?.data)
      ? (statsRows.data[0] || {})
      : (statsRows?.data || {});

    return {
      stats: {
        negociosActivos: pick(stats, ['barberias_activas', 'negocios_activos', 'negocios_activos_count', 'barberias_activas_count'], 0),
        barberosActivos: pick(stats, ['barberos_activos', 'personal_activo', 'barberos_activos_count', 'personal_activo_count'], 0),
        citasDia: pick(stats, ['citas_por_dia_7d', 'citas_dia_prom_7d', 'citas_dia', 'citas_dia_promedio'], 0),
        tasaCancel: pick(stats, ['tasa_cancelacion', 'cancelacion_pct', 'tasa_cancelacion_pct'], 0)
      },
      comentarios
    };
  },

  async approveBusiness(solicitudId, notaAdmin = null) {
    const adminId = await currentUsuarioId();

    const { data: sRow, error: sErr } = await supabase
      .from('solicitudes_aprobacion')
      .select('id, negocio_id')
      .eq('id', solicitudId)
      .single();

    if (sErr) throw sErr;
    if (!sRow?.negocio_id) throw new Error('Solicitud sin negocio_id.');

    const { error: nErr } = await supabase
      .from('negocios')
      .update({ activo: true })
      .eq('id', sRow.negocio_id);

    if (nErr) throw nErr;

    const { error: pErr } = await supabase
      .from('personal')
      .update({ activo: true })
      .eq('negocio_id', sRow.negocio_id);

    if (pErr) throw pErr;

    const { error: upErr } = await SolicitudAprobacionModel.resolve(solicitudId, {
      estado: 'aprobada',
      admin_usuario_id: adminId,
      nota_admin: notaAdmin,
      resuelto_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString()
    });

    if (upErr) throw upErr;
    return true;
  },

  async approveBarber(solicitudId, notaAdmin = null) {
    const adminId = await currentUsuarioId();

    const { data: sRow, error: sErr } = await supabase
      .from('solicitudes_aprobacion')
      .select('id, usuario_solicitante_id')
      .eq('id', solicitudId)
      .single();

    if (sErr) throw sErr;

    const { error: uErr } = await supabase
      .from('usuarios')
      .update({ rol_id: 2 })
      .eq('id', sRow.usuario_solicitante_id);

    if (uErr) throw uErr;

    const { error: upErr } = await SolicitudAprobacionModel.resolve(solicitudId, {
      estado: 'aprobada',
      admin_usuario_id: adminId,
      nota_admin: notaAdmin,
      resuelto_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString()
    });

    if (upErr) throw upErr;
    return true;
  }
};