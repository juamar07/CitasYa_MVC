import { AdminService } from '../services/AdminService.js';

export const AdminController = {
  pendientes(){
    return AdminService.pendingBusinesses();
  },
  aprobar(id){
    return AdminService.approveBusiness(id);
  }
};
