import { supabase } from '../config/supabaseClient.js';
import { NegocioModel } from '../models/NegocioModel.js';
import { PersonalModel } from '../models/PersonalModel.js';
import { ServicioModel } from '../models/ServicioModel.js';
import { SolicitudAprobacionModel } from '../models/SolicitudAprobacionModel.js';

export const BusinessService = {
  listPublic(){
    return NegocioModel.publicList();
  },

  myBusinesses(){
    return NegocioModel.mine();
  },

  async setBusinessKey(negocioId, plainKey){
    const { data, error } = await supabase.functions.invoke('set-business-key', {
      body: { negocio_id: Number(negocioId), clave: String(plainKey ?? '') }
    });
    if (error) throw error;
    return data;
  },

  async verifyBusinessKey(negocioId, plainKey){
    if (!negocioId) return { ok: false, message: 'Negocio inválido.' };
    if (!String(plainKey || '').trim()) return { ok: false, message: 'Debes ingresar la contraseña.' };

    const { data, error } = await supabase.functions.invoke('verify-business-key', {
      body: { negocio_id: Number(negocioId), clave: String(plainKey ?? '') }
    });

    if (error) {
      console.error('Error verificando clave de negocio:', error);
      return { ok: false, message: 'No se pudo verificar la clave del negocio.' };
    }

    return data || { ok: false, message: 'No se pudo verificar la clave del negocio.' };
  },

  async detailWithResources(id, options = {}){
    if (options.requireVerification && !options.verified) {
      return {
        negocio: null,
        personal: [],
        servicios: [],
        error: new Error('Se requiere verificación de clave antes de cargar recursos.')
      };
    }

    const [negocio, personal, servicios] = await Promise.all([
      NegocioModel.byId(id),
      PersonalModel.listByNegocio(id),
      ServicioModel.listByNegocio(id)
    ]);

    const error = negocio.error || personal.error || servicios.error || null;
    return {
      negocio: negocio.data,
      personal: personal.data,
      servicios: servicios.data,
      error
    };
  },

  async registerBusinessFlow(payload){
    const negocioPayload = { ...(payload?.negocio ?? {}) };
    const plainBusinessKey = negocioPayload.__businessKey;
    if (negocioPayload.__businessKey !== undefined) delete negocioPayload.__businessKey;

    const serviciosPayload = Array.isArray(payload?.servicios) ? payload.servicios : [];
    const personalPayload  = Array.isArray(payload?.personal) ? payload.personal : [];

    const { data: negocioData, error: negocioErr } = await NegocioModel.upsert(negocioPayload);
    if (negocioErr) throw negocioErr;

    const negocioRow = Array.isArray(negocioData) ? negocioData[0] : negocioData;
    const negocioId = negocioRow?.id ?? negocioPayload?.id;
    if (!negocioId) throw new Error('No se pudo resolver negocio_id.');
    
    if (plainBusinessKey && String(plainBusinessKey).trim()){
      const r = await BusinessService.setBusinessKey(negocioId, String(plainBusinessKey).trim());
      if (!r?.ok) throw new Error(r?.message || 'No se pudo guardar la clave del negocio.');
    }

    const { data: oldServicios } = await supabase
      .from('servicios')
      .select('id')
      .eq('negocio_id', negocioId);

    const { data: oldPersonal } = await supabase
      .from('personal')
      .select('id')
      .eq('negocio_id', negocioId);

    const oldPersonalIds = (oldPersonal || []).map((p) => p.id).filter(Boolean);
    const oldServiciosIds = (oldServicios || []).map((s) => s.id).filter(Boolean);

    if (oldPersonalIds.length){
      await supabase.from('personal_servicio').delete().in('personal_id', oldPersonalIds);
      await supabase.from('personal').delete().eq('negocio_id', negocioId);
    }
    if (oldServiciosIds.length){
      await supabase.from('servicios').delete().eq('negocio_id', negocioId);
    }

    const serviciosInsert = serviciosPayload
      .filter((s) => (s?.nombre ?? '').trim())
      .map((s) => ({
        negocio_id: negocioId,
        nombre: (s.nombre ?? '').trim(),
        duracion_min: Number(s.duracion_min ?? 0),
        precio_cop: s.precio_cop === null || s.precio_cop === '' ? null : Number(s.precio_cop),
        costo_tokens: Number(s.tokens ?? 1)
      }));

    const { data: serviciosRows, error: serviciosErr } = await supabase
      .from('servicios')
      .insert(serviciosInsert)
      .select();

    if (serviciosErr) throw serviciosErr;

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
      }catch(_e){
        personalInsert.push({
          negocio_id: negocioId,
          usuario_id: null,
          propietario: true,
          nombre_publico: responsable.nombre_completo,
          activo: true
        });
      }
    }

    personalPayload.forEach((p) => {
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

    const firstIsOwner = Boolean(responsable?.nombre_completo);
    const relations = [];

    // Mapa robusto de servicios insertados por clave estable
    const serviceIdMap = new Map(
      (serviciosRows || []).map((r) => {
        const key = `${String(r.nombre ?? '').trim()}__${Number(r.duracion_min ?? 0)}__${r.precio_cop === null || r.precio_cop === '' ? '' : Number(r.precio_cop)}`;
        return [key, r.id];
      })
    );

    // Mapa robusto de personal insertado por nombre_publico
    const personalIdMap = new Map(
      (personalRows || []).map((p) => [String(p.nombre_publico ?? '').trim(), p.id])
    );

    personalPayload.forEach((p) => {
      const personalName = String(p?.nombre_publico ?? '').trim();
      const personalId = personalIdMap.get(personalName);
      if (!personalId) return;

      (p.servicios || []).forEach((serviceIndex) => {
        const originalService = serviciosPayload?.[serviceIndex];
        if (!originalService) return;

        const serviceKey = `${String(originalService.nombre ?? '').trim()}__${Number(originalService.duracion_min ?? 0)}__${originalService.precio_cop === null || originalService.precio_cop === '' ? '' : Number(originalService.precio_cop)}`;
        const servicioId = serviceIdMap.get(serviceKey);

        if (!servicioId) return;
        relations.push({ personal_id: personalId, servicio_id: servicioId });
      });
    });

    if (relations.length){
      const { error: relErr } = await supabase.from('personal_servicio').insert(relations);
      if (relErr) throw relErr;
    }

    // Crear solicitud de aprobación para el negocio
    try {
      const { data: auth } = await supabase.auth.getUser();
      const authId = auth?.user?.id;

      if (authId){
        const { data: uRow } = await supabase
          .from('usuarios')
          .select('id')
          .eq('auth_user_id', authId)
          .maybeSingle();

        const usuarioId = uRow?.id;

        if (usuarioId){
          await SolicitudAprobacionModel.createNegocio(usuarioId, negocioId);
        }
      }
    }catch(e){
      console.error('No se pudo crear la solicitud de aprobación del negocio:', e);
    }

    return { negocio: negocioRow, servicios: serviciosRows, personal: personalRows };
  }
};