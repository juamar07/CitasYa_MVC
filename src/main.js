// src/main.js
import { initAuth, getUser, getRole } from './store/auth.js';
import { AuthController } from './controllers/AuthController.js';
import { navigate } from './router/index.js';
import { startRouter } from './router/index.js';

async function renderGlobalMenu(){
  await initAuth();
  const user = getUser();
  const role = getRole();

  const dropdown = document.getElementById('globalDropdownMenu');
  if (!dropdown) return;

  const menuLoggedOut = `
    <button class="menu-item" data-menu="login">Iniciar sesión</button>
    <button class="menu-item" data-menu="register">Registrarme</button>
    <button class="menu-item" data-menu="registerBiz">Registrar mi negocio</button>
  `;

  const menuLoggedIn = `
    <button class="menu-item" data-menu="login">Iniciar sesión</button>
    <button class="menu-item" data-menu="register">Registrarme</button>
    <button class="menu-item" data-menu="registerBiz">Registrar mi negocio</button>
    <button class="menu-item" data-menu="perfil">Mi perfil</button>
    <button class="menu-item danger" data-menu="logout">Cerrar sesión</button>
    <div style="padding:8px 10px;color:#666;font-size:12px;border-top:1px solid #eee;margin-top:6px;">
      Sesión: ${role || '...'}
    </div>
  `;

  dropdown.innerHTML = user ? menuLoggedIn : menuLoggedOut;
}

function bindGlobalMenu(){
  const menuBtn = document.getElementById('globalMenuBtn');
  const dropdown = document.getElementById('globalDropdownMenu');

  if (!menuBtn || !dropdown) return;

  function closeMenu(){ dropdown.classList.remove('open'); }

  menuBtn.addEventListener('click', (ev) => {
    ev.preventDefault();
    dropdown.classList.toggle('open');
  });

  document.addEventListener('click', (ev) => {
    const t = ev.target;
    if (dropdown.contains(t) || menuBtn.contains(t)) return;
    closeMenu();
  });

  dropdown.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('[data-menu]');
    if (!btn) return;

    const action = btn.getAttribute('data-menu');
    closeMenu();

    // login / register => logout automático si había sesión
    if (action === 'login'){
      if (getUser()) await AuthController.logout();
      navigate('/login');
      await renderGlobalMenu();
      return;
    }

    if (action === 'register'){
      if (getUser()) await AuthController.logout();
      navigate('/registro');
      await renderGlobalMenu();
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
      await renderGlobalMenu();
      return;
    }
  });

  // cuando navegas, actualiza menú (y también cierra el dropdown)
  window.addEventListener('hashchange', () => {
    closeMenu();
    renderGlobalMenu();
  });
}

// ✅ IMPORTANTE: esperar a que exista el DOM del layout
window.addEventListener('DOMContentLoaded', async () => {
  // 1) engancha menú global (header existe en main.html)
  bindGlobalMenu();
  await renderGlobalMenu();

  // 2) arranca el router => renderiza la primera vista (esto evita la pantalla en blanco)
  startRouter();
});
