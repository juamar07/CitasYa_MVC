import { NegocioModel } from '../models/NegocioModel.js';
import { PersonalModel } from '../models/PersonalModel.js';
import { ServicioModel } from '../models/ServicioModel.js';

export const BusinessService = {
  listPublic(){
    return NegocioModel.publicList();
  },
  myBusinesses(){
    return NegocioModel.mine();
  },
  async detailWithResources(id){
    const [negocio, personal, servicios] = await Promise.all([
      NegocioModel.byId(id),
      PersonalModel.listByNegocio(id),
      ServicioModel.listByNegocio(id)
    ]);
    return { negocio: negocio.data, personal: personal.data, servicios: servicios.data };
  }
};
