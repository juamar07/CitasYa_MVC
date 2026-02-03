import { NegocioModel } from '../models/NegocioModel.js';
import { PersonalModel } from '../models/PersonalModel.js';
import { supabase } from '../config/supabaseClient.js';

export const AdminService = {
  async pendingBusinesses(){
    return (await supabase.from('negocios').select('*').eq('estado', 'pendiente')).data || [];
  },

  async approveBusiness(id){
    const { data, error } = await NegocioModel.upsert({ id, estado: 'aprobado' });
    if (error) throw error;
    return data;
  },

  // ✅ NUEVO: barberos/personal pendientes (activo = false)
  async pendingBarbers(){
    // Trae datos básicos + negocio asociado para mostrar nombre (si aplica)
    const { data, error } = await supabase
      .from('personal')
      .select('id, nombre_publico, propietario, activo, creado_en, negocio_id, negocios(nombre)')
      .eq('activo', false);

    if (error) throw error;
    return data || [];
  },

  // ✅ NUEVO: aprobar barbero (activo = true)
  async approveBarber(id){
    const { data, error } = await PersonalModel.upsert({ id, activo: true });
    if (error) throw error;
    return data;
  }
};
