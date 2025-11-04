import { BarberoAgendaController } from '../../controllers/BarberoAgendaController.js';
import { formatDate, formatTime } from '../../utils/dates.js';

export default async function BarberoMiAgendaView(){
  const citas = await BarberoAgendaController.miAgenda();
  const rows = (citas||[]).map(c => `
    <tr>
      <td>${formatDate(c.fecha ?? c.inicia_en)}</td>
      <td>${formatTime(c.inicia_en)}</td>
      <td>${formatTime(c.termina_en)}</td>
      <td>${c.usuario_cliente_id ?? ''}</td>
      <td>${c.servicio_id ?? ''}</td>
    </tr>`).join('') || '<tr><td colspan="5">Sin citas programadas.</td></tr>';
  return `
  <style>
    body{ font-family:'Open Sans',sans-serif; background:#f7f8fc; margin:0; padding:20px; }
    .container{ max-width:960px; margin:0 auto; background:#fff; padding:24px; border-radius:12px; box-shadow:0 12px 32px rgba(15,23,42,.1); }
    h1{ margin-top:0; text-align:center; }
    table{ width:100%; border-collapse:collapse; margin-top:16px; }
    th, td{ padding:12px; border-bottom:1px solid #e2e8f0; text-align:left; }
    th{ background:#f0f4ff; color:#273b7a; font-weight:700; }
  </style>
  <div class="container">
    <h1>Mi agenda de citas</h1>
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Inicio</th>
          <th>Fin</th>
          <th>Cliente</th>
          <th>Servicio</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}
