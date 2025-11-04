import { NegocioModel } from '../models/NegocioModel.js';
import { CitaModel } from '../models/CitaModel.js';
import { AppointmentService } from '../services/AppointmentService.js';
import { getUsuarioId } from '../store/auth.js';

export const ClienteAppointmentsController = {
  async loadHome(){ return (await NegocioModel.publicList()).data || []; },
  async misCitas(){ return (await CitaModel.byCliente(getUsuarioId())).data || []; },
  async agendar(payload){ 
    payload.usuario_cliente_id = getUsuarioId();
    const { data, error } = await AppointmentService.schedule(payload);
    if (error) throw error;
    return data;
  }
};
