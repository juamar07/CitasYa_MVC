import { supabase } from '../config/supabaseClient.js';
import { NegocioModel } from '../models/NegocioModel.js';
import { PersonalModel } from '../models/PersonalModel.js';
import { ServicioModel } from '../models/ServicioModel.js';

export const BusinessService = {
  listPublic(){
    return NegocioModel.publicList();
  },

  myBusinesses(){
    return NegocioModel.mine();
  },

  async detailWithResources(id){
    const [negocio, personal, servicios] = await Promise.all([
      NegocioModel.byId(id),
      PersonalModel.listByNegocio(id),
      ServicioModel.listByNegocio(id)
    ]);
    return { negocio: negocio.data, personal: personal.data, servicios: servicios.data };
  },

  /**
   * Registro completo (negocio + servicios + personal + relación personal_servicio)
   * payload: { negocio, responsable?, servicios, personal }
   * - negocio: { id?, nombre, direccion, activo? }
   * - servicios: [{ nombre, duracion_min, precio_cop, tokens }]
   * - personal:  [{ nombre_publico, servicios: [serviceIndex...] }]
   */
  async registerBusinessFlow(payload){
    const negocioPayload = payload?.negocio ?? {};
    const serviciosPayload = Array.isArray(payload?.servicios) ? payload.servicios : [];
    const personalPayload  = Array.isArray(payload?.personal) ? payload.personal : [];

    // 1) Upsert negocio
    const { data: negocioData, error: negocioErr } = await NegocioModel.upsert(negocioPayload);
    if (negocioErr) throw negocioErr;

    const negocioRow = Array.isArray(negocioData) ? negocioData[0] : negocioData;
    const negocioId = negocioRow?.id ?? negocioPayload?.id;
    if (!negocioId) throw new Error('No se pudo resolver negocio_id.');

    // 2) Limpiar recursos previos (si existen) para evitar duplicados al actualizar
    const { data: oldServicios } = await supabase
      .from('servicios')
      .select('id')
      .eq('negocio_id', negocioId);

    const { data: oldPersonal } = await supabase
      .from('personal')
      .select('id')
      .eq('negocio_id', negocioId);

    const oldPersonalIds = (oldPersonal || []).map(p => p.id).filter(Boolean);
    const oldServiciosIds = (oldServicios || []).map(s => s.id).filter(Boolean);

    if (oldPersonalIds.length){
      await supabase.from('personal_servicio').delete().in('personal_id', oldPersonalIds);
      await supabase.from('personal').delete().eq('negocio_id', negocioId);
    }
    if (oldServiciosIds.length){
      await supabase.from('servicios').delete().eq('negocio_id', negocioId);
    }

    // 3) Insertar servicios
    const serviciosInsert = serviciosPayload
      .filter(s => (s?.nombre ?? '').trim())
      .map(s => ({
        negocio_id: negocioId,
        nombre: (s.nombre ?? '').trim(),
        duracion_min: Number(s.duracion_min ?? 0),
        precio_cop: s.precio_cop === null || s.precio_cop === '' ? null : Number(s.precio_cop),
        tokens: Number(s.tokens ?? 1)
      }));

    const { data: serviciosRows, error: serviciosErr } = await supabase
      .from('servicios')
      .insert(serviciosInsert)
      .select();

    if (serviciosErr) throw serviciosErr;

    // 4) Insertar personal (incluye propietario autenticado si payload.responsable existe)
    const personalInsert = [];

    const responsable = payload?.responsable;
    if (responsable?.nombre_completo){
      try{
        const { data: auth } = await supabase.auth.getUser();
        const authId = auth?.user?.id;
        let usuarioId = null;

        if (authId){
          const { data: uRow } = await supabase
            .from('usuarios')
            .select('id')
            .eq('auth_user_id', authId)
            .maybeSingle();

          usuarioId = uRow?.id ?? null;
        }

        personalInsert.push({
          negocio_id: negocioId,
          usuario_id: usuarioId,
          propietario: true,
          nombre_publico: responsable.nombre_completo,
          activo: true
        });
      }catch(e){
        personalInsert.push({
          negocio_id: negocioId,
          usuario_id: null,
          propietario: true,
          nombre_publico: responsable.nombre_completo,
          activo: true
        });
      }
    }

    personalPayload.forEach(p => {
      if (!(p?.nombre_publico ?? '').trim()) return;
      personalInsert.push({
        negocio_id: negocioId,
        usuario_id: null,
        propietario: false,
        nombre_publico: (p.nombre_publico ?? '').trim(),
        activo: true
      });
    });

    const { data: personalRows, error: personalErr } = await supabase
      .from('personal')
      .insert(personalInsert)
      .select();

    if (personalErr) throw personalErr;

    // 5) Insertar relaciones personal_servicio
    const serviceIdByIndex = (serviciosRows || []).map(r => r.id);

    const firstIsOwner = Boolean(responsable?.nombre_completo);
    const relations = [];

    personalPayload.forEach((p, idx) => {
      const personalRow = personalRows?.[firstIsOwner ? idx + 1 : idx];
      if (!personalRow?.id) return;

      (p.servicios || []).forEach(serviceIndex => {
        const servicioId = serviceIdByIndex?.[serviceIndex];
        if (!servicioId) return;
        relations.push({ personal_id: personalRow.id, servicio_id: servicioId });
      });
    });

    if (relations.length){
      const { error: relErr } = await supabase.from('personal_servicio').insert(relations);
      if (relErr) throw relErr;
    }

    return { negocio: negocioRow, servicios: serviciosRows, personal: personalRows };
  }
};
