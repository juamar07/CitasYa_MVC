import { navigate } from '../../router/index.js';

export default async function ClienteAgendarPublicoView({ query }){
  const negocio = query.get('negocio') || '';
  return `
  <style>
    body{ font-family:'Open Sans',sans-serif; background:#f0f2f5; margin:0; padding:20px; }
    .container{ max-width:920px; margin:0 auto; background:#fff; padding:24px; border-radius:12px; box-shadow:0 6px 20px rgba(15,23,42,.08); border-left:4px solid #5c6bc0; }
    header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
    header img{ width:52px; }
    h1{ margin:0 0 12px; font-size:28px; }
    label{ display:block; margin:12px 0 6px; color:#003366; font-weight:600; }
    input, select, textarea{ width:100%; padding:12px; border:2px solid #d7dbe3; border-radius:8px; font-size:16px; box-sizing:border-box; }
    textarea{ min-height:90px; resize:vertical; }
    .actions{ display:grid; gap:12px; grid-template-columns:repeat(auto-fit, minmax(180px,1fr)); margin-top:24px; }
    button{ border:none; border-radius:8px; padding:14px 18px; font-weight:700; cursor:pointer; color:#fff; font-size:16px; transition:transform .2s ease, box-shadow .2s ease; }
    button:hover{ transform:translateY(-1px); box-shadow:0 10px 18px rgba(92,107,192,.25); }
    .btn-primary{ background:#5c6bc0; }
    .btn-green{ background:#66BB6A; }
    .btn-outline{ background:#eff2f9; color:#233247; }
    nav a{ margin-left:12px; color:#5c6bc0; font-weight:600; text-decoration:none; }
    nav a:hover{ text-decoration:underline; }
  </style>
  <div class="container">
    <header>
      <div>
        <h1>Agendar cita rápida</h1>
        <p>Reserva sin necesidad de iniciar sesión.</p>
      </div>
      <div>
        <img src="/assets/img/LogoCitasYa.png" alt="Citas Ya">
      </div>
    </header>
    <nav>
      <a href="#/login">Iniciar sesión</a>
      <a href="#/registro">Registrarme</a>
      <a href="#/barbero/registrar-negocio">Registrar negocio</a>
    </nav>
    <section>
      <label for="public_negocio">Establecimiento</label>
      <input id="public_negocio" value="${negocio}" placeholder="Ej: Barbería Central" />
      <label for="public_servicio">Servicio</label>
      <select id="public_servicio">
        <option value="">Selecciona un servicio</option>
      </select>
      <label for="public_barbero">Profesional</label>
      <select id="public_barbero">
        <option value="">Selecciona un barbero</option>
      </select>
      <label for="public_fecha">Fecha</label>
      <input type="date" id="public_fecha" />
      <label for="public_hora">Hora</label>
      <select id="public_hora">
        <option value="">Selecciona fecha y servicio</option>
      </select>
      <label for="public_notas">Notas</label>
      <textarea id="public_notas" placeholder="Indica preferencias o información adicional"></textarea>
    </section>
    <div class="actions">
      <button class="btn-green" id="public_agendar">Programar cita</button>
      <button class="btn-outline" id="public_ir_login">Ir al inicio</button>
    </div>
  </div>`;
}

export function onMount() {
  // Menú hamburguesa
  const burger = document.getElementById('btn_burger');
  const menu = document.getElementById('menu');
  burger?.addEventListener('click', () => {
    if (!menu) return;
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
  });

  // Navegación del menú (si usas data-go)
  document.querySelectorAll('#menu [data-go]').forEach(a => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      const to = a.getAttribute('data-go');
      if (to) navigate(to);
    });
  });

  // Modal de login
  const modal = document.getElementById('modalAuth');
  const openModal = () => { if (modal) modal.style.display = 'flex'; };
  const closeModal = () => { if (modal) modal.style.display = 'none'; };

  // Requiere login en las 3 acciones
  document.getElementById('btn_programar')?.addEventListener('click', (ev) => { ev.preventDefault(); openModal(); });
  document.getElementById('btn_comentario')?.addEventListener('click', (ev) => { ev.preventDefault(); openModal(); });
  document.getElementById('btn_cancelar')?.addEventListener('click', (ev) => { ev.preventDefault(); openModal(); });

  // Botones del modal
  document.getElementById('m_login')?.addEventListener('click', () => navigate('/login'));
  document.getElementById('m_reg')?.addEventListener('click', () => navigate('/registro'));
  document.getElementById('m_close')?.addEventListener('click', closeModal);
}
