import { ClienteAppointmentsController as ctrl } from '../../controllers/ClienteAppointmentsController.js';
import { navigate } from '../../router/index.js';
import { initAuth, getUser, getRole } from '../../store/auth.js';
import { AuthController } from '../../controllers/AuthController.js';

export default async function HomeView(){
  await initAuth();

  const user = getUser();
  const role = getRole();

  const negocios = await ctrl.loadHome();
  const cards = (negocios || []).map(n => `
    <li>
      <strong>${n.nombre}</strong><br/>
      <small>${n.direccion ?? ''}</small><br/>
      <a href="#/cliente/agendar-publico?negocio=${n.id}">Agendar</a>
    </li>
  `).join('');

  const menuItemsLoggedOut = `
    <button class="menu-item" data-menu="login">Iniciar sesión</button>
    <button class="menu-item" data-menu="register">Registrarme</button>
    <button class="menu-item" data-menu="registerBiz">Registrar mi negocio</button>
  `;

  const menuItemsLoggedIn = `
    <button class="menu-item" data-menu="login">Iniciar sesión</button>
    <button class="menu-item" data-menu="register">Registrarme</button>
    <button class="menu-item" data-menu="registerBiz">Registrar mi negocio</button>
    <button class="menu-item" data-menu="perfil">Mi perfil</button>
    <button class="menu-item danger" data-menu="logout">Cerrar sesión</button>
  `;

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
      --btn-blue:#5c6bc0;
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
      border-left: var(--container-bl) solid var(--btn-blue);
    }

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

    .banner-left{ justify-self: start; position: relative; display: inline-flex; align-items:center; gap:8px; }
    .menu-btn{
      width: 40px; height: 40px;
      border: 1px solid var(--btn-blue);
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      font-size: 20px;
      color: var(--btn-blue);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .menu-btn:hover{ background: rgba(92,107,192,.08); }

    .dropdown{
      position: absolute;
      top: 48px;
      left: 0;
      width: 240px;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,.12);
      border: 1px solid rgba(0,0,0,.08);
      padding: 10px;
      display: none;
    }
    .dropdown.open{ display: block; }

    .menu-item{
      width: 100%;
      text-align: left;
      border: none;
      background: transparent;
      padding: 10px 10px;
      cursor: pointer;
      border-radius: 8px;
      font-size: 15px;
      color: #233247;
    }
    .menu-item:hover{ background: #f2f4f8; }
    .menu-item.danger{ color: #b00020; }

    .banner-title{ justify-self: center; font-weight: 700; color: #233247; }
    .banner-logo{ justify-self: end; display: inline-flex; align-items: center; }
    .banner-logo img{ width: 52px; height: auto; display: block; }

    h2{ margin-top: 24px; }
    .home-public-list {
      list-style: none;
      padding: 0;
      margin: 20px auto 0;
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
      color: var(--btn-blue);
      font-weight: 600;
    }

    .legal-outside{
      margin: 18px auto 24px;
      padding: 10px 12px;
      max-width: calc(var(--container-w) + var(--container-pad)*2 + var(--container-bl));
      text-align: center; color: #666; font-size: 14px; line-height: 1.35;
    }
  </style>

  <header class="app-banner" role="banner">
    <div class="banner-box">
      <div class="banner-inner">
        <div class="banner-left">
          <button class="menu-btn" id="menuBtn" aria-label="Abrir menú">☰</button>
          <div class="dropdown" id="dropdownMenu" role="menu" aria-label="Menú">
            ${user ? menuItemsLoggedIn : menuItemsLoggedOut}
            ${user ? `<div style="padding:8px 10px;color:#666;font-size:12px;border-top:1px solid #eee;margin-top:6px;">
              Sesión: ${role || '...'}
            </div>` : ''}
          </div>
        </div>

        <div class="banner-title">Bienvenido a Citas Ya</div>

        <a href="#/" class="banner-logo" aria-label="Ir al inicio">
          <img src="./assets/img/LogoCitasYa.png" alt="Citas Ya">
        </a>
      </div>
    </div>
  </header>

  <div class="container">
    <section>
      <h2>Barberías destacadas</h2>
      <ul class="home-public-list">${cards}</ul>
    </section>
    <footer style="text-align:center;margin-top:18px;">
      <p>Reserva servicios y gestiona tu agenda en minutos.</p>
    </footer>
  </div>

  <div class="legal-outside">
    Todos los derechos reservados © 2025<br>
    Citas Ya S.A.S - Nit 810.000.000-0
  </div>`;
}

export function onMount(){
  const menuBtn = document.getElementById('menuBtn');
  const dropdown = document.getElementById('dropdownMenu');

  function closeMenu(){ dropdown?.classList.remove('open'); }

  menuBtn?.addEventListener('click', (ev) => {
    ev.preventDefault();
    dropdown?.classList.toggle('open');
  });

  document.addEventListener('click', (ev) => {
    if (!dropdown || !menuBtn) return;
    const t = ev.target;
    if (dropdown.contains(t) || menuBtn.contains(t)) return;
    closeMenu();
  });

  dropdown?.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('[data-menu]');
    if (!btn) return;

    const action = btn.getAttribute('data-menu');
    closeMenu();

    if (action === 'login'){
      const { getUser } = await import('../../store/auth.js');
      if (getUser()) await AuthController.logout();
      navigate('/login');
      return;
    }

    if (action === 'register'){
      const { getUser } = await import('../../store/auth.js');
      if (getUser()) await AuthController.logout();
      navigate('/registro');
      return;
    }

    if (action === 'registerBiz'){
      navigate('/barbero/registrar-negocio');
      return;
    }

    if (action === 'perfil'){
      navigate('/perfil');
      return;
    }

    if (action === 'logout'){
      await AuthController.logout();
      navigate('/');
      return;
    }
  });
}
