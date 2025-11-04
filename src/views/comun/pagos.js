import { PagosController } from '../../controllers/PagosController.js';
import { formatCurrency } from '../../utils/money.js';
import { bindForm } from '../../utils/forms.js';

export default async function PagosView(){
  const [pagos, meta] = await Promise.all([
    PagosController.misPagos(),
    PagosController.metadata()
  ]);
  const { metodos = [], estados = [] } = meta;
  const metodoOptions = metodos.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
  const estadoOptions = estados.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');
  const rows = (pagos||[]).map(p => `
    <tr>
      <td>${new Date(p.creado_en ?? Date.now()).toLocaleDateString('es-CO')}</td>
      <td>${formatCurrency(p.monto ?? 0)}</td>
      <td>${p.metodo_pago_id ?? ''}</td>
      <td>${p.estado_pago_id ?? ''}</td>
    </tr>`).join('') || '<tr><td colspan="4">Sin pagos registrados.</td></tr>';
  return `
  <style>
    body{ font-family:'Open Sans',sans-serif; background:#f5f7fb; margin:0; padding:20px; }
    .layout{ max-width:960px; margin:0 auto; display:grid; gap:20px; }
    form, table{ background:#fff; border-radius:12px; box-shadow:0 10px 30px rgba(15,23,42,.08); }
    form{ padding:24px; }
    table{ border-collapse:collapse; width:100%; overflow:hidden; }
    th, td{ padding:12px; border-bottom:1px solid #e2e8f0; text-align:left; }
    th{ background:#e7ecff; color:#233247; }
    label{ display:block; margin:12px 0 6px; color:#003366; font-weight:600; }
    input, select{ width:100%; padding:12px; border:2px solid #d7dbe3; border-radius:8px; font-size:16px; box-sizing:border-box; }
    button{ margin-top:16px; padding:12px 18px; border:none; border-radius:8px; background:#5c6bc0; color:#fff; font-weight:700; cursor:pointer; }
  </style>
  <div class="layout">
    <form id="pagoForm">
      <h1>Registrar pago</h1>
      <label for="pago_monto">Monto</label>
      <input type="number" id="pago_monto" name="monto" step="1000" required />
      <label for="pago_metodo">Método de pago</label>
      <select id="pago_metodo" name="metodo_pago_id" required>
        <option value="">Selecciona un método</option>
        ${metodoOptions}
      </select>
      <label for="pago_estado">Estado</label>
      <select id="pago_estado" name="estado_pago_id" required>
        <option value="">Selecciona un estado</option>
        ${estadoOptions}
      </select>
      <button type="submit">Guardar pago</button>
    </form>
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Monto</th>
          <th>Método</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

export function onMount(){
  const form = document.getElementById('pagoForm');
  if (form){
    bindForm(form, async (payload) => {
      await PagosController.crear(payload);
      location.reload();
    });
  }
}
