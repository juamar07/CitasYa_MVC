import { AdminController } from '../../controllers/AdminController.js';

function formatSentimientos(sentimientos = {}) {
  return {
    malo: sentimientos.malo || 0,
    neutro: sentimientos.neutro || 0,
    muyBueno: sentimientos['muy bueno'] || 0
  };
}

function renderComentariosRecientes(comentarios = []) {
  if (!comentarios.length) {
    return '<tr><td colspan="6">No hay comentarios recientes.</td></tr>';
  }

  return comentarios.map((c) => `
    <tr>
      <td>${c.nombre_autor || 'Anónimo'}</td>
      <td>${c.destino}${c.negocio_nombre ? ` (${c.negocio_nombre})` : ''}</td>
      <td>${c.calificacion ?? 0}</td>
      <td>${c.recomienda ? 'Sí' : 'No'}</td>
      <td>${c.sentimiento || 'malo'}</td>
      <td>${c.texto || ''}</td>
    </tr>
  `).join('');
}

export default async function AdminDashboardView() {
  const [solicitudesNegocio, solicitudesBarbero, dashboard] = await Promise.all([
    AdminController.pendientes(),
    AdminController.barberosPendientes(),
    AdminController.dashboardData()
  ]);

  const { stats = {}, comentarios = {} } = dashboard || {};
  const sentimientos = formatSentimientos(comentarios.sentimientos || {});

  const barberRows = (solicitudesBarbero || []).map((s) => `
    <tr>
      <td>${s.usuario?.nombre_completo ?? ''}</td>
      <td>${s.usuario?.correo ?? ''}</td>
      <td>${s.creado_en ?? ''}</td>
      <td><button class="approve-barber" data-id="${s.id}">Aprobar</button></td>
    </tr>
  `).join('') || `<tr><td colspan="4">No hay solicitudes de barbero pendientes.</td></tr>`;

  const businessRows = (solicitudesNegocio || []).map((s) => `
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

      body{
        font-family:'Open Sans',sans-serif;
        background:#eee;
        color:#333;
        margin:0;
        padding:20px;
        padding-top: calc(var(--banner-h) + 20px);
      }

      .app-banner{
        position:fixed;
        top:0;
        left:0;
        right:0;
        height:var(--banner-h);
        z-index:999;
      }

      .banner-shell{
        max-width: calc(var(--container-w) + var(--container-pad)*2 + var(--container-bl));
        margin:0 auto;
        height:100%;
      }

      .banner-box{
        height:100%;
        background:var(--banner-bg);
        border-radius:10px;
        display:flex;
        align-items:center;
        transition:background-color .2s ease;
      }

      .banner-box:hover{ background:var(--banner-bg-hover); }

      .banner-inner{
        display:grid;
        grid-template-columns:1fr auto 1fr;
        width:100%;
        align-items:center;
        padding:0 12px;
      }

      .banner-title{
        text-align:center;
        font-size:18px;
        font-weight:700;
        color:var(--ink);
      }

      .back-button{
        justify-self:start;
        display:inline-flex;
        align-items:center;
        gap:8px;
        padding:10px 14px;
        background:#fff;
        border:1px solid rgba(0,0,0,.08);
        border-radius:10px;
        color:#37465b;
        text-decoration:none;
        font-weight:700;
      }

      .banner-logo{
        justify-self:end;
        display:inline-flex;
        align-items:center;
      }

      .banner-logo img{
        width:54px;
        height:54px;
        object-fit:contain;
      }

      .container{
        max-width:var(--container-w);
        margin:0 auto;
        padding:var(--container-pad);
        background:#fff;
        border-radius:10px;
        box-shadow:0 4px 8px rgba(0,0,0,.05);
        border-left:var(--container-bl) solid var(--blue);
      }

      h1{ margin:0 0 18px; text-align:center; font-size:38px; color:#000; }
      h2{ margin:18px 0 10px; font-size:30px; color:#000; }
      .muted{ color:#666; font-size:12px; }

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

      .kpi .val{
        font-size:30px;
        font-weight:800;
        color:#000;
      }

      .kpi .lbl{
        margin-top:6px;
        color:#555;
      }

      .grid2{
        display:grid;
        grid-template-columns:1.2fr .8fr;
        gap:16px;
        align-items:start;
        margin-top:6px;
      }

      .card{
        background:#fafafa;
        border:1px solid #ececec;
        border-radius:10px;
        padding:14px;
      }

      .stats-list{
        display:grid;
        grid-template-columns:repeat(2, 1fr);
        gap:10px;
        margin-top:10px;
      }

      .stats-pill{
        background:#eef2ff;
        color:#273b7a;
        border-radius:10px;
        padding:10px 12px;
        font-weight:700;
      }

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
        vertical-align:top;
      }

      th{
        background:#eef2ff;
        color:#273b7a;
        font-weight:700;
      }

      .approve-business,
      .approve-barber{
        border:none;
        border-radius:8px;
        padding:10px 14px;
        cursor:pointer;
        color:#fff;
        background:var(--blue);
        font-weight:700;
      }

      .approve-business:hover,
      .approve-barber:hover{
        background:var(--blue-h);
      }

      @media (max-width: 900px){
        .kpis{ grid-template-columns:repeat(2, 1fr); }
        .grid2{ grid-template-columns:1fr; }
      }

      @media (max-width: 640px){
        .kpis{ grid-template-columns:1fr; }
        h1{ font-size:30px; }
        h2{ font-size:24px; }
      }
    </style>

    <header class="app-banner">
      <div class="banner-shell">
        <div class="banner-box">
          <div class="banner-inner">
            <a class="back-button" href="#" id="btnBack">&larr; Volver</a>
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
          <div class="val">${stats.negociosActivos ?? 0}</div>
          <div class="lbl">Barberías activas</div>
        </div>
        <div class="kpi">
          <div class="val">${stats.barberosActivos ?? 0}</div>
          <div class="lbl">Barberos activos</div>
        </div>
        <div class="kpi">
          <div class="val">${Number(stats.citasDia ?? 0).toFixed(1)}</div>
          <div class="lbl">Citas/día (promedio 7d)</div>
        </div>
        <div class="kpi">
          <div class="val">${typeof stats.tasaCancel === 'number' ? `${stats.tasaCancel}%` : (stats.tasaCancel ?? '0%')}</div>
          <div class="lbl">Tasa de cancelación</div>
        </div>
      </section>

      <div class="grid2">
        <div class="card">
          <h2>Resumen de comentarios</h2>
          <div class="muted">Total comentarios: ${comentarios.total ?? 0}</div>
          <div style="font-size:28px;font-weight:800;margin:6px 0 12px 0;">
            ${comentarios.promedioCalificacion !== null && comentarios.promedioCalificacion !== undefined
              ? `${Number(comentarios.promedioCalificacion).toFixed(1)} / 5.0 ★`
              : 'Sin calificaciones'}
          </div>

          <div class="stats-list">
            <div class="stats-pill">Recomiendan: ${comentarios.recomendacionesSi ?? 0}</div>
            <div class="stats-pill">No recomiendan: ${comentarios.recomendacionesNo ?? 0}</div>
            <div class="stats-pill">Muy bueno: ${sentimientos.muyBueno}</div>
            <div class="stats-pill">Neutro: ${sentimientos.neutro}</div>
            <div class="stats-pill">Malo: ${sentimientos.malo}</div>
          </div>
        </div>

        <div class="card">
          <h2>Aprobación</h2>
          <div class="muted">Solicitudes pendientes de barberos y negocios.</div>
        </div>
      </div>

      <h2>Comentarios recientes</h2>
      <table>
        <thead>
          <tr>
            <th>Autor</th>
            <th>Destino</th>
            <th>Calificación</th>
            <th>Recomienda</th>
            <th>Sentimiento</th>
            <th>Comentario</th>
          </tr>
        </thead>
        <tbody>${renderComentariosRecientes(comentarios.recientes || [])}</tbody>
      </table>

      <h2>Solicitudes de barbero</h2>
      <div class="muted">Usuarios con solicitud pendiente.</div>
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
      <div class="muted">Negocios con solicitud pendiente.</div>
      <table>
        <thead>
          <tr>
            <th>Negocio</th>
            <th>Dirección</th>
            <th>Registro</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>${businessRows}</tbody>
      </table>
    </div>
  `;
}

export function onMount() {
  document.getElementById('btnBack')?.addEventListener('click', (e) => {
    e.preventDefault();
    history.back();
  });

  document.addEventListener('click', async (e) => {
    const barberBtn = e.target.closest('.approve-barber');
    if (barberBtn) {
      const id = Number(barberBtn.dataset.id || 0);
      if (!id) return;
      await AdminController.aprobarBarbero(id);
      window.location.reload();
      return;
    }

    const businessBtn = e.target.closest('.approve-business');
    if (businessBtn) {
      const id = Number(businessBtn.dataset.id || 0);
      if (!id) return;
      await AdminController.aprobar(id);
      window.location.reload();
    }
  });
}