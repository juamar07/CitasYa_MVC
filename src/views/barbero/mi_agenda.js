import { BarberoAgendaController } from '../../controllers/BarberoAgendaController.js';
import { supabase } from '../../config/supabaseClient.js';
import { navigate } from '../../router/index.js';
import { getUsuarioId } from '../../store/auth.js';
import { formatDate, formatTime } from '../../utils/dates.js';
import { ConjuntoHorarioModel } from '../../models/ConjuntoHorarioModel.js';
import { DiaHorarioModel } from '../../models/DiaHorarioModel.js';

function pick(obj, keys, fallback = '—') {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
  }
  return fallback;
}

export default async function BarberoMiAgendaView(){
  // 1) nombre del usuario (para “Bienvenido de nuevo, …”)
  const usuarioId = getUsuarioId();
  const { data: u } = await supabase
    .from('usuarios')
    .select('nombre_completo')
    .eq('id', usuarioId)
    .single();

  const nombre = u?.nombre_completo || 'Mi agenda';

  // 2) obtener personal_id del barbero (para horario)
  const { data: personal } = await supabase
    .from('personal')
    .select('id')
    .eq('usuario_id', usuarioId)
    .single();

  // 3) citas
  const citas = await BarberoAgendaController.miAgenda();

  // 4) pintar citas (con fallback)
  const rows = (citas||[]).map(c => `
    <tr>
      <td>${c.asistente ?? '-'}</td>
      <td>${formatDate(c.fecha ?? (c.inicia_en?.substring?.(0,10) || ''))}</td>
      <td>${formatTime(c.inicia_en)}</td>
      <td>${formatTime(c.termina_en)}</td>
      <td>${c.servicio ?? (c.servicio_id ?? '-')}</td>
    </tr>
  `).join('') || `<tr><td colspan="5" class="muted">No hay citas para mostrar.</td></tr>`;

  // 5) horario (si existe en BD)
  let scheduleHtml = `<div class="muted">No hay un horario publicado aún.</div>`;
  let rangeInfo = '';

  if (personal?.id) {
    const { data: conjuntos } = await ConjuntoHorarioModel.listByPersonal(personal.id);
    const last = Array.isArray(conjuntos) && conjuntos.length ? conjuntos[conjuntos.length - 1] : null;

    if (last?.id) {
      const { data: dias } = await DiaHorarioModel.listByConjunto(last.id);

      if (Array.isArray(dias) && dias.length) {
        const dayNames = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

        const body = dias.map(d => {
          const idx = Number(pick(d, ['dia_semana','dia','dia_idx'], -1));
          const day = dayNames[idx] || `Día ${idx}`;

          const work = !!pick(d, ['trabaja','work','activo'], false);
          const start = pick(d, ['hora_inicio','inicio','start'], '—');
          const end   = pick(d, ['hora_fin','fin','end'], '—');
          const lunchStart = pick(d, ['almuerzo_inicio','inicio_almuerzo','lunch_start'], '');
          const lunchEnd   = pick(d, ['almuerzo_fin','fin_almuerzo','lunch_end'], '');
          const lunch = (lunchStart && lunchEnd) ? `${lunchStart} – ${lunchEnd}` : '—';

          return `
            <tr>
              <td>${day}</td>
              <td>${work ? 'Sí' : 'No'}</td>
              <td>${work ? start : '—'}</td>
              <td>${work ? end : '—'}</td>
              <td>${work ? lunch : '—'}</td>
            </tr>
          `;
        }).join('');

        scheduleHtml = `
          <table>
            <thead>
              <tr>
                <th>Día</th><th>Trabaja</th><th>Inicio</th><th>Fin</th><th>Almuerzo</th>
              </tr>
            </thead>
            <tbody>${body}</tbody>
          </table>
        `;

        const ds = pick(last, ['fecha_inicio','date_start','inicio'], '');
        const de = pick(last, ['fecha_fin','date_end','fin'], '');
        if (ds && de) rangeInfo = `Rango de fechas: ${ds} → ${de}`;
      }
    }
  }

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
      font-family:'Open Sans',sans-serif;
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
    h1{ text-align:center; margin:0 0 8px; font-weight:700; }
    h2{ margin:18px 0 8px; font-weight:700; color:#000; }
    .muted{ color:#666; font-size:14px; }

    table{ width:100%; border-collapse: collapse; }
    th, td{ padding:10px; border-bottom:1px solid #eee; text-align:left; }
    th{ background:#f6f7fb; font-weight:700; color:#233247; }

    .btn{
      display:block; border:none; border-radius:6px; padding:12px 18px; color:#fff; font-weight:700; cursor:pointer;
      transition: background-color .2s, transform .2s; width:100%; margin:10px 0; font-size:16px;
    }
    .btn:hover{ transform: translateY(-1px); }
    .btn-green{ background:#66bb6a; } .btn-green:hover{ background:#43a047; }
    .btn-blue{  background:#5c6bc0; } .btn-blue:hover{  background:#3f51b5; }

    .wide75{ width:75%; margin:12px auto; }
    @media (max-width:768px){ .wide75{ width:100%; } }

    .app-banner{ position:fixed; top:0; left:0; right:0; height:var(--banner-h); z-index:9999; background:transparent; }
    .app-banner .banner-box{
      height:100%;
      width:min(calc(var(--container-w) + var(--container-pad)*2 + var(--container-bl)), calc(100% - var(--page-sidepad)*2));
      margin:0 auto; background:var(--banner-bg); border-bottom:1px solid rgba(0,0,0,.06); border-radius:10px;
      display:flex; align-items:center; transition:background-color .2s ease;
    }
    .app-banner .banner-box:hover,.app-banner .banner-box:focus-within{ background:var(--banner-bg-hover); }
    .app-banner .banner-inner{ display:grid; grid-template-columns: 1fr auto 1fr; align-items:center; gap:8px; width:100%; padding:0 12px; }
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
      margin:18px auto 24px; padding:10px 12px;
      max-width: calc(var(--container-w) + var(--container-pad)*2 + var(--container-bl));
      text-align:center; color:#666; font-size:14px; line-height:1.35;
    }

    .card{
      border:1px dashed #cfd6e4; border-radius:8px; padding:12px; background:#fbfcff;
    }
  </style>

  <header class="app-banner" role="banner">
    <div class="banner-box">
      <div class="banner-inner">
        <a href="#" id="btnBack" class="back-button banner-back">&larr; Volver</a>
        <div class="banner-title">Mi agenda</div>
        <a href="#" id="btnHome" class="banner-logo" aria-label="Ir al inicio">
          <img src="assets/img/LogoCitasYa.png" alt="Citas Ya">
        </a>
      </div>
    </div>
  </header>

  <div class="container">
    <h1 id="welcome">Bienvenido de nuevo, ${nombre}</h1>

    <section>
      <h2>Citas agendadas</h2>
      <div class="card">
        <table id="tblBookings">
          <thead>
            <tr>
              <th>Asistente</th>
              <th>Fecha</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Servicio</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>

    <section class="wide75" style="margin-top:6px;">
      <button id="btnICS" class="btn btn-blue">Conectar con calendario virtual</button>
    </section>

    <section>
      <h2>Mi horario</h2>
      <div id="scheduleView" class="card">${scheduleHtml}</div>
      <div class="muted" id="rangeInfo" style="margin-top:6px;">${rangeInfo}</div>
    </section>

    <section class="wide75">
      <button id="btnEdit" class="btn btn-green">Editar agenda</button>
    </section>
  </div>

  <div class="legal-outside">
    Todos los derechos reservados © 2026<br>
    Citas Ya S.A.S - Nit 810.000.000-0
  </div>
  `;
}

export function onMount(){
  document.getElementById('btnBack')?.addEventListener('click', (e)=>{ e.preventDefault(); navigate('/barbero/organizar-agenda'); });
  document.getElementById('btnEdit')?.addEventListener('click', ()=> navigate('/barbero/organizar-agenda'));
  document.getElementById('btnHome')?.addEventListener('click', (e)=>{ e.preventDefault(); navigate('/'); });

  document.getElementById('btnICS')?.addEventListener('click', ()=>{
    alert('Exportación ICS pendiente de conectar en MVC (la UI ya está lista).');
  });
}
