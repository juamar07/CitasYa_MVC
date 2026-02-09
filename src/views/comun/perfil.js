import { getRole, getUser, initAuth } from '../../store/auth.js';
import { navigate } from '../../router/index.js';

export default async function PerfilView(){
  await initAuth();

  const user = getUser();
  const role = getRole();

  const name = user?.user_metadata?.full_name || user?.email || 'Usuario';

  return `
  <style>
    body{ font-family:'Open Sans',sans-serif;background:#eee;margin:0;padding:20px;color:#333; }
    .card{ max-width:800px;margin:24px auto;background:#fff;border-radius:10px;padding:20px;
           box-shadow:0 4px 8px rgba(0,0,0,.05); border-left:4px solid #5c6bc0; }
    h1{ margin:0 0 10px; }
    .muted{ color:#666; margin: 6px 0; }
    .btn{ margin-top:14px; padding:12px 14px; border:none; border-radius:8px; cursor:pointer; font-weight:700; color:#fff; background:#5c6bc0; }
  </style>
  <div class="card">
    <h1>Mi perfil (placeholder)</h1>
    <div class="muted">Nombre: <b>${name}</b></div>
    <div class="muted">Tipo de cuenta: <b>${role || 'desconocido'}</b></div>

    <button class="btn" id="goRole">
      ${role === 'barbero' ? 'Ir a organizar agenda' : 'Ir a agendar cita'}
    </button>
  </div>`;
}

export function onMount(){
  document.getElementById('goRole')?.addEventListener('click', async () => {
    const { getRole } = await import('../../store/auth.js');
    const role = getRole();
    if (role === 'barbero') navigate('/barbero/organizar-agenda');
    else navigate('/cliente/agendar');
  });
}
