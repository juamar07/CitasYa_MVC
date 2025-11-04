import { ClienteAppointmentsController as ctrl } from '../../controllers/ClienteAppointmentsController.js';
import { navigate } from '../../router/index.js';

export default async function HomeView(){
  const negocios = await ctrl.loadHome();
  const cards = (negocios||[]).map(n=>`
    <li>
      <strong>${n.nombre}</strong><br/>
      <small>${n.direccion??''}</small><br/>
      <a href="#/cliente/agendar-publico?negocio=${n.id}">Agendar</a>
    </li>`).join('');
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
    }
    body {
      font-family: 'Open Sans', sans-serif;
      background-color: #eeeeee;
      margin: 0;
      padding: 20px;
      color: #333;
      padding-top: calc(var(--banner-h) + 8px);
    }
    .container {
      max-width: var(--container-w);
      margin: auto;
      padding: var(--container-pad);
      background-color: #ffffff;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
      border-radius: 10px;
      border-left: var(--container-bl) solid #5c6bc0;
    }
    h1 { text-align: center; color: #000; font-size: 24px; font-weight: 600; margin-bottom: 20px; }
    button {
      display: block; width: 100%; margin: 10px 0;
      border: none; padding: 15px 20px; border-radius: 5px;
      cursor: pointer; font-weight: 600; transition: background-color 0.3s, transform 0.3s;
      color: white; font-size: 16px;
    }
    .btn-inicio { background-color: #5c6bc0; }
    .btn-inicio:hover { background-color: #3f51b5; transform: translateY(-2px); }
    .btn-registrar { background-color: #66BB6A; }
    .btn-registrar:hover { background-color: #57A05D; transform: translateY(-2px); }
    .btn-slim {
      width: min(640px, 75%);
      margin-left: auto;
      margin-right: auto;
    }
    .btn-row-2{
      width: min(640px, 75%);
      margin: 10px auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    @media (max-width: 560px){
      .btn-slim{ width: 100%; }
      .btn-row-2{ width: 100%; grid-template-columns: 1fr; }
    }
    footer { text-align: center; font-size: 14px; color: #555; margin-top: 20px; }
    .app-banner{
      position: fixed; top: 0; left: 0; right: 0; height: var(--banner-h);
      z-index: 9999; background: transparent;
    }
    .app-banner .banner-box{
      height: 100%;
      width: min(calc(var(--container-w) + var(--container-pad)*2 + var(--container-bl)),
                 calc(100% - var(--page-sidepad)*2));
      margin: 0 auto;
      background: var(--banner-bg);
      border-bottom: 1px solid rgba(0,0,0,.06);
      border-radius: 10px;
      transition: background-color .2s ease;
      display: flex; align-items: center;
    }
    .app-banner .banner-box:hover,
    .app-banner .banner-box:focus-within{ background: var(--banner-bg-hover); }
    .app-banner .banner-inner{
      display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
      gap: 8px; width: 100%; padding: 0 12px;
    }
    .banner-back{ justify-self: start; }
    .banner-title{ justify-self: center; font-weight: 700; color: #233247; }
    .banner-logo{ justify-self: end; display: inline-flex; align-items: center; }
    .banner-logo img{ width: 52px; height: auto; display: block; }
    .back-button{
      display:inline-block; text-decoration:none; font-size:14px; color:#5c6bc0;
      padding:8px 12px; border:1px solid #5c6bc0; border-radius:6px;
      transition: background-color .2s, color .2s;
    }
    .back-button:hover{ background:#5c6bc0; color:#fff; }
    .legal-outside{
      margin: 18px auto 24px;
      padding: 10px 12px;
      max-width: calc(var(--container-w) + var(--container-pad)*2 + var(--container-bl));
      text-align: center; color: #666; font-size: 14px; line-height: 1.35;
    }
    .dev-shortcuts {
      margin-top: 24px; padding: 12px; border: 1px dashed #999;
      border-radius: 8px; background: #fafafa;
    }
    .dev-shortcuts h2 { font-size: 14px; margin: 0 0 10px; color: #666; }
    .btn-dev { background-color: #009688; }
    .btn-dev:hover { background-color: #00796B; }
    .btn-dev-alt { background-color: #8D6E63; }
    .btn-dev-alt:hover { background-color: #6D4C41; }
    @media (max-width: 768px) {
      .container { width: 100%; padding: 10px; }
      h1, .banner-title { font-size: 20px; }
      button { font-size: 14px; }
    }
    .home-public-list {
      list-style: none;
      padding: 0;
      margin: 30px auto 0;
      max-width: 420px;
      display: grid;
      gap: 12px;
    }
    .home-public-list li {
      padding: 12px;
      background: #f5f7fb;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .home-public-list a {
      display: inline-block;
      margin-top: 6px;
      color: #5c6bc0;
      font-weight: 600;
    }
  </style>
  <header class="app-banner" role="banner">
    <div class="banner-box">
      <div class="banner-inner">
        <a href="#" class="back-button banner-back" data-action="back">&larr; Volver</a>
        <div class="banner-title">Bienvenido a Citas Ya</div>
        <a href="#/" class="banner-logo" aria-label="Ir al inicio">
          <img src="./assets/img/LogoCitasYa.png" alt="Citas Ya">
        </a>
      </div>
    </div>
  </header>
  <div class="container">
    <section>
      <button id="btn_login" class="btn-inicio btn-slim">Iniciar Sesión</button>
      <button id="btn_registrar_cliente" class="btn-registrar btn-slim">Registrarse</button>
    </section>
    <section>
      <h2>Barberías destacadas</h2>
      <ul class="home-public-list">${cards}</ul>
    </section>
    <section class="dev-shortcuts" aria-label="Accesos temporales de desarrollo">
      <h2>Accesos rápidos (temporal)</h2>
      <button id="dev_ir_agendar" class="btn-dev">Ir a: Agendar una cita (Cliente)</button>
      <button id="dev_ir_organizar" class="btn-dev">Ir a: Organizar agenda (Barbero)</button>
      <button id="dev_ir_admin" class="btn-dev-alt">Ir a: Administrador</button>
    </section>
    <footer>
      <p>Reserva servicios y gestiona tu agenda en minutos.</p>
    </footer>
  </div>
  <div class="legal-outside">
    Todos los derechos reservados © 2025<br>
    Citas Ya S.A.S - Nit 810.000.000-0
  </div>`;
}

export function onMount(){
  const backBtn = document.querySelector('[data-action="back"]');
  backBtn?.addEventListener('click', (ev) => { ev.preventDefault(); history.back(); });
  document.getElementById('btn_login')?.addEventListener('click', () => navigate('/login'));
  document.getElementById('btn_registrar_cliente')?.addEventListener('click', () => navigate('/registro'));
  document.getElementById('dev_ir_agendar')?.addEventListener('click', () => navigate('/cliente/agendar'));
  document.getElementById('dev_ir_organizar')?.addEventListener('click', () => navigate('/barbero/organizar-agenda'));
  document.getElementById('dev_ir_admin')?.addEventListener('click', () => navigate('/admin'));
}
