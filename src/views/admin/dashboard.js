import { AdminController } from '../../controllers/AdminController.js';

export default async function AdminDashboardView(){
  const pendientes = await AdminController.pendientes();
  const rows = (pendientes||[]).map(n => `
    <tr>
      <td>${n.nombre}</td>
      <td>${n.direccion ?? ''}</td>
      <td>${n.creado_en ?? ''}</td>
      <td><button class="approve" data-id="${n.id}">Aprobar</button></td>
    </tr>`).join('') || '<tr><td colspan="4">No hay negocios pendientes.</td></tr>';
  return `
  <style>
    body{ font-family:'Open Sans',sans-serif; background:#eff3ff; margin:0; padding:20px; }
    .container{ max-width:1024px; margin:0 auto; background:#fff; padding:24px; border-radius:14px; box-shadow:0 16px 36px rgba(15,23,42,.12); }
    h1{ margin-top:0; }
    table{ width:100%; border-collapse:collapse; margin-top:16px; }
    th, td{ padding:12px; border-bottom:1px solid #e5e9f2; text-align:left; }
    th{ background:#eef2ff; color:#273b7a; }
    .approve{ padding:8px 14px; border:none; border-radius:6px; background:#5c6bc0; color:#fff; font-weight:600; cursor:pointer; }
  </style>
  <div class="container">
    <h1>Panel administrativo</h1>
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
  </div>`;
}

export function onMount(){
  document.querySelectorAll('.approve').forEach(btn => {
    btn.addEventListener('click', async () => {
      await AdminController.aprobar(btn.dataset.id);
      location.reload();
    });
  });
}
