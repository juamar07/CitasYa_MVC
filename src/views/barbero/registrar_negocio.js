import { BarberoNegocioController } from '../../controllers/BarberoNegocioController.js';
import { bindForm } from '../../utils/forms.js';

export default async function RegistrarNegocioView(){
  const negocios = await BarberoNegocioController.misNegocios();
  const cards = (negocios||[]).map(n => `
    <article class="negocio-card">
      <h3>${n.nombre}</h3>
      <p>${n.direccion ?? ''}</p>
      <small>Estado: ${n.estado ?? 'pendiente'}</small>
    </article>`).join('') || '<p>No has registrado negocios.</p>';
  return `
  <style>
    body{ font-family:'Open Sans',sans-serif; background:#f8fafc; margin:0; padding:20px; }
    .layout{ display:grid; gap:20px; max-width:1040px; margin:0 auto; grid-template-columns:1fr 1fr; }
    @media (max-width:900px){ .layout{ grid-template-columns:1fr; } }
    form{ background:#fff; padding:24px; border-radius:12px; box-shadow:0 12px 28px rgba(15,23,42,.08); border-left:4px solid #5c6bc0; }
    h1{ grid-column:1/-1; margin:0; }
    label{ display:block; margin:12px 0 6px; color:#003366; font-weight:600; }
    input, textarea{ width:100%; padding:12px; border:2px solid #d7dbe3; border-radius:8px; font-size:16px; box-sizing:border-box; }
    textarea{ min-height:100px; resize:vertical; }
    button{ margin-top:16px; padding:12px 18px; border:none; border-radius:8px; background:#5c6bc0; color:#fff; font-weight:700; cursor:pointer; }
    .negocios-list{ display:grid; gap:12px; }
    .negocio-card{ background:#fff; padding:18px; border-radius:12px; box-shadow:0 4px 16px rgba(15,23,42,.08); }
  </style>
  <div class="layout">
    <h1>Registrar negocio</h1>
    <form id="negocioForm">
      <label for="negocio_nombre">Nombre comercial</label>
      <input id="negocio_nombre" name="nombre" required />
      <label for="negocio_direccion">Dirección</label>
      <input id="negocio_direccion" name="direccion" />
      <label for="negocio_descripcion">Descripción</label>
      <textarea id="negocio_descripcion" name="descripcion"></textarea>
      <button type="submit">Guardar negocio</button>
    </form>
    <section class="negocios-list">
      <h2>Mis negocios</h2>
      ${cards}
    </section>
  </div>`;
}

export function onMount(){
  const form = document.getElementById('negocioForm');
  if (form){
    bindForm(form, async (payload) => {
      await BarberoNegocioController.guardarNegocio(payload);
      location.reload();
    });
  }
}
