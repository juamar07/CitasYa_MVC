import { EstadisticaModel } from '../models/EstadisticaModel.js';

export const StatsService = {
  async global(){
    const { data, error } = await EstadisticaModel.resumenGlobal();
    if (error) throw error;
    return data || {};
  },

  async forBusiness(negocioId){
    const { data, error } = await EstadisticaModel.resumenNegocio(negocioId);
    if (error) throw error;
    return data || {};
  }
};