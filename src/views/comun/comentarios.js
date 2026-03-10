import { ComentariosController } from '../../controllers/ComentariosController.js';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDate(value) {
  if (!value) return 'Fecha no disponible';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function badgeClass(sentimiento) {
  const s = String(sentimiento || '').toLowerCase().replaceAll('_', ' ');
  if (s.includes('muy') || s.includes('positivo')) return 'pos';
  if (s.includes('neut')) return 'neu';
  return 'neg';
}

function badgeText(sentimiento, calificacion) {
  const s = String(sentimiento || '').trim().toLowerCase().replaceAll('_', ' ');
  if (s) {
    if (s === 'positivo') return 'muy bueno';
    if (s === 'negativo') return 'malo';
    if (s === 'neutro') return 'neutro';
    return s;
  }

  const n = Number(calificacion || 0);
  if (n >= 4) return 'muy bueno';
  if (n === 3) return 'neutro';
  if (n > 0) return 'malo';
  return 'sin calificación';
}

function renderNegocioOptions(negocios = []) {
  return negocios
    .map((n) => `<option value="${escapeHtml(n.nombre)}"></option>`)
    .join('');
}

function renderMyComments(items = []) {
  if (!items.length) {
    return `<div class="muted">No hay comentarios registrados.</div>`;
  }

  return items.map((item) => {
    const autor = item.nombre_autor || 'Anónimo';
    const destino = item.negocio_id
      ? `Barbería${item.negocio_nombre ? ` · ${item.negocio_nombre}` : ''}`
      : 'Página';

    return `
      <div class="my-item">
        <div class="my-top">
          <div>
            <div class="my-title">${escapeHtml(autor)}</div>
            <div class="my-sub">
              ${escapeHtml(destino)}
              ${item.calificacion ? ` · ${Number(item.calificacion)}/5 ★` : ''}
              ${item.recomienda ? ' · Recomienda la página' : ''}
            </div>
            <div class="my-date">${escapeHtml(formatDate(item.creado_en))}</div>
          </div>

          <button
            type="button"
            class="btn-del"
            data-action="delete-comment"
            data-id="${item.id}"
          >
            Eliminar
          </button>
        </div>

        <div class="my-text">${escapeHtml(item.texto || '')}</div>
        <div style="margin-top:8px;">
          <span class="badge ${badgeClass(item.sentimiento)}">
            ${escapeHtml(badgeText(item.sentimiento, item.calificacion))}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

export default async function ComentariosView() {
  const [negocios, mine] = await Promise.all([
    ComentariosController.negocios().catch(() => []),
    ComentariosController.listMine().catch(() => [])
  ]);

  return `
    <style>
      :root{
        --container-w: 980px;
        --container-pad: 24px;
        --container-bl: 4px;

        --banner-h: 64px;
        --page-sidepad: 16px;
        --banner-bg: #e6e9ee;
        --banner-bg-hover: #d7dbe3;

        --green:#66bb6a;
        --green-h:#4caf50;
        --red:#ef5350;
        --red-h:#e53935;
        --ink:#233247;
      }

      .comentarios-page *{ box-sizing:border-box; }

      .comentarios-page{
        font-family:'Open Sans',sans-serif;
        background:#eee;
        color:#333;
        min-height:100vh;
        padding:20px;
        padding-top: calc(var(--banner-h) + 20px);
      }

      .comentarios-page .app-banner{
        position:fixed;
        top:0; left:0; right:0;
        height:var(--banner-h);
        z-index:9999;
      }

      .comentarios-page .banner-box{
        height:100%;
        width:min(calc(var(--container-w) + var(--container-pad)*2 + var(--container-bl)), calc(100% - var(--page-sidepad)*2));
        margin:0 auto;
        background:var(--banner-bg);
        border-bottom:1px solid rgba(0,0,0,.06);
        border-radius:10px;
        display:flex;
        align-items:center;
        transition:background-color .2s ease;
      }

      .comentarios-page .banner-box:hover{ background:var(--banner-bg-hover); }

      .comentarios-page .banner-inner{
        display:grid;
        grid-template-columns:1fr auto 1fr;
        gap:8px;
        width:100%;
        padding:0 12px;
        align-items:center;
      }

      .comentarios-page .banner-title{
        text-align:center;
        font-size:18px;
        font-weight:700;
        color:var(--ink);
      }

      .comentarios-page .back-button{
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

      .comentarios-page .banner-logo{
        justify-self:end;
        display:inline-flex;
        align-items:center;
      }

      .comentarios-page .banner-logo img{
        width:54px;
        height:54px;
        object-fit:contain;
      }

      .comentarios-page .container{
        width:min(var(--container-w), 100%);
        margin:0 auto;
        padding:var(--container-pad);
        background:#fff;
        border-radius:14px;
        border-left:var(--container-bl) solid #5c6bc0;
        box-shadow:0 4px 10px rgba(0,0,0,.05);
      }

      .comentarios-page h1{
        margin:6px 0 24px;
        text-align:center;
        font-size:56px;
        font-weight:800;
        color:#000;
      }

      .comentarios-page label{
        display:block;
        margin:18px 0 8px;
        color:#003366;
        font-size:16px;
        font-weight:700;
      }

      .comentarios-page .hint{
        color:#666;
        font-size:14px;
        font-weight:400;
      }

      .comentarios-page input[type="text"],
      .comentarios-page select,
      .comentarios-page textarea{
        width:100%;
        box-sizing:border-box;
        padding:14px 14px;
        border-radius:10px;
        border:2px solid #ddd;
        outline:none;
        font-size:16px;
        background:#fff;
      }

      .comentarios-page input[type="text"]:focus,
      .comentarios-page select:focus,
      .comentarios-page textarea:focus{
        border-color:#7da2a9;
      }

      .comentarios-page textarea{
        min-height:130px;
        resize:vertical;
      }

      .comentarios-page .hidden{ display:none; }

      .comentarios-page .row-inline{
        display:flex;
        gap:24px;
        justify-content:space-between;
        align-items:flex-start;
        flex-wrap:wrap;
      }

      .comentarios-page .grow{ flex:1; min-width:280px; }

      .comentarios-page .stars{
        display:flex;
        gap:10px;
        font-size:34px;
        user-select:none;
        margin-top:6px;
      }

      .comentarios-page .star{
        cursor:pointer;
        opacity:.28;
        transition:.15s;
      }

      .comentarios-page .star.active{ opacity:1; }

      .comentarios-page .badge{
        display:inline-block;
        padding:4px 10px;
        border-radius:20px;
        font-size:13px;
        margin-top:10px;
      }

      .comentarios-page .badge.neg{ background:#ffe4e4; color:#b00020; }
      .comentarios-page .badge.neu{ background:#eef1f6; color:#445; }
      .comentarios-page .badge.pos{ background:#e6f4ea; color:#1b5e20; }

      .comentarios-page .btn-main{
        display:block;
        width:min(760px, 78%);
        margin:24px auto 8px;
        padding:16px 20px;
        border:none;
        border-radius:10px;
        color:#fff;
        background:var(--green);
        font-weight:800;
        font-size:18px;
        cursor:pointer;
        transition:.2s;
      }

      .comentarios-page .btn-main:hover{
        background:var(--green-h);
        transform:translateY(-2px);
      }

      .comentarios-page .section-title{
        margin:30px 0 12px;
        font-size:24px;
        font-weight:800;
      }

      .comentarios-page .my-item{
        border:1px solid rgba(0,0,0,.10);
        border-radius:12px;
        padding:14px;
        margin-top:12px;
        background:#fff;
      }

      .comentarios-page .my-top{
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:12px;
      }

      .comentarios-page .my-title{ font-weight:800; }
      .comentarios-page .my-date{ opacity:.7; font-weight:400; margin-top:4px; }
      .comentarios-page .my-sub{ opacity:.85; font-size:13px; margin-top:4px; }
      .comentarios-page .my-text{ margin-top:10px; white-space:pre-wrap; }

      .comentarios-page .btn-del{
        border:none;
        background:var(--red);
        color:#fff;
        padding:8px 12px;
        border-radius:8px;
        font-weight:700;
        cursor:pointer;
        transition:.2s;
        white-space:nowrap;
      }

      .comentarios-page .btn-del:hover{
        background:var(--red-h);
        transform:translateY(-1px);
      }

      .comentarios-page .err{
        display:none;
        margin-top:12px;
        color:#c62828;
        font-size:14px;
        font-weight:700;
      }

      .comentarios-page .ok{
        display:none;
        margin-top:12px;
        color:#2e7d32;
        font-size:14px;
        font-weight:700;
      }

      @media (max-width: 900px){
        .comentarios-page h1{ font-size:44px; }
      }

      @media (max-width: 640px){
        .comentarios-page{
          padding:12px;
          padding-top: calc(var(--banner-h) + 12px);
        }

        .comentarios-page .container{
          padding:18px;
        }

        .comentarios-page h1{
          font-size:34px;
        }

        .comentarios-page .btn-main{
          width:100%;
        }

        .comentarios-page .my-top{
          flex-direction:column;
          align-items:stretch;
        }
      }
    </style>

    <div class="comentarios-page">
      <header class="app-banner" role="banner">
        <div class="banner-box">
          <div class="banner-inner">
            <a href="#" class="back-button" id="btnBack">&larr; Volver</a>
            <div class="banner-title">Comentarios</div>
            <a class="banner-logo" href="#/">
              <img src="assets/img/LogoCitasYa.png" alt="Citas Ya">
            </a>
          </div>
        </div>
      </header>

      <div class="container">
        <h1>Cuéntanos tu experiencia</h1>

        <form id="formComentario" novalidate>
          <label for="inpName">Tu nombre <span class="hint">(opcional)</span></label>
          <input id="inpName" name="nombre_autor" type="text" placeholder="Ej: Juan Pérez" />

          <label for="selDestino">Selecciona a quién va dirigido</label>
          <select id="selDestino" name="destino" required>
            <option value="">Selecciona una opción</option>
            <option value="pagina">A la página</option>
            <option value="barberia">A una barbería</option>
          </select>

          <div id="negocioField" class="hidden">
            <label for="inpNegocio">Escribe el nombre de la barbería</label>
            <input
              id="inpNegocio"
              name="negocio_nombre"
              type="text"
              list="negociosList"
              placeholder="Ej: Barbería Central"
            />
            <datalist id="negociosList">${renderNegocioOptions(negocios)}</datalist>
            <input id="negocioIdHidden" name="negocio_id" type="hidden" value="" />
            <div class="hint">Se sugiere con base en barberías registradas.</div>
          </div>

          <label for="txtComment">Escribe tu comentario</label>
          <textarea
            id="txtComment"
            name="texto"
            placeholder="¿Qué te gustó o qué podemos mejorar?"
            required
          ></textarea>

          <div class="row-inline" style="margin-top:18px;">
            <div class="grow">
              <label>Déjanos tu calificación</label>
              <div class="stars" id="stars" aria-label="Calificación por estrellas">
                <span class="star" data-value="1">★</span>
                <span class="star" data-value="2">★</span>
                <span class="star" data-value="3">★</span>
                <span class="star" data-value="4">★</span>
                <span class="star" data-value="5">★</span>
              </div>
              <input type="hidden" id="calificacion" name="calificacion" value="0" />
              <div id="sentimientoWrap"></div>
            </div>

            <div style="min-width:260px;">
              <label style="text-align:right;">¿Recomiendas la página?</label>
              <label style="display:flex;align-items:center;gap:10px;font-weight:400;margin-top:8px;">
                <input type="checkbox" id="chkRecomienda" name="recomienda" />
                Sí, la recomiendo
              </label>
            </div>
          </div>

          <div id="formError" class="err"></div>
          <div id="formOk" class="ok"></div>

          <button type="submit" class="btn-main">Enviar</button>
        </form>

        <div class="section-title">Tus comentarios</div>
        <div id="myComments">${renderMyComments(mine)}</div>
      </div>
    </div>
  `;
}

export async function onMount() {
  const $ = (selector) => document.querySelector(selector);

  const form = $('#formComentario');
  const btnBack = $('#btnBack');
  const selDestino = $('#selDestino');
  const negocioField = $('#negocioField');
  const inpNegocio = $('#inpNegocio');
  const negocioIdHidden = $('#negocioIdHidden');
  const negociosList = $('#negociosList');
  const starsWrap = $('#stars');
  const calificacionInp = $('#calificacion');
  const sentimientoWrap = $('#sentimientoWrap');
  const formError = $('#formError');
  const formOk = $('#formOk');
  const myComments = $('#myComments');

  const negocioMap = new Map();
  Array.from(negociosList?.querySelectorAll('option') || []).forEach((opt) => {
    const value = opt.value?.trim();
    if (value) negocioMap.set(value.toLowerCase(), value);
  });

  const hideMessages = () => {
    formError.style.display = 'none';
    formError.textContent = '';
    formOk.style.display = 'none';
    formOk.textContent = '';
  };

  const setError = (msg) => {
    formOk.style.display = 'none';
    formError.style.display = 'block';
    formError.textContent = msg || 'Ocurrió un error.';
  };

  const setOk = (msg) => {
    formError.style.display = 'none';
    formOk.style.display = 'block';
    formOk.textContent = msg || 'Operación exitosa.';
  };

  const renderSentimiento = (score) => {
    const n = Number(score || 0);
    if (!n) {
      sentimientoWrap.innerHTML = '';
      return;
    }

    let text = 'malo';
    let cls = 'neg';
    if (n === 3) {
      text = 'neutro';
      cls = 'neu';
    } else if (n >= 4) {
      text = 'muy bueno';
      cls = 'pos';
    }

    sentimientoWrap.innerHTML = `<span class="badge ${cls}">${text}</span>`;
  };

  const setStars = (score) => {
    const n = Number(score || 0);
    calificacionInp.value = String(n);
    Array.from(starsWrap.querySelectorAll('.star')).forEach((star) => {
      const value = Number(star.dataset.value || 0);
      star.classList.toggle('active', value <= n);
    });
    renderSentimiento(n);
  };

  const syncNegocioId = () => {
    const current = String(inpNegocio?.value || '').trim().toLowerCase();
    if (!current) {
      negocioIdHidden.value = '';
      return;
    }

    const options = Array.from(negociosList?.querySelectorAll('option') || []);
    const match = options.find((opt) => String(opt.value || '').trim().toLowerCase() === current);
    if (match) {
      const selectedName = String(match.value || '').trim();
      const selected = Array.from(options).find((opt) => opt.value === selectedName);
      if (selected) {
        const allOptions = Array.from(negociosList.querySelectorAll('option'));
        const idx = allOptions.indexOf(selected);
        // datalist no trae ids, así que resolvemos por nombre usando controller al enviar
        negocioIdHidden.value = '';
      }
    } else {
      negocioIdHidden.value = '';
    }
  };

  const updateDestinoUI = () => {
    const destino = selDestino.value;
    const showNegocio = destino === 'barberia';
    negocioField.classList.toggle('hidden', !showNegocio);

    if (!showNegocio) {
      inpNegocio.value = '';
      negocioIdHidden.value = '';
    }
  };

  const refreshMine = async () => {
    const mine = await ComentariosController.listMine().catch(() => []);
    myComments.innerHTML = renderMyComments(mine);
  };

  btnBack?.addEventListener('click', (e) => {
    e.preventDefault();
    history.back();
  });

  selDestino?.addEventListener('change', () => {
    hideMessages();
    updateDestinoUI();
  });

  inpNegocio?.addEventListener('input', () => {
    hideMessages();
    syncNegocioId();
  });

  starsWrap?.addEventListener('click', (e) => {
    const star = e.target.closest('.star');
    if (!star) return;
    setStars(Number(star.dataset.value || 0));
  });

  myComments?.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action="delete-comment"]');
    if (!btn) return;

    const id = Number(btn.dataset.id || 0);
    if (!id) return;

    const ok = window.confirm('¿Deseas eliminar este comentario?');
    if (!ok) return;

    try {
      await ComentariosController.eliminar(id);
      await refreshMine();
    } catch (err) {
      setError(err?.message || 'No se pudo eliminar el comentario.');
    }
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessages();

    try {
      const fd = new FormData(form);
      const payload = Object.fromEntries(fd.entries());

      payload.destino = selDestino.value;
      payload.calificacion = Number(calificacionInp.value || 0);
      payload.recomienda = document.getElementById('chkRecomienda')?.checked === true;

      if (!payload.destino) {
        setError('Selecciona a quién va dirigido el comentario.');
        return;
      }

      if (!String(payload.texto || '').trim()) {
        setError('Debes escribir un comentario.');
        return;
      }

      if (payload.destino === 'barberia') {
        const negocioNombre = String(inpNegocio?.value || '').trim();
        if (!negocioNombre) {
          setError('Selecciona una barbería registrada.');
          return;
        }

        const negocios = await ComentariosController.negocios();
        const match = (negocios || []).find(
          (n) => String(n.nombre || '').trim().toLowerCase() === negocioNombre.toLowerCase()
        );

        if (!match?.id) {
          setError('Debes seleccionar una barbería válida de la lista.');
          return;
        }

        payload.negocio_id = Number(match.id);
        payload.negocio_nombre = match.nombre;
      } else {
        payload.negocio_id = null;
        payload.negocio_nombre = '';
      }

      const created = await ComentariosController.crear(payload);

      if (!created) {
        throw new Error('No se recibió confirmación del guardado del comentario.');
      }

      form.reset();
      setStars(0);
      updateDestinoUI();

      setOk('Comentario enviado correctamente.');
      await refreshMine();
    } catch (err) {
      console.error('Error enviando comentario:', err);
      setError(err?.message || 'No se pudo guardar el comentario.');
    }
  });

  setStars(0);
  updateDestinoUI();
}