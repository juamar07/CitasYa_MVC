import { supabase } from '../config/supabaseClient.js';
import { SolicitudAprobacionModel } from '../models/SolicitudAprobacionModel.js';

async function currentUsuarioId(){
  const { data, error } = await supabase.rpc('current_usuario_id');
  if (error) throw error;
  return data; // bigint
}

export const AdminService = {
  // Solicitudes de negocio (pendientes)
async pendingBusinesses(){
  const { data, error } = await SolicitudAprobacionModel.listPending('negocio');
  if (error) throw error;

  const rows = data || [];
  const negocioIds = [...new Set(rows.map(r => r.negocio_id).filter(Boolean))];

  let negocioMap = new Map();
  if (negocioIds.length){
    const { data: negocios, error: nErr } = await supabase
      .from('negocios')
      .select('id, nombre, direccion, activo, creado_en')
      .in('id', negocioIds);

    if (nErr) throw nErr;
    negocioMap = new Map((negocios || []).map(n => [n.id, n]));
  }

  return rows.map(r => ({
    ...r,
    negocio: r.negocio_id ? (negocioMap.get(r.negocio_id) || null) : null
  }));
},

  // Solicitudes de barbero (pendientes)
    async pendingBarbers(){
      const { data, error } = await SolicitudAprobacionModel.listPending('barbero');
      if (error) throw error;

      const rows = data || [];
      const usuarioIds = [...new Set(rows.map(r => r.usuario_solicitante_id).filter(Boolean))];

      let usuarioMap = new Map();
      if (usuarioIds.length){
        const { data: usuarios, error: uErr } = await supabase
          .from('usuarios')
          .select('id, nombre_completo, correo, rol_id')
          .in('id', usuarioIds);

        if (uErr) throw uErr;
        usuarioMap = new Map((usuarios || []).map(u => [u.id, u]));
      }

      return rows.map(r => ({
        ...r,
        usuario: r.usuario_solicitante_id ? (usuarioMap.get(r.usuario_solicitante_id) || null) : null
      }));
    },

  async approveBusiness(solicitudId, notaAdmin = null){
    const adminId = await currentUsuarioId();

    // Traer solicitud con negocio
    const { data: sRow, error: sErr } = await supabase
      .from('solicitudes_aprobacion')
      .select('id, negocio_id')
      .eq('id', solicitudId)
      .single();

    if (sErr) throw sErr;
    if (!sRow?.negocio_id) throw new Error('Solicitud sin negocio_id.');

    // 1) Activar negocio
    const { error: nErr } = await supabase
      .from('negocios')
      .update({ activo: true })
      .eq('id', sRow.negocio_id);

    if (nErr) throw nErr;

    // 2) Activar personal del negocio
    const { error: pErr } = await supabase
      .from('personal')
      .update({ activo: true })
      .eq('negocio_id', sRow.negocio_id);

    if (pErr) throw pErr;

    // 3) Resolver solicitud
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

  async approveBarber(solicitudId, notaAdmin = null){
    const adminId = await currentUsuarioId();

    // Traer solicitud con usuario
    const { data: sRow, error: sErr } = await supabase
      .from('solicitudes_aprobacion')
      .select('id, usuario_solicitante_id')
      .eq('id', solicitudId)
      .single();

    if (sErr) throw sErr;

    // 1) Cambiar rol a barbero (id=2)
    const { error: uErr } = await supabase
      .from('usuarios')
      .update({ rol_id: 2 })
      .eq('id', sRow.usuario_solicitante_id);

    if (uErr) throw uErr;

    // 2) Resolver solicitud
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
