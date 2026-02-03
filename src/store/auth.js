import { supabase } from '../config/supabaseClient.js';

let session = null;
let profile = null; // { usuarioId, role }

export async function initAuth(){
  const { data } = await supabase.auth.getSession();
  session = data.session || null;
  profile = session?.user ? await fetchProfile(session.user.id) : null;
  supabase.auth.onAuthStateChange(async (_e, s) => {
    session = s?.session || null;
    profile = session?.user ? await fetchProfile(session.user.id) : null;
  });
}

async function fetchProfile(authUserId){
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, auth_user_id, rol_id, roles:rol_id(nombre)')
    .eq('auth_user_id', authUserId)
    .single();
  if (error) return null;
  return { usuarioId: data.id, role: data.roles?.nombre };
}

// 👇 NUEVO: intenta cargar perfil si aún no está
async function ensureProfileLoaded(){
  if (session?.user && !profile) {
    profile = await fetchProfile(session.user.id);
  }
}

export function getUser(){ return session?.user || null; }
export function getRole(){ return profile?.role || null; }
export function getUsuarioId(){ return profile?.usuarioId || null; }

export async function guardAuth(){
  if (!getUser()) {
        // ✅ guarda a dónde quería ir (path + query)
        const target = location.hash.slice(1) || '/';
        sessionStorage.setItem('redirectTo', target);

        location.hash = '#/login';
        return false;
      }
      return true;
    }

    export async function guardRole(expected){
      const ok = await guardAuth();
      if (!ok) return false;

      await ensureProfileLoaded();

      if (getRole() !== expected) {
        // ✅ ya está logueado, pero no tiene rol permitido: no mandes a login
        location.hash = '#/';
        return false;
      }
      return true;
    }
