import { supabase } from '../config/supabaseClient.js';

export const UsuarioModel = {
  currentProfile(authUserId){
    return supabase
      .from('usuarios')
      .select('id, nombres, apellidos, correo, telefono, rol_id, roles:rol_id(nombre)')
      .eq('auth_user_id', authUserId)
      .single();
  },
  byId(id){
    return supabase.from('usuarios').select('*').eq('id', id).single();
  },
  update(id, patch){
    return supabase.from('usuarios').update(patch).eq('id', id).select().single();
  }
};
