import { CompraModel } from '../models/CompraModel.js';
import { BusinessService } from './BusinessService.js';

async function resolveNegocioId(){
  const { data, error } = await BusinessService.myBusinesses();
  if (error) throw error;

  const negocios = data || [];
  if (!negocios.length) {
    throw new Error('No tienes un negocio asociado. Registra o asóciate a un negocio para comprar tokens.');
  }
  return negocios[0].id;
}

export const PaymentService = {
  // ✅ Alias para que PagosController no reviente
  async myPayments(){
    return this.listMine();
  },

  async listMine(){
    const negocioId = await resolveNegocioId();
    return CompraModel.listByNegocio(negocioId);
  },

  async create(payload){
    const negocioId = await resolveNegocioId();

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
