import { navigate } from '../../router/index.js';

export default async function ClienteCancelarView(){
  return `
  <style>
    body{ font-family:'Open Sans',sans-serif; background:#eef1f6; margin:0; padding:20px; }
    .container{ max-width:720px; margin:0 auto; background:#fff; padding:24px; border-radius:12px; box-shadow:0 8px 24px rgba(15,23,42,.08); border-left:4px solid #ef5350; }
    h1{ text-align:center; margin-top:0; }
    label{ display:block; margin:12px 0 6px; color:#8b2a2a; font-weight:600; }
    input, textarea{ width:100%; padding:12px; border:2px solid #f3c2c2; border-radius:8px; font-size:16px; box-sizing:border-box; }
    textarea{ min-height:110px; resize:vertical; }
    .actions{ display:flex; gap:12px; justify-content:center; margin-top:24px; flex-wrap:wrap; }
    button{ padding:12px 22px; border-radius:8px; border:none; font-weight:700; cursor:pointer; font-size:16px; color:#fff; }
    .btn-cancel{ background:#ef5350; }
    .btn-back{ background:#9fa6b2; }
  </style>
  <div class="container">
    <h1>Cancelar una cita</h1>
    <label for="cancel_id">Código de la cita</label>
    <input id="cancel_id" placeholder="Ingresa el identificador" />
    <label for="cancel_motivo">Motivo de cancelación</label>
    <textarea id="cancel_motivo" placeholder="Cuéntanos el motivo"></textarea>
    <div class="actions">
      <button class="btn-cancel" id="cancel_confirmar">Cancelar cita</button>
      <button class="btn-back" id="cancel_volver">Volver a mi agenda</button>
    </div>
  </div>`;
}

export function onMount(){
  document.getElementById('cancel_volver')?.addEventListener('click', () => navigate('/cliente/agendar'));
}
