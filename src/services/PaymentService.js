import { CompraModel } from '../models/CompraModel.js';
import { BusinessService } from './BusinessService.js';

async function resolveNegocioId(){
  const { data, error } = await BusinessService.myBusinesses();
  if (error) throw error;

  const negocios = data || [];
  if (!negocios.length) {
    // Sin negocio asociado → no se puede comprar tokens
    throw new Error('No tienes un negocio asociado. Registra o asóciate a un negocio para comprar tokens.');
  }
  // Regla: usar el primer negocio del barbero (si manejas múltiples, luego lo hacemos seleccionable)
  return negocios[0].id;
}

export const PaymentService = {
  async listMine(){
    const negocioId = await resolveNegocioId();
    return CompraModel.listByNegocio(negocioId);
  },

  async create(payload){
    const negocioId = await resolveNegocioId();

    // Acepta payload desde UI: { tokens, monto_cop, metodo_id, estado_id, ref_externa }
    // Si vienen con nombres antiguos, los mapeamos sin romper:
    const metodo_id = payload.metodo_id ?? payload.metodo_pago_id ?? payload.metodoId;
    const estado_id = payload.estado_id ?? payload.estado_pago_id ?? payload.estadoId;
    const tokens    = payload.tokens ?? payload.tokens_compra ?? null;

    const monto_cop =
      payload.monto_cop ??
      payload.monto ??
      payload.montoCOP ??
      null;

    const ref_externa = payload.ref_externa ?? payload.ref ?? payload.referencia ?? null;

    if (!metodo_id) throw new Error('Selecciona un método de pago.');
    if (!estado_id) throw new Error('Selecciona un estado de pago.');
    if (monto_cop == null || Number(monto_cop) <= 0) throw new Error('El monto debe ser mayor a 0.');

    const insertPayload = {
      negocio_id: negocioId,
      metodo_id,
      estado_id,
      tokens: tokens == null ? null : Number(tokens),
      monto_cop: Number(monto_cop),
      ref_externa
    };

    return CompraModel.create(insertPayload);
  }
};
