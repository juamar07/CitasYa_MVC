// src/views/comun/pagos.js
import { PagosController } from '../../controllers/PagosController.js';
import { navigate } from '../../router/index.js';

const PACKS = [
  { tokens: 50,  total: 21000, per: 420 },
  { tokens: 100, total: 34000, per: 340 },
  { tokens: 150, total: 42000, per: 280 },
  { tokens: 200, total: 44000, per: 220 },
];

const PLUS_PRICE = 47000;

// ✅ LINKS EXACTOS (los que tenías en el MVP)
const PACK_LINKS = {
  50:  "https://mpago.li/28hZUAL",
  100: "https://mpago.li/2yEEqdM",
  150: "https://mpago.li/1wcD9Gp",
  200: "https://mpago.li/1S7Hwd5"
};

const PLUS_LINK = "https://mpago.li/1vd8RJo";
const GENERIC_LINK = "https://link.mercadopago.com.co/citasya";

function formatCOP(n){
  const x = Number(n || 0);
  return x.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  });
}

function pricePerTokenManual(qty){
  if (!qty || qty <= 0) return 0;
  if (qty <= 50) return 420;
  if (qty <= 100) return 340;
  if (qty <= 150) return 280;
  return 220; // 151–200 (como en tu texto)
}

function findByNameLike(list, needle){
  const n = needle.toLowerCase();
  return (list || []).find(x => (x.nombre || '').toLowerCase().includes(n)) || null;
}

export default async function PagosView(){
  const [compras, meta] = await Promise.all([
    PagosController.misPagos(),
    PagosController.metadata()
  ]);

  const metodos = meta?.metodos || [];
  const estados = meta?.estados || [];

  const metodoDefault = findByNameLike(metodos, 'mercado') || metodos[0] || null;
  const estadoDefault = findByNameLike(estados, 'pend') || estados[0] || null;

  const metodoName = new Map(metodos.map(m => [String(m.id), m.nombre]));
  const estadoName = new Map(estados.map(e => [String(e.id), e.nombre]));

  const packList = PACKS.map(p =>
    `<li>${p.tokens} tokens — ${formatCOP(p.total)} (${formatCOP(p.per)}/token)</li>`
  ).join('');

  const packOptions = [
    `<option value="">— Elegir paquete —</option>`,
    ...PACKS.map(p => `<option value="${p.tokens}">${p.tokens} tokens — ${formatCOP(p.total)} (${formatCOP(p.per)}/token)</option>`)
  ].join('');

  const metodoOptions = metodos.map(m =>
    `<option value="${m.id}" ${metodoDefault?.id === m.id ? 'selected' : ''}>${m.nombre}</option>`
  ).join('');

  const estadoOptions = estados.map(e =>
    `<option value="${e.id}" ${estadoDefault?.id === e.id ? 'selected' : ''}>${e.nombre}</option>`
  ).join('');

  const rows = (compras || []).map(c => {
    const mid = c.metodo_id != null ? String(c.metodo_id) : '';
    const eid = c.estado_id != null ? String(c.estado_id) : '';
    return `
      <tr>
        <td>${new Date(c.creado_en ?? Date.now()).toLocaleString('es-CO')}</td>
        <td>${c.tokens ?? '—'}</td>
        <td>${formatCOP(c.monto_cop ?? 0)}</td>
        <td>${metodoName.get(mid) || mid || '—'}</td>
        <td>${estadoName.get(eid) || eid || '—'}</td>
      </tr>
    `;
  }).join('') || `<tr><td colspan="5">Sin pagos registrados.</td></tr>`;

  return `
  <style>
    body{
      background:#eeeeee;
      margin:0;
      padding:20px;
      font-family: Arial, sans-serif;
    }

    .header{
      width:100%;
      box-sizing:border-box;
      background:#e6e9ee;
      border-radius:10px;
      padding:12px 20px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      margin:0 0 16px 0;
    }

    .header strong{
      font-size:18px;
      font-weight:700;
    }

    .back-button{
      text-decoration:none;
      color:#5c6bc0;
      border:1px solid #5c6bc0;
      padding:8px 12px;
      border-radius:6px;
      display:inline-flex;
      align-items:center;
    }

    .back-button:hover{
      background:#5c6bc0;
      color:#fff;
    }

    .header img{
      width:52px;
      display:block;
    }

    .container{
      max-width:980px;
      margin:0 auto;
      background:#fff;
      padding:20px;
      border-radius:10px;
      border-left:4px solid #5c6bc0;
      box-shadow:0 4px 8px rgba(0,0,0,.05);
      box-sizing:border-box;
    }

    h1{
      text-align:center;
      margin:10px 0 12px;
      font-size:34px;
    }

    h2{
      margin:18px 0 10px;
      font-size:26px;
    }

    .muted{
      color:#666;
      font-size:14px;
    }

    .card{
      border:1px dashed #cfd6e4;
      border-radius:8px;
      padding:12px;
      background:#fbfcff;
    }

    .grid{
      display:grid;
      grid-template-columns: 1fr 1fr;
      gap:14px;
    }

    @media (max-width:800px){
      .grid{
        grid-template-columns:1fr;
      }
    }

    label{
      display:block;
      margin:10px 0 6px;
      color:#003366;
      font-weight:700;
    }

    input, select{
      width:100%;
      padding:12px;
      border:2px solid #d7dbe3;
      border-radius:8px;
      font-size:16px;
      box-sizing:border-box;
    }

    .plus-plan-row{
      display:flex;
      align-items:center;
      gap:12px;
      margin-top:14px;
      color:#003366;
      font-weight:700;
      flex-wrap:wrap;
    }

    .plus-plan-row input[type="checkbox"]{
      width:18px;
      height:18px;
      margin:0;
      flex:0 0 auto;
    }

    .plus-plan-text{
      display:flex;
      align-items:baseline;
      gap:6px;
      flex-wrap:wrap;
      line-height:1.3;
    }

    .plus-plan-text strong{
      margin:0;
    }

    .plus-plan-text .plus-extra{
      font-weight:400;
      color:#003366;
    }

    .plus-plan-text .plus-price{
      font-weight:700;
      color:#003366;
    }

    .btn{
      width:75%;
      margin:14px auto 0;
      display:block;
      padding:12px 18px;
      border:none;
      border-radius:6px;
      background:#66bb6a;
      color:#fff;
      font-weight:800;
      cursor:pointer;
    }

    .btn:hover{
      background:#43a047;
    }

    table{
      width:100%;
      border-collapse:collapse;
      margin-top:18px;
    }

    th, td{
      padding:12px;
      border-bottom:1px solid #e2e8f0;
      text-align:left;
    }

    th{
      background:#e7ecff;
    }

    .footer{
      text-align:center;
      color:#666;
      margin-top:18px;
      font-size:14px;
    }

    @media (max-width:800px){
      .header{
        padding:12px;
      }

      .btn{
        width:100%;
      }

      .plus-plan-row{
        align-items:flex-start;
      }
    }
  </style>

  <div class="header">
    <a class="back-button" href="#" id="btnBack">← Volver</a>
    <strong>Pagos</strong>
    <a href="#" id="btnHome" aria-label="Inicio">
      <img src="assets/img/LogoCitasYa.png" alt="Citas Ya" style="width:52px;">
    </a>
  </div>

  <div class="container">
    <h1>Comprar tokens</h1>
    <p class="muted">Cada 30 min de cita consume 1 token. Puedes escoger un paquete o indicar una cantidad manual.</p>

    <div class="card">
      <strong>Paquetes disponibles</strong>
      <ul style="margin:10px 0 0 18px;">${packList}</ul>
      <div class="muted" style="margin-top:8px;">
        ¿Más de 200 tokens? Te conviene <strong>Citas Ya Plus</strong> (${formatCOP(PLUS_PRICE)}/mes, tokens ilimitados).
      </div>
    </div>

    <h2>Selecciona tu compra</h2>

    <div class="grid">
      <div>
        <label>Paquete</label>
        <select id="packSelect">${packOptions}</select>
      </div>
      <div>
        <label>Cantidad manual (tokens)</label>
        <input id="manualTokens" type="number" min="1" placeholder="Ej: 65" />
        <div class="muted" style="margin-top:6px;">
          El precio por token usará la tarifa del paquete anterior (≤50: $420; 51–100: $340; 101–150: $280; 151–200: $220).
        </div>
      </div>
    </div>

    <div class="plus-plan-row">
      <input type="checkbox" id="plusPlan" />
      <div class="plus-plan-text">
        <strong>Citas Ya Plus</strong>
        <span class="plus-extra">(tokens ilimitados 1 mes)</span>
        <span class="plus-price">— ${formatCOP(PLUS_PRICE)}</span>
      </div>
    </div>

    <div class="grid" style="margin-top:10px;">
      <div>
        <label>Método de pago</label>
        <select id="metodoSelect">${metodoOptions}</select>
      </div>
      <div>
        <label>Estado</label>
        <select id="estadoSelect">${estadoOptions}</select>
      </div>
    </div>

    <h2>Resumen</h2>
    <div class="grid">
      <div>
        <label>Tokens</label>
        <input id="sumTokens" readonly />
      </div>
      <div>
        <label>Valor a pagar (COP)</label>
        <input id="sumMonto" readonly />
      </div>
    </div>
    <div class="grid" style="margin-top:10px;">
      <div>
        <label>Método</label>
        <input id="sumMetodo" readonly />
      </div>
      <div>
        <label>Link de pago</label>
        <input id="sumLink" readonly />
      </div>
    </div>

    <button class="btn" id="btnPay">Realizar pago</button>

    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Tokens</th>
          <th>Monto</th>
          <th>Método</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="footer">
      Todos los derechos reservados © 2026<br>
      Citas Ya S.A.S - Nit 810.000.000-0
    </div>
  </div>
  `;
}

export function onMount(){
  document.getElementById('btnBack')?.addEventListener('click', (e)=>{ e.preventDefault(); history.back(); });
  document.getElementById('btnHome')?.addEventListener('click', (e)=>{ e.preventDefault(); navigate('/'); });

  const packSelect = document.getElementById('packSelect');
  const manualTokens = document.getElementById('manualTokens');
  const plusPlan = document.getElementById('plusPlan');
  const metodoSelect = document.getElementById('metodoSelect');
  const estadoSelect = document.getElementById('estadoSelect');

  const sumTokens = document.getElementById('sumTokens');
  const sumMonto = document.getElementById('sumMonto');
  const sumMetodo = document.getElementById('sumMetodo');
  const sumLink = document.getElementById('sumLink');

  // ✅ Calcula monto/tokens y también cuál será el link final
  function recalc(){
    let tokens = null;
    let monto = 0;
    let paymentLink = GENERIC_LINK;

    const isPlus = !!plusPlan?.checked;

    if (isPlus){
      // Plus: monto fijo y link fijo
      monto = PLUS_PRICE;
      paymentLink = PLUS_LINK;

      packSelect.disabled = true;
      manualTokens.disabled = true;

      sumTokens.value = 'Ilimitados (1 mes)';
      sumMonto.value = formatCOP(monto);
      sumMetodo.value = metodoSelect?.selectedOptions?.[0]?.textContent || '';
      sumLink.value = paymentLink;

      return { tokens: null, monto, paymentLink };
    }

    packSelect.disabled = false;
    manualTokens.disabled = false;

    const pack = Number(packSelect?.value || 0);
    const manual = Number(manualTokens?.value || 0);

    if (pack > 0){
      const p = PACKS.find(x => x.tokens === pack);
      tokens = pack;
      monto = p ? p.total : 0;
      paymentLink = PACK_LINKS[pack] || GENERIC_LINK;
    } else if (manual > 0){
      tokens = manual;
      const per = pricePerTokenManual(manual);
      monto = manual * per;
      paymentLink = GENERIC_LINK; // manual → link genérico (como tu MVP)
    } else {
      tokens = null;
      monto = 0;
      paymentLink = GENERIC_LINK;
    }

    sumTokens.value = tokens ? String(tokens) : '';
    sumMonto.value = monto ? formatCOP(monto) : '';
    sumMetodo.value = metodoSelect?.selectedOptions?.[0]?.textContent || '';
    sumLink.value = paymentLink;

    return { tokens, monto, paymentLink };
  }

  // Eventos
  packSelect?.addEventListener('change', ()=>{ manualTokens.value = ''; recalc(); });
  manualTokens?.addEventListener('input', ()=>{ packSelect.value = ''; recalc(); });
  plusPlan?.addEventListener('change', ()=> recalc());
  metodoSelect?.addEventListener('change', ()=> recalc());

  // init
  recalc();

  // ✅ AQUÍ QUEDA LA REDIRECCIÓN A MERCADO PAGO
  // (después de registrar en BD)
  document.getElementById('btnPay')?.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
      const { tokens, monto, paymentLink } = recalc();
      const metodo_id = metodoSelect?.value;
      const estado_id = estadoSelect?.value;

      if (!monto) {
        alert('Selecciona un paquete, cantidad manual o Citas Ya Plus.');
        return;
      }

      if (!metodo_id) {
        alert('Selecciona un método.');
        return;
      }

      if (!estado_id) {
        alert('Selecciona un estado.');
        return;
      }

      await PagosController.crear({
        metodo_id: Number(metodo_id),
        estado_id: Number(estado_id),
        tokens: tokens == null ? null : Number(tokens),
        monto_cop: Number(monto),
        ref_externa: paymentLink
      });

      window.open(paymentLink, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.error(e);
      alert(e?.message || 'No se pudo iniciar el pago.');
    }
  });
}
