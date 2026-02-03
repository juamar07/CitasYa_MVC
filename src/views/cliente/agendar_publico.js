import { navigate } from '../../router/index.js';

export default async function ClienteAgendarPublicoView({ query }) {
  const negocio = query.get('negocio') || '';

  return `
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600&display=swap" rel="stylesheet">

  <style>
    ${/* === Pega AQUÍ TODO el CSS de :root hasta .legal-outside del MVP === */''}
  </style>

  <!-- Banner -->
  <header class="app-banner" role="banner">
    <div class="banner-box">
      <div class="banner-inner">
        <!-- Menú hamburguesa -->
        <button id="btn_burger" class="burger" aria-label="Abrir menú">
          <span></span><span></span><span></span>
        </button>

        <div class="banner-title">Bienvenido a Citas Ya</div>

        <!-- ✅ Logo con ruta correcta (GitHub Pages) -->
        <a class="banner-logo" href="#/">
          <img src="assets/img/LogoCitasYa.png" alt="Citas Ya">
        </a>

        <!-- menú contextual -->
        <nav id="menu" class="menu" aria-label="Menú rápido">
          <a href="#" data-go="/login">Iniciar sesión</a>
          <a href="#" data-go="/registro">Registrarme</a>
          <a href="#" data-go="/barbero/registrar-negocio">Registrar mi negocio</a>
        </nav>
      </div>
    </div>
  </header>

  <div class="container">
    <h1>Programación de Citas</h1>

    <label>Ingrese nombre completo del asistente</label>
    <input type="text" id="asistente">

    <label>Ingrese el nombre del establecimiento</label>
    <input type="text" id="bizName" list="bizlist" placeholder="Escribe el nombre" value="${negocio}">
    <datalist id="bizlist"></datalist>

    <div style="display:flex; align-items:center; gap:10px; margin-top:8px;">
      <label style="display:flex; align-items:center; gap:8px; margin:0;">
        <input type="checkbox" id="dontKnow"> ¿No recuerda el nombre del establecimiento?
      </label>
      <button type="button" id="btnMap" class="btn btn-pri" style="width:auto; display:none; margin:0;">Buscar por mapa</button>
    </div>
    <div class="hint">La búsqueda ignora mayúsculas y acentos.</div>

    <label>Seleccione el servicio</label>
    <select id="servicio"><option value="">— Seleccione —</option></select>
    <div id="duracionHint" class="hint">Duración: —</div>

    <label>Seleccione el barbero</label>
    <select id="barbero"><option value="">— Seleccione —</option></select>

    <div class="row-2">
      <div>
        <label>Seleccione la fecha de la cita</label>
        <input type="date" id="fecha">
      </div>
      <div>
        <label>Seleccione la hora de la cita</label>
        <select id="timeSel" disabled>
          <option value="">— Selecciona fecha, servicio y barbero —</option>
        </select>
        <div id="timeHelp" class="hint"></div>
      </div>
    </div>

    <button id="btn_programar" class="btn btn-green w-75 btn-center">Programar cita</button>

    <textarea id="resumen" class="w-75 btn-center" style="width:100%;min-height:68px;" placeholder="Aquí verás el resumen de tu cita…"></textarea>

    <div class="row-2">
      <button id="btn_comentario" class="btn btn-pri">Déjanos tu comentario</button>
      <button id="btn_cancelar" class="btn btn-red">Cancelar una cita</button>
    </div>

    <p class="hint" style="text-align:center;margin-top:18px;">Reserva y gestiona tu agenda en minutos.</p>
  </div>

  <div class="legal-outside">
    Todos los derechos reservados © 2025<br>
    Citas Ya S.A.S - Nit 810.000.000-0
  </div>

  <!-- Modal de acceso -->
  <div id="modalAuth" class="modal" role="dialog" aria-modal="true" aria-labelledby="ttlAuth">
    <div class="box">
      <h3 id="ttlAuth">Antes de continuar</h3>
      <p>Para completar esta acción, por favor inicia sesión o regístrate.</p>
      <div class="actions">
        <button id="m_reg" class="btn btn-pri">Registrarme</button>
        <button id="m_login" class="btn btn-green">Iniciar sesión</button>
        <button id="m_close" class="btn btn-red">Cerrar</button>
      </div>
    </div>
  </div>

  <!-- Modal Buscar por mapa (solo UI por ahora; no cambia estética) -->
  <div id="modalMap" class="map-modal" aria-modal="true" role="dialog">
    <div class="box">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <h3 style="margin:0;">Buscar establecimiento</h3>
        <button id="closeMap" class="btn btn-red" style="width:auto; margin:0;">Cerrar</button>
      </div>
      <p class="hint" style="margin-top:-6px;">Selecciona tu barbería de la lista o abre su ubicación en el mapa.</p>
      <div id="bizList" class="map-grid"></div>
      <p class="hint" style="margin-top:8px;">* “Ver en mapa” abre Google Maps con la ubicación registrada (si tiene lat/lng).</p>
    </div>
  </div>
  `;
}

export function onMount() {
  // Menú hamburguesa
  const burger = document.getElementById('btn_burger');
  const menu = document.getElementById('menu');
  burger?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!menu) return;
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
  });
  document.addEventListener('click', () => { if (menu) menu.style.display = 'none'; });

  // Navegación del menú
  document.querySelectorAll('#menu [data-go]').forEach(a => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      const to = a.getAttribute('data-go');
      if (to) navigate(to);
    });
  });

  // Modal login (obligatorio para Programar / Comentario / Cancelar)
  const modal = document.getElementById('modalAuth');
  const openModal = () => { if (modal) modal.style.display = 'flex'; };
  const closeModal = () => { if (modal) modal.style.display = 'none'; };

  document.getElementById('btn_programar')?.addEventListener('click', (ev) => { ev.preventDefault(); openModal(); });
  document.getElementById('btn_comentario')?.addEventListener('click', (ev) => { ev.preventDefault(); openModal(); });
  document.getElementById('btn_cancelar')?.addEventListener('click', (ev) => { ev.preventDefault(); openModal(); });

  document.getElementById('m_login')?.addEventListener('click', () => navigate('/login'));
  document.getElementById('m_reg')?.addEventListener('click', () => navigate('/registro'));
  document.getElementById('m_close')?.addEventListener('click', closeModal);

  // Modal mapa (solo abrir/cerrar UI)
  const dontKnow = document.getElementById('dontKnow');
  const btnMap = document.getElementById('btnMap');
  const modalMap = document.getElementById('modalMap');
  const closeMap = document.getElementById('closeMap');

  dontKnow?.addEventListener('change', () => {
    if (btnMap) btnMap.style.display = dontKnow.checked ? 'inline-block' : 'none';
  });
  btnMap?.addEventListener('click', () => { if (modalMap) modalMap.style.display = 'flex'; });
  closeMap?.addEventListener('click', () => { if (modalMap) modalMap.style.display = 'none'; });
  modalMap?.addEventListener('click', (e) => { if (e.target === modalMap) modalMap.style.display = 'none'; });
}
