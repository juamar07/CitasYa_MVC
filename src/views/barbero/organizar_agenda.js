import { navigate } from '../../router/index.js';

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

    select, input[type="text"], input[type="date"], textarea{
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
    .btn-icon{ display:inline-block; padding:6px 10px; border-radius:6px; font-size:14px; width:auto; }
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

    .legal-outside{
      margin: 18px auto 24px; padding:10px 12px;
      max-width: calc(var(--container-w) + var(--container-pad)*2 + var(--container-bl));
      text-align:center; color:#666; font-size:14px; line-height:1.35;
    }

    @media (max-width: 768px){
      .row, .row-3{ grid-template-columns: 1fr; }
      .btn-slim{ width:100%; }
    }
  </style>

  <!-- ===== Banner ===== -->
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

    <!-- 1. Barbería -->
    <section>
      <label for="bizName">Nombre de la barbería
        <span id="bizState" class="badge badge-warn">No cargada</span>
      </label>
      <input type="text" id="bizName" list="businessList" placeholder="Ej: Barbería Central">
      <datalist id="businessList"></datalist>
      <small class="muted">Escribe el nombre. La búsqueda ignora mayúsculas/acentos.</small>
    </section>

    <!-- 2. Personal -->
    <section>
      <label for="staffSelect">Seleccione el personal</label>
      <select id="staffSelect" disabled>
        <option value="">— Seleccione —</option>
      </select>
    </section>

    <section class="wide75" style="margin-top:6px;">
      <button type="button" id="btnMiAgenda" class="btn btn-blue" style="width:100%;">Mi agenda</button>
    </section>

    <!-- 3. Mismo horario para toda la semana -->
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

    <!-- 4-5. Por día -->
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

    <!-- 5.1 Almuerzo -->
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

    <!-- 6. Fechas -->
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

    <!-- 7. Actualizar agenda + Resumen -->
    <section>
      <button type="button" id="btnUpdateAgenda" class="btn btn-green btn-slim">Actualizar agenda</button>
      <textarea id="agendaSummary" placeholder="Aquí verás el resumen de tu agenda…" aria-label="Resumen de agenda"></textarea>
    </section>

    <!-- 8. Portal de pagos -->
    <section style="text-align:center; margin-top:10px;">
      <button type="button" id="btnPagos" class="btn btn-red btn-slim">Ir al portal de pagos</button>
      <p class="muted" style="margin:6px 0 0;">Recuerda recargar <strong>tokens</strong> para agendar citas. NIT 810.000.000-0</p>
    </section>
  </div>

  <div class="legal-outside">
    Todos los derechos reservados © 2025<br>
    Citas Ya S.A.S - Nit 810.000.000-0
  </div>
  `;
}

export function onMount() {
  const DAYS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

  // Navegación
  document.getElementById('btnMiAgenda')?.addEventListener('click', () => navigate('/barbero/mi-agenda'));
  document.getElementById('btnPagos')?.addEventListener('click', () => navigate('/pagos'));
  document.getElementById('btnBack')?.addEventListener('click', (e) => { e.preventDefault(); history.back(); });
  document.getElementById('btnHome')?.addEventListener('click', (e) => { e.preventDefault(); navigate('/'); });

  // Helpers UI (igual al MVP)
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
    el.appendChild(hh);
    el.appendChild(document.createTextNode(':'));
    el.appendChild(mm);

    return {
      get: ()=> (hh.value!=='' && mm.value!=='') ? hh.value + ':' + mm.value : '',
      set: (v)=>{ if(!v){ hh.value=''; mm.value=''; return; } const [H,M]=v.split(':'); hh.value=H||''; mm.value=M||''; }
    };
  }

  function renderDayCheckboxes(container){
    container.innerHTML='';
    DAYS.forEach((d,idx)=>{
      const lab=document.createElement('label');
      const cb=document.createElement('input'); cb.type='checkbox'; cb.value=idx;
      lab.appendChild(cb); lab.appendChild(document.createTextNode(' '+d));
      container.appendChild(lab);
    });
  }

  function renderPerDayTable(){
    const perDayBody = document.getElementById('perDayBody');
    if (!perDayBody) return;

    perDayBody.innerHTML='';
    DAYS.forEach((d,idx)=>{
      const tr=document.createElement('tr');

      const tdDay=document.createElement('td'); tdDay.textContent=d; tr.appendChild(tdDay);

      const tdWork=document.createElement('td');
      const cb=document.createElement('input'); cb.type='checkbox';
      tdWork.appendChild(cb); tr.appendChild(tdWork);

      const tdStart=document.createElement('td');
      const tpS=document.createElement('div'); tpS.className='time-picker'; tdStart.appendChild(tpS);
      const tpStart=createTimePicker(tpS);

      const tdEnd=document.createElement('td');
      const tpE=document.createElement('div'); tpE.className='time-picker'; tdEnd.appendChild(tpE);
      const tpEnd=createTimePicker(tpE);

      tr.appendChild(tdStart); tr.appendChild(tdEnd);

      const tdAct=document.createElement('td');
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='btn-icon btn-icon-green';
      btn.textContent='Guardar';
      btn.addEventListener('click', ()=> {
        const s = tpStart.get();
        const e = tpEnd.get();
        if (!s || !e) { alert('Selecciona hora de inicio y fin.'); return; }
        if (s >= e) { alert('La hora de inicio debe ser menor que la hora de fin.'); return; }
        cb.checked = true;
        alert('Horario guardado para ' + d + '.');
      });
      tdAct.appendChild(btn);
      tr.appendChild(tdAct);

      perDayBody.appendChild(tr);
    });
  }

  // Inicializar UI dinámica (como MVP)
  createTimePicker(document.getElementById('commonStart'));
  createTimePicker(document.getElementById('commonEnd'));
  createTimePicker(document.getElementById('lunchStart'));
  createTimePicker(document.getElementById('lunchEnd'));
  renderDayCheckboxes(document.getElementById('commonDays'));
  renderDayCheckboxes(document.getElementById('lunchDays'));
  renderPerDayTable();

  // Toggle bloque "mismo horario"
  const sameAllWeek = document.getElementById('sameAllWeek');
  const sameWeekBlock = document.getElementById('sameWeekBlock');
  sameAllWeek?.addEventListener('change', () => {
    if (!sameWeekBlock) return;
    sameWeekBlock.style.display = sameAllWeek.checked ? 'block' : 'none';
  });

  // Guardar fechas (solo validación UI)
  const btnSaveDates = document.getElementById('btnSaveDates');
  btnSaveDates?.addEventListener('click', () => {
    const start = document.getElementById('dateStart')?.value || '';
    const end = document.getElementById('dateEnd')?.value || '';
    const warn = document.getElementById('dateWarn');

    if (warn) warn.style.display = 'none';

    if (start && end && start > end) {
      if (warn) {
        warn.textContent = 'La fecha de inicio no puede ser mayor que la fecha de fin.';
        warn.style.display = 'block';
      }
      return;
    }
    alert('Fechas guardadas.');
  });

  // Actualizar agenda (placeholder UI)
  document.getElementById('btnUpdateAgenda')?.addEventListener('click', () => {
    const txt = document.getElementById('agendaSummary');
    if (txt) txt.value = 'Agenda actualizada (vista MVP). Conectaremos guardado real a Supabase en el siguiente paso.';
  });
}
