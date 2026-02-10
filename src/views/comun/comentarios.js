// src/views/comun/comentarios.js
import { ComentariosController } from '../../controllers/ComentariosController.js';
import { bindForm } from '../../utils/forms.js';

function escapeHtml(str=''){
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#039;");
}

function parseHashQuery(){
  // soporta #/comentarios?negocio=12
  const hash = location.hash || '';
  const qIndex = hash.indexOf('?');
  if (qIndex === -1) return {};
  const query = hash.slice(qIndex + 1);
  return Object.fromEntries(new URLSearchParams(query));
}

function starsHTML(name='calificacion'){
  // radios 1..5 para que bindForm capture calificacion
  // (la estética final depende del CSS existente; no lo tocamos)
  return `
    <div class="stars" data-stars>
      ${[1,2,3,4,5].map(n => `
        <label style="cursor:pointer; user-select:none;">
          <input type="radio" name="${name}" value="${n}" required style="display:none;">
          <span data-star="${n}">★</span>
        </label>
      `).join('')}
      <div class="rating-label" data-rating-label>Neutro</div>
    </div>
  `;
}

function wireStars(container){
  const stars = [...container.querySelectorAll('[data-star]')];
  const label = container.querySelector('[data-rating-label]');
  const radios = [...container.querySelectorAll('input[type="radio"]')];

  function updateUI(value){
    stars.forEach((s) => {
      const n = parseInt(s.getAttribute('data-star'), 10);
      s.style.opacity = (n <= value) ? '1' : '0.3';
    });
    if (label){
      if (value >= 4) label.textContent = 'Positivo';
      else if (value === 3) label.textContent = 'Neutro';
      else label.textContent = 'Negativo';
    }
  }

  radios.forEach(r => {
    r.addEventListener('change', () => updateUI(parseInt(r.value, 10)));
  });

  // default visual
  updateUI(3);
}

function renderTipoOptions(tipos){
  return `
    <option value="">Selecciona una opción</option>
    ${tipos.map(t => `<option value="${t.id}">${escapeHtml(t.nombre)}</option>`).join('')}
  `;
}

function renderMisComentarios(list){
  if (!list.length){
    return `<p>No hay comentarios registrados.</p>`;
  }

  return `
    <div class="mis-comentarios-list">
      ${list.map(c => `
        <div class="comentario-item" style="padding:12px; border:1px solid #eee; border-radius:10px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; gap:10px; align-items:flex-start;">
            <div>
              <div style="font-weight:600;">
                ${escapeHtml(c.nombre_autor || 'Anónimo')}
                <span style="opacity:.7; font-weight:400;">• ${escapeHtml(c.creado_en || '')}</span>
              </div>
              <div style="opacity:.8; font-size:14px;">
                Calificación: ${escapeHtml(c.calificacion)} | Recomienda: ${c.recomienda ? 'Sí' : 'No'}
              </div>
            </div>
            <button type="button" class="btn-eliminar" data-eliminar-id="${c.id}">
              Eliminar
            </button>
          </div>
          <div style="margin-top:8px; white-space:pre-wrap;">${escapeHtml(c.texto || '')}</div>
        </div>
      `).join('')}
    </div>
  `;
}

export default async function ComentariosView(){
  const { negocio } = parseHashQuery(); // opcional: negocio_id desde query
  const tipos = await ComentariosController.tipos();
  const misComentarios = await ComentariosController.listMine();

  return `
    <div class="page">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <button type="button" class="btn-volver" onclick="history.back()">← Volver</button>
        <h2 style="margin:0;">Comentarios</h2>
        <div style="width:42px;"></div>
      </div>

      <div class="card" style="padding:18px; border-radius:14px;">
        <h1 style="text-align:center; margin-top:0;">Cuéntanos tu experiencia</h1>

        <form id="formComentario">
          <div class="form-group">
            <label>Tu nombre <span style="opacity:.6;">(opcional)</span></label>
            <input name="nombre_autor" type="text" placeholder="Ej: Juan Pérez" />
          </div>

          <div class="form-group">
            <label>Selecciona a quién va dirigido</label>
            <select name="tipo_comentario_id" required>
              ${renderTipoOptions(tipos)}
            </select>
          </div>

          <div class="form-group">
            <label>Negocio</label>
            <input
              name="negocio_id"
              type="number"
              inputmode="numeric"
              placeholder="ID del negocio"
              value="${negocio ? escapeHtml(negocio) : ''}"
              required
            />
            <small style="opacity:.7;">Se sugiere con base en barberías registradas.</small>
          </div>

          <div class="form-group">
            <label>Escribe tu comentario</label>
            <textarea name="texto" rows="4" placeholder="¿Qué te gustó o qué podemos mejorar?" required></textarea>
          </div>

          <div class="form-group" style="display:flex; justify-content:space-between; gap:20px; flex-wrap:wrap;">
            <div>
              <label>Déjanos tu calificación</label>
              <div id="starsWrap">
                ${starsHTML('calificacion')}
              </div>
            </div>

            <div style="display:flex; align-items:flex-end;">
              <label style="display:flex; gap:8px; align-items:center; margin:0;">
                <input type="checkbox" name="recomienda" />
                ¿Recomiendas la página? <span style="opacity:.7;">Sí, la recomiendo</span>
              </label>
            </div>
          </div>

          <button type="submit" class="btn-enviar" style="width:100%; margin-top:12px;">
            Enviar
          </button>
        </form>
      </div>

      <div class="card" style="padding:18px; border-radius:14px; margin-top:16px;">
        <h2 style="margin-top:0;">Tus comentarios</h2>
        <div id="misComentarios">
          ${renderMisComentarios(misComentarios)}
        </div>
      </div>
    </div>
  `;
}

export async function onMount(root){
  const form = root.querySelector('#formComentario');
  const starsWrap = root.querySelector('#starsWrap');
  if (starsWrap) wireStars(starsWrap);

  bindForm(form, async (data) => {
    await ComentariosController.crear(data);
    // recarga la vista
    location.hash = location.hash.split('?')[0] + (location.hash.includes('?') ? location.hash.slice(location.hash.indexOf('?')) : '');
  });

  root.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-eliminar-id]');
    if (!btn) return;

    const id = parseInt(btn.getAttribute('data-eliminar-id'), 10);
    if (!Number.isFinite(id)) return;

    await ComentariosController.eliminar(id);
    // refresca
    location.hash = location.hash;
  });
}
