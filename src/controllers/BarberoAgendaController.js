import { CitaModel } from '../models/CitaModel.js';
import { PersonalModel } from '../models/PersonalModel.js';
import { getUsuarioId } from '../store/auth.js';

export const BarberoAgendaController = {
  async miAgenda(){
    const personal = await PersonalModel.byId(getUsuarioId());
    if (!personal.data) return [];
    return (await CitaModel.byStaff(personal.data.id)).data || [];
  }
};
