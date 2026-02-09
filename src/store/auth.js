// src/store/auth.js
import { supabase } from '../config/supabaseClient.js';

let session = null;
let profile = null; // { usuarioId, role }
let initialized = false;
let initPromise = null;

async function fetchProfile(authUserId){
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, auth_user_id, rol_id, roles:rol_id(nombre)')
    .eq('auth_user_id', authUserId)
    .single();

  if (error) return null;
  return { usuarioId: data.id, role: data.roles?.nombre };
}

// Inicializa listener 1 sola vez
export async function initAuth(){
  if (initialized) return true;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const { data } = await supabase.auth.getSession();
    session = data.session || null;
    profile = session?.user ? await fetchProfile(session.user.id) : null;

    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      session = newSession || null;
      profile = session?.user ? await fetchProfile(session.user.id) : null;
    });

    initialized = true;
    return true;
  })();

  return initPromise;
}

// Asegura que haya sesión cargada antes de decidir
async function ensureSessionLoaded(){
  // si nunca se inicializó, inicializa
  if (!initialized) await initAuth();

  // si no hay sesión en memoria, re-pregunta a supabase (rehidratación)
  if (!session) {
    const { data } = await supabase.auth.getSession();
    session = data.session || null;
  }
  // si hay usuario pero no perfil, lo carga
  if (session?.user && !profile) {
    profile = await fetchProfile(session.user.id);
  }
}

export function getUser(){ return session?.user || null; }
export function getRole(){ return profile?.role || null; }
export function getUsuarioId(){ return profile?.usuarioId || null; }

export async function guardAuth(){
  await ensureSessionLoaded();

  if (!getUser()) {
    // guarda a dónde quería ir
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

  // perfil ya se asegura en ensureSessionLoaded, pero lo dejamos por seguridad
  await ensureSessionLoaded();

  if (getRole() !== expected) {
    // está logueado, pero sin permiso
    location.hash = '#/';
    return false;
  }
  return true;
}
