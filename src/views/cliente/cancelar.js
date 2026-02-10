// src/views/cliente/cancelar.js
import { navigate } from '../../router/index.js';
import { getUsuarioId } from '../../store/auth.js';
import { CitaModel } from '../../models/CitaModel.js';
import { CancelacionCitaModel } from '../../models/CancelacionCitaModel.js';
import { AppointmentService } from '../../services/AppointmentService.js';
import { AvailabilityService } from '../../services/AvailabilityService.js';
import { BusinessService } from '../../services/BusinessService.js';
import { ConjuntoHorarioModel } from '../../models/ConjuntoHorarioModel.js';
import { DiaHorarioModel } from '../../models/DiaHorarioModel.js';

function esc(s=''){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

function pick(obj, keys, fallback=null){
  for (const k of keys){
    if (obj && obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
  }
  return fallback;
}

function toLocalDateValue(iso){
  if (!iso) return '';
  return String(iso).slice(0,10);
}
function toLocalTimeValue(iso){
  if (!iso) return '';
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2,'0');
  const mm = String(d.getMinutes()).padStart(2,'0');
  return `${hh}:${mm}`;
}
function dayIndexFromDate(dateStr){
  // JS: 0=Dom..6=Sáb  -> lo convertimos a 0=Lun..6=Dom como en tu mi_agenda
  const d = new Date(dateStr + 'T00:00:00');
  const js = d.getDay(); // 0..6
  return (js === 0) ? 6 : (js - 1);
}

function addMinutesHHMM(hhmm, minutes){
  const [h,m] = hhmm.split(':').map(Number);
  const d = new Date(2000,0,1,h,m,0);
  d.setMinutes(d.getMinutes() + minutes);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function toMin(hhmm){
  const [h,m] = hhmm.split(':').map(Number);
  return h*60+m;
}
function within(a, b, x){ // a<=x<b (minutos)
  return x >= a && x < b;
}

async function resolveCancelStateId(){
  // intentamos nombres comunes (sin asumir uno solo)
  const candidates = ['cancelada', 'cancelado', 'cancelar', 'anulada', 'anulado'];
  let lastErr = null;
  for (const name of candidates){
    try{
      const id = await AppointmentService._estadoId(name);
      if (id) return id;
    }catch(e){ lastErr = e; }
  }
  throw lastErr || new Error('No se pudo resolver estado_id de cancelación en estado_cita.');
}

function formatCitaLine(c){
  const biz = c?.negocios?.nombre ?? `Negocio ${c.negocio_id}`;
  const svc = c?.servicios?.nombre ?? `Servicio ${c.servicio_id}`;
  const staff = c?.personal?.nombre_publico ?? `Barbero ${c.personal_id}`;
  const date = toLocalDateValue(c.inicia_en || c.fecha);
  const start = toLocalTimeValue(c.inicia_en);
  const end = toLocalTimeValue(c.termina_en);
  return `${biz} · ${svc} · ${staff}\n${date} ${start}-${end}`;
}

async function getHorarioDia(personalId, dateStr){
  const { data: conjuntos } = await ConjuntoHorarioModel.listByPersonal(personalId); // :contentReference[oaicite:6]{index=6}
  const last = Array.isArray(conjuntos) && conjuntos.length ? conjuntos[conjuntos.length - 1] : null;
  if (!last?.id) return null;

  const { data: dias } = await DiaHorarioModel.listByConjunto(last.id); // :contentReference[oaicite:7]{index=7}
  if (!Array.isArray(dias) || !dias.length) return null;

  const idx = dayIndexFromDate(dateStr);

  // buscamos el registro del día con varios nombres posibles
  const dia = dias.find(d => {
    const v = Number(pick(d, ['dia_id','dia_semana','dia','dia_idx'], -999));
    return v === idx;
  });

  return dia || null;
}

async function buildSlots({ personalId, dateStr, duracionMin }){
  const dia = await getHorarioDia(personalId, dateStr);
  if (!dia) return { slots: [], msg: 'No hay horario publicado para ese barbero.' };

  const trabaja = Boolean(pick(dia, ['trabaja','work','activo'], false));
  if (!trabaja) return { slots: [], msg: 'Ese barbero no trabaja ese día.' };

  const inicio = pick(dia, ['hora_inicio','inicio','start'], null);
  const fin = pick(dia, ['hora_fin','fin','end'], null);
  if (!inicio || !fin) return { slots: [], msg: 'Horario incompleto para ese día.' };

  const almI = pick(dia, ['almuerzo_inicio','inicio_almuerzo','lunch_start'], '');
  const almF = pick(dia, ['almuerzo_fin','fin_almuerzo','lunch_end'], '');

  const startMin = toMin(inicio);
  const endMin = toMin(fin);
  const lunchStart = almI ? toMin(almI) : null;
  const lunchEnd = almF ? toMin(almF) : null;

  // slots cada 10 min
  const step = 10;
  const candidates = [];
  for (let m = startMin; m + duracionMin <= endMin; m += step){
    // excluir almuerzo si aplica
    if (lunchStart !== null && lunchEnd !== null){
      const slotEnd = m + duracionMin;
      const overlapsLunch = (m < lunchEnd) && (slotEnd > lunchStart);
      if (overlapsLunch) continue;
    }
    const hh = String(Math.floor(m/60)).padStart(2,'0');
    const mm = String(m%60).padStart(2,'0');
    candidates.push(`${hh}:${mm}`);
  }

  // validar contra citas existentes
  const freeSlots = [];
  for (const hhmm of candidates){
    const startISO = new Date(`${dateStr}T${hhmm}:00`).toISOString();
    const ok = await AvailabilityService.isFree(personalId, startISO, duracionMin); // 
    if (ok) freeSlots.push(hhmm);
  }

  return { slots: freeSlots, msg: freeSlots.length ? '' : 'No hay horas disponibles para esa fecha.' };
}

export default async function ClienteCancelarView(){
  // UI MVP (CSS incluido, scoped)
  return `
  <style>
    .cancelar-page{
      --container-w: 920px;
      --container-pad: 20px;
      --container-bl: 4px;

      --banner-h: 64px;
      --page-sidepad: 16px;
      --banner-bg: #e6e9ee;
      --banner-bg-hover: #d7dbe3;

      font-family: 'Open Sans', sans-serif;
      background:#eeeeee;
      margin:0;
      padding:20px;
      color:#333;
      padding-top: calc(var(--banner-h) + 8px);
      min-height: calc(100vh - 40px);
    }
    .cancelar-page .container{
      max-width: var(--container-w);
      margin: 0 auto;
      padding: var(--container-pad);
      background:#fff;
      border-radius:10px;
      box-shadow:0 4px 8px rgba(0,0,0,.05);
      border-left: var(--container-bl) solid #5c6bc0;
    }
    .cancelar-page h1{ text-align:center; margin:0 0 14px; font-weight:700; color:#000; }
    .cancelar-page h2{ margin:18px 0 10px; font-weight:700; color:#000; }
    .cancelar-page h3{ margin:12px 0 8px; color:#233247; }
    .cancelar-page label{ display:block; margin:8px 0 4px; color:#003366; }
    .cancelar-page .muted{ color:#666; font-size:14px; }

    .cancelar-page input[type="text"], .cancelar-page input[type="date"],
    .cancelar-page select, .cancelar-page textarea{
      width:100%; padding:10px; border:2px solid #ddd; border-radius:6px; font-size:16px;
      transition: border-color .2s; box-sizing:border-box;
    }
    .cancelar-page input:focus, .cancelar-page select:focus, .cancelar-page textarea:focus{
      outline:none; border-color:#7da2a9;
    }

    .cancelar-page .row{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
    .cancelar-page .two-btns{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
    .cancelar-page .wide75{ width:75%; margin:12px auto; }
    @media (max-width:768px){
      .cancelar-page .row, .cancelar-page .two-btns{ grid-template-columns: 1fr; }
      .cancelar-page .wide75{ width:100%; }
    }

    .cancelar-page .btn{
      display:block; border:none; border-radius:6px; padding:12px 18px; color:#fff; font-weight:700; cursor:pointer;
      transition: background-color .2s, transform .2s; width:100%; margin:10px 0; font-size:16px;
    }
    .cancelar-page .btn:hover{ transform: translateY(-1px); }
    .cancelar-page .btn-green{ background:#66bb6a; } .cancelar-page .btn-green:hover{ background:#43a047; }
    .cancelar-page .btn-blue{  background:#5c6bc0; } .cancelar-page .btn-blue:hover{  background:#3f51b5; }
    .cancelar-page .btn-red{   background:#ef5350; } .cancelar-page .btn-red:hover{   background:#e53935; }

    .cancelar-page .card{
      border:1px dashed #bdbdbd; border-radius:8px; padding:12px; background:#fafafa; margin:8px 0 12px;
    }

    .cancelar-page textarea{ min-height:150px; resize:vertical; }

    .cancelar-page .app-banner{ position:fixed; top:0; left:0; right:0; height:var(--banner-h); z-index:9999; background:transparent; }
    .cancelar-page .app-banner .banner-box{
      height:100%;
      width:min(calc(var(--container-w) + var(--container-pad)*2 + var(--container-bl)), calc(100% - var(--page-sidepad)*2));
      margin:0 auto; background:var(--banner-bg); border-bottom:1px solid rgba(0,0,0,.06); border-radius:10px;
      display:flex; align-items:center; transition:background-color .2s ease;
    }
    .cancelar-page .app-banner .banner-box:hover,.cancelar-page .app-banner .banner-box:focus-within{ background:var(--banner-bg-hover); }
    .cancelar-page .app-banner .banner-inner{ display:grid; grid-template-columns: 1fr auto 1fr; align-items:center; gap:8px; width:100%; padding:0 12px;}
    .cancelar-page .banner-title{ justify-self:center; font-weight:700; color:#233247; }
    .cancelar-page .banner-logo{ justify-self:end; display:inline-flex; align-items:center; }
    .cancelar-page .banner-logo img{ width:52px; height:auto; display:block; }
    .cancelar-page .back-button{
      display:inline-block; text-decoration:none; font-size:14px; color:#5c6bc0;
      padding:8px 12px; border:1px solid #5c6bc0; border-radius:6px; transition: background-color .2s, color .2s;
    }
    .cancelar-page .back-button:hover{ background:#5c6bc0; color:#fff; }

    .cancelar-page .legal-outside{
      margin: 18px auto 24px; padding:10px 12px;
      max-width: calc(var(--container-w) + var(--container-pad)*2 + var(--container-bl));
      text-align:center; color:#666; font-size:14px; line-height:1.35;
    }

    .cancelar-page .cita-row{
      display:flex; align-items:center; justify-content:space-between; gap:12px;
      padding:10px; border-bottom:1px solid #eee;
    }
    .cancelar-page .cita-row:last-child{ border-bottom:none; }
    .cancelar-page .cita-left{ display:flex; gap:10px; align-items:flex-start; }
    .cancelar-page .cita-meta{ line-height:1.25; }
    .cancelar-page .cita-meta b{ color:#233247; }
    .cancelar-page .btn-pick{
      background:#5c6bc0; color:#fff; border:none; border-radius:6px; padding:10px 14px; font-weight:700; cursor:pointer;
    }
    .cancelar-page .btn-pick:hover{ background:#3f51b5; }

    .cancelar-page .error{ color:#b00020; font-weight:600; margin-top:8px; }
  </style>

  <div class="cancelar-page">
    <header class="app-banner" role="banner">
      <div class="banner-box">
        <div class="banner-inner">
          <a href="#" id="btnBack" class="back-button banner-back">&larr; Volver</a>
          <div class="banner-title">Cancelar o Re-agendar</div>
          <a href="#" id="btnHome" class="banner-logo" aria-label="Ir al inicio">
            <img src="assets/img/LogoCitasYa.png" alt="Citas Ya">
          </a>
        </div>
      </div>
    </header>

    <div class="container">
      <h1>Cancelar o Re-agendar una cita</h1>

      <section class="row">
        <div>
          <label for="accion">Acción</label>
          <select id="accion">
            <option value="cancelar">Cancelar</option>
            <option value="reagendar">Re-agendar</option>
          </select>
        </div>
        <div>
          <label>Nombre del asistente</label>
          <input type="text" id="attendee" readonly placeholder="Tu sesión define el asistente">
          <small class="muted">Esta búsqueda está ligada a tu sesión (no por texto) para evitar errores.</small>
        </div>
      </section>

      <section id="citasSection" style="display:none;">
        <h2>Selecciona la cita</h2>
        <div id="citasList" class="card"></div>
      </section>

      <section id="cancelBlock" style="display:none;">
        <h2>Resumen de la cita</h2>
        <textarea id="cancelSummary" readonly></textarea>

        <label for="motivo">Motivo de cancelación</label>
        <textarea id="motivo" placeholder="Cuéntanos el motivo"></textarea>

        <div class="two-btns">
          <button id="btnCancelar" class="btn btn-red">Confirmar cancelación</button>
          <button id="btnClear" class="btn btn-blue">Limpiar</button>
        </div>
        <div id="cancelErr" class="error" style="display:none;"></div>
      </section>

      <section id="reBlock" style="display:none;">
        <h2>Re-agendar la cita</h2>

        <div class="card">
          <h3 style="margin-top:0;">Detalles (puedes cambiar servicio/barbero/fecha/hora)</h3>

          <div class="row">
            <div>
              <label>Barbería</label>
              <input type="text" id="bizName" readonly>
            </div>
            <div>
              <label for="svc">Servicio</label>
              <select id="svc"></select>
              <small class="muted" id="svcDur">Duración: —</small>
            </div>
          </div>

          <div class="row">
            <div>
              <label for="staff">Barbero</label>
              <select id="staff"></select>
            </div>
            <div class="row" style="grid-template-columns: 1fr 1fr; gap:12px;">
              <div>
                <label for="date">Fecha</label>
                <input type="date" id="date">
              </div>
              <div>
                <label for="timeSel">Hora</label>
                <select id="timeSel" disabled><option value="">— Selecciona fecha —</option></select>
                <small class="muted" id="timeHelp"></small>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div>
            <h3>Cita anterior</h3>
            <textarea id="oldSummary" readonly></textarea>
          </div>
          <div>
            <h3>Nueva cita</h3>
            <textarea id="newSummary" readonly></textarea>
          </div>
        </div>

        <div class="two-btns wide75">
          <button id="btnReagendar" class="btn btn-green">Confirmar re-agendación</button>
          <button id="btnClear2" class="btn btn-blue">Limpiar</button>
        </div>

        <div id="reErr" class="error" style="display:none;"></div>
      </section>
    </div>

    <div class="legal-outside">
      Todos los derechos reservados © 2025<br>
      Citas Ya S.A.S - Nit 810.000.000-0
    </div>
  </div>
  `;
}

export async function onMount(){
  const $ = (s) => document.querySelector(s);

  // navegación
  $('#btnBack')?.addEventListener('click', (e)=>{ e.preventDefault(); navigate('/cliente/agendar'); });
  $('#btnHome')?.addEventListener('click', (e)=>{ e.preventDefault(); navigate('/'); });

  const usuarioId = getUsuarioId();
  if (!usuarioId){
    // guardRole debería evitar esto, pero por seguridad
    navigate('/login');
    return;
  }

  // estado
  let citas = [];
  let selected = null;         // cita seleccionada (detallada)
  let recursos = null;         // { negocio, personal, servicios }
  let cancelStateId = null;

  const accion = $('#accion');

  const citasSection = $('#citasSection');
  const citasList = $('#citasList');

  const cancelBlock = $('#cancelBlock');
  const cancelSummary = $('#cancelSummary');
  const motivo = $('#motivo');
  const btnCancelar = $('#btnCancelar');
  const btnClear = $('#btnClear');
  const cancelErr = $('#cancelErr');

  const reBlock = $('#reBlock');
  const bizName = $('#bizName');
  const svcSel = $('#svc');
  const staffSel = $('#staff');
  const dateInp = $('#date');
  const timeSel = $('#timeSel');
  const timeHelp = $('#timeHelp');
  const svcDur = $('#svcDur');
  const oldSummary = $('#oldSummary');
  const newSummary = $('#newSummary');
  const btnReagendar = $('#btnReagendar');
  const btnClear2 = $('#btnClear2');
  const reErr = $('#reErr');

  function showErr(el, msg){
    if (!el) return;
    el.style.display = msg ? 'block' : 'none';
    el.textContent = msg || '';
  }

  function clearAll(){
    selected = null;
    recursos = null;

    // reset UI
    cancelSummary.value = '';
    if (motivo) motivo.value = '';
    if (bizName) bizName.value = '';
    if (svcSel) svcSel.innerHTML = '';
    if (staffSel) staffSel.innerHTML = '';
    if (dateInp) dateInp.value = '';
    if (timeSel){
      timeSel.disabled = true;
      timeSel.innerHTML = `<option value="">— Selecciona fecha —</option>`;
    }
    if (svcDur) svcDur.textContent = 'Duración: —';
    if (oldSummary) oldSummary.value = '';
    if (newSummary) newSummary.value = '';

    cancelBlock.style.display = 'none';
    reBlock.style.display = 'none';
    showErr(cancelErr, '');
    showErr(reErr, '');
  }

  async function renderCitas(){
    // cargar citas del usuario (detalladas)
    const { data } = await CitaModel.byClienteDetailed(usuarioId);
    citas = Array.isArray(data) ? data : [];

    // por defecto mostramos siempre la sección
    citasSection.style.display = 'block';

    if (!citas.length){
      citasList.innerHTML = `<div class="muted">No se encontraron citas asociadas a tu usuario.</div>`;
      return;
    }

    citasList.innerHTML = citas.map(c => {
      const biz = c?.negocios?.nombre ?? `Negocio ${c.negocio_id}`;
      const svc = c?.servicios?.nombre ?? `Servicio ${c.servicio_id}`;
      const staff = c?.personal?.nombre_publico ?? `Barbero ${c.personal_id}`;
      const date = toLocalDateValue(c.inicia_en || c.fecha);
      const start = toLocalTimeValue(c.inicia_en);
      const end = toLocalTimeValue(c.termina_en);
      return `
        <div class="cita-row">
          <div class="cita-left">
            <input type="radio" name="pickCita" value="${c.id}">
            <div class="cita-meta">
              <div><b>${esc(biz)}</b> · ${esc(svc)} · ${esc(staff)}</div>
              <div class="muted">${esc(date)} ${esc(start)}-${esc(end)}</div>
            </div>
          </div>
          <button class="btn-pick" data-pick="${c.id}">Seleccionar</button>
        </div>
      `;
    }).join('');
  }

  async function loadRecursosFromSelected(){
    if (!selected) return;

    // negocio + personal + servicios
    recursos = await BusinessService.detailWithResources(selected.negocio_id); // :contentReference[oaicite:9]{index=9}

    // pintar negocio
    bizName.value = recursos?.negocio?.nombre ?? `Negocio ${selected.negocio_id}`;

    // servicios
    const servicios = Array.isArray(recursos?.servicios) ? recursos.servicios : [];
    svcSel.innerHTML = servicios.map(s => `
      <option value="${s.id}">${esc(s.nombre)} (${s.duracion_min} min)</option>
    `).join('');

    // personal / barberos
    const personal = Array.isArray(recursos?.personal) ? recursos.personal : [];
    staffSel.innerHTML = personal.map(p => `
      <option value="${p.id}">${esc(p.nombre_publico ?? 'Barbero')}</option>
    `).join('');

    // set defaults basados en la cita anterior
    if (String(selected.servicio_id)){
      svcSel.value = String(selected.servicio_id);
    }
    if (String(selected.personal_id)){
      staffSel.value = String(selected.personal_id);
    }

    // set fecha default a la misma de la cita anterior
    dateInp.value = toLocalDateValue(selected.inicia_en || selected.fecha);

    // pintar duración y slots
    updateServicioDur();
    await refreshSlots();
    updateSummaries();
  }

  function updateServicioDur(){
    const servicios = Array.isArray(recursos?.servicios) ? recursos.servicios : [];
    const svcId = Number(svcSel.value);
    const svc = servicios.find(s => Number(s.id) === svcId);
    const mins = svc?.duracion_min ?? null;
    svcDur.textContent = mins ? `Duración: ${mins} min` : 'Duración: —';
  }

  function updateSummaries(){
    if (!selected) return;

    // anterior
    oldSummary.value = [
      `Asistente: (sesión)`,
      `Establecimiento: ${bizName.value || ''}`,
      `Servicio: ${svcSel.options[svcSel.selectedIndex]?.textContent || ''}`,
      `Barbero: ${staffSel.options[staffSel.selectedIndex]?.textContent || ''}`,
      `Fecha: ${toLocalDateValue(selected.inicia_en || selected.fecha)}`,
      `Hora: ${toLocalTimeValue(selected.inicia_en)} - ${toLocalTimeValue(selected.termina_en)}`
    ].join('\n');

    // nueva (si hay fecha y hora)
    const hhmm = timeSel.value || '';
    const date = dateInp.value || '';
    const svcText = svcSel.options[svcSel.selectedIndex]?.textContent || '';
    const staffText = staffSel.options[staffSel.selectedIndex]?.textContent || '';
    newSummary.value = [
      `Asistente: (sesión)`,
      `Establecimiento: ${bizName.value || ''}`,
      `Servicio: ${svcText}`,
      `Barbero: ${staffText}`,
      `Fecha: ${date || '—'}`,
      `Hora: ${hhmm || '—'}`
    ].join('\n');
  }

  async function refreshSlots(){
    if (!recursos) return;

    const servicios = Array.isArray(recursos?.servicios) ? recursos.servicios : [];
    const svcId = Number(svcSel.value);
    const svc = servicios.find(s => Number(s.id) === svcId);
    const duracionMin = Number(svc?.duracion_min ?? 0);

    const personalId = Number(staffSel.value);
    const dateStr = dateInp.value;

    if (!dateStr){
      timeSel.disabled = true;
      timeSel.innerHTML = `<option value="">— Selecciona fecha —</option>`;
      timeHelp.textContent = '';
      return;
    }

    timeSel.disabled = true;
    timeSel.innerHTML = `<option value="">Cargando horas…</option>`;
    timeHelp.textContent = '';

    const { slots, msg } = await buildSlots({ personalId, dateStr, duracionMin });
    if (msg) timeHelp.textContent = msg;

    if (!slots.length){
      timeSel.disabled = true;
      timeSel.innerHTML = `<option value="">— Sin disponibilidad —</option>`;
      return;
    }

    timeSel.disabled = false;
    timeSel.innerHTML = `<option value="">— Selecciona una hora —</option>` + slots.map(h => `<option value="${h}">${h}</option>`).join('');
  }

  function toggleBlocks(){
    if (!selected){
      cancelBlock.style.display = 'none';
      reBlock.style.display = 'none';
      return;
    }

    if (accion.value === 'cancelar'){
      reBlock.style.display = 'none';
      cancelBlock.style.display = 'block';
      cancelSummary.value = formatCitaLine(selected);
    }else{
      cancelBlock.style.display = 'none';
      reBlock.style.display = 'block';
      updateSummaries();
    }
  }

  // eventos
  accion.addEventListener('change', () => {
    toggleBlocks();
    showErr(cancelErr, '');
    showErr(reErr, '');
  });

  citasList.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-pick]');
    if (!btn) return;
    const id = Number(btn.getAttribute('data-pick'));
    selected = citas.find(c => Number(c.id) === id) || null;

    // seleccionar radio
    document.querySelectorAll('input[name="pickCita"]').forEach(r => {
      r.checked = Number(r.value) === id;
    });

    clearAll();
    // rehidrata seleccionada
    selected = citas.find(c => Number(c.id) === id) || null;

    toggleBlocks();
    if (selected){
      // carga recursos para reagendar
      await loadRecursosFromSelected();
      toggleBlocks();
      // summary de cancelar
      cancelSummary.value = formatCitaLine(selected);
    }
  });

  btnClear?.addEventListener('click', (e)=>{ e.preventDefault(); clearAll(); renderCitas(); });
  btnClear2?.addEventListener('click', (e)=>{ e.preventDefault(); clearAll(); renderCitas(); });

  svcSel?.addEventListener('change', async ()=>{ updateServicioDur(); await refreshSlots(); updateSummaries(); });
  staffSel?.addEventListener('change', async ()=>{ await refreshSlots(); updateSummaries(); });
  dateInp?.addEventListener('change', async ()=>{ await refreshSlots(); updateSummaries(); });
  timeSel?.addEventListener('change', ()=>{ updateSummaries(); });

  btnCancelar?.addEventListener('click', async (e)=>{
    e.preventDefault();
    showErr(cancelErr, '');

    if (!selected) return showErr(cancelErr, 'Selecciona una cita.');
    const mot = (motivo.value || '').trim();
    if (!mot) return showErr(cancelErr, 'Escribe un motivo de cancelación.');

    try{
      if (!cancelStateId) cancelStateId = await resolveCancelStateId();

      // 1) registrar cancelación
      const cancelPayload = {
        cita_id: Number(selected.id),
        usuario_id_cancelo: Number(usuarioId),
        motivo: mot,
        cancelado_en: new Date().toISOString()
      };
      const { error: cErr } = await CancelacionCitaModel.create(cancelPayload);
      if (cErr) throw cErr;

      // 2) actualizar estado cita
      const { error: uErr } = await CitaModel.update(selected.id, { estado_id: cancelStateId });
      if (uErr) throw uErr;

      // refrescar
      clearAll();
      await renderCitas();
    }catch(err){
      showErr(cancelErr, err?.message || 'Error cancelando la cita.');
    }
  });

  btnReagendar?.addEventListener('click', async (e)=>{
    e.preventDefault();
    showErr(reErr, '');

    if (!selected) return showErr(reErr, 'Selecciona una cita.');
    const dateStr = dateInp.value;
    const hhmm = timeSel.value;
    if (!dateStr) return showErr(reErr, 'Selecciona una fecha.');
    if (!hhmm) return showErr(reErr, 'Selecciona una hora.');

    const negocio_id = Number(selected.negocio_id);
    const personal_id = Number(staffSel.value);
    const servicio_id = Number(svcSel.value);

    try{
      if (!cancelStateId) cancelStateId = await resolveCancelStateId();

      // 1) cancelar cita anterior (registro + estado)
      const mot = `Re-agendación solicitada por el usuario.`;
      const cancelPayload = {
        cita_id: Number(selected.id),
        usuario_id_cancelo: Number(usuarioId),
        motivo: mot,
        cancelado_en: new Date().toISOString()
      };
      const { error: cErr } = await CancelacionCitaModel.create(cancelPayload);
      if (cErr) throw cErr;

      const { error: uErr } = await CitaModel.update(selected.id, { estado_id: cancelStateId });
      if (uErr) throw uErr;

      // 2) crear nueva cita
      const startISO = new Date(`${dateStr}T${hhmm}:00`).toISOString();

      // validación final de colisión
      // (duración la resuelve AppointmentService internamente)
      const { data: svcRow } = await (await import('../../config/supabaseClient.js')).supabase
        .from('servicios')
        .select('duracion_min')
        .eq('id', servicio_id)
        .single();
      const durMin = Number(svcRow?.duracion_min ?? 0);

      const free = await AvailabilityService.isFree(personal_id, startISO, durMin);
      if (!free) throw new Error('Esa hora ya no está disponible. Selecciona otra.');

      const { error: sErr } = await AppointmentService.schedule({
        usuario_cliente_id: Number(usuarioId),
        negocio_id,
        personal_id,
        servicio_id,
        inicia_en: startISO
      });
      if (sErr) throw sErr;

      clearAll();
      await renderCitas();
    }catch(err){
      showErr(reErr, err?.message || 'Error re-agendando la cita.');
    }
  });

  // init
  await renderCitas();
}
