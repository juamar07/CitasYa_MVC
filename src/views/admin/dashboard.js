import { AdminController } from '../../controllers/AdminController.js';
import { StatsService } from '../../services/StatsService.js';

function pick(row, keys, fallback = 0) {
  for (const k of keys) {
    if (row && row[k] !== undefined && row[k] !== null) return row[k];
  }
  return fallback;
}

export default async function AdminDashboardView() {
  // Pendientes (panel aprobación negocios)
  const pendientes = await AdminController.pendientes();

  // Estadísticas globales (puede venir como array)
  const { data: statsRows } = await StatsService.global();
  const stats = Array.isArray(statsRows) ? (statsRows[0] || {}) : (statsRows || {});

  // Mapeo defensivo
  const negociosActivos = pick(stats, ['barberias_activas', 'negocios_activos', 'negocios_activos_count', 'barberias_activas_count'], 0);
  const barberosActivos = pick(stats, ['barberos_activos', 'personal_activo', 'barberos_activos_count', 'personal_activo_count'], 0);
  const citasDia = pick(stats, ['citas_por_dia_7d', 'citas_dia_prom_7d', 'citas_dia', 'citas_dia_promedio'], 0);
  const tasaCancel = pick(stats, ['tasa_cancelacion', 'cancelacion_pct', 'tasa_cancelacion_pct'], 0);

  const ratingProm = pick(stats, ['rating_promedio', 'promedio_rating', 'rating_avg'], null);
  const totalComentarios = pick(stats, ['total_comentarios', 'comentarios_total'], null);

  const barberosPendientes = await AdminController.barberosPendientes();
  const barberRows = (barberosPendientes || []).map(p => `
    <tr>
      <td>${p.nombre_publico ?? ''}</td>
      <td>${p.negocios?.nombre ?? ''}</td>
      <td>${p.propietario ? 'Sí' : 'No'}</td>
      <td>${p.creado_en ?? ''}</td>
      <td><button class="approve-barber" data-id="${p.id}">Aprobar</button></td>
    </tr>
  `).join('') || `<tr><td colspan="5">No hay barberos pendientes.</td></tr>`;

  const rows = (pendientes || []).map(n => `
    <tr>
      <td>${n.nombre ?? ''}</td>
      <td>${n.direccion ?? ''}</td>
      <td>${n.creado_en ?? ''}</td>
      <td><button class="approve" data-id="${n.id}">Aprobar</button></td>
    </tr>
  `).join('') || `<tr><td colspan="4">No hay negocios pendientes.</td></tr>`;

  return `
  <style>
    :root{
      --container-w: 1100px;
      --container-pad: 20px;
      --container-bl: 0px;
      --banner-h: 64px;
      --page-sidepad: 16px;
      --banner-bg: #e6e9ee;
      --banner-bg-hover: #d7dbe3;
      --btn-blue: #5c6bc0;
      --btn-blue-hover:#3f51b5;
    }

    /* ✅ Mantiene tu estilo actual, solo ajusta padding-top para el banner */
    body{
      font-family:'Open Sans',sans-serif;
      background:#eff3ff;
      margin:0;
      padding:20px;
      padding-top: calc(var(--banner-h) + 8px);
    }

    /* Header estándar (igual login) */
    .app-banner{
      position:fixed; top:0; left:0; right:0; height:var(--banner-h); z-index:9999; background:transparent;
    }
    .app-banner .banner-box{
      height:100%;
      width:min(calc(var(--container-w) + var(--container-pad)*2 + var(--container-bl)),
                calc(100% - var(--page-sidepad)*2));
      margin:0 auto; background:var(--banner-bg); border-bottom:1px solid rgba(0,0,0,.06); border-radius:10px;
      transition: background-color .2s; display:flex; align-items:center;
    }
    .app-banner .banner-box:hover, .app-banner .banner-box:focus-within{ background:var(--banner-bg-hover); }
    .app-banner .banner-inner{ display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:8px; width:100%; padding:0 12px; }
    .banner-back{ justify-self:start; }
    .banner-title{ justify-self:center; font-weight:700; color:#233247; }
    .banner-logo{ justify-self:end; display:inline-flex; align-items:center; }
    .banner-logo img{ width:52px; height:auto; display:block; }
    .back-button{
      display:inline-block; text-decoration:none; font-size:14px; color:var(--btn-blue);
      padding:8px 12px; border:1px solid var(--btn-blue); border-radius:6px; transition: background-color .2s, color .2s;
    }
    .back-button:hover{ background:var(--btn-blue); color:#fff; }

    /* Footer fuera del card */
    .legal-outside{
      margin:18px auto 24px; padding:10px 12px;
      max-width: calc(var(--container-w) + var(--container-pad)*2 + var(--container-bl));
      text-align:center; color:#666; font-size:14px; line-height:1.35;
    }

    /* ====== TU CSS ORIGINAL (intacto) ====== */
    .wrap{ max-width:1100px; margin:0 auto; }
    .card{ background:#fff; border-radius:16px; box-shadow:0 16px 36px rgba(15,23,42,.12); padding:22px; }
    h1{ margin:0 0 16px 0; font-size:38px; }
    h2{ margin:22px 0 10px 0; font-size:28px; }

    .kpis{ display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:16px; margin-top:10px; }
    .kpi{ background:#f7f9ff; border:1px solid #dbe4ff; border-radius:14px; padding:16px; }
    .kpi .val{ font-size:34px; font-weight:800; }
    .kpi .lbl{ margin-top:6px; color:#334155; }

    .grid2{ display:grid; grid-template-columns:1.2fr .8fr; gap:16px; margin-top:14px; }
    .muted{ color:#64748b; font-size:14px; }

    table{ width:100%; border-collapse:collapse; margin-top:12px; }
    th, td{ padding:12px; border-bottom:1px solid #e5e9f2; text-align:left; }
    th{ background:#eef2ff; color:#273b7a; }
    .approve{ padding:8px 14px; border:none; border-radius:8px; background:#5c6bc0; color:#fff; font-weight:700; cursor:pointer; }
    .approve:active{ transform:scale(.98); }
    .approve-barber{ padding:8px 14px; border:none; border-radius:8px; background:#5c6bc0; color:#fff; font-weight:700; cursor:pointer; }
    .approve-barber:active{ transform:scale(.98); }

    @media (max-width: 980px){
      .kpis{ grid-template-columns:repeat(2,minmax(0,1fr)); }
      .grid2{ grid-template-columns:1fr; }
      h1, .banner-title{ font-size:20px; }
    }
  </style>

  <header class="app-banner" role="banner">
    <div class="banner-box">
      <div class="banner-inner">
        <a href="#" class="back-button banner-back" data-action="back">&larr; Volver</a>
        <div class="banner-title">Panel admin</div>
        <a href="#/" class="banner-logo" aria-label="Ir al inicio">
          <img src="./assets/img/LogoCitasYa.png" alt="Citas Ya">
        </a>
      </div>
    </div>
  </header>

  <div class="wrap">
    <div class="card">
      <h1>Panel de administración</h1>

      <div class="kpis">
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
      </div>

      <div class="grid2">
        <div>
          <h2>Resumen de comentarios</h2>
          ${ratingProm !== null ? `
            <div class="muted">Promedio</div>
            <div style="font-size:34px;font-weight:800;margin:4px 0 10px 0;">
              ${Number(ratingProm).toFixed(1)} / 5.0 ★
            </div>
          ` : `<div class="muted">No hay métricas de comentarios disponibles en <b>estadisticas_globales</b>.</div>`}
          ${totalComentarios !== null ? `<div class="muted">Total comentarios: ${totalComentarios}</div>` : ``}
        </div>
        <div>
          <h2>Aprobación de negocios</h2>
          <div class="muted">Negocios con estado <b>pendiente</b>.</div>
        </div>
      </div>

      <h2>Barberos pendientes</h2>
      <div class="muted">Personal con <b>activo = false</b>.</div>
      <table>
        <thead>
          <tr>
            <th>Nombre público</th>
            <th>Negocio</th>
            <th>Propietario</th>
            <th>Registro</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>${barberRows}</tbody>
      </table>

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

      <div class="muted" style="margin-top:10px;"></div>
    </div>
  </div>

  <div class="legal-outside">
    Todos los derechos reservados © 2026<br>
    Citas Ya S.A.S - Nit 810.000.000-0
  </div>
  `;
}

export function onMount() {
  // ✅ Volver a la última página navegada
  const backBtn = document.querySelector('[data-action="back"]');
  backBtn?.addEventListener('click', (ev) => { ev.preventDefault(); history.back(); });

  document.addEventListener('click', async (e) => {
    const btn = e.target?.closest?.('.approve-barber');
    if (!btn) return;

    const id = btn.getAttribute('data-id');
    if (!id) return;

    btn.disabled = true;
    btn.textContent = 'Aprobando...';

    try {
      await AdminController.aprobarBarbero(id);
      location.reload();
    } catch (err) {
      console.error(err);
      btn.disabled = false;
      btn.textContent = 'Aprobar';
      alert('No se pudo aprobar el barbero. Revisa consola.');
    }
  });
}
