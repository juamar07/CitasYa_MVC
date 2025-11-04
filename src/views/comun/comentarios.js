import { ComentariosController } from '../../controllers/ComentariosController.js';
import { bindForm } from '../../utils/forms.js';

export default async function ComentariosView({ query }){
  const negocioId = query.get('negocio') || '';
  const comentarios = negocioId ? await ComentariosController.list(negocioId) : [];
  const tipos = await ComentariosController.tipos();
  const options = tipos.map(t => `<option value="${t.id}">${t.nombre}</option>`).join('');
  const list = (comentarios||[]).map(c => `
    <article class="comment-card">
      <header>
        <strong>${c.usuario_id ?? 'Usuario'}</strong>
        <span>${new Date(c.creado_en ?? Date.now()).toLocaleString('es-CO')}</span>
      </header>
      <p>${c.comentario ?? ''}</p>
    </article>`).join('') || '<p>No hay comentarios registrados.</p>';
  return `
  <style>
    body{ font-family:'Open Sans',sans-serif; background:#f4f6fb; margin:0; padding:20px; }
    .layout{ max-width:960px; margin:0 auto; display:grid; gap:20px; }
    form, section{ background:#fff; padding:24px; border-radius:12px; box-shadow:0 12px 28px rgba(15,23,42,.08); }
    h1{ margin:0; }
    label{ display:block; margin:12px 0 6px; color:#003366; font-weight:600; }
    input, select, textarea{ width:100%; padding:12px; border:2px solid #d7dbe3; border-radius:8px; font-size:16px; box-sizing:border-box; }
    textarea{ min-height:120px; }
    button{ margin-top:16px; padding:12px 18px; border:none; border-radius:8px; background:#5c6bc0; color:#fff; font-weight:700; cursor:pointer; }
    .comment-card{ border-bottom:1px solid #e2e8f0; padding-bottom:16px; margin-bottom:16px; }
    .comment-card:last-child{ border-bottom:none; margin-bottom:0; }
    .comment-card header{ display:flex; justify-content:space-between; margin-bottom:8px; color:#475569; font-size:14px; }
  </style>
  <div class="layout">
    <form id="comentarioForm">
      <h1>Deja tu comentario</h1>
      <label for="comentario_negocio">Negocio</label>
      <input id="comentario_negocio" name="negocio_id" value="${negocioId}" placeholder="ID del negocio" required />
      <label for="comentario_tipo">Tipo</label>
      <select id="comentario_tipo" name="tipo_id" required>
        <option value="">Selecciona una opción</option>
        ${options}
      </select>
      <label for="comentario_texto">Comentario</label>
      <textarea id="comentario_texto" name="comentario" required></textarea>
      <button type="submit">Enviar comentario</button>
    </form>
    <section>
      <h2>Comentarios recientes</h2>
      ${list}
    </section>
  </div>`;
}

export function onMount(){
  const form = document.getElementById('comentarioForm');
  if (form){
    bindForm(form, async (payload) => {
      await ComentariosController.crear(payload);
      location.reload();
    });
  }
}
