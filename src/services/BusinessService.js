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

  async verifyBusinessKey(negocioId, plainKey){
    if (!negocioId) return { ok: false, message: 'Negocio inválido.' };
    if (!String(plainKey || '').trim()) return { ok: false, message: 'Debes ingresar la contraseña.' };

    const { data, error, field } = await NegocioModel.readSecretByBusinessId(negocioId);
    if (error) {
      console.error('Error verificando clave de negocio:', error);
      return { ok: false, message: 'No se pudo verificar la clave del negocio.' };
    }

    if (!field) {
      return { ok: false, message: 'El negocio no tiene un campo de clave configurado en BD.' };
    }

    const stored = String(data?.secret || '');
    const provided = String(plainKey || '');
    const ok = stored.length > 0 && stored === provided;

    return { ok, message: ok ? 'Verificación exitosa.' : 'Contraseña incorrecta.' };
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
    const negocioPayload = payload?.negocio ?? {};
    const serviciosPayload = Array.isArray(payload?.servicios) ? payload.servicios : [];
    const personalPayload  = Array.isArray(payload?.personal) ? payload.personal : [];

    const { data: negocioData, error: negocioErr } = await NegocioModel.upsert(negocioPayload);
    if (negocioErr) throw negocioErr;

    const negocioRow = Array.isArray(negocioData) ? negocioData[0] : negocioData;
    const negocioId = negocioRow?.id ?? negocioPayload?.id;
    if (!negocioId) throw new Error('No se pudo resolver negocio_id.');

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
        tokens: Number(s.tokens ?? 1)
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

    const serviceIdByIndex = (serviciosRows || []).map((r) => r.id);

    const firstIsOwner = Boolean(responsable?.nombre_completo);
    const relations = [];

    personalPayload.forEach((p, idx) => {
      const personalRow = personalRows?.[firstIsOwner ? idx + 1 : idx];
      if (!personalRow?.id) return;

      (p.servicios || []).forEach((serviceIndex) => {
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