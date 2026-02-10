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

function parseQuery(){
  // soporta /comun/comentarios?negocio=12 (si tu router lo usa)
  try{
    const url = new URL(location.href);
    return Object.fromEntries(url.searchParams.entries());
  }catch{
    return {};
  }
}

function renderTipoOptions(tipos){
  return `
    <option value="">Selecciona una opción</option>
    ${tipos.map(t => `<option value="${t.id}">${escapeHtml(t.nombre)}</option>`).join('')}
  `;
}

function badgeFromCalificacion(n){
  if (!Number.isFinite(n)) return '';
  if (n >= 4) return `<span class="badge pos">Positivo</span>`;
  if (n === 3) return `<span class="badge neu">Neutro</span>`;
  return `<span class="badge neg">Negativo</span>`;
}

function renderMisComentarios(list){
  if (!list.length) return `<p>No hay comentarios registrados.</p>`;

  return `
    <div class="my-list">
      ${list.map(c => `
        <div class="my-item">
          <div class="my-top">
            <div>
              <div class="my-title">
                ${escapeHtml(c.nombre_autor || 'Anónimo')}
                <span class="my-date">• ${escapeHtml(c.creado_en || '')}</span>
              </div>
              <div class="my-sub">
                Calificación: <b>${escapeHtml(c.calificacion)}</b>
                ${badgeFromCalificacion(Number(c.calificacion))}
                &nbsp;|&nbsp; Recomienda: <b>${c.recomienda ? 'Sí' : 'No'}</b>
              </div>
            </div>

            <button type="button" class="btn-del" data-eliminar-id="${c.id}">Eliminar</button>
          </div>

          <div class="my-text">${escapeHtml(c.texto || '')}</div>
        </div>
      `).join('')}
    </div>
  `;
}

export default async function ComentariosView(){
  const q = parseQuery();
  const negocio = q.negocio || '';

  const tipos = await ComentariosController.tipos();
  const misComentarios = await ComentariosController.listMine();

  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600&display=swap');

      .comentarios-page{
        --container-w: 900px;
        --container-pad: 20px;
        --container-bl: 4px;

        --banner-h: 64px;
        --page-sidepad: 16px;
        --banner-bg: #e6e9ee;
        --banner-bg-hover: #d7dbe3;

        --brand-blue:#5c6bc0;
        --green:#66BB6A; --green-h:#57A05D;
        --red:#f44336;   --red-h:#d32f2f;

        font-family:'Open Sans', sans-serif;
        background:#eee;
        color:#333;
        margin:0;
        padding:20px;
        padding-top: calc(var(--banner-h) + 8px);
        min-height: calc(100vh - 40px);
      }

      .comentarios-page .container{
        max-width: var(--container-w);
        margin:auto;
        background:#fff;
        border-radius:10px;
        padding:var(--container-pad);
        box-shadow:0 4px 8px rgba(0,0,0,.05);
        border-left: var(--container-bl) solid var(--brand-blue);
      }

      /* Banner */
      .comentarios-page .app-banner{
        position:fixed; top:0; left:0; right:0;
        height:var(--banner-h); z-index:9999;
      }
      .comentarios-page .app-banner .banner-box{
        height:100%;
        width:min(calc(var(--container-w) + var(--container-pad)*2 + var(--container-bl)),
                  calc(100% - var(--page-sidepad)*2));
        margin:0 auto;
        background:var(--banner-bg);
        border-bottom:1px solid rgba(0,0,0,.06);
        border-radius:10px;
        display:flex; align-items:center;
        transition:background-color .2s ease;
      }
      .comentarios-page .app-banner .banner-box:hover{ background:var(--banner-bg-hover); }
      .comentarios-page .banner-inner{
        display:grid;
        grid-template-columns:1fr auto 1fr;
        gap:8px;
        width:100%;
        padding:0 12px;
        align-items:center;
      }
      .comentarios-page .banner-title{
        justify-self:center;
        font-weight:700;
        color:#233247;
      }
      .comentarios-page .banner-logo{
        justify-self:end;
        display:flex;
        align-items:center;
        text-decoration:none;
      }
      .comentarios-page .banner-logo img{
        height:42px;
        width:auto;
      }
      .comentarios-page .back-button{
        justify-self:start;
        text-decoration:none;
        font-weight:700;
        color:#233247;
        background:#fff;
        padding:8px 10px;
        border-radius:8px;
        border:1px solid rgba(0,0,0,.1);
      }

      .comentarios-page h1{
        text-align:center;
        margin:18px 0 22px;
        font-size:28px;
        font-weight:700;
        color:#222;
      }

      .comentarios-page label{
        font-weight:700;
        display:block;
        margin:12px 0 6px;
      }

      .comentarios-page .hint{
        color:#666;
        font-size:13px;
        margin-top:4px;
      }

      .comentarios-page input[type="text"],
      .comentarios-page input[type="number"],
      .comentarios-page select,
      .comentarios-page textarea{
        width:100%;
        box-sizing:border-box;
        padding:12px 12px;
        border-radius:8px;
        border:1px solid rgba(0,0,0,.15);
        outline:none;
        font-size:14px;
      }
      .comentarios-page textarea{
        min-height:110px;
        resize:vertical;
      }

      .comentarios-page .row-inline{
        display:flex;
        gap:24px;
        justify-content:space-between;
        align-items:flex-start;
        flex-wrap:wrap;
      }
      .comentarios-page .grow{ flex:1; min-width:280px; }

      /* Stars */
      .comentarios-page .stars{
        display:flex;
        gap:6px;
        font-size:22px;
        user-select:none;
        margin-top:4px;
      }
      .comentarios-page .star{
        cursor:pointer;
        opacity:.35;
        transition:.15s;
      }
      .comentarios-page .star.active{ opacity:1; }
      .comentarios-page .badge{
        display:inline-block;
        padding:3px 8px;
        border-radius:20px;
        font-size:12px;
        margin-left:8px;
        vertical-align:middle;
      }
      .comentarios-page .badge.neg{ background:#ffe4e4; color:#b00020; }
      .comentarios-page .badge.neu{ background:#eef1f6; color:#445; }
      .comentarios-page .badge.pos{ background:#e6f4ea; color:#1b5e20; }

      .comentarios-page .btn-main{
        display:block;
        width:min(680px, 75%);
        margin:18px auto 6px;
        padding:14px 20px;
        border:none;
        border-radius:8px;
        color:#fff;
        background:var(--green);
        font-weight:700;
        font-size:16px;
        cursor:pointer;
        transition:.2s;
      }
      .comentarios-page .btn-main:hover{
        background:var(--green-h);
        transform:translateY(-2px);
      }

      /* Mis comentarios */
      .comentarios-page .section-title{
        margin:22px 0 10px;
        font-size:22px;
        font-weight:800;
      }
      .comentarios-page .my-item{
        border:1px solid rgba(0,0,0,.10);
        border-radius:10px;
        padding:12px 12px;
        margin-top:10px;
        background:#fff;
      }
      .comentarios-page .my-top{
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:12px;
      }
      .comentarios-page .my-title{ font-weight:800; }
      .comentarios-page .my-date{ opacity:.7; font-weight:400; }
      .comentarios-page .my-sub{ opacity:.85; font-size:13px; margin-top:2px; }
      .comentarios-page .my-text{ margin-top:10px; white-space:pre-wrap; }

      .comentarios-page .btn-del{
        border:none;
        background:var(--red);
        color:#fff;
        padding:8px 10px;
        border-radius:8px;
        font-weight:700;
        cursor:pointer;
        transition:.2s;
        height:36px;
        white-space:nowrap;
      }
      .comentarios-page .btn-del:hover{
        background:var(--red-h);
        transform:translateY(-1px);
      }
    </style>

    <div class="comentarios-page">
      <header class="app-banner" role="banner">
        <div class="banner-box">
          <div class="banner-inner">
            <a href="#" class="back-button" onclick="history.back();return false;">&larr; Volver</a>
            <div class="banner-title">Comentarios</div>
            <a href="/" class="banner-logo" aria-label="Inicio">
              <img src="LogoCitasYa.png" alt="Citas Ya" />
            </a>
          </div>
        </div>
      </header>

      <div class="container">
        <h1>Cuéntanos tu experiencia</h1>

        <form id="formComentario">
          <!-- Nombre -->
          <label for="inpName">Tu nombre <span class="hint">(opcional)</span></label>
          <input id="inpName" name="nombre_autor" type="text" placeholder="Ej: Juan Pérez" />

          <!-- Tipo comentario -->
          <label for="selTarget">Selecciona a quién va dirigido</label>
          <select id="selTarget" name="tipo_comentario_id" required>
            ${renderTipoOptions(tipos)}
          </select>

          <!-- Negocio -->
          <label for="inpNeg">Negocio</label>
          <div class="row-inline" style="align-items:center;">
            <div class="grow">
              <input id="inpNeg" name="negocio_id" type="number" placeholder="ID del negocio" value="${escapeHtml(negocio)}" required />
            </div>
            <div class="hint" style="margin-top:0; min-width:260px;">
              Se sugiere con base en barberías registradas.
            </div>
          </div>

          <!-- Texto -->
          <label for="txtComment">Escribe tu comentario</label>
          <textarea id="txtComment" name="texto" placeholder="¿Qué te gustó o qué podemos mejorar?" required></textarea>

          <!-- Stars + Recomienda -->
          <div class="row-inline" style="margin-top:10px;">
            <div class="grow">
              <label>Déjanos tu calificación</label>

              <!-- input real que se envía -->
              <input type="hidden" name="calificacion" id="calificacionHidden" value="3" />

              <div id="starCtrl" class="stars" aria-label="Calificación de 1 a 5">
                <span class="star" data-v="1">★</span>
                <span class="star" data-v="2">★</span>
                <span class="star" data-v="3">★</span>
                <span class="star" data-v="4">★</span>
                <span class="star" data-v="5">★</span>
              </div>

              <div id="sentBadge" class="hint"></div>
            </div>

            <div style="min-width:220px">
              <label for="chkReco">¿Recomiendas la página?</label>
              <div class="row-inline" style="gap:10px; align-items:center;">
                <input id="chkReco" name="recomienda" type="checkbox" />
                <span>Sí, la recomiendo</span>
              </div>
            </div>
          </div>

          <button id="btnSend" type="submit" class="btn-main">Enviar</button>
        </form>

        <div class="section-title">Tus comentarios</div>
        <div id="misComentarios">
          ${renderMisComentarios(misComentarios)}
        </div>
      </div>
    </div>
  `;
}

export async function onMount(root){
  const form = root.querySelector('#formComentario');

  const starCtrl = root.querySelector('#starCtrl');
  const hidden = root.querySelector('#calificacionHidden');
  const badge = root.querySelector('#sentBadge');

  function setBadge(v){
    if (!badge) return;
    if (v >= 4) badge.innerHTML = `Positivo <span class="badge pos">Positivo</span>`;
    else if (v === 3) badge.innerHTML = `Neutro <span class="badge neu">Neutro</span>`;
    else badge.innerHTML = `Negativo <span class="badge neg">Negativo</span>`;
  }

  function paintStars(v){
    const stars = [...starCtrl.querySelectorAll('.star')];
    stars.forEach(s => {
      const n = parseInt(s.getAttribute('data-v'), 10);
      s.classList.toggle('active', n <= v);
    });
    if (hidden) hidden.value = String(v);
    setBadge(v);
  }

  // init en 3 (neutro)
  if (starCtrl) {
    paintStars(3);
    starCtrl.addEventListener('click', (e) => {
      const el = e.target.closest('.star');
      if (!el) return;
      const v = parseInt(el.getAttribute('data-v'), 10);
      if (!Number.isFinite(v)) return;
      paintStars(v);
    });
  }

  bindForm(form, async (data) => {
    await ComentariosController.crear(data);
    // refresca vista sin cambiar ruta
    window.location.reload();
  });

  root.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-eliminar-id]');
    if (!btn) return;
    const id = parseInt(btn.getAttribute('data-eliminar-id'), 10);
    if (!Number.isFinite(id)) return;

    await ComentariosController.eliminar(id);
    window.location.reload();
  });
}
