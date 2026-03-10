import { CompraModel } from '../models/CompraModel.js';
import { MetodoPagoModel } from '../models/MetodoPagoModel.js';
import { EstadoPagoModel } from '../models/EstadoPagoModel.js';
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
  async myPayments(){
    return this.listMine();
  },

  async listMine(){
    const negocioId = await resolveNegocioId();
    const { data, error } = await CompraModel.listByNegocio(negocioId);
    if (error) throw error;
    return data || [];
  },

  async metadata(){
    const [metodosRes, estadosRes] = await Promise.all([
      MetodoPagoModel.list(),
      EstadoPagoModel.list()
    ]);

    if (metodosRes.error) throw metodosRes.error;
    if (estadosRes.error) throw estadosRes.error;

    return {
      metodos: metodosRes.data || [],
      estados: estadosRes.data || []
    };
  },

  async create(payload){
    const negocioId = await resolveNegocioId();

    const metodo_id = payload.metodo_id ?? payload.metodo_pago_id ?? payload.metodoId;
    const estado_id = payload.estado_id ?? payload.estado_pago_id ?? payload.estadoId;
    const tokens = payload.tokens ?? payload.tokens_compra ?? null;

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

    const { data, error } = await CompraModel.create(insertPayload);
    if (error) throw error;
    return data;
  }
};