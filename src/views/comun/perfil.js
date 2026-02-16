// src/views/comun/perfil.js
import { supabase } from '../../config/supabaseClient.js';
import { UsuarioModel } from '../../models/UsuarioModel.js';
import { navigate } from '../../router/index.js';

function esc(s=''){
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#039;");
}

function roleLabelFromId(rolId){
  if (rolId === 3) return 'administrador';
  if (rolId === 2) return 'barbero';
  return 'usuario';
}

function primaryRouteByRole(rolId){
  if (rolId === 3) return { path: '/admin', label: 'Ir al panel admin' };
  if (rolId === 2) return { path: '/barbero/mi-agenda', label: 'Ir a mi agenda' };
  return { path: '/cliente/agendar', label: 'Ir a agendar cita' };
}

export default async function PerfilView(){
  const { data: sessionData } = await supabase.auth.getSession();
  const authUser = sessionData?.session?.user || null;

  if (!authUser){
    navigate('/login');
    return '';
  }

  const { data: perfil, error } = await UsuarioModel.currentProfile(authUser.id); // :contentReference[oaicite:1]{index=1}

  const fullName = perfil
    ? `${perfil.nombres || ''} ${perfil.apellidos || ''}`.trim()
    : (authUser.user_metadata?.full_name || authUser.email || '—');

  const rolId = perfil?.rol_id ?? 1;
  const rolLabel = roleLabelFromId(rolId);
  const primary = primaryRouteByRole(rolId);

  return `
  <style>
    :root{
      --container-w: 800px;
      --container-pad: 20px;
      --container-bl: 4px;
      --banner-h: 64px;
      --page-sidepad: 16px;
      --banner-bg: #e6e9ee;
      --banner-bg-hover: #d7dbe3;
      --btn-blue: #5c6bc0;
      --btn-blue-hover:#3f51b5;
      --btn-green:#66BB6A;
    }
    body{
      font-family:'Open Sans', sans-serif; background:#eee; margin:0; padding:20px; color:#333;
      padding-top: calc(var(--banner-h) + 8px);
    }
    .container{
      max-width:var(--container-w); margin:auto; padding:var(--container-pad); background:#fff;
      box-shadow:0 4px 8px rgba(0,0,0,.05); border-radius:10px; border-left:var(--container-bl) solid var(--btn-blue);
    }

    h1{ color:#000; font-size:34px; font-weight:700; margin:8px 0 12px; }
    .row{ margin:6px 0; font-size:18px; }
    .row b{ color:#233247; }
    .muted{ color:#666; font-size:14px; margin-top:10px; }

    .btns{ display:flex; gap:12px; flex-wrap:wrap; margin-top:18px; }
    button{
      border:none; border-radius:8px; padding:12px 16px; font-weight:700; cursor:pointer;
      transition:.2s; color:#fff; min-width:220px;
    }
    button:active{ transform:scale(.99); }
    .btn-blue{ background:var(--btn-blue); }
    .btn-blue:hover{ background:var(--btn-blue-hover); }
    .btn-outline{
      background:#fff; color:var(--btn-blue); border:2px solid var(--btn-blue);
    }
    .btn-outline:hover{ background:#eef2ff; }

    .error{
      margin-top:10px; padding:10px 12px; border-radius:10px;
      background:#fff1f2; border:1px solid #fecdd3; color:#9f1239; display:none;
    }

    /* Header igual al login */
    .app-banner{
      position:fixed; top:0; left:0; right:0; height:var(--banner-h); z-index:9999; background:transparent;
    }
    .app-banner .banner-box{
      height:100%;
      width:min(calc(var(--container-w) + var(--container-pad)*2 + var(--container-bl)),
                calc(100% - var(--page-sidepad)*2));
      margin:0 auto; background:var(--banner-bg); border-bottom:1px solid rgba(0,0,0,.06); border-radius:10px;
      transition: background-color .2s; display:flex; align-items:center;
    }
    .app-banner .banner-box:hover, .app-banner .banner-box:focus-within{ background:var(--banner-bg-hover); }
    .app-banner .banner-inner{ display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:8px; width:100%; padding:0 12px; }
    .banner-back{ justify-self:start; }
    .banner-title{ justify-self:center; font-weight:700; color:#233247; }
    .banner-logo{ justify-self:end; display:inline-flex; align-items:center; }
    .banner-logo img{ width:52px; height:auto; display:block; }
    .back-button{
      display:inline-block; text-decoration:none; font-size:14px; color:var(--btn-blue);
      padding:8px 12px; border:1px solid var(--btn-blue); border-radius:6px; transition: background-color .2s, color .2s;
    }
    .back-button:hover{ background:var(--btn-blue); color:#fff; }

    /* Footer fuera del container (como login) */
    .legal-outside{
      margin:18px auto 24px; padding:10px 12px;
      max-width: calc(var(--container-w) + var(--container-pad)*2 + var(--container-bl));
      text-align:center; color:#666; font-size:14px; line-height:1.35;
    }

    @media (max-width:768px){
      .container{ width:100%; padding:10px; }
      h1, .banner-title{ font-size:20px; }
      .row, button{ font-size:14px; }
      button{ min-width:100%; }
    }
  </style>

  <header class="app-banner" role="banner">
    <div class="banner-box">
      <div class="banner-inner">
        <a href="#" class="back-button banner-back" data-action="back">&larr; Volver</a>
        <div class="banner-title">Mi perfil</div>
        <a href="#/" class="banner-logo" aria-label="Ir al inicio">
          <img src="./assets/img/LogoCitasYa.png" alt="Citas Ya">
        </a>
      </div>
    </div>
  </header>

  <div class="container">
    <h1>Mi perfil</h1>

    ${error ? `<div class="error" style="display:block;">No se pudo cargar tu perfil desde la tabla usuarios.</div>` : ''}

    <div class="row">Nombre: <b>${esc(fullName || '—')}</b></div>
    <div class="row">Tipo de cuenta: <b>${esc(rolLabel)}</b></div>

    <div class="btns">
      ${
        rolId === 1 ? `
          <button id="btnSolicitarBarbero" class="btn-outline" type="button">
            Solicitar perfil barbero
          </button>
        ` : ''
      }
      <button id="btnIr" class="btn-blue" type="button">${esc(primary.label)}</button>
    </div>

    <div class="muted">
      Nota: la solicitud de perfil barbero es simbólica por ahora.
    </div>
  </div>

  <div class="legal-outside">
    Todos los derechos reservados © 2026<br>
    Citas Ya S.A.S - Nit 810.000.000-0
  </div>
  `;
}

export function onMount(){
  const backBtn = document.querySelector('[data-action="back"]');
  backBtn?.addEventListener('click', (ev) => { ev.preventDefault(); history.back(); });

  const btnIr = document.getElementById('btnIr');
  btnIr?.addEventListener('click', async ()=>{
    const { data: sessionData } = await supabase.auth.getSession();
    const authUser = sessionData?.session?.user;
    if (!authUser) return navigate('/login');

    const { data: perfil } = await UsuarioModel.currentProfile(authUser.id);
    const rolId = perfil?.rol_id ?? 1;
    const primary = primaryRouteByRole(rolId);
    navigate(primary.path);
  });

  const btnSolicitar = document.getElementById('btnSolicitarBarbero');
  btnSolicitar?.addEventListener('click', ()=>{
    alert('Solicitud enviada (simbólico). Luego conectamos esto al flujo de aprobación.');
  });
}
