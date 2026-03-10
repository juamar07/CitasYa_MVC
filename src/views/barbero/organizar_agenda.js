import { navigate } from '../../router/index.js';
import { BusinessService } from '../../services/BusinessService.js';
import { ConjuntoHorarioModel } from '../../models/ConjuntoHorarioModel.js';
import { DiaHorarioModel } from '../../models/DiaHorarioModel.js';
import { getUsuarioId } from '../../store/auth.js';

export default async function BarberoOrganizarAgendaView() {
  return `
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600&display=swap" rel="stylesheet">
  <style>
    :root{
      --container-w: 920px;
      --container-pad: 20px;
      --container-bl: 4px;

      --banner-h: 64px;
      --page-sidepad: 16px;
      --banner-bg: #e6e9ee;
      --banner-bg-hover: #d7dbe3;
    }

    body{
      font-family: 'Open Sans', sans-serif;
      background:#eeeeee;
      margin:0;
      padding:20px;
      color:#333;
      padding-top: calc(var(--banner-h) + 8px);
    }
    .container{
      max-width: var(--container-w);
      margin: 0 auto;
      padding: var(--container-pad);
      background:#fff;
      border-radius:10px;
      box-shadow:0 4px 8px rgba(0,0,0,.05);
      border-left: var(--container-bl) solid #5c6bc0;
    }
    h1{ text-align:center; margin:0 0 14px; font-weight:700; color:#000; }
    h2{ margin:22px 0 12px; font-weight:700; color:#000; text-align:center;}
    h3{ margin:12px 0 8px; color:#233247; }
    label{ display:block; margin:8px 0 4px; color:#003366; }

    select, input[type="text"], input[type="date"], input[type="password"], textarea{
      width:100%; padding:10px; border:2px solid #ddd; border-radius:6px; font-size:16px;
      transition: border-color .2s; box-sizing: border-box;
    }
    textarea{ min-height:180px; resize:vertical; }
    select:focus, input:focus, textarea:focus{ outline:none; border-color:#7da2a9; }

    .row{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
    .row-3{ display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; }

    .align-end{ align-self: end; }
    .muted{ color:#666; font-size:14px; }
    .badge{ display:inline-block; padding:4px 8px; border-radius:999px; font-size:12px; margin-left:8px; }
    .badge-ok{ background:#e8f5e9; color:#2e7d32; border:1px solid #c8e6c9; }
    .badge-warn{ background:#fff3e0; color:#ef6c00; border:1px solid #ffe0b2; }
    .warn{ color:#c62828; font-size:14px; }

    .day-list{ display:flex; flex-wrap:wrap; gap:14px; }
    .day-list label{ display:inline-flex; align-items:center; gap:6px; margin:0; }

    .btn{
      display:block; border:none; border-radius:6px; padding:12px 18px; color:#fff; font-weight:700; cursor:pointer;
      transition: background-color .2s, transform .2s; width:100%; margin:10px 0; font-size:16px;
    }
    .btn:hover{ transform: translateY(-1px); }
    .btn-green{ background:#66bb6a; } .btn-green:hover{ background:#43a047; }
    .btn-blue{ background:#5c6bc0; } .btn-blue:hover{ background:#3f51b5; }
    .btn-red{ background:#ef5350; } .btn-red:hover{ background:#e53935; }
    .btn-slim{ width:min(640px, 75%); margin:12px auto; }
    .btn-icon{ display:inline-block; padding:6px 10px; border-radius:6px; font-size:14px; width:auto; border:none; cursor:pointer; }
    .btn-icon-green{ background:#66bb6a; color:#fff; }
    .btn-icon-green:hover{ background:#43a047; }

    .wide75{ width:75%; margin:12px auto; }
    @media (max-width:768px){ .wide75{ width:100%; } }

    table{ width:100%; border-collapse:collapse; margin:8px 0; }
    th, td{ padding:8px; text-align:left; }
    th{ background:#f5f5f5; color:#555; font-weight:600; }

    .time-picker{ display:flex; gap:8px; align-items:center; }
    .time-picker select{ width:auto; min-width:84px; }

    .app-banner{ position:fixed; top:0; left:0; right:0; height:var(--banner-h); z-index:9999; background:transparent; }
    .app-banner .banner-box{
      height:100%;
      width:min(calc(var(--container-w) + var(--container-pad)*2 + var(--container-bl)), calc(100% - var(--page-sidepad)*2));
      margin:0 auto; background:var(--banner-bg); border-bottom:1px solid rgba(0,0,0,.06); border-radius:10px;
      display:flex; align-items:center; transition:background-color .2s ease;
    }
    .app-banner .banner-box:hover,.app-banner .banner-box:focus-within{ background:var(--banner-bg-hover); }
    .app-banner .banner-inner{ display:grid; grid-template-columns: 1fr auto 1fr; align-items:center; gap:8px; width:100%; padding:0 12px;}
    .banner-back{ justify-self:start; }
    .banner-title{ justify-self:center; font-weight:700; color:#233247; }
    .banner-logo{ justify-self:end; display:inline-flex; align-items:center; }
    .banner-logo img{ width:52px; height:auto; display:block; }
    .back-button{
      display:inline-block; text-decoration:none; font-size:14px; color:#5c6bc0;
      padding:8px 12px; border:1px solid #5c6bc0; border-radius:6px; transition: background-color .2s, color .2s;
    }
    .back-button:hover{ background:#5c6bc0; color:#fff; }

    @media (max-width: 768px){
      .row, .row-3{ grid-template-columns: 1fr; }
      .btn-slim{ width:100%; }
    }

      .mvc-registro-negocio .legal-outside{
          margin:18px auto 24px;
          padding:10px 12px;
          max-width: 1080px;
          text-align:center;
          color:#666;
          font-size:14px;
          line-height:1.35;
        }

  </style>

  <header class="app-banner" role="banner">
    <div class="banner-box">
      <div class="banner-inner">
        <a href="#" id="btnBack" class="back-button banner-back">&larr; Volver</a>
        <div class="banner-title">Organizar agenda</div>
        <a href="#" id="btnHome" class="banner-logo" aria-label="Ir al inicio">
          <img src="assets/img/LogoCitasYa.png" alt="Citas Ya">
        </a>
      </div>
    </div>
  </header>

  <div class="container">
    <h1>Organizar agenda</h1>

    <section>
      <label for="bizName">Nombre de la barbería
        <span id="bizState" class="badge badge-warn">No cargada</span>
      </label>
      <input type="text" id="bizName" list="businessList" placeholder="Ej: Barbería Central">
      <datalist id="businessList"></datalist>
      <small class="muted">Escribe el nombre. La búsqueda ignora mayúsculas/acentos.</small>
    </section>

    <section id="bizPasswordBlock" style="display:none; margin-top:10px;">
      <label for="bizPassword">Contraseña de la barbería</label>
      <div class="row">
        <input type="password" id="bizPassword" placeholder="Ingresa la contraseña">
        <button type="button" id="btnVerifyBiz" class="btn-icon btn-icon-green align-end">Verificar</button>
      </div>
      <small id="bizPasswordStatus" class="muted"></small>
    </section>

    <section>
      <label for="staffSelect">Seleccione el personal</label>
      <select id="staffSelect" disabled>
        <option value="">— Seleccione —</option>
      </select>
    </section>

    <section class="wide75" style="margin-top:6px;">
      <button type="button" id="btnMiAgenda" class="btn btn-blue" style="width:100%;">Mi agenda</button>
    </section>

    <section>
      <h2>Horario de trabajo</h2>
      <div class="row">
        <label style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="sameAllWeek"> ¿Usar el mismo horario para toda la semana?
        </label>
      </div>

      <div id="sameWeekBlock" style="display:none;">
        <h3>Horario común</h3>
        <div class="row-3">
          <div>
            <label>Hora de inicio</label>
            <div class="time-picker" id="commonStart"></div>
          </div>
          <div>
            <label>Hora de fin</label>
            <div class="time-picker" id="commonEnd"></div>
          </div>
          <div>
            <label>Días a aplicar</label>
            <div class="day-list" id="commonDays"></div>
          </div>
        </div>
        <div style="text-align:right; margin-top:6px;">
          <button type="button" id="btnApplyCommon" class="btn-icon btn-icon-green" title="Guardar horario común">Guardar</button>
        </div>
      </div>
    </section>

    <section>
      <h3>Horario por día</h3>
      <table>
        <thead>
          <tr>
            <th>Día</th><th>Trabaja</th><th>Inicio</th><th>Fin</th><th>Acción</th>
          </tr>
        </thead>
        <tbody id="perDayBody"></tbody>
      </table>
      <small class="muted">Puedes usar el horario común y luego ajustar un día específico aquí.</small>
    </section>

    <section>
      <h3>Hora de almuerzo (opcional)</h3>
      <div class="row-3">
        <div>
          <label>Inicio almuerzo</label>
          <div class="time-picker" id="lunchStart"></div>
        </div>
        <div>
          <label>Fin almuerzo</label>
          <div class="time-picker" id="lunchEnd"></div>
        </div>
        <div>
          <label>Días a aplicar</label>
          <div class="day-list" id="lunchDays"></div>
        </div>
      </div>
      <div style="text-align:right; margin-top:6px;">
        <button type="button" id="btnApplyLunch" class="btn-icon btn-icon-green" title="Guardar almuerzo">Guardar</button>
      </div>
    </section>

    <section>
      <h2>Rango de fechas</h2>
      <div class="row-3">
        <div>
          <label for="dateStart">Fecha de inicio</label>
          <input type="date" id="dateStart">
        </div>
        <div>
          <label for="dateEnd">Fecha de fin</label>
          <input type="date" id="dateEnd">
        </div>
        <div class="align-end">
          <button type="button" id="btnSaveDates" class="btn-icon btn-icon-green">Guardar fechas</button>
        </div>
      </div>
      <div id="dateWarn" class="warn" style="display:none; margin-top:6px;"></div>
    </section>

    <section>
      <button type="button" id="btnUpdateAgenda" class="btn btn-green btn-slim">Actualizar agenda</button>
      <textarea id="agendaSummary" placeholder="Aquí verás el resumen de tu agenda…" aria-label="Resumen de agenda"></textarea>
    </section>

    <section style="text-align:center; margin-top:10px;">
      <button type="button" id="btnPagos" class="btn btn-red btn-slim">Ir al portal de pagos</button>
      <p class="muted" style="margin:6px 0 0;">Recuerda recargar <strong>tokens</strong> para agendar citas. NIT 810.000.000-0</p>
    </section>
  </div>

  <div class="legal-outside">
    Todos los derechos reservados © 2026<br>
    Citas Ya S.A.S - Nit 810.000.000-0
  </div>
  `;
}

export function onMount() {
  const DAYS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

  const state = {
    businesses: [],
    businessByName: new Map(),
    businessId: null,
    businessName: '',
    resourcesLoaded: false,
    dayIds: [1, 2, 3, 4, 5, 6, 7],
    personalId: null,
    personalName: '',
    fecha_inicio: '',
    fecha_fin: '',
    currentConjuntoId: null,
    editCtx: null,
    perDay: {},
    perDayInputs: {}
  };

  const $ = (id) => document.getElementById(id);

  const bizNameInput = $('bizName');
  const businessList = $('businessList');
  const bizState = $('bizState');
  const bizPasswordBlock = $('bizPasswordBlock');
  const bizPassword = $('bizPassword');
  const btnVerifyBiz = $('btnVerifyBiz');
  const bizPasswordStatus = $('bizPasswordStatus');
  const staffSelect = $('staffSelect');
  const sameAllWeek = $('sameAllWeek');
  const sameWeekBlock = $('sameWeekBlock');
  const dateStart = $('dateStart');
  const dateEnd = $('dateEnd');
  const dateWarn = $('dateWarn');
  const agendaSummary = $('agendaSummary');

  document.getElementById('btnMiAgenda')?.addEventListener('click', () => {
    try {
      const ctx = {
        conjunto_horario_id: state.currentConjuntoId || null,
        negocio_id: state.businessId || null,
        negocio_nombre: state.businessName || '',
        personal_id: state.personalId || null,
        personal_nombre: state.personalName || '',
        fecha_inicio: state.fecha_inicio || '',
        fecha_fin: state.fecha_fin || ''
      };
      sessionStorage.setItem('cy_edit_agenda_ctx', JSON.stringify(ctx));
    } catch (_e) {}
    navigate('/barbero/mi-agenda');
  });

  document.getElementById('btnPagos')?.addEventListener('click', () => navigate('/pagos'));
  document.getElementById('btnBack')?.addEventListener('click', (e) => { e.preventDefault(); history.back(); });
  document.getElementById('btnHome')?.addEventListener('click', (e) => { e.preventDefault(); navigate('/'); });

  function resetPerDayState() {
    state.perDay = {};
    DAYS.forEach((_, dayIdx) => {
      const dayId = state.dayIds[dayIdx] ?? (dayIdx + 1);
      state.perDay[dayId] = {
        dayIdx,
        trabaja: false,
        hora_inicio: '',
        hora_fin: '',
        almuerzo_inicio: '',
        almuerzo_fin: ''
      };
    });
  }

  function createTimePicker(el){
    const hh = document.createElement('select');
    const mm = document.createElement('select');

    const hhPh = document.createElement('option'); hhPh.value=''; hhPh.textContent='HH'; hh.appendChild(hhPh);
    for (let h=0; h<24; h++){
      const op = document.createElement('option');
      op.value = String(h).padStart(2,'0');
      op.textContent = op.value;
      hh.appendChild(op);
    }

    const mmPh = document.createElement('option'); mmPh.value=''; mmPh.textContent='MM'; mm.appendChild(mmPh);
    for (let m=0; m<60; m+=10){
      const op = document.createElement('option');
      op.value = String(m).padStart(2,'0');
      op.textContent = op.value;
      mm.appendChild(op);
    }

    el.innerHTML = '';
    el.appendChild(hh);
    el.appendChild(document.createTextNode(':'));
    el.appendChild(mm);

    return {
      get: ()=> (hh.value!=='' && mm.value!=='') ? `${hh.value}:${mm.value}` : '',
      set: (v)=>{
        if (!v) { hh.value = ''; mm.value = ''; return; }
        const [H, M] = String(v).split(':');
        hh.value = H || '';
        mm.value = M || '';
      }
    };
  }

  function renderDayCheckboxes(container){
    container.innerHTML='';
    DAYS.forEach((d, idx) => {
      const dayId = state.dayIds[idx] ?? (idx + 1);
      const lab = document.createElement('label');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = String(dayId);
      cb.dataset.dayIdx = String(idx);
      lab.appendChild(cb);
      lab.appendChild(document.createTextNode(` ${d}`));
      container.appendChild(lab);
    });
  }

  function renderPerDayTable(){
    const perDayBody = $('perDayBody');
    if (!perDayBody) return;

    perDayBody.innerHTML='';
    state.perDayInputs = {};

    DAYS.forEach((d, idx) => {
      const dayId = state.dayIds[idx] ?? (idx + 1);
      const tr = document.createElement('tr');

      const tdDay = document.createElement('td'); tdDay.textContent = d; tr.appendChild(tdDay);

      const tdWork = document.createElement('td');
      const cb = document.createElement('input'); cb.type='checkbox';
      tdWork.appendChild(cb); tr.appendChild(tdWork);

      const tdStart = document.createElement('td');
      const tpS = document.createElement('div'); tpS.className='time-picker';
      tdStart.appendChild(tpS);
      const tpStart = createTimePicker(tpS);

      const tdEnd = document.createElement('td');
      const tpE = document.createElement('div'); tpE.className='time-picker';
      tdEnd.appendChild(tpE);
      const tpEnd = createTimePicker(tpE);

      tr.appendChild(tdStart);
      tr.appendChild(tdEnd);

      const tdAct = document.createElement('td');
      const btn = document.createElement('button');
      btn.type='button';
      btn.className='btn-icon btn-icon-green';
      btn.textContent='Guardar';
      btn.addEventListener('click', () => {
        const inicio = tpStart.get();
        const fin = tpEnd.get();
        if (!inicio || !fin) { alert('Selecciona hora de inicio y fin.'); return; }
        if (inicio >= fin) { alert('La hora de inicio debe ser menor que la hora de fin.'); return; }

        state.perDay[dayId] = {
          ...state.perDay[dayId],
          dayIdx: idx,
          trabaja: true,
          hora_inicio: inicio,
          hora_fin: fin
        };
        cb.checked = true;
        alert(`Horario guardado para ${d}.`);
      });
      tdAct.appendChild(btn);
      tr.appendChild(tdAct);

      cb.addEventListener('change', () => {
        if (!cb.checked) {
          state.perDay[dayId] = {
            ...state.perDay[dayId],
            dayIdx: idx,
            trabaja: false,
            hora_inicio: '',
            hora_fin: '',
            almuerzo_inicio: '',
            almuerzo_fin: ''
          };
          tpStart.set('');
          tpEnd.set('');
        }
      });

      state.perDayInputs[dayId] = { cb, tpStart, tpEnd };
      perDayBody.appendChild(tr);
    });
  }

  function validateLunchForDay(dayData) {
    if (!dayData.almuerzo_inicio && !dayData.almuerzo_fin) return true;
    if (!dayData.trabaja || !dayData.hora_inicio || !dayData.hora_fin) return false;
    if (!dayData.almuerzo_inicio || !dayData.almuerzo_fin) return false;
    if (dayData.almuerzo_inicio >= dayData.almuerzo_fin) return false;
    if (dayData.almuerzo_inicio < dayData.hora_inicio) return false;
    if (dayData.almuerzo_fin > dayData.hora_fin) return false;
    return true;
  }

  function buildSummaryText() {
    const lines = [];
    lines.push(`Barbería: ${state.businessName || '—'}`);
    lines.push(`Personal: ${state.personalName || '—'}`);
    lines.push(`Rango: ${state.fecha_inicio || '—'} → ${state.fecha_fin || '—'}`);
    lines.push('');
    lines.push('Detalle por día:');

    DAYS.forEach((name, idx) => {
      const dayId = state.dayIds[idx] ?? (idx + 1);
      const row = state.perDay[dayId];
      if (!row?.trabaja) {
        lines.push(`- ${name}: No trabaja`);
        return;
      }
      const lunch = row.almuerzo_inicio && row.almuerzo_fin ? ` | Almuerzo ${row.almuerzo_inicio}-${row.almuerzo_fin}` : '';
      lines.push(`- ${name}: ${row.hora_inicio}-${row.hora_fin}${lunch}`);
    });

    return lines.join('\n');
  }

    function applyStateToPerDayUI() {
    Object.entries(state.perDayInputs || {}).forEach(([dayId, refs]) => {
      const row = state.perDay?.[Number(dayId)];
      if (!row || !refs) return;

      refs.cb.checked = Boolean(row.trabaja);
      refs.tpStart.set(row.hora_inicio || '');
      refs.tpEnd.set(row.hora_fin || '');
    });
  }

  async function loadLatestAgendaForCurrentSelection() {
    if (!state.businessId || !state.personalId) return;

    try {
      const { data: conjunto, error: conjuntoError } =
        await ConjuntoHorarioModel.latestByBusinessAndPersonal(state.businessId, Number(state.personalId));

      if (conjuntoError) throw conjuntoError;

      if (!conjunto?.id) {
        state.currentConjuntoId = null;
        state.fecha_inicio = '';
        state.fecha_fin = '';
        if (dateStart) dateStart.value = '';
        if (dateEnd) dateEnd.value = '';
        resetPerDayState();
        applyStateToPerDayUI();
        if (agendaSummary) agendaSummary.value = '';
        return;
      }

      state.currentConjuntoId = conjunto.id;
      state.fecha_inicio = conjunto.fecha_inicio || '';
      state.fecha_fin = conjunto.fecha_fin || '';

      if (dateStart) dateStart.value = state.fecha_inicio;
      if (dateEnd) dateEnd.value = state.fecha_fin;

      resetPerDayState();

      const { data: dias, error: diasError } = await DiaHorarioModel.listByConjunto(conjunto.id);
      if (diasError) throw diasError;

      (dias || []).forEach((d) => {
        const dayId = Number(d.dia_id ?? d.dia_semana_id ?? d.dia ?? 0);
        if (!dayId || !state.perDay[dayId]) return;

        state.perDay[dayId] = {
          ...state.perDay[dayId],
          trabaja: Boolean(d.trabaja),
          hora_inicio: d.hora_inicio || '',
          hora_fin: d.hora_fin || '',
          almuerzo_inicio: d.almuerzo_inicio || '',
          almuerzo_fin: d.almuerzo_fin || ''
        };
      });

      applyStateToPerDayUI();

      if (agendaSummary) {
        agendaSummary.value = buildSummaryText();
      }
    } catch (error) {
      console.error('Error cargando agenda existente:', error);
    }
  }

  async function loadBusinesses() {
    try {
      const { data, error } = await BusinessService.myBusinesses();
      if (error) throw error;
      state.businesses = data || [];
      state.businessByName = new Map((state.businesses || []).map((b) => [String(b.nombre || ''), b]));
      if (businessList) {
        businessList.innerHTML = state.businesses
          .map((b) => `<option value="${String(b.nombre || '').replace(/"/g, '&quot;')}">`)
          .join('');
      }
    } catch (error) {
      console.error('Error cargando barberías:', error);
      alert('No fue posible cargar tus barberías.');
    }
  }

  function resetResourcesGate() {
    state.resourcesLoaded = false;
    state.personalId = null;
    state.personalName = '';
    if (staffSelect) {
      staffSelect.innerHTML = '<option value="">— Seleccione —</option>';
      staffSelect.disabled = true;
    }
    if (bizState) {
      bizState.textContent = 'No cargada';
      bizState.className = 'badge badge-warn';
    }
  }

  function handleBusinessSelection() {
    const selected = state.businessByName.get(bizNameInput?.value || '');
    if (!selected) {
      state.businessId = null;
      state.businessName = '';
      if (bizPasswordBlock) bizPasswordBlock.style.display = 'none';
      if (bizPasswordStatus) bizPasswordStatus.textContent = '';
      if (bizPassword) bizPassword.value = '';
      resetResourcesGate();
      return;
    }

    state.businessId = selected.id;
    state.businessName = selected.nombre || '';
    if (bizPasswordBlock) bizPasswordBlock.style.display = 'block';
    if (bizPasswordStatus) bizPasswordStatus.textContent = '';
    if (bizPassword) bizPassword.value = '';
    resetResourcesGate();
  }

  async function verifyAndLoadResources() {
    if (!state.businessId) {
      alert('Selecciona primero una barbería válida.');
      return;
    }

    const inputPass = bizPassword?.value || '';
    if (!inputPass.trim()) {
      alert('Ingresa la contraseña de la barbería.');
      return;
    }

    try {
      if (bizPasswordStatus) bizPasswordStatus.textContent = 'Verificando…';
      const { ok, message } = await BusinessService.verifyBusinessKey(state.businessId, inputPass);
      if (!ok) {
        if (bizPasswordStatus) bizPasswordStatus.textContent = message || 'Clave incorrecta.';
        alert(message || 'Contraseña incorrecta.');
        resetResourcesGate();
        return;
      }

      const { personal, error } = await BusinessService.detailWithResources(state.businessId, { requireVerification: true, verified: true });
      if (error) throw error;

      if (staffSelect) {
        staffSelect.innerHTML = '<option value="">— Seleccione —</option>';
        (personal || []).forEach((p) => {
          const op = document.createElement('option');
          op.value = String(p.id);
          op.textContent = p.nombre_publico || `Personal #${p.id}`;
          staffSelect.appendChild(op);
        });
        staffSelect.disabled = false;
      }

      state.resourcesLoaded = true;
        try {
          const raw = sessionStorage.getItem('cy_edit_agenda_ctx');
          const ctx = raw ? JSON.parse(raw) : null;

          if (ctx && Number(ctx.negocio_id) === Number(state.businessId)) {
            state.editCtx = ctx;

            if (staffSelect && ctx.personal_id) {
              const exists = Array.from(staffSelect.options).find((o) => Number(o.value) === Number(ctx.personal_id));
              if (exists) {
                staffSelect.value = String(ctx.personal_id);
                state.personalId = Number(ctx.personal_id);
                state.personalName = exists.textContent || '';
                await loadLatestAgendaForCurrentSelection();
              }
            }
          }
        } catch (error) {
          console.error('No se pudo cargar contexto de edición:', error);
        }
        
      if (bizState) {
        bizState.textContent = 'Cargada';
        bizState.className = 'badge badge-ok';
      }
      if (bizPasswordStatus) bizPasswordStatus.textContent = 'Barbería verificada correctamente.';
    } catch (error) {
      console.error('Error verificando barbería:', error);
      if (bizPasswordStatus) bizPasswordStatus.textContent = 'No fue posible verificar la barbería.';
      alert('No fue posible verificar/cargar recursos de la barbería.');
    }
  }

  function bindButtons(tpCommonStart, tpCommonEnd, tpLunchStart, tpLunchEnd) {
    $('btnApplyCommon')?.addEventListener('click', () => {
      const inicio = tpCommonStart.get();
      const fin = tpCommonEnd.get();
      const selectedDays = Array.from(document.querySelectorAll('#commonDays input[type="checkbox"]:checked'));

      if (!inicio || !fin) { alert('Selecciona la hora de inicio y fin para el horario común.'); return; }
      if (inicio >= fin) { alert('La hora de inicio debe ser menor a la hora de fin.'); return; }
      if (!selectedDays.length) { alert('Selecciona al menos un día para aplicar el horario común.'); return; }

      selectedDays.forEach((cb) => {
        const dayId = Number(cb.value);
        const dayIdx = Number(cb.dataset.dayIdx);
        state.perDay[dayId] = {
          ...state.perDay[dayId],
          dayIdx,
          trabaja: true,
          hora_inicio: inicio,
          hora_fin: fin
        };

        const inputs = state.perDayInputs[dayId];
        if (inputs) {
          inputs.cb.checked = true;
          inputs.tpStart.set(inicio);
          inputs.tpEnd.set(fin);
        }
      });

      alert('Horario común guardado.');
    });

    $('btnApplyLunch')?.addEventListener('click', () => {
      const almInicio = tpLunchStart.get();
      const almFin = tpLunchEnd.get();
      const selectedDays = Array.from(document.querySelectorAll('#lunchDays input[type="checkbox"]:checked'));

      if (!almInicio || !almFin) { alert('Selecciona inicio y fin del almuerzo.'); return; }
      if (almInicio >= almFin) { alert('La hora de inicio del almuerzo debe ser menor a la hora de fin.'); return; }
      if (!selectedDays.length) { alert('Selecciona al menos un día para aplicar el almuerzo.'); return; }

      for (const cb of selectedDays) {
        const dayId = Number(cb.value);
        const dayData = { ...state.perDay[dayId], almuerzo_inicio: almInicio, almuerzo_fin: almFin };
        if (!validateLunchForDay(dayData)) {
          alert('El almuerzo debe quedar dentro del rango de trabajo del día seleccionado.');
          return;
        }
      }

      selectedDays.forEach((cb) => {
        const dayId = Number(cb.value);
        state.perDay[dayId] = {
          ...state.perDay[dayId],
          almuerzo_inicio: almInicio,
          almuerzo_fin: almFin
        };
      });

      alert('Horario de almuerzo guardado.');
    });

    $('btnSaveDates')?.addEventListener('click', () => {
      const start = dateStart?.value || '';
      const end = dateEnd?.value || '';
      if (dateWarn) { dateWarn.style.display = 'none'; dateWarn.textContent = ''; }

      if (!start || !end) {
        alert('Selecciona fecha de inicio y fecha de fin.');
        return;
      }
      if (start > end) {
        if (dateWarn) {
          dateWarn.textContent = 'La fecha de inicio no puede ser mayor que la fecha de fin.';
          dateWarn.style.display = 'block';
        }
        return;
      }

      state.fecha_inicio = start;
      state.fecha_fin = end;
      alert('Fechas guardadas.');
    });

    $('btnUpdateAgenda')?.addEventListener('click', async () => {
      try {
        if (!state.businessId || !state.resourcesLoaded) {
          alert('Debes seleccionar y verificar la barbería antes de actualizar la agenda.');
          return;
        }
        if (!state.personalId) {
          alert('Selecciona el personal para publicar la agenda.');
          return;
        }
        if (!state.fecha_inicio || !state.fecha_fin) {
          alert('Debes guardar el rango de fechas antes de actualizar la agenda.');
          return;
        }
        if (state.fecha_inicio > state.fecha_fin) {
          alert('La fecha de inicio no puede ser mayor que la fecha de fin.');
          return;
        }

        const hasWorkingDay = Object.values(state.perDay).some((d) => d.trabaja);
        if (!hasWorkingDay) {
          alert('Debes configurar al menos un día de trabajo.');
          return;
        }

        for (const dayData of Object.values(state.perDay)) {
          if (!dayData.trabaja) continue;
          if (!dayData.hora_inicio || !dayData.hora_fin || dayData.hora_inicio >= dayData.hora_fin) {
            alert('Cada día laboral debe tener horas válidas (inicio menor a fin).');
            return;
          }
          if (!validateLunchForDay(dayData)) {
            alert('Revisa el horario de almuerzo: debe quedar dentro del rango laboral del día.');
            return;
          }
        }

      const usuarioId = getUsuarioId();
      let conjuntoId = state.currentConjuntoId;

      if (!conjuntoId) {
        const { data: existingConjunto } = await ConjuntoHorarioModel.latestByBusinessAndPersonal(
          state.businessId,
          Number(state.personalId)
        );

        if (
          existingConjunto?.id &&
          String(existingConjunto.fecha_inicio || '') === String(state.fecha_inicio || '') &&
          String(existingConjunto.fecha_fin || '') === String(state.fecha_fin || '')
        ) {
          conjuntoId = existingConjunto.id;
        }
      }

      if (!conjuntoId) {
        const { data: conjuntoData, error: conjuntoError } = await ConjuntoHorarioModel.create({
          negocio_id: state.businessId,
          personal_id: Number(state.personalId),
          fecha_inicio: state.fecha_inicio,
          fecha_fin: state.fecha_fin,
          creado_por: usuarioId || null
        });

        if (conjuntoError) throw conjuntoError;

        conjuntoId = conjuntoData?.id;
        if (!conjuntoId) throw new Error('No se pudo crear el conjunto de horario.');
      }

      state.currentConjuntoId = conjuntoId;

      const diasPayload = Object.entries(state.perDay).map(([dayId, cfg]) => ({
        conjunto_horario_id: conjuntoId,
        dia_id: Number(dayId),
        trabaja: Boolean(cfg.trabaja),
        hora_inicio: cfg.trabaja ? (cfg.hora_inicio || null) : null,
        hora_fin: cfg.trabaja ? (cfg.hora_fin || null) : null,
        almuerzo_inicio: cfg.trabaja && cfg.almuerzo_inicio ? cfg.almuerzo_inicio : null,
        almuerzo_fin: cfg.trabaja && cfg.almuerzo_fin ? cfg.almuerzo_fin : null
      }));

      const { error: diasError } = await DiaHorarioModel.upsert(diasPayload);
      if (diasError) throw diasError;

        if (agendaSummary) agendaSummary.value = buildSummaryText();
        alert('Agenda actualizada correctamente.');
      } catch (error) {
        console.error('Error al actualizar agenda:', error);
        alert(`No se pudo actualizar la agenda. ${error?.message || ''}`.trim());
      }
    });
  }

  sameAllWeek?.addEventListener('change', () => {
    if (sameWeekBlock) sameWeekBlock.style.display = sameAllWeek.checked ? 'block' : 'none';
  });

  staffSelect?.addEventListener('change', async () => {
    state.personalId = staffSelect.value ? Number(staffSelect.value) : null;
    state.personalName = staffSelect.options[staffSelect.selectedIndex]?.textContent || '';

    if (state.resourcesLoaded && state.personalId) {
      await loadLatestAgendaForCurrentSelection();
    }
  });

  bizNameInput?.addEventListener('change', handleBusinessSelection);
  bizNameInput?.addEventListener('blur', handleBusinessSelection);
  btnVerifyBiz?.addEventListener('click', verifyAndLoadResources);

  (async () => {
    resetPerDayState();

    const tpCommonStart = createTimePicker($('commonStart'));
    const tpCommonEnd = createTimePicker($('commonEnd'));
    const tpLunchStart = createTimePicker($('lunchStart'));
    const tpLunchEnd = createTimePicker($('lunchEnd'));

    renderDayCheckboxes($('commonDays'));
    renderDayCheckboxes($('lunchDays'));
    renderPerDayTable();
    bindButtons(tpCommonStart, tpCommonEnd, tpLunchStart, tpLunchEnd);

    try {
      const { data: diasSemana } = await DiaHorarioModel.listDiasSemana();
      if (Array.isArray(diasSemana) && diasSemana.length >= 7) {
        state.dayIds = diasSemana.slice(0, 7).map((d) => Number(d.id));
        resetPerDayState();
        renderDayCheckboxes($('commonDays'));
        renderDayCheckboxes($('lunchDays'));
        renderPerDayTable();
      }
    } catch (error) {
      console.error('No se pudo cargar dias_semana, se usará mapeo por defecto:', error);
    }

    await loadBusinesses();

    try {
        const raw = sessionStorage.getItem('cy_edit_agenda_ctx');
        const ctx = raw ? JSON.parse(raw) : null;

        if (ctx?.negocio_nombre && bizNameInput) {
          bizNameInput.value = ctx.negocio_nombre;
          handleBusinessSelection();
        }
      } catch (error) {
        console.error('No se pudo restaurar barbería en edición:', error);
      }
    })();
  }