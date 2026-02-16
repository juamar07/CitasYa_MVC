import { navigate } from '../../router/index.js';

export default async function ClienteAgendarView(){
  return `
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
    label{ display:block; margin:8px 0 4px; color:#003366; }
    .muted{ color:#666; font-size:14px; }
    input[type="text"], input[type="date"], select, textarea{
      width:100%; padding:10px; border:2px solid #ddd; border-radius:6px; font-size:16px;
      transition: border-color .2s; box-sizing:border-box;
    }
    input:focus, select:focus, textarea:focus{ outline:none; border-color:#7da2a9; }
    .row{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
    .two-btns{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
    .wide75{ width:75%; margin:12px auto; }
    @media (max-width:768px){ .row, .two-btns, .wide75{ grid-template-columns:1fr; width:100%; } }
    .btn{
      display:block; border:none; border-radius:6px; padding:12px 18px; color:#fff; font-weight:700; cursor:pointer;
      transition: background-color .2s, transform .2s; width:100%; margin:10px 0; font-size:16px;
    }
    .btn:hover{ transform: translateY(-1px); }
    .btn-green{ background:#66bb6a; } .btn-green:hover{ background:#43a047; }
    .btn-blue{  background:#5c6bc0; } .btn-blue:hover{  background:#3f51b5; }
    .btn-red{   background:#ef5350; } .btn-red:hover{   background:#e53935; }
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
  </style>
  <header class="app-banner" role="banner">
    <div class="banner-box">
      <div class="banner-inner">
        <a href="#" class="back-button banner-back" data-action="back">&larr; Volver</a>
        <div class="banner-title">Programación de Citas</div>
        <a href="#/" class="banner-logo" aria-label="Ir al inicio">
          <img src="assets/img/LogoCitasYa.png" alt="Citas Ya">
        </a>
      </div>
    </div>
  </header>
  <div class="container">
    <h1>Programación de Citas</h1>
    <section>
      <label for="attendee">Ingrese nombre completo del asistente</label>
      <input type="text" id="attendee" placeholder="Ej: Juan Martín Betancur">
    </section>
    <section>
      <label for="biz">Ingrese el nombre del establecimiento</label>
      <input type="text" id="biz" placeholder="Ej: Barbería Central">
      <small class="muted">La búsqueda ignora mayúsculas y acentos.</small>
    </section>
    <section>
      <label for="service">Seleccione el servicio</label>
      <select id="service">
        <option value="">— Seleccione —</option>
      </select>
      <small class="muted" id="svcDur">Duración: —</small>
    </section>
    <section>
      <label for="staff">Seleccione el barbero</label>
      <select id="staff">
        <option value="">— Seleccione —</option>
      </select>
    </section>
    <section>
      <div class="row">
        <div>
          <label for="date">Seleccione la fecha de la cita</label>
          <input type="date" id="date">
        </div>
        <div>
          <label for="timeSel">Seleccione la hora de la cita</label>
          <select id="timeSel">
            <option value="">— Selecciona fecha, servicio y barbero —</option>
          </select>
          <small class="muted" id="timeHelp"></small>
        </div>
      </div>
    </section>
    <section class="two-btns wide75">
      <button id="btnSchedule" class="btn btn-green">Programar cita</button>
      <button id="btnClear" class="btn btn-blue">Limpiar</button>
    </section>
    <section>
      <textarea id="summary" placeholder="Aquí verás el resumen de tu cita…" aria-label="Resumen" readonly></textarea>
    </section>
    <section class="two-btns wide75">
      <button type="button" id="btnComment" class="btn btn-blue">Déjanos tu comentario</button>
      <button type="button" id="btnCancel" class="btn btn-red">Cancelar una cita</button>
    </section>
  </div>
  <div class="legal-outside">
    Todos los derechos reservados © 2026<br>
    Citas Ya S.A.S - Nit 810.000.000-0
  </div>`;
}

export function onMount(){
  const backBtn = document.querySelector('[data-action="back"]');
  backBtn?.addEventListener('click', (ev) => { ev.preventDefault(); history.back(); });
  document.getElementById('btnComment')?.addEventListener('click', () => navigate('/comentarios'));
  document.getElementById('btnCancel')?.addEventListener('click', () => navigate('/cliente/cancelar'));
}
