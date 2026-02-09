import { PaymentService } from '../services/PaymentService.js';

export const PagosController = {
  async misPagos(){
    return PaymentService.listMine();
  },
  async metadata(){
    return PaymentService.metadata();
  },
  async crear(payload){
    return PaymentService.create(payload);
  }
};
