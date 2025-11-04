import { CompraModel } from '../models/CompraModel.js';
import { MetodoPagoModel } from '../models/MetodoPagoModel.js';
import { EstadoPagoModel } from '../models/EstadoPagoModel.js';
import { getUsuarioId } from '../store/auth.js';

export const PaymentService = {
  async myPayments(){
    return (await CompraModel.listByUsuario(getUsuarioId())).data || [];
  },
  async metadata(){
    const [metodos, estados] = await Promise.all([
      MetodoPagoModel.list(),
      EstadoPagoModel.list()
    ]);
    return { metodos: metodos.data || [], estados: estados.data || [] };
  },
  async create(payload){
    payload.usuario_id = getUsuarioId();
    const { data, error } = await CompraModel.create(payload);
    if (error) throw error;
    return data;
  }
};
