import { supabase } from '../config/supabaseClient.js';

async function withNegocioNames(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const negocioIds = [...new Set(list.map((c) => c.negocio_id).filter(Boolean))];

  if (!negocioIds.length) {
    return list.map((c) => ({ ...c, negocio_nombre: null }));
  }

  const { data: negocios, error } = await supabase
    .from('negocios')
    .select('id,nombre')
    .in('id', negocioIds);

  if (error) throw error;

  const negocioMap = new Map((negocios || []).map((n) => [Number(n.id), n.nombre]));
  return list.map((c) => ({
    ...c,
    negocio_nombre: c.negocio_id ? (negocioMap.get(Number(c.negocio_id)) || null) : null
  }));
}

export const ComentarioModel = {
  listByNegocio(negocioId) {
    return supabase
      .from('comentarios')
      .select('*')
      .eq('negocio_id', negocioId)
      .eq('visible', true)
      .order('creado_en', { ascending: false });
  },

  async listByUsuario(usuarioId) {
    const { data, error } = await supabase
      .from('comentarios')
      .select('*')
      .eq('usuario_autor_id', usuarioId)
      .order('creado_en', { ascending: false });

    if (error) return { data: null, error };
    const merged = await withNegocioNames(data || []);
    return { data: merged, error: null };
  },

  create(payload) {
    return supabase
      .from('comentarios')
      .insert(payload)
      .select()
      .single();
  },

  removeByIdAndUsuario(id, usuarioId) {
    return supabase
      .from('comentarios')
      .delete()
      .eq('id', id)
      .eq('usuario_autor_id', usuarioId)
      .select();
  },

  listAllForAdmin() {
    return supabase
      .from('comentarios')
      .select('id, negocio_id, nombre_autor, calificacion, recomienda, texto, sentimiento, visible, creado_en')
      .eq('visible', true)
      .order('creado_en', { ascending: false });
  },

  async listRecentDetailed(limit = 10) {
    const { data, error } = await supabase
      .from('comentarios')
      .select('id, negocio_id, nombre_autor, calificacion, recomienda, texto, sentimiento, visible, creado_en')
      .eq('visible', true)
      .order('creado_en', { ascending: false })
      .limit(limit);

    if (error) return { data: null, error };
    const merged = await withNegocioNames(data || []);
    return { data: merged, error: null };
  }
};