import { NegocioModel } from '../models/NegocioModel.js';
import { supabase } from '../config/supabaseClient.js';

export const AdminService = {
  async pendingBusinesses(){
    return (await supabase.from('negocios').select('*').eq('estado', 'pendiente')).data || [];
  },
  async approveBusiness(id){
    const { data, error } = await NegocioModel.upsert({ id, estado: 'aprobado' });
    if (error) throw error;
    return data;
  }
};
