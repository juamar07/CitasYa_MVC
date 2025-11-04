import { EstadisticaModel } from '../models/EstadisticaModel.js';

export const StatsService = {
  global(){
    return EstadisticaModel.resumenGlobal();
  },
  forBusiness(negocioId){
    return EstadisticaModel.resumenNegocio(negocioId);
  }
};
