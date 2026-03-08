import { navigate } from '../../router/index.js';
import { initAuth, getUser, getRole } from '../../store/auth.js';
import { AuthController } from '../../controllers/AuthController.js';
import { ClienteAppointmentsController } from '../../controllers/ClienteAppointmentsController.js';
import { BusinessService } from '../../services/BusinessService.js';
import { PersonalServicioModel } from '../../models/PersonalServicioModel.js';
import { ConjuntoHorarioModel } from '../../models/ConjuntoHorarioModel.js';
import { DiaHorarioModel } from '../../models/DiaHorarioModel.js';
import { AvailabilityService } from '../../services/AvailabilityService.js';

function normText(s = '') {
  return String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function dayIndexFromDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  const js = d.getDay();
  return js === 0 ? 6 : js - 1;
}

function pick(obj, keys, fallback = null) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
  }
  return fallback;
}

function toMin(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + m;
}

export default async function ClienteAgendarPublicoView({ query }) {
  const negocio = query.get('negocio') || '';

  return `
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600&display=swap" rel="stylesheet">

  <style>
        :root{
      --container-w: 920px;
      --container-pad: 20px;
      --container-bl: 4px;
      --banner-h: 64px;
      --page-sidepad: 16px;
      --banner-bg:#e6e9ee; --banner-bg-hover:#d7dbe3;

      /* Colores del proyecto */
      --c-primary:#5c6bc0;      /* morado botones */
      --c-primary-d:#3f51b5;
      --c-green:#66BB6A;        /* programar */
      --c-green-d:#57A05D;
      --c-red:#EF5350;          /* cancelar */
      --c-red-d:#D8433E;
      --c-text:#003366;
    }

    body{
      font-family:'Open Sans',sans-serif;
      background:#eee;
      margin:0;
      padding:20px;
      color:#333;
      padding-top:calc(var(--banner-h) + 8px);
    }
    .container{
      max-width:var(--container-w);
      margin:auto;
      padding:var(--container-pad);
      background:#fff;
      box-shadow:0 4px 8px rgba(0,0,0,.05);
      border-radius:10px;
      border-left:var(--container-bl) solid var(--c-primary);
    }
    h1{ text-align:center; font-size:30px; margin:.3rem 0 1.2rem; }
    label{ display:block; margin:10px 0 6px; color:var(--c-text); }
    input[type="text"], input[type="date"], select, textarea{
      width:100%; box-sizing:border-box; padding:12px; border:2px solid #ddd; border-radius:6px; font-size:16px;
    }
    textarea{ min-height:84px; resize:vertical; }

    /* Botones */
    .btn{ display:inline-block; border:none; color:#fff; font-weight:700; padding:14px 18px; border-radius:6px; cursor:pointer; }
    .w-75{ width:min(690px,75%); }
    .btn-center{ display:block; margin:12px auto; }
    .btn-pri{ background:var(--c-primary); }
    .btn-pri:hover{ background:var(--c-primary-d); }
    .btn-green{ background:var(--c-green); }
    .btn-green:hover{ background:var(--c-green-d); }
    .btn-red{ background:var(--c-red); }
    .btn-red:hover{ background:var(--c-red-d); }

    .row-2{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; width:min(690px,75%); margin:12px auto; }
    @media (max-width:680px){ .row-2{ grid-template-columns:1fr; width:100%; } .w-75{ width:100%; } }

    .hint{ color:#666; font-size:14px; margin-top:6px; }

    /* Banner (mismo ancho visual que el card) */
    .app-banner{ position:fixed; top:0; left:0; right:0; height:var(--banner-h); z-index:9999; background:transparent; }
    .app-banner .banner-box{
      height:100%;
      width:min(calc(var(--container-w) + var(--container-pad)*2 + var(--container-bl)), calc(100% - var(--page-sidepad)*2));
      margin:0 auto; background:var(--banner-bg); border-bottom:1px solid rgba(0,0,0,.06); border-radius:10px;
      display:flex; align-items:center; transition:background .2s;
    }
    .app-banner .banner-box:hover{ background:var(--banner-bg-hover); }
    .app-banner .banner-inner{
      position: relative;
      display:grid;
      grid-template-columns:auto 1fr auto;
      align-items:center;
      gap:10px;
      width:100%;
      padding:0 12px;
    }
    .banner-logo img{ width:52px; display:block; }
    /* Menú hamburguesa */
    .burger{ width:42px; height:42px; border-radius:8px; display:inline-grid; place-items:center; border:1px solid #bfc9d9; background:#fff; cursor:pointer; }
    .burger span{ display:block; width:18px; height:2px; background:#333; margin:3px 0; }
    .menu{ position:absolute; top:calc(var(--banner-h) - 6px); left:12px; background:#fff; box-shadow:0 10px 30px rgba(0,0,0,.15); border-radius:10px; padding:8px; display:none; }
    .menu a{ display:block; padding:10px 14px; border-radius:8px; color:#233247; text-decoration:none; font-weight:600; }
    .menu a:hover{ background:#f2f4f8; }

    /* Modal de acceso */
    .modal{ position:fixed; inset:0; background:rgba(0,0,0,.35); display:none; align-items:center; justify-content:center; z-index:10000; }
    .modal .box{ width:min(520px, 92vw); background:#fff; border-radius:12px; padding:18px; box-shadow:0 14px 38px rgba(0,0,0,.25); }
    .modal h3{ margin:0 0 6px; }
    .modal p{ margin:6px 0 12px; color:#444; }
    .modal .actions{ display:flex; gap:10px; justify-content:flex-end; flex-wrap:wrap; }
    .modal .actions .btn{ min-width:180px; }

    /* Modal Buscar por mapa */
    .map-modal{ position:fixed; inset:0; background:rgba(0,0,0,.45); display:none; align-items:center; justify-content:center; z-index:10000; }
    .map-modal .box{ background:#fff; width:min(900px,95%); border-radius:10px; padding:16px; box-shadow:0 8px 24px rgba(0,0,0,.2); }
    .map-grid{ display:grid; grid-template-columns: 1fr auto auto; gap:8px; align-items:center; }

    /* Legal fuera del card */
    .legal-outside{ margin:18px auto 24px; padding:10px 12px; max-width:calc(var(--container-w) + var(--container-pad)*2 + var(--container-bl)); text-align:center; color:#666; font-size:14px; line-height:1.35; }
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
         <nav id="menu" class="menu" aria-label="Menú rápido"></nav>
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
    Todos los derechos reservados © 2026<br>
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
  const state = {
    negocios: [],
    negocioSel: null,
    personal: [],
    servicios: [],
    serviciosFiltrados: []
  };

  const burger = document.getElementById('btn_burger');
  const menu = document.getElementById('menu');
  const modal = document.getElementById('modalAuth');

  const asistente = document.getElementById('asistente');
  const bizName = document.getElementById('bizName');
  const bizlist = document.getElementById('bizlist');
  const barbero = document.getElementById('barbero');
  const servicio = document.getElementById('servicio');
  const duracionHint = document.getElementById('duracionHint');
  const fecha = document.getElementById('fecha');
  const timeSel = document.getElementById('timeSel');
  const timeHelp = document.getElementById('timeHelp');
  const resumen = document.getElementById('resumen');

  const modalMap = document.getElementById('modalMap');
  const bizList = document.getElementById('bizList');

  const openModal = () => { if (modal) modal.style.display = 'flex'; };
  const closeModal = () => { if (modal) modal.style.display = 'none'; };

  function updateSummary() {
    const bizTxt = state.negocioSel?.nombre || '—';
    const staffTxt = barbero.options[barbero.selectedIndex]?.textContent || '—';
    const svcTxt = servicio.options[servicio.selectedIndex]?.textContent || '—';
    const dateTxt = fecha.value || '—';
    const timeTxt = timeSel.value || '—';
    resumen.value = [
      `Asistente: ${asistente.value || '—'}`,
      `Barbería: ${bizTxt}`,
      `Barbero: ${staffTxt}`,
      `Servicio: ${svcTxt}`,
      `Fecha: ${dateTxt}`,
      `Hora: ${timeTxt}`
    ].join('\n');
  }

  function resetServiciosYHoras() {
    state.serviciosFiltrados = [];
    servicio.innerHTML = '<option value="">— Seleccione —</option>';
    duracionHint.textContent = 'Duración: —';
    timeSel.disabled = true;
    timeSel.innerHTML = '<option value="">— Selecciona fecha, servicio y barbero —</option>';
    timeHelp.textContent = '';
  }

  function resetBarberos() {
    state.personal = [];
    barbero.innerHTML = '<option value="">— Seleccione —</option>';
    resetServiciosYHoras();
  }

  async function getHorarioDia(personalId, dateStr) {
    const { data: conjuntos, error: cErr } = await ConjuntoHorarioModel.listByPersonal(personalId);
    if (cErr) throw cErr;
    const last = Array.isArray(conjuntos) && conjuntos.length ? conjuntos[conjuntos.length - 1] : null;
    if (!last?.id) return null;

    const { data: dias, error: dErr } = await DiaHorarioModel.listByConjunto(last.id);
    if (dErr) throw dErr;
    if (!Array.isArray(dias) || !dias.length) return null;

    const idx = dayIndexFromDate(dateStr);
    const dia = dias.find((d) => {
      const v = Number(pick(d, ['dia_id', 'dia_semana', 'dia', 'dia_idx'], -999));
      return v === idx || v === (idx + 1);
    });
    return dia || null;
  }

  async function buildSlots({ personalId, dateStr, duracionMin }) {
    const dia = await getHorarioDia(personalId, dateStr);
    if (!dia) return { slots: [], msg: 'No hay horario publicado para ese barbero.' };

    const trabaja = Boolean(pick(dia, ['trabaja', 'work', 'activo'], false));
    if (!trabaja) return { slots: [], msg: 'Ese barbero no trabaja ese día.' };

    const inicio = pick(dia, ['hora_inicio', 'inicio', 'start'], null);
    const fin = pick(dia, ['hora_fin', 'fin', 'end'], null);
    if (!inicio || !fin) return { slots: [], msg: 'Horario incompleto para ese día.' };

    const almI = pick(dia, ['almuerzo_inicio', 'inicio_almuerzo', 'lunch_start'], '');
    const almF = pick(dia, ['almuerzo_fin', 'fin_almuerzo', 'lunch_end'], '');

    const startMin = toMin(inicio);
    const endMin = toMin(fin);
    const lunchStart = almI ? toMin(almI) : null;
    const lunchEnd = almF ? toMin(almF) : null;

    const candidates = [];
    for (let m = startMin; m + duracionMin <= endMin; m += 10) {
      if (lunchStart !== null && lunchEnd !== null) {
        const slotEnd = m + duracionMin;
        const overlapsLunch = m < lunchEnd && slotEnd > lunchStart;
        if (overlapsLunch) continue;
      }
      const hh = String(Math.floor(m / 60)).padStart(2, '0');
      const mm = String(m % 60).padStart(2, '0');
      candidates.push(`${hh}:${mm}`);
    }

    const freeSlots = [];
    for (const hhmm of candidates) {
      const startISO = new Date(`${dateStr}T${hhmm}:00`).toISOString();
      const ok = await AvailabilityService.isFree(Number(personalId), startISO, Number(duracionMin));
      if (ok) freeSlots.push(hhmm);
    }

    return { slots: freeSlots, msg: freeSlots.length ? '' : 'No hay horas disponibles para esa fecha.' };
  }

  async function refreshSlots() {
    const personalId = Number(barbero.value || 0);
    const servicioId = Number(servicio.value || 0);
    const dateStr = fecha.value;

    if (!personalId || !servicioId || !dateStr) {
      timeSel.disabled = true;
      timeSel.innerHTML = '<option value="">— Selecciona fecha, servicio y barbero —</option>';
      timeHelp.textContent = '';
      return;
    }

    const svc = state.serviciosFiltrados.find((s) => Number(s.id) === servicioId);
    const durMin = Number(svc?.duracion_min || 0);
    if (!durMin) {
      timeSel.disabled = true;
      timeSel.innerHTML = '<option value="">— Servicio sin duración —</option>';
      timeHelp.textContent = '';
      return;
    }

    timeSel.disabled = true;
    timeSel.innerHTML = '<option value="">Cargando horas…</option>';
    timeHelp.textContent = '';

    try {
      const { slots, msg } = await buildSlots({ personalId, dateStr, duracionMin: durMin });
      timeHelp.textContent = msg || '';
      if (!slots.length) {
        timeSel.disabled = true;
        timeSel.innerHTML = '<option value="">— Sin disponibilidad —</option>';
        return;
      }
      timeSel.disabled = false;
      timeSel.innerHTML = '<option value="">— Selecciona una hora —</option>' + slots.map((h) => `<option value="${h}">${h}</option>`).join('');
    } catch (e) {
      console.error('Error cargando disponibilidad:', e);
      timeSel.disabled = true;
      timeSel.innerHTML = '<option value="">— Sin disponibilidad —</option>';
      timeHelp.textContent = 'No fue posible cargar horarios disponibles.';
    }
  }

  async function loadServiciosByBarbero(personalId) {
    resetServiciosYHoras();
    if (!personalId) return;

    try {
      const { data: rel, error: relErr } = await PersonalServicioModel.listByPersonal(Number(personalId));
      if (relErr) throw relErr;

      const ids = new Set((rel || []).map((r) => Number(r.servicio_id)));
      state.serviciosFiltrados = (state.servicios || []).filter((s) => ids.has(Number(s.id)) && s.activo !== false);

      servicio.innerHTML = '<option value="">— Seleccione —</option>' + state.serviciosFiltrados
        .map((s) => `<option value="${s.id}">${s.nombre}</option>`)
        .join('');
    } catch (e) {
      console.error('Error cargando servicios por barbero:', e);
      alert('No se pudieron cargar los servicios del barbero seleccionado.');
    }
  }

  async function loadResourcesForBiz(negocioId) {
    resetBarberos();
    if (!negocioId) return;

    try {
      const { personal, servicios, error } = await BusinessService.detailWithResources(negocioId);
      if (error) throw error;

      state.personal = (personal || []).filter((p) => p?.id && p.activo !== false);
      state.servicios = (servicios || []).filter((s) => s?.id && s.activo !== false);

      barbero.innerHTML = '<option value="">— Seleccione —</option>' + state.personal
        .map((p) => `<option value="${p.id}">${p.nombre_publico || `Barbero #${p.id}`}</option>`)
        .join('');
    } catch (e) {
      console.error('Error cargando personal/servicios:', e);
      alert('No se pudieron cargar los recursos de la barbería.');
    }
  }

  function findBusinessByInput() {
    const target = normText(bizName.value);
    return state.negocios.find((n) => normText(n.nombre) === target) || null;
  }

  async function loadPublicBusinesses() {
    try {
      const { data, error } = await BusinessService.listPublic();
      if (error) throw error;
      state.negocios = (data || []).filter((n) => n?.id && n?.nombre);

      bizlist.innerHTML = state.negocios
        .map((n) => `<option value="${String(n.nombre).replace(/"/g, '&quot;')}">`)
        .join('');

      bizList.innerHTML = state.negocios
        .map((n) => {
          const mapUrl = (n.latitud != null && n.longitud != null)
            ? `https://www.google.com/maps?q=${n.latitud},${n.longitud}`
            : '';
          return `
            <div>${n.nombre}</div>
            <button type="button" class="btn btn-pri" data-pick-biz="${n.id}" style="width:auto;padding:8px 12px;">Seleccionar</button>
            ${mapUrl ? `<a class="btn btn-green" href="${mapUrl}" target="_blank" rel="noreferrer" style="width:auto;padding:8px 12px;text-decoration:none;">Ver en mapa</a>` : `<span class="hint">Sin ubicación</span>`}
          `;
        })
        .join('');

      const pre = findBusinessByInput();
      if (pre) {
        state.negocioSel = pre;
        await loadResourcesForBiz(pre.id);
      }
    } catch (e) {
      console.error('Error cargando barberías públicas:', e);
      alert('No fue posible cargar las barberías disponibles.');
    }
  }

  burger?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!menu) return;
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  });
  menu?.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', () => { if (menu) menu.style.display = 'none'; });

  (async () => {
    await initAuth();

    const user = getUser();
    const role = getRole();
    if (!menu) return;

    if (!user) {
      menu.innerHTML = `
        <a href="#" data-action="login">Iniciar sesión</a>
        <a href="#" data-action="register">Registrarme</a>
        <a href="#" data-action="registerBiz">Registrar mi negocio</a>
      `;
    } else {
      menu.innerHTML = `
        <a href="#" data-action="login">Iniciar sesión</a>
        <a href="#" data-action="register">Registrarme</a>
        <a href="#" data-action="registerBiz">Registrar mi negocio</a>
        <a href="#" data-action="perfil">Mi perfil</a>
        <a href="#" data-action="logout" style="color:#b00020;">Cerrar sesión</a>
      `;
    }

    menu.querySelectorAll('[data-action]').forEach((a) => {
      a.addEventListener('click', async (ev) => {
        ev.preventDefault();
        const action = a.getAttribute('data-action');
        if (menu) menu.style.display = 'none';

        if (action === 'login') {
          if (getUser()) await AuthController.logout();
          navigate('/login');
          return;
        }

        if (action === 'register') {
          if (getUser()) await AuthController.logout();
          navigate('/registro');
          return;
        }

        if (action === 'registerBiz') {
          if (!getUser()) { navigate('/login'); return; }
          if (role !== 'barbero') { navigate('/'); return; }
          navigate('/barbero/registrar-negocio');
          return;
        }

        if (action === 'perfil') {
          navigate('/perfil');
          return;
        }

        if (action === 'logout') {
          await AuthController.logout();
          navigate('/');
        }
      });
    });
  })();

  document.getElementById('btn_programar')?.addEventListener('click', async (ev) => {
    ev.preventDefault();

    await initAuth();
    const user = getUser();
    const role = getRole();

    if (!user) {
      openModal();
      return;
    }
    if (role !== 'usuario') {
      alert('Solo los usuarios cliente pueden programar citas.');
      return;
    }

    const negocioId = Number(state.negocioSel?.id || 0);
    const personalId = Number(barbero.value || 0);
    const servicioId = Number(servicio.value || 0);
    const dateStr = fecha.value;
    const hhmm = timeSel.value;

    if (!negocioId) return alert('Selecciona una barbería válida.');
    if (!personalId) return alert('Selecciona un barbero.');
    if (!servicioId) return alert('Selecciona un servicio.');
    if (!dateStr) return alert('Selecciona la fecha de la cita.');
    if (!hhmm) return alert('Selecciona la hora de la cita.');

    const svc = state.serviciosFiltrados.find((s) => Number(s.id) === servicioId);
    const durMin = Number(svc?.duracion_min || 0);
    if (!durMin) return alert('El servicio no tiene duración válida.');

    try {
      const startISO = new Date(`${dateStr}T${hhmm}:00`).toISOString();
      const free = await AvailabilityService.isFree(personalId, startISO, durMin);
      if (!free) {
        alert('Esa hora ya no está disponible. Selecciona otra.');
        await refreshSlots();
        return;
      }

      const payload = {
        negocio_id: negocioId,
        personal_id: personalId,
        servicio_id: servicioId,
        inicia_en: startISO
      };
      const nombreAsistente = (asistente.value || '').trim();
      if (nombreAsistente) payload.nombre_invitado = nombreAsistente;

      await ClienteAppointmentsController.agendar(payload);
      alert('Cita programada correctamente.');
      navigate('/cliente/cancelar');
    } catch (e) {
      console.error('Error programando cita pública:', e);
      alert(`No se pudo programar la cita. ${e?.message || ''}`.trim());
    }
  });

  document.getElementById('btn_comentario')?.addEventListener('click', async (ev) => {
    ev.preventDefault();
    await initAuth();
    if (!getUser()) { openModal(); return; }
    navigate('/comentarios');
  });

  document.getElementById('btn_cancelar')?.addEventListener('click', async (ev) => {
    ev.preventDefault();
    await initAuth();
    if (!getUser()) { openModal(); return; }
    if (getRole() !== 'usuario') { alert('Solo los usuarios cliente pueden cancelar/reagendar citas.'); return; }
    navigate('/cliente/cancelar');
  });

  document.getElementById('m_login')?.addEventListener('click', () => navigate('/login'));
  document.getElementById('m_reg')?.addEventListener('click', () => navigate('/registro'));
  document.getElementById('m_close')?.addEventListener('click', closeModal);

  const dontKnow = document.getElementById('dontKnow');
  const btnMap = document.getElementById('btnMap');
  const closeMap = document.getElementById('closeMap');

  dontKnow?.addEventListener('change', () => {
    if (btnMap) btnMap.style.display = dontKnow.checked ? 'inline-block' : 'none';
  });
  btnMap?.addEventListener('click', () => { if (modalMap) modalMap.style.display = 'flex'; });
  closeMap?.addEventListener('click', () => { if (modalMap) modalMap.style.display = 'none'; });
  modalMap?.addEventListener('click', (e) => { if (e.target === modalMap) modalMap.style.display = 'none'; });

  bizList?.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-pick-biz]');
    if (!btn) return;
    const id = Number(btn.getAttribute('data-pick-biz'));
    const b = state.negocios.find((n) => Number(n.id) === id);
    if (!b) return;
    state.negocioSel = b;
    bizName.value = b.nombre;
    if (modalMap) modalMap.style.display = 'none';
    await loadResourcesForBiz(b.id);
    updateSummary();
  });

  bizName?.addEventListener('change', async () => {
    state.negocioSel = findBusinessByInput();
    resetBarberos();
    if (state.negocioSel?.id) {
      await loadResourcesForBiz(state.negocioSel.id);
    }
    updateSummary();
  });
  bizName?.addEventListener('blur', async () => {
    state.negocioSel = findBusinessByInput();
    if (!state.negocioSel) {
      resetBarberos();
    }
    updateSummary();
  });

  barbero?.addEventListener('change', async () => {
    await loadServiciosByBarbero(barbero.value);
    updateSummary();
  });

  servicio?.addEventListener('change', async () => {
    const svc = state.serviciosFiltrados.find((s) => Number(s.id) === Number(servicio.value));
    duracionHint.textContent = svc?.duracion_min ? `Duración: ${svc.duracion_min} min` : 'Duración: —';
    await refreshSlots();
    updateSummary();
  });

  fecha?.addEventListener('change', async () => {
    await refreshSlots();
    updateSummary();
  });

  timeSel?.addEventListener('change', updateSummary);
  asistente?.addEventListener('input', updateSummary);

  loadPublicBusinesses();
  updateSummary();
}