import { AdminController } from '../../controllers/AdminController.js';
import { StatsService } from '../../services/StatsService.js';

function pick(row, keys, fallback = 0) {
  for (const k of keys) {
    if (row && row[k] !== undefined && row[k] !== null) return row[k];
  }
  return fallback;
}

export default async function AdminDashboardView() {
  // Solicitudes pendientes
  const solicitudesNegocio = await AdminController.pendientes();         // ahora devuelve solicitudes tipo negocio
  const solicitudesBarbero = await AdminController.barberosPendientes(); // ahora devuelve solicitudes tipo barbero

  const { data: statsRows } = await StatsService.global();
  const stats = Array.isArray(statsRows) ? (statsRows[0] || {}) : (statsRows || {});

  const negociosActivos = pick(stats, ['barberias_activas', 'negocios_activos', 'negocios_activos_count', 'barberias_activas_count'], 0);
  const barberosActivos = pick(stats, ['barberos_activos', 'personal_activo', 'barberos_activos_count', 'personal_activo_count'], 0);
  const citasDia = pick(stats, ['citas_por_dia_7d', 'citas_dia_prom_7d', 'citas_dia', 'citas_dia_promedio'], 0);
  const tasaCancel = pick(stats, ['tasa_cancelacion', 'cancelacion_pct', 'tasa_cancelacion_pct'], 0);

  const ratingProm = pick(stats, ['rating_promedio', 'promedio_rating', 'rating_avg'], null);
  const totalComentarios = pick(stats, ['total_comentarios', 'comentarios_total'], null);

  const barberRows = (solicitudesBarbero || []).map(s => `
    <tr>
      <td>${s.usuario?.nombre_completo ?? ''}</td>
      <td>${s.usuario?.correo ?? ''}</td>
      <td>${s.creado_en ?? ''}</td>
      <td><button class="approve-barber" data-id="${s.id}">Aprobar</button></td>
    </tr>
  `).join('') || `<tr><td colspan="4">No hay solicitudes de barbero pendientes.</td></tr>`;

  const rows = (solicitudesNegocio || []).map(s => `
    <tr>
      <td>${s.negocio?.nombre ?? ''}</td>
      <td>${s.negocio?.direccion ?? ''}</td>
      <td>${s.creado_en ?? ''}</td>
      <td><button class="approve-business" data-id="${s.id}">Aprobar</button></td>
    </tr>
  `).join('') || `<tr><td colspan="4">No hay solicitudes de negocio pendientes.</td></tr>`;

  return `
  <style>
    :root{
      --container-w: 980px;
      --container-pad: 20px;
      --container-bl: 4px;

      --banner-h: 64px;
      --banner-bg: #e6e9ee;
      --banner-bg-hover: #d7dbe3;

      --blue:#5c6bc0;
      --blue-h:#3f51b5;
      --ink:#233247;
    }

    *{ box-sizing:border-box; }

    /* Fondo y espaciado como el MVP */
    body{
      font-family:'Open Sans',sans-serif;
      background:#eee;
      color:#333;
      margin:0;
      padding:20px;
      padding-top: calc(var(--banner-h) + 20px); /* espacio para banner fijo */
    }

    /* ===== Banner superior (alineado al ancho de la página/contenedor) ===== */
    .app-banner{
      position:fixed; top:0; left:0; right:0;
      height:var(--banner-h);
      z-index:999;
    }
    .banner-shell{
      max-width: calc(var(--container-w) + var(--container-pad)*2 + var(--container-bl));
      margin:0 auto;
    }
    .banner-box{
      height:100%;
      background:var(--banner-bg);
      border-radius:10px;
      border-bottom:1px solid rgba(0,0,0,.06);
      display:flex;
      align-items:center;
      transition:.2s;
      padding:0 12px;
    }
    .banner-box:hover{ background:var(--banner-bg-hover); }
    .banner-inner{
      display:grid;
      grid-template-columns: 1fr auto 1fr;
      align-items:center;
      gap:8px;
      width:100%;
    }
    .banner-title{
      justify-self:center;
      font-weight:700;
      color:var(--ink);
    }
    .banner-logo{
      justify-self:end;
      display:flex;
      align-items:center;
      text-decoration:none;
    }
    .banner-logo img{
      width:52px;
      height:auto;
      display:block;
    }
    .back-button{
      justify-self:start;
      display:inline-block;
      text-decoration:none;
      font-size:14px;
      color:var(--blue);
      padding:8px 12px;
      border:1px solid var(--blue);
      border-radius:6px;
      transition:.2s;
      background:transparent;
      cursor:pointer;
    }
    .back-button:hover{ background:var(--blue); color:#fff; }

    /* ===== Contenedor principal (como MVP) ===== */
    .container{
      max-width:var(--container-w);
      margin:0 auto;
      background:#fff;
      border-radius:10px;
      padding:var(--container-pad);
      border-left:var(--container-bl) solid var(--blue);
      box-shadow:0 4px 8px rgba(0,0,0,.05);
    }

    h1{
      margin:0 0 18px;
      text-align:center;
      font-size:38px;
      color:#000;
    }
    h2{
      margin:18px 0 10px;
      font-size:30px;
      color:#000;
    }
    .muted{ color:#666; font-size:12px; }

    /* KPIs */
    .kpis{
      display:grid;
      grid-template-columns:repeat(4, 1fr);
      gap:14px;
      margin-bottom:18px;
    }
    .kpi{
      background:#f8f9ff;
      border:1px solid #e5e7f5;
      border-radius:10px;
      padding:16px;
    }
    .kpi .val{ font-size:30px; font-weight:800; color:#000; }
    .kpi .lbl{ margin-top:6px; color:#555; }

    /* Sección doble (como antes) */
    .grid2{
      display:grid;
      grid-template-columns: 1.2fr .8fr;
      gap:16px;
      align-items:start;
      margin-top:6px;
    }

    /* Tablas */
    table{
      width:100%;
      border-collapse:collapse;
      margin-top:12px;
      background:#fff;
    }
    th, td{
      padding:12px;
      border-bottom:1px solid #ececec;
      text-align:left;
    }
    th{
      background:#eef2ff;
      color:#273b7a;
      font-weight:700;
    }

    /* Botones (mantengo tu clase para no romper handlers) */
    .approve-business, .approve-barber{
      border:none;
      border-radius:8px;
      padding:10px 14px;
      cursor:pointer;
      color:#fff;
      background:var(--blue);
      font-weight:700;
    }
    .approve-business:hover, .approve-barber:hover{ background:var(--blue-h); }
    .approve-business:active, .approve-barber:active{ transform:scale(.98); }

    /* Legal fuera del contenedor (como MVP) */
    .legal-outside{
      margin:18px auto 24px;
      padding:10px 12px;
      max-width: calc(var(--container-w) + var(--container-pad)*2 + var(--container-bl));
      text-align:center;
      color:#666;
      font-size:14px;
      line-height:1.35;
    }

    @media(max-width:920px){
      .kpis{ grid-template-columns:repeat(2, 1fr); }
      .grid2{ grid-template-columns:1fr; }
    }
    @media(max-width:560px){
      .kpis{ grid-template-columns:1fr; }
    }
  </style>

  <!-- Banner superior -->
  <header class="app-banner">
    <div class="banner-shell">
      <div class="banner-box">
        <div class="banner-inner">
          <a class="back-button" href="#" onclick="history.back();return false;">&larr; Volver</a>
          <div class="banner-title">Panel admin</div>
          <a class="banner-logo" href="#/">
            <img src="assets/img/LogoCitasYa.png" alt="Citas Ya">
          </a>
        </div>
      </div>
    </div>
  </header>

  <div class="container">
    <h1>Panel de administración</h1>

    <section class="kpis">
      <div class="kpi">
        <div class="val">${negociosActivos}</div>
        <div class="lbl">Barberías activas</div>
      </div>
      <div class="kpi">
        <div class="val">${barberosActivos}</div>
        <div class="lbl">Barberos activos</div>
      </div>
      <div class="kpi">
        <div class="val">${Number(citasDia).toFixed(1)}</div>
        <div class="lbl">Citas/día (promedio 7d)</div>
      </div>
      <div class="kpi">
        <div class="val">${typeof tasaCancel === 'number' ? `${tasaCancel}%` : tasaCancel}</div>
        <div class="lbl">Tasa de cancelación</div>
      </div>
    </section>

    <div class="grid2">
      <div>
        <h2>Resumen de comentarios</h2>
        ${ratingProm !== null ? `
          <div class="muted">Promedio</div>
          <div style="font-size:28px;font-weight:800;margin:4px 0 10px 0;">
            ${Number(ratingProm).toFixed(1)} / 5.0 ★
          </div>
        ` : `<div class="muted">No hay métricas de comentarios disponibles en <b>estadisticas_globales</b>.</div>`}
        ${totalComentarios !== null ? `<div class="muted">Total comentarios: ${totalComentarios}</div>` : ``}
      </div>

      <div>
        <h2>Aprobación</h2>
        <div class="muted">Solicitudes pendientes (barbero y negocio).</div>
      </div>
    </div>

    <h2>Solicitudes de barbero</h2>
    <div class="muted">Usuarios con solicitud <b>pendiente</b>.</div>
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Registro</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>${barberRows}</tbody>
    </table>

    <h2>Solicitudes de negocio</h2>
    <div class="muted">Negocios con solicitud <b>pendiente</b> (negocio.activo = false).</div>
    <table>
      <thead>
        <tr>
          <th>Negocio</th>
          <th>Dirección</th>
          <th>Registro</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>

  <div class="legal-outside">
    Todos los derechos reservados © 2026<br>
    Citas Ya S.A.S - Nit 810.000.000-0
  </div>
  `;

}

export function onMount() {
  document.addEventListener('click', async (e) => {
    const btnBarber = e.target?.closest?.('.approve-barber');
    if (btnBarber){
      const id = btnBarber.getAttribute('data-id');
      if (!id) return;
      btnBarber.disabled = true;
      btnBarber.textContent = 'Aprobando...';
      try{
        await AdminController.aprobarBarbero(id);
        location.reload();
      }catch(err){
        console.error(err);
        btnBarber.disabled = false;
        btnBarber.textContent = 'Aprobar';
        alert('No se pudo aprobar. Revisa consola.');
      }
      return;
    }

    const btnBusiness = e.target?.closest?.('.approve-business');
    if (btnBusiness){
      const id = btnBusiness.getAttribute('data-id');
      if (!id) return;
      btnBusiness.disabled = true;
      btnBusiness.textContent = 'Aprobando...';
      try{
        await AdminController.aprobar(id);
        location.reload();
      }catch(err){
        console.error(err);
        btnBusiness.disabled = false;
        btnBusiness.textContent = 'Aprobar';
        alert('No se pudo aprobar. Revisa consola.');
      }
    }
  });
}
