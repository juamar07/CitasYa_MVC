import { ComentarioModel } from '../models/ComentarioModel.js';
import { TipoComentarioModel } from '../models/TipoComentarioModel.js';
import { getUsuarioId } from '../store/auth.js';

export const ComentariosController = {
  async list(negocioId){
    return (await ComentarioModel.listByNegocio(negocioId)).data || [];
  },
  async tipos(){
    return (await TipoComentarioModel.list()).data || [];
  },
  async crear(payload){
    payload.usuario_id = getUsuarioId();
    const { data, error } = await ComentarioModel.create(payload);
    if (error) throw error;
    return data;
  }
};
