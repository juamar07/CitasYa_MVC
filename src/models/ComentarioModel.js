// src/models/ComentarioModel.js
import { supabase } from '../config/supabaseClient.js';

export const ComentarioModel = {
  listByNegocio(negocioId){
    return supabase
      .from('comentarios')
      .select('*')
      .eq('negocio_id', negocioId)
      .order('creado_en', { ascending:false });
  },

  listByUsuario(usuarioId){
    return supabase
      .from('comentarios')
      .select('*')
      .eq('usuario_autor_id', usuarioId)
      .order('creado_en', { ascending:false });
  },

  create(payload){
    return supabase
      .from('comentarios')
      .insert(payload)
      .select()
      .single();
  },

  removeByIdAndUsuario(id, usuarioId){
    return supabase
      .from('comentarios')
      .delete()
      .eq('id', id)
      .eq('usuario_autor_id', usuarioId)
      .select();
  }
};
