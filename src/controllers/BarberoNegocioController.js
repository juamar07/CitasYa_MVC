import { BusinessService } from '../services/BusinessService.js';
import { NegocioModel } from '../models/NegocioModel.js';

export const BarberoNegocioController = {
  async misNegocios(){
    return (await BusinessService.myBusinesses()).data || [];
  },

  async guardarNegocio(payload){
    const { data, error } = await NegocioModel.upsert(payload);
    if (error) throw error;
    return data;
  },

  async registrarNegocioCompleto(payload){
    return await BusinessService.registerBusinessFlow(payload);
  }
};
