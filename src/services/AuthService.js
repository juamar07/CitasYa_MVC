// src/services/AuthService.js
import { supabase } from '../config/supabaseClient.js';

export const AuthService = {
  login(email, password){ return supabase.auth.signInWithPassword({ email, password }); },
  logout(){ return supabase.auth.signOut(); },

  async registerCliente({ email, password, full_name, phone, username }){
    // 1) Crear usuario en Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } }
    });
    if (error) return { error };

    // 2) Upsert en usuarios (si ya existe por trigger, lo actualiza)
    const authUserId = data?.user?.id;
    if (!authUserId){
      return { error: new Error('No se pudo obtener auth_user_id del registro.') };
    }

    const payload = {
      auth_user_id: authUserId,
      nombre_completo: full_name ?? null,
      correo: email ?? null,
      telefono: (phone ?? '').trim() || null,
      usuario: (username ?? '').trim() || null,
      rol_id: 1,
      activo: true
    };

    const { error: dbError } = await supabase
      .from('usuarios')
      .upsert([payload], { onConflict: 'auth_user_id' });

    if (dbError) return { error: dbError };

    return { error: null };
  }
};