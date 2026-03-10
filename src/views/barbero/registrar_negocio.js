import { BarberoNegocioController } from '../../controllers/BarberoNegocioController.js';
import { supabase } from '../../config/supabaseClient.js';
import { UsuarioModel } from '../../models/UsuarioModel.js';

export default async function RegistrarNegocioView() {
  return `
    <style>
      :root {
        --bg: #f4f6fb;
        --card: #ffffff;
        --text: #111827;
        --muted: #6b7280;
        --border: #e5e7eb;
        --primary: #5c6bc0;
        --primary-2: #4f46e5;
        --success: #22c55e;
        --danger: #ef4444;
        --warn: #f59e0b;
        --banner-h: 64px;
      }

      .mvc-registro-negocio {
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        min-height: 100vh;
        background: var(--bg);
        padding: 16px;
        padding-top: calc(var(--banner-h) + 12px);
        color: var(--text);
      }

      .mvc-registro-negocio .app-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: var(--banner-h);
        z-index: 9999;
      }

      .mvc-registro-negocio .banner-shell {
        max-width: 1110px;
        margin: 0 auto;
        height: 100%;
      }

      .mvc-registro-negocio .banner-box {
        height: 100%;
        background: #e6e9ee;
        border-radius: 10px;
        display: flex;
        align-items: center;
        transition: background-color .2s ease;
      }

      .mvc-registro-negocio .banner-box:hover {
        background: #d7dbe3;
      }

      .mvc-registro-negocio .banner-inner {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        width: 100%;
        align-items: center;
        padding: 0 12px;
      }

      .mvc-registro-negocio .back-button {
        justify-self: start;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        background: #fff;
        border: 1px solid rgba(0,0,0,.08);
        border-radius: 10px;
        color: #37465b;
        text-decoration: none;
        font-weight: 700;
      }

      .mvc-registro-negocio .banner-title {
        text-align: center;
        font-size: 18px;
        font-weight: 700;
        color: #233247;
      }

      .mvc-registro-negocio .banner-logo {
        justify-self: end;
        display: inline-flex;
        align-items: center;
      }

      .mvc-registro-negocio .banner-logo img {
        width: 54px;
        height: 54px;
        object-fit: contain;
      }

      .mvc-registro-negocio .container {
        max-width: 1080px;
        margin: 24px auto;
        padding: 0 16px;
      }

      .mvc-registro-negocio .card {
        background: var(--card);
        border: 1px solid var(--border);
        border-left: 4px solid var(--primary);
        border-radius: 18px;
        box-shadow: 0 10px 25px rgba(17, 24, 39, 0.08);
        padding: 24px;
      }

      .mvc-registro-negocio h1 {
        font-size: 42px;
        margin: 0 0 6px;
        text-align: center;
      }

      .mvc-registro-negocio h2 {
        font-size: 26px;
        margin: 18px 0 10px;
        text-align: center;
      }

      .mvc-registro-negocio h3 {
        font-size: 20px;
        margin: 18px 0 8px;
      }

      .mvc-registro-negocio .sub {
        text-align: center;
        color: var(--muted);
        margin-bottom: 18px;
      }

      .mvc-registro-negocio .badge {
        display: inline-block;
        padding: 3px 10px;
        font-size: 12px;
        border-radius: 999px;
        border: 1px solid var(--border);
        margin-left: 8px;
        vertical-align: middle;
      }

      .mvc-registro-negocio .badge-warn {
        background: rgba(245, 158, 11, 0.12);
        border-color: rgba(245, 158, 11, 0.35);
        color: #b45309;
      }

      .mvc-registro-negocio .badge-ok {
        background: rgba(34, 197, 94, 0.12);
        border-color: rgba(34, 197, 94, 0.35);
        color: #15803d;
      }

      .mvc-registro-negocio .grid2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }

      @media (max-width: 860px) {
        .mvc-registro-negocio .grid2 { grid-template-columns: 1fr; }
        .mvc-registro-negocio h1 { font-size: 34px; }
      }

      .mvc-registro-negocio label {
        display: block;
        color: #1f2937;
        font-weight: 600;
        margin: 10px 0 6px;
      }

      .mvc-registro-negocio .hint {
        color: var(--muted);
        font-size: 13px;
        margin-top: 4px;
      }

      .mvc-registro-negocio .inp {
        width: 100%;
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 12px 12px;
        outline: none;
        font-size: 15px;
        background: white;
      }

      .mvc-registro-negocio .inp:focus {
        border-color: rgba(92, 107, 192, 0.6);
        box-shadow: 0 0 0 4px rgba(92, 107, 192, 0.12);
      }

      .mvc-registro-negocio .error {
        color: var(--danger);
        font-size: 13px;
        margin-top: 6px;
        min-height: 16px;
      }

      .mvc-registro-negocio .btn {
        border: none;
        border-radius: 10px;
        padding: 12px 14px;
        font-weight: 700;
        cursor: pointer;
      }

      .mvc-registro-negocio .btn.primary {
        background: var(--primary);
        color: white;
      }

      .mvc-registro-negocio .btn.success {
        background: var(--success);
        color: white;
      }

      .mvc-registro-negocio .btn.full {
        width: 100%;
        margin-top: 14px;
      }

      .mvc-registro-negocio table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        border: 1px solid var(--border);
        border-radius: 12px;
        overflow: hidden;
      }

      .mvc-registro-negocio thead th {
        background: #eef2ff;
        text-align: left;
        padding: 10px 12px;
        font-weight: 800;
        color: #1f2937;
      }

      .mvc-registro-negocio tbody td {
        padding: 10px 12px;
        border-top: 1px solid var(--border);
        vertical-align: middle;
      }

      .mvc-registro-negocio .muted { color: var(--muted); }

      .mvc-registro-negocio .actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }

      .mvc-registro-negocio .btn-icon {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        border: 1px solid var(--border);
        background: #fff;
        cursor: pointer;
        font-weight: 900;
      }

      .mvc-registro-negocio .btn-icon.del {
        border-color: rgba(239, 68, 68, 0.35);
        color: #b91c1c;
        background: rgba(239, 68, 68, 0.06);
      }

      .mvc-registro-negocio .chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: 1px solid var(--border);
        padding: 6px 10px;
        border-radius: 999px;
        margin: 4px 6px 4px 0;
        background: #fff;
      }

      .mvc-registro-negocio .chip input {
        margin: 0;
      }

      .mvc-registro-negocio .summary-box {
        width: 100%;
        min-height: 180px;
        resize: vertical;
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 14px;
        background: #fff;
        box-shadow: 0 6px 14px rgba(17,24,39,0.06);
        white-space: pre-wrap;
        word-break: break-word;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        line-height: 1.45;
        color: #111827;
      }

      .mvc-registro-negocio .summary-box:focus {
        outline: none;
      }

      .mvc-registro-negocio .legal-outside{
          margin:18px auto 24px;
          padding:10px 12px;
          max-width: 1080px;
          text-align:center;
          color:#666;
          font-size:14px;
          line-height:1.35;
        }

    </style>

    <div class="mvc-registro-negocio">
      <header class="app-banner" role="banner">
        <div class="banner-shell">
          <div class="banner-box">
            <div class="banner-inner">
              <a href="#" class="back-button" id="btnBack">&larr; Volver</a>
              <div class="banner-title">Registrar negocio</div>
              <a class="banner-logo" href="#/">
                <img src="assets/img/LogoCitasYa.png" alt="Citas Ya">
              </a>
            </div>
          </div>
        </div>
      </header>

      <div class="container">
        <div class="card">
          <h1>Registrar Negocio</h1>
          <div class="sub">Datos del negocio</div>

          <label>Nombre de la barbería/peluquería <span id="businessStatus" class="badge badge-warn">Negocio nuevo</span></label>
          <input id="shopName" class="inp" type="text" placeholder="Ej: Barbería Central" list="businessList" />
          <datalist id="businessList"></datalist>
          <div id="error-shopName" class="error"></div>

          <label>Dirección</label>
          <input id="shopAddress" class="inp" type="text" placeholder="Ej: Carrera 23 #60-36" />
          <div class="hint" id="shopAddressHint">Escribe la dirección. La búsqueda ignora mayúsculas/acentos.</div>
          <div id="error-shopAddress" class="error"></div>

          <h2>Datos del responsable</h2>

          <label>Nombre completo</label>
          <input id="ownerName" class="inp" type="text" />
          <div id="error-ownerName" class="error"></div>

          <label>Correo</label>
          <input id="ownerEmail" class="inp" type="email" />
          <div id="error-ownerEmail" class="error"></div>

          <label>Teléfono</label>
          <input id="ownerPhone" class="inp" type="text" placeholder="Ej: 3001234567" />
          <div id="error-ownerPhone" class="error"></div>

          <label>Contraseña de la barbería <span class="muted">(mínimo 6 caracteres)</span></label>
          <input id="ownerPass" class="inp" type="password" placeholder="Contraseña compartida para todos los barberos del negocio" />
          <div id="error-ownerPass" class="error"></div>

          <h2>Servicios del establecimiento</h2>

          <table>
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Duración (min)</th>
                <th>Precio (COP)</th>
                <th>Tokens</th>
                <th style="width:140px;">Acción</th>
              </tr>
            </thead>
            <tbody id="servicesBody"></tbody>
          </table>
          <div id="error-services" class="error"></div>

          <button id="addService" class="btn primary full" type="button">Agregar servicio (+)</button>

          <h2>Personal del establecimiento</h2>

          <table>
            <thead>
              <tr>
                <th style="width:240px;">Personal</th>
                <th>Servicios que ofrece</th>
                <th style="width:90px;">Acción</th>
              </tr>
            </thead>
            <tbody id="staffBody"></tbody>
          </table>
          <div id="error-staff" class="error"></div>

          <button id="addStaff" class="btn primary full" type="button">Agregar personal (+)</button>

          <button id="submitForm" class="btn success full" type="button">Guardar y continuar</button>

          <div id="datos-resumen" style="display:none; margin-top:16px;">
            <h3>Resumen</h3>
            <textarea id="summaryText" class="summary-box" readonly></textarea>
          </div>

          <div id="registro-final" style="display:none;">
            <button id="registerBusiness" class="btn success full" type="button">Registrar negocio</button>
          </div>
        </div>
      </div>
    </div>

    <div class="legal-outside">
      Todos los derechos reservados © 2026<br>
      Citas Ya S.A.S - Nit 810.000.000-0
    </div>
  `;
}

export async function onMount() {
  const $ = (id) => document.getElementById(id);

  const btnBack = $('btnBack');

  const shopName = $('shopName');
  const shopAddress = $('shopAddress');
  const shopAddressHint = $('shopAddressHint');
  const businessList = $('businessList');
  const businessStatus = $('businessStatus');

  const ownerName = $('ownerName');
  const ownerEmail = $('ownerEmail');
  const ownerPhone = $('ownerPhone');
  const ownerPass = $('ownerPass');

  const servicesBody = $('servicesBody');
  const staffBody = $('staffBody');

  const addServiceBtn = $('addService');
  const addStaffBtn = $('addStaff');

  const submitFormBtn = $('submitForm');
  const resumenSec = $('datos-resumen');
  const summaryText = $('summaryText');
  const registroFinalSec = $('registro-final');
  const registerBusinessBtn = $('registerBusiness');

  const err = {
    shopName: $('error-shopName'),
    shopAddress: $('error-shopAddress'),
    ownerName: $('error-ownerName'),
    ownerEmail: $('error-ownerEmail'),
    ownerPhone: $('error-ownerPhone'),
    ownerPass: $('error-ownerPass'),
    services: $('error-services'),
    staff: $('error-staff')
  };

  const fmtCOP = (n) => {
    const num = Number(n);
    if (!Number.isFinite(num)) return '';
    return num.toLocaleString('es-CO');
  };

  const parseCOP = (str) => {
    const d = String(str ?? '').replace(/[^\d]/g, '');
    return d ? Number(d) : '';
  };

  const computeTokens = (mins) => Math.max(1, Math.ceil(Number(mins || 0) / 30));

  const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  const firstNameFrom = (fullName = '') => {
    const clean = String(fullName || '').trim();
    if (!clean) return '';
    return clean.split(/\s+/)[0] || clean;
  };

  let negociosIndex = new Map(); // nombre -> negocio
  let currentNegocioId = null;
  let currentUsuario = null;

  let services = []; // { name, durationMins, priceCOP }
  let staff = [];    // { name, services: Set<index>, usuario_id?: number|null, personal_id?: number|null, isCurrentUser?: boolean }

  btnBack?.addEventListener('click', (e) => {
    e.preventDefault();
    history.back();
  });

  function setBusinessStatus(isNew) {
    if (!businessStatus) return;
    businessStatus.textContent = isNew ? 'Negocio nuevo' : 'Cargado';
    businessStatus.className = 'badge ' + (isNew ? 'badge-warn' : 'badge-ok');
  }

  function clearErrors() {
    Object.values(err).forEach((el) => {
      if (el) el.textContent = '';
    });
  }

  function clearActionAreas() {
    if (resumenSec) resumenSec.style.display = 'none';
    if (registroFinalSec) registroFinalSec.style.display = 'none';
    if (summaryText) summaryText.value = '';
  }

  function buildSummaryText() {
    const validServices = services.filter((s) => String(s.name || '').trim() && Number(s.durationMins) > 0);
    const validStaff = staff.filter((p) => String(p.name || '').trim());

    const lines = [
      `Barbería: ${shopName?.value?.trim() || '—'}`,
      `Dirección: ${shopAddress?.value?.trim() || '—'}`,
      `Responsable: ${ownerName?.value?.trim() || '—'}`,
      `Correo: ${ownerEmail?.value?.trim() || '—'}`,
      `Teléfono: ${ownerPhone?.value?.trim() || '—'}`,
      '',
      'Servicios:'
    ];

    if (!validServices.length) {
      lines.push('  • No hay servicios válidos.');
    } else {
      validServices.forEach((s) => {
        const priceText = s.priceCOP === '' ? 'Sin precio' : `$${fmtCOP(s.priceCOP)} COP`;
        lines.push(`  • ${String(s.name || '').trim()} · ${Number(s.durationMins || 0)} min · ${priceText} · ≈ ${computeTokens(s.durationMins)} token${computeTokens(s.durationMins) > 1 ? 's' : ''}`);
      });
    }

    lines.push('', 'Personal:');

    if (!validStaff.length) {
      lines.push('  • No hay personal registrado.');
    } else {
      validStaff.forEach((p) => {
        const names = Array.from(p.services.values())
          .map((idx) => String(services[idx]?.name || '').trim())
          .filter(Boolean);
        lines.push(`  • ${String(p.name || '').trim()}${p.isCurrentUser ? ' (barbero actual)' : ''}`);
        lines.push(`    Servicios: ${names.length ? names.join(', ') : 'Sin asignar'}`);
      });
    }

    return lines.join('\n');
  }

  function updateSummaryBox() {
    if (summaryText) summaryText.value = buildSummaryText();
  }

  function buildBusinessOptionsHTML() {
    return Array.from(negociosIndex.values())
      .map((n) => `<option value="${escapeHtml(String(n.nombre || ''))}">`)
      .join('');
  }

  function maybeLoadBusinessByName() {
    const key = String(shopName?.value || '').trim();
    const chosen = key ? negociosIndex.get(key) : null;

    if (!chosen) {
      currentNegocioId = null;
      setBusinessStatus(true);
      if (shopAddressHint) {
        shopAddressHint.textContent = 'Escribe la dirección. La búsqueda ignora mayúsculas/acentos.';
      }
      return;
    }

    currentNegocioId = chosen.id ?? null;
    if (shopAddress && chosen.direccion) {
      shopAddress.value = chosen.direccion;
    }
    if (shopAddressHint && chosen.direccion) {
      shopAddressHint.textContent = `Dirección: ${chosen.direccion}`;
    }
    setBusinessStatus(false);
    updateSummaryBox();
  }

  function upsertCurrentBarberIntoStaff() {
    if (!currentUsuario?.id) return;

    const displayName =
      currentUsuario.nombre_publico ||
      currentUsuario.nombre_completo ||
      [currentUsuario.nombres, currentUsuario.apellidos].filter(Boolean).join(' ').trim() ||
      currentUsuario.nombre ||
      firstNameFrom(ownerName?.value || '') ||
      'Barbero';

    const idx = staff.findIndex((p) => p.isCurrentUser || (currentUsuario.id && p.usuario_id === currentUsuario.id));

    if (idx >= 0) {
      staff[idx] = {
        ...staff[idx],
        name: staff[idx].name || displayName,
        usuario_id: currentUsuario.id ?? staff[idx].usuario_id ?? null,
        personal_id: currentUsuario.personal_id ?? staff[idx].personal_id ?? null,
        isCurrentUser: true
      };
    } else {
      staff.unshift({
        name: displayName,
        services: new Set(),
        usuario_id: currentUsuario.id ?? null,
        personal_id: currentUsuario.personal_id ?? null,
        isCurrentUser: true
      });
    }

    renderStaff();
  }

  // Autollenar responsable desde sesión (si existe)
  try {
    const { data: auth } = await supabase.auth.getUser();
    if (auth?.user?.id) {
      const prof = await UsuarioModel.currentProfile(auth.user.id);
      const u = prof?.data || null;
      if (u) {
        currentUsuario = {
          ...u,
          id: u.id ?? null,
          personal_id: u.personal_id ?? u.barbero_id ?? null
        };

        const fallbackName =
          u.nombre_completo ||
          [u.nombres, u.apellidos].filter(Boolean).join(' ').trim() ||
          u.nombre ||
          '';
        const fallbackEmail = u.correo ?? u.email ?? '';
        const fallbackPhone = u.telefono ?? u.numero ?? u.phone ?? '';

        if (ownerName && !ownerName.value) ownerName.value = fallbackName;
        if (ownerEmail && !ownerEmail.value) ownerEmail.value = fallbackEmail;
        if (ownerPhone && !ownerPhone.value) ownerPhone.value = fallbackPhone;
        if (ownerPass) ownerPass.placeholder = 'Contraseña compartida para todos los barberos del negocio';

        upsertCurrentBarberIntoStaff();
      }
    }
  } catch (e) {
    console.warn('No se pudo cargar perfil:', e);
  }

  // Negocios para datalist
  try {
    const list = await BarberoNegocioController.misNegocios();
    (list || []).forEach((n) => {
      if (!n?.nombre) return;
      negociosIndex.set(String(n.nombre).trim(), n);
    });
    if (businessList) {
      businessList.innerHTML = buildBusinessOptionsHTML();
    }
  } catch (e) {
    console.warn('No se pudieron cargar negocios:', e);
  }

  if (shopName) {
    shopName.addEventListener('change', maybeLoadBusinessByName);
    shopName.addEventListener('blur', maybeLoadBusinessByName);
    shopName.addEventListener('input', () => {
      setBusinessStatus(true);
      currentNegocioId = null;
      if (shopAddressHint) {
        shopAddressHint.textContent = 'Escribe la dirección. La búsqueda ignora mayúsculas/acentos.';
      }
      clearActionAreas();
      updateSummaryBox();
    });
  }

  shopAddress?.addEventListener('input', () => {
    clearActionAreas();
    updateSummaryBox();
  });

  ownerName?.addEventListener('input', () => {
    if (currentUsuario?.id) {
      const idx = staff.findIndex((p) => p.isCurrentUser || p.usuario_id === currentUsuario.id);
      if (idx >= 0 && !staff[idx].name.trim()) {
        staff[idx].name = firstNameFrom(ownerName.value);
        renderStaff();
      }
    }
    clearActionAreas();
    updateSummaryBox();
  });

  ownerEmail?.addEventListener('input', () => {
    clearActionAreas();
    updateSummaryBox();
  });

  ownerPhone?.addEventListener('input', () => {
    clearActionAreas();
    updateSummaryBox();
  });

  ownerPass?.addEventListener('input', clearActionAreas);

  // ===== Servicios =====
  function buildServiceRowHTML(s, i) {
    const tokens = computeTokens(s.durationMins);
    const priceVal = s.priceCOP === '' ? '' : fmtCOP(s.priceCOP);
    return `
      <tr data-i="${i}">
        <td><input type="text" class="inp service-name" value="${escapeHtml(s.name ?? '')}" placeholder="Corte"></td>
        <td><input type="number" class="inp service-dur" min="5" step="5" value="${s.durationMins ?? 30}"></td>
        <td><input type="text" class="inp service-price" inputmode="numeric" value="${priceVal}" placeholder="Ej: 18.000"></td>
        <td class="muted token-cell">≈ ${tokens} token${tokens > 1 ? 's' : ''}</td>
        <td class="actions">
          <button type="button" class="btn-icon up" title="Subir">↑</button>
          <button type="button" class="btn-icon down" title="Bajar">↓</button>
          <button type="button" class="btn-icon del" title="Eliminar">✕</button>
        </td>
      </tr>
    `;
  }

  function renderServices() {
    if (!servicesBody) return;
    servicesBody.innerHTML = services.map((s, i) => buildServiceRowHTML(s, i)).join('');
    refreshStaffServiceLabels();
  }

  function refreshServiceRowTokens(index) {
    const tr = servicesBody?.querySelector(`tr[data-i="${index}"]`);
    if (!tr) return;
    const cell = tr.querySelector('.token-cell');
    if (!cell) return;
    const tokens = computeTokens(services[index]?.durationMins);
    cell.textContent = `≈ ${tokens} token${tokens > 1 ? 's' : ''}`;
  }

  function refreshStaffServiceLabels() {
    if (!staffBody) return;
    staffBody.querySelectorAll('input.staff-svc').forEach((cb) => {
      const sIdx = Number(cb.dataset.s);
      const labelSpan = cb.closest('.chip')?.querySelector('span');
      if (!labelSpan) return;
      const label = (services[sIdx]?.name || `Servicio ${sIdx + 1}`).trim();
      labelSpan.textContent = label || `Servicio ${sIdx + 1}`;
    });
  }

  function addServiceRow() {
    services.push({ name: '', durationMins: 30, priceCOP: '' });
    renderServices();
    clearActionAreas();
    updateSummaryBox();
  }

  function moveService(from, to) {
    if (to < 0 || to >= services.length) return;
    const [item] = services.splice(from, 1);
    services.splice(to, 0, item);

    staff = staff.map((p) => {
      const newSet = new Set();
      p.services.forEach((idx) => {
        if (idx === from) newSet.add(to);
        else if (from < to && idx > from && idx <= to) newSet.add(idx - 1);
        else if (from > to && idx >= to && idx < from) newSet.add(idx + 1);
        else newSet.add(idx);
      });
      return { ...p, services: newSet };
    });

    renderServices();
    renderStaff();
    clearActionAreas();
    updateSummaryBox();
  }

  function removeServiceRow(index) {
    services.splice(index, 1);
    staff = staff.map((p) => {
      const newSet = new Set();
      p.services.forEach((idx) => {
        if (idx === index) return;
        newSet.add(idx > index ? idx - 1 : idx);
      });
      return { ...p, services: newSet };
    });
    renderServices();
    renderStaff();
    clearActionAreas();
    updateSummaryBox();
  }

  if (servicesBody) {
    servicesBody.addEventListener('input', (ev) => {
      const tr = ev.target.closest('tr');
      if (!tr) return;
      const i = Number(tr.dataset.i);
      if (!Number.isFinite(i) || !services[i]) return;

      if (ev.target.classList.contains('service-name')) {
        services[i].name = ev.target.value;
        refreshStaffServiceLabels();
      }

      if (ev.target.classList.contains('service-dur')) {
        services[i].durationMins = Number(ev.target.value || 0);
        refreshServiceRowTokens(i);
      }

      if (ev.target.classList.contains('service-price')) {
        services[i].priceCOP = parseCOP(ev.target.value);
      }

      clearActionAreas();
      updateSummaryBox();
    });

    servicesBody.addEventListener('blur', (ev) => {
      const tr = ev.target.closest('tr');
      if (!tr) return;
      const i = Number(tr.dataset.i);
      if (!Number.isFinite(i) || !services[i]) return;

      if (ev.target.classList.contains('service-price')) {
        const parsed = parseCOP(ev.target.value);
        services[i].priceCOP = parsed;
        ev.target.value = parsed === '' ? '' : fmtCOP(parsed);
      }
    }, true);

    servicesBody.addEventListener('change', (ev) => {
      const tr = ev.target.closest('tr');
      if (!tr) return;
      const i = Number(tr.dataset.i);
      if (!Number.isFinite(i) || !services[i]) return;

      if (ev.target.classList.contains('service-dur')) {
        services[i].durationMins = Number(ev.target.value || 0);
        refreshServiceRowTokens(i);
      }

      if (ev.target.classList.contains('service-price')) {
        const parsed = parseCOP(ev.target.value);
        services[i].priceCOP = parsed;
        ev.target.value = parsed === '' ? '' : fmtCOP(parsed);
      }

      clearActionAreas();
      updateSummaryBox();
    });

    servicesBody.addEventListener('click', (ev) => {
      const tr = ev.target.closest('tr');
      if (!tr) return;
      const i = Number(tr.dataset.i);
      if (!Number.isFinite(i)) return;

      if (ev.target.classList.contains('up')) moveService(i, i - 1);
      if (ev.target.classList.contains('down')) moveService(i, i + 1);
      if (ev.target.classList.contains('del')) removeServiceRow(i);
    });
  }

  // ===== Personal =====
  function buildStaffRowHTML(p, i) {
    const checks = services.map((s, sIdx) => {
      const checked = p.services.has(sIdx) ? 'checked' : '';
      const label = escapeHtml((s.name || `Servicio ${sIdx + 1}`).trim() || `Servicio ${sIdx + 1}`);
      return `
        <label class="chip">
          <input type="checkbox" class="staff-svc" data-s="${sIdx}" ${checked}>
          <span>${label}</span>
        </label>
      `;
    }).join('') || '<span class="muted">Agrega servicios primero.</span>';

    const deleteBtn = p.isCurrentUser
      ? '<span class="muted">Principal</span>'
      : '<button type="button" class="btn-icon del staff-del" title="Eliminar">✕</button>';

    return `
      <tr data-i="${i}">
        <td>
          <input
            type="text"
            class="inp staff-name"
            value="${escapeHtml(p.name ?? '')}"
            placeholder="Nombre público"
            ${p.isCurrentUser ? 'data-fixed-current="1"' : ''}
          >
        </td>
        <td class="staff-services">${checks}</td>
        <td class="actions">${deleteBtn}</td>
      </tr>
    `;
  }

  function renderStaff() {
    if (!staffBody) return;
    staffBody.innerHTML = staff.map((p, i) => buildStaffRowHTML(p, i)).join('');
  }

  function addStaffRow() {
    staff.push({ name: '', services: new Set(), usuario_id: null, personal_id: null, isCurrentUser: false });
    renderStaff();
    clearActionAreas();
    updateSummaryBox();
  }

  function removeStaffRow(index) {
    if (staff[index]?.isCurrentUser) return;
    staff.splice(index, 1);
    renderStaff();
    clearActionAreas();
    updateSummaryBox();
  }

  if (staffBody) {
    staffBody.addEventListener('input', (ev) => {
      const tr = ev.target.closest('tr');
      if (!tr) return;
      const i = Number(tr.dataset.i);
      if (!Number.isFinite(i) || !staff[i]) return;
      if (ev.target.classList.contains('staff-name')) {
        staff[i].name = ev.target.value;
        clearActionAreas();
        updateSummaryBox();
      }
    });

    staffBody.addEventListener('change', (ev) => {
      const tr = ev.target.closest('tr');
      if (!tr) return;
      const i = Number(tr.dataset.i);
      if (!Number.isFinite(i) || !staff[i]) return;

      if (ev.target.classList.contains('staff-svc')) {
        const sIdx = Number(ev.target.dataset.s);
        if (ev.target.checked) staff[i].services.add(sIdx);
        else staff[i].services.delete(sIdx);
        clearActionAreas();
        updateSummaryBox();
      }
    });

    staffBody.addEventListener('click', (ev) => {
      const tr = ev.target.closest('tr');
      if (!tr) return;
      const i = Number(tr.dataset.i);
      if (!Number.isFinite(i)) return;
      if (ev.target.classList.contains('staff-del')) removeStaffRow(i);
    });
  }

  addServiceBtn?.addEventListener('click', addServiceRow);
  addStaffBtn?.addEventListener('click', addStaffRow);

  // Inicial (como MVP)
  if (!services.length) {
    services = [
      { name: 'Corte', durationMins: 30, priceCOP: '' },
      { name: 'Barba', durationMins: 20, priceCOP: '' },
      { name: 'Corte y barba', durationMins: 40, priceCOP: '' }
    ];
    renderServices();
  }
  if (!staff.length && currentUsuario?.id) {
    upsertCurrentBarberIntoStaff();
  } else {
    renderStaff();
  }
  updateSummaryBox();

  function validate() {
    clearErrors();
    let ok = true;

    if (!shopName?.value?.trim()) {
      if (err.shopName) err.shopName.textContent = 'Ingresa el nombre del negocio.';
      ok = false;
    }
    if (!shopAddress?.value?.trim()) {
      if (err.shopAddress) err.shopAddress.textContent = 'Ingresa la dirección.';
      ok = false;
    }

    if (!ownerName?.value?.trim()) {
      if (err.ownerName) err.ownerName.textContent = 'Ingresa el nombre del responsable.';
      ok = false;
    }
    if (!ownerEmail?.value?.trim()) {
      if (err.ownerEmail) err.ownerEmail.textContent = 'Ingresa el correo del responsable.';
      ok = false;
    }
    if (!ownerPhone?.value?.trim()) {
      if (err.ownerPhone) err.ownerPhone.textContent = 'Ingresa el teléfono del responsable.';
      ok = false;
    }
    if (!ownerPass?.value?.trim() || ownerPass.value.trim().length < 6) {
      if (err.ownerPass) err.ownerPass.textContent = 'Ingresa la contraseña de la barbería con mínimo 6 caracteres.';
      ok = false;
    }

    const validServices = services.filter((s) => String(s.name || '').trim() && Number(s.durationMins) > 0);
    if (!validServices.length) {
      if (err.services) err.services.textContent = 'Agrega al menos un servicio válido.';
      ok = false;
    }

    const hasInvalidPrice = validServices.some((s) => s.priceCOP === '' || !Number.isFinite(Number(s.priceCOP)) || Number(s.priceCOP) <= 0);
    if (hasInvalidPrice) {
      if (err.services) err.services.textContent = 'Todos los servicios deben tener un precio válido mayor a 0.';
      ok = false;
    }

    const validStaff = staff.filter((p) => String(p.name || '').trim());
    const invalidStaff = staff.some((p) => !String(p.name || '').trim());
    if (invalidStaff) {
      if (err.staff) err.staff.textContent = 'Revisa el nombre del personal.';
      ok = false;
    }
    if (!validStaff.length) {
      if (err.staff) err.staff.textContent = 'Debes tener al menos una persona en el establecimiento.';
      ok = false;
    }

    return ok;
  }

  submitFormBtn?.addEventListener('click', () => {
    if (!validate()) return;
    updateSummaryBox();
    if (resumenSec) resumenSec.style.display = 'block';
    if (registroFinalSec) registroFinalSec.style.display = 'block';
    resumenSec?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  });

  registerBusinessBtn?.addEventListener('click', async () => {
    if (!validate()) return;

    const payload = {
      responsable: {
        nombre_completo: ownerName.value.trim(),
        correo: ownerEmail.value.trim(),
        telefono: ownerPhone.value.trim()
      },
      negocio: {
        id: currentNegocioId,
        nombre: shopName.value.trim(),
        direccion: shopAddress.value.trim(),
        activo: false,
        __businessKey: ownerPass.value.trim()
      },
      servicios: services.map((s) => ({
        nombre: String(s.name || '').trim(),
        duracion_min: Number(s.durationMins || 0),
        precio_cop: s.priceCOP === '' ? null : Number(s.priceCOP),
        tokens: computeTokens(s.durationMins)
      })),
      personal: staff.map((p) => ({
        nombre_publico: String(p.name || '').trim(),
        servicios: Array.from(p.services.values()),
        usuario_id: p.usuario_id ?? null,
        personal_id: p.personal_id ?? null,
        es_barbero_actual: !!p.isCurrentUser
      }))
    };

    try {
      await BarberoNegocioController.registrarNegocioCompleto(payload);
      alert('Negocio registrado. Queda pendiente de aprobación.');
      window.location.hash = '#/barbero/organizar-agenda';
    } catch (e) {
      console.error(e);
      alert('No se pudo registrar el negocio. Revisa la consola.');
    }
  });
}