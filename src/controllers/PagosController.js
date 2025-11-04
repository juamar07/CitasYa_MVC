import { PaymentService } from '../services/PaymentService.js';

export const PagosController = {
  async misPagos(){
    return PaymentService.myPayments();
  },
  async metadata(){
    return PaymentService.metadata();
  },
  async crear(payload){
    return PaymentService.create(payload);
  }
};
